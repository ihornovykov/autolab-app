import { ORPCError } from "@orpc/server";
import { db } from "@autolab/db";
import { bookingServices, bookings } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { services } from "@autolab/db/schema/service";
import dayjs from "dayjs";
import "dayjs/locale/uk.js";
import PDFDocument from "pdfkit";
import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { getClientName } from "../../lib/client";
import { formatBookingTimeRange } from "../../lib/date";
import {
  getBrandFontRegistrationKey,
  resolveBrandFontData,
  type PdfBrandFontOptions,
} from "../../lib/font";
import { bufferFromBase64 } from "../../lib/buffer";
import { formatPrice } from "../../lib/price";
import { DEFAULT_WORKING_HOURS } from "../../lib/schedule";
import { autolabLogoBase64 } from "../../assets/generated/autolab-logo";
import { dejaVuSansBoldBase64 } from "../../assets/generated/dejavu-sans-bold";
import { dejaVuSansBase64 } from "../../assets/generated/dejavu-sans";

import type { z } from "zod";

import type { listBookingsInputSchema, organizationAnalyticsOutputSchema } from "./validation";

dayjs.locale("uk");

export const bookingWith = {
  vehicle: true as const,
  employee: { with: { user: { columns: { name: true } } } },
  bookingServices: { with: { service: true as const } },
};

export const reportBookingWith = {
  vehicle: { with: { client: true as const } },
  employee: { with: { user: { columns: { name: true } } } },
  bookingServices: { with: { service: { columns: { title: true } } } },
};

export type ResolvedBookingItem = {
  serviceId: string;
  quantity: number;
  unitPrice: string;
  duration: number;
};

export const publicBookingWith = {
  organization: true as const,
  vehicle: { with: { client: true as const } },
  employee: { with: { user: { columns: { name: true } } } },
  bookingServices: { with: { service: true as const } },
};

export const mapPublicBooking = (row: {
  startTime: Date;
  endTime: Date;
  allowsOvertime: boolean;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  totalPrice: string;
  organization?: { name: string } | null;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string | null;
    bodyStyle?: string | null;
    engine?: string | null;
    engineVolume?: number | null;
    client?: {
      firstName: string;
      lastName?: string | null;
      middleName?: string | null;
    } | null;
  } | null;
  employee?: {
    user?: { name?: string | null } | null;
  } | null;
  bookingServices?: Array<{
    quantity: number;
    unitPrice: string;
    service: {
      title: string;
      description: string | null;
      price: string;
      duration: number;
      category: string | null;
    };
  }>;
}) => ({
  status: row.status,
  startTime: row.startTime,
  endTime: row.endTime,
  allowsOvertime: row.allowsOvertime,
  notes: row.notes,
  totalPrice: row.totalPrice,
  organization: {
    name: row.organization?.name ?? "",
  },
  client: row.vehicle?.client ? { name: getClientName(row.vehicle.client) } : null,
  employee: row.employee?.user?.name ? { name: row.employee.user.name } : null,
  vehicle: row.vehicle
    ? {
        make: row.vehicle.make,
        model: row.vehicle.model,
        year: row.vehicle.year,
        licensePlate: row.vehicle.licensePlate,
        bodyStyle: row.vehicle.bodyStyle,
        engine: row.vehicle.engine,
        engineVolume: row.vehicle.engineVolume,
      }
    : null,
  services:
    row.bookingServices?.map((item) => ({
      title: item.service.title,
      description: item.service.description,
      price: item.service.price,
      duration: item.service.duration,
      category: item.service.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) ?? [],
});

export const mapBooking = (
  row: {
    id: string;
    organizationId: string;
    employeeId: string;
    vehicleId: string;
    startTime: Date;
    endTime: Date;
    allowsOvertime: boolean;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    notes: string | null;
    totalPrice: string;
    createdAt: Date;
    updatedAt: Date;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year: number;
      licensePlate: string | null;
    };
    employee?: {
      id: string;
      userId: string;
      role: "TECHNICIAN" | "MANAGER" | "OWNER";
      user?: unknown;
    } | null;
    bookingServices?: Array<{
      quantity: number;
      unitPrice: string;
      duration: number;
      service: {
        id: string;
        title: string;
        description: string | null;
        price: string;
        duration: number;
        category: string | null;
      };
    }>;
  },
  options?: {
    employeeWorkingHours?: typeof DEFAULT_WORKING_HOURS;
  },
) => ({
  id: row.id,
  organizationId: row.organizationId,
  employeeId: row.employeeId,
  vehicleId: row.vehicleId,
  startTime: row.startTime,
  endTime: row.endTime,
  allowsOvertime: row.allowsOvertime,
  status: row.status,
  notes: row.notes,
  totalPrice: row.totalPrice,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  vehicle: row.vehicle,
  services: row.bookingServices?.map((bs) => ({
    ...bs.service,
    quantity: bs.quantity,
    unitPrice: bs.unitPrice,
  })),
  employee: row.employee
    ? {
        id: row.employee.id,
        userId: row.employee.userId,
        role: row.employee.role,
        name: (row.employee.user as { name?: string } | undefined)?.name,
      }
    : undefined,
  employeeWorkingHours: options?.employeeWorkingHours,
});

export const mapVehicleBookingListItem = (
  mapped: ReturnType<typeof mapBooking>,
) => ({
  id: mapped.id,
  organizationId: mapped.organizationId,
  employeeId: mapped.employeeId,
  vehicleId: mapped.vehicleId,
  startTime: mapped.startTime,
  endTime: mapped.endTime,
  allowsOvertime: mapped.allowsOvertime,
  status: mapped.status,
  notes: mapped.notes,
  totalPrice: mapped.totalPrice,
  createdAt: mapped.createdAt,
  updatedAt: mapped.updatedAt,
  services: mapped.services ?? [],
});

export const calculateBookingDuration = (items: ResolvedBookingItem[]) =>
  items.reduce((sum, item) => sum + item.duration * item.quantity, 0);

export const getListBookingsOrder = (
  sort: z.infer<typeof listBookingsInputSchema>["sort"],
  includePast?: boolean,
) => {
  if (sort === "upcoming") {
    return includePast ? [desc(bookings.startTime)] : [asc(bookings.startTime)];
  }

  return sort === "asc" ? [asc(bookings.startTime)] : [desc(bookings.startTime)];
};

export const assertEndTimeAfterStart = (startTime: Date, endTime: Date) => {
  if (!endTime.getTime() || endTime <= startTime) {
    throw new ORPCError("BAD_REQUEST", {
      message: "End time must be after start time",
    });
  }
};

type AnalyticsSummary = {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  inProgressBookings: number;
  pendingBookings: number;
  totalRevenue: string;
  averageTicket: string;
  newClients: number;
};

const bookingRangeCondition = (
  organizationId: string,
  from: Date,
  to: Date,
) =>
  and(
    eq(bookings.organizationId, organizationId),
    gte(bookings.startTime, from),
    lte(bookings.startTime, to),
  );

const toRevenue = (value: string | null | undefined) => value ?? "0";

const calcDeltaPercent = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const calcRevenueDeltaPercent = (current: string, previous: string) => {
  const currentValue = Number(current);
  const previousValue = Number(previous);
  if (previousValue === 0) return currentValue === 0 ? 0 : null;
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const fetchSummary = async (
  organizationId: string,
  from: Date,
  to: Date,
): Promise<AnalyticsSummary> => {
  const range = bookingRangeCondition(organizationId, from, to);

  const statusRows = await db
    .select({
      status: bookings.status,
      count: count(),
      revenue: sum(bookings.totalPrice),
    })
    .from(bookings)
    .where(range)
    .groupBy(bookings.status);

  const statusMap = new Map(
    statusRows.map((row) => [row.status, row] as const),
  );

  const [newClientsResult] = await db
    .select({ count: count() })
    .from(clients)
    .where(
      and(
        eq(clients.organizationId, organizationId),
        gte(clients.createdAt, from),
        lte(clients.createdAt, to),
      ),
    );

  const completedBookings = statusMap.get("COMPLETED")?.count ?? 0;
  const totalRevenue = toRevenue(statusMap.get("COMPLETED")?.revenue);
  const averageTicket =
    completedBookings > 0
      ? (Number(totalRevenue) / completedBookings).toFixed(2)
      : "0";

  return {
    totalBookings: statusRows.reduce((acc, row) => acc + row.count, 0),
    completedBookings,
    cancelledBookings: statusMap.get("CANCELLED")?.count ?? 0,
    inProgressBookings: statusMap.get("IN_PROGRESS")?.count ?? 0,
    pendingBookings: statusMap.get("PENDING")?.count ?? 0,
    totalRevenue,
    averageTicket,
    newClients: newClientsResult?.count ?? 0,
  };
};

const withComparison = (
  current: AnalyticsSummary,
  previous: AnalyticsSummary,
) => ({
  ...current,
  totalBookingsDeltaPercent: calcDeltaPercent(
    current.totalBookings,
    previous.totalBookings,
  ),
  completedBookingsDeltaPercent: calcDeltaPercent(
    current.completedBookings,
    previous.completedBookings,
  ),
  totalRevenueDeltaPercent: calcRevenueDeltaPercent(
    current.totalRevenue,
    previous.totalRevenue,
  ),
  averageTicketDeltaPercent: calcRevenueDeltaPercent(
    current.averageTicket,
    previous.averageTicket,
  ),
  newClientsDeltaPercent: calcDeltaPercent(current.newClients, previous.newClients),
});

export const collectOrganizationAnalytics = async ({
  organizationId,
  from,
  to,
}: {
  organizationId: string;
  from: Date;
  to: Date;
}): Promise<z.infer<typeof organizationAnalyticsOutputSchema>> => {
  const durationMs = to.getTime() - from.getTime();
  const previousFrom = new Date(from.getTime() - durationMs);
  const previousTo = new Date(from.getTime() - 1);

  const [currentSummary, previousSummary] = await Promise.all([
    fetchSummary(organizationId, from, to),
    fetchSummary(organizationId, previousFrom, previousTo),
  ]);

  const revenueTimeSeriesRows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${bookings.startTime}), 'YYYY-MM-DD')`,
      revenue: sum(bookings.totalPrice),
      bookingsCount: count(),
    })
    .from(bookings)
    .where(
      and(
        bookingRangeCondition(organizationId, from, to),
        eq(bookings.status, "COMPLETED"),
      ),
    )
    .groupBy(sql`date_trunc('day', ${bookings.startTime})`)
    .orderBy(asc(sql`date_trunc('day', ${bookings.startTime})`));

  const statusBreakdownRows = await db
    .select({
      status: bookings.status,
      count: count(),
      revenue: sum(bookings.totalPrice),
    })
    .from(bookings)
    .where(bookingRangeCondition(organizationId, from, to))
    .groupBy(bookings.status);

  const topServicesRows = await db
    .select({
      serviceId: services.id,
      title: services.title,
      count: sql<number>`sum(${bookingServices.quantity})`.mapWith(Number),
      revenue: sql<string>`sum(cast(${bookingServices.unitPrice} as numeric) * ${bookingServices.quantity})`,
    })
    .from(bookingServices)
    .innerJoin(bookings, eq(bookingServices.bookingId, bookings.id))
    .innerJoin(services, eq(bookingServices.serviceId, services.id))
    .where(
      and(
        bookingRangeCondition(organizationId, from, to),
        eq(bookings.status, "COMPLETED"),
      ),
    )
    .groupBy(services.id, services.title)
    .orderBy(desc(count()))
    .limit(5);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    summary: withComparison(currentSummary, previousSummary),
    revenueTimeSeries: revenueTimeSeriesRows.map((row) => ({
      date: row.date,
      revenue: toRevenue(row.revenue),
      bookingsCount: row.bookingsCount,
    })),
    statusBreakdown: statusBreakdownRows.map((row) => ({
      status: row.status,
      count: row.count,
      revenue: toRevenue(row.revenue),
    })),
    topServices: topServicesRows.map((row) => ({
      serviceId: row.serviceId,
      title: row.title,
      count: row.count,
      revenue: toRevenue(row.revenue),
    })),
  };
};

const fontRegularData = bufferFromBase64(dejaVuSansBase64);
const fontBoldData = bufferFromBase64(dejaVuSansBoldBase64);
const autolabLogoBuffer = bufferFromBase64(autolabLogoBase64);

const AUTOLAB_BRAND = {
  fontFamily: "geist",
  fontWeight: 700,
  fontStyle: "italic",
  iconSize: 16,
  fontSize: 12,
  gap: 2,
  text: "AUTOLAB",
} as const satisfies PdfBrandFontOptions & {
  iconSize: number;
  fontSize: number;
  gap: number;
  text: string;
};

const brandFontKey = getBrandFontRegistrationKey(AUTOLAB_BRAND);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const FOOTER_HEIGHT = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_BOTTOM = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT;

const statusLabels = {
  PENDING: "Заплановано",
  IN_PROGRESS: "В роботі",

COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
} as const;

const computeReceiptSubtotal = (services: ReceiptService[]) =>
  services.reduce(
    (sum, service) => sum + Number(service.unitPrice ?? service.price) * (service.quantity ?? 1),
    0,
  );

const computeReceiptDiscount = (subtotal: number, totalPrice: string) => {
  const discount = subtotal - Number(totalPrice);
  return discount >= 0.005 ? discount : 0;
};

type ReceiptService = {
  id: string;
  title: string;
  description?: string | null;
  price: string;
  unitPrice?: string;
  quantity?: number;
  duration: number;
};

type ReceiptVehicle = {
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  client?: {
    firstName: string;
    lastName?: string | null;
    middleName?: string | null;
  } | null;
};

type ReceiptOrganization = {
  name: string;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

type ReceiptEmployee = {
  name?: string;
  role: "OWNER" | "MANAGER" | "TECHNICIAN";
};

export type BookingReceiptPdfInput = {
  booking: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: keyof typeof statusLabels;
    totalPrice: string;
    notes?: string | null;
    allowsOvertime?: boolean;
    services?: ReceiptService[];
  };
  organization: ReceiptOrganization;
  vehicle?: ReceiptVehicle | null;
  employee?: ReceiptEmployee | null;
};

const resolveImageBuffer = async (source?: string | null) => {
  if (source?.startsWith("data:")) {
    const base64 = source.split(",")[1];
    if (base64) return Buffer.from(base64, "base64");
  }

  if (source?.startsWith("http://") || source?.startsWith("https://")) {
    const response = await fetch(source);
    if (response.ok) return Buffer.from(await response.arrayBuffer());
  }

  return null;
};

const renderReceiptPdfToBuffer = (
  input: BookingReceiptPdfInput,
  assets: { orgLogoBuffer: Buffer | null; autolabLogoBuffer: Buffer },
) =>
  new Promise<Buffer>((resolve, reject) => {
    dayjs.locale("uk");

    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      autoFirstPage: true,
      bufferPages: true,
      font: false as unknown as string,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("regular", fontRegularData);
    doc.registerFont("bold", fontBoldData);
    doc.registerFont(brandFontKey, resolveBrandFontData(AUTOLAB_BRAND));
    doc.font("regular");

    const { booking, organization, vehicle } = input;
    const { orgLogoBuffer, autolabLogoBuffer } = assets;
    let y = MARGIN;

    const drawAutolabBrand = (x: number, topY: number) => {
      const { iconSize, fontSize, gap, text } = AUTOLAB_BRAND;
      const textX = x + iconSize + gap;
      const textY = topY + (iconSize - fontSize) / 2 - 1;

      doc.image(autolabLogoBuffer, x, topY, { fit: [iconSize, iconSize] });
      doc.font(brandFontKey).fontSize(fontSize).fillColor("#111111");
      doc.text(text, textX, textY, { lineBreak: false });
    };

    const getAutolabBrandWidth = () => {
      doc.font(brandFontKey).fontSize(AUTOLAB_BRAND.fontSize);
      return AUTOLAB_BRAND.iconSize + AUTOLAB_BRAND.gap + doc.widthOfString(AUTOLAB_BRAND.text);
    };

    const drawLabelValue = (
      label: string,
      value: string,
      x: number,
      rowY: number,
      width: number,
    ) => {
      doc
        .font("regular")
        .fontSize(8)
        .fillColor("#666666")
        .text(label.toUpperCase(), x, rowY, { width });
      doc
        .font("regular")
        .fontSize(11)
        .fillColor("#111111")
        .text(value, x, rowY + 12, { width });
    };

    const colNo = MARGIN;
    const colTitle = MARGIN + 28;
    const colPrice = PAGE_WIDTH - MARGIN - 70;
    const titleWidth = colPrice - colTitle - 8;
    const tableWidth = CONTENT_WIDTH;

    const drawTableHeader = () => {
      doc.rect(MARGIN, y, tableWidth, 22).fillAndStroke("#f5f5f5", "#cccccc");
      doc.font("bold").fontSize(8).fillColor("#111111");
      doc.text("№", colNo + 6, y + 7, { width: 20 });
      doc.text("ПОСЛУГА / ОПИС РОБІТ", colTitle + 4, y + 7, { width: titleWidth });
      doc.text("ВАРТІСТЬ", colPrice, y + 7, { width: 64, align: "right" });
      y += 22;
    };

    const ensureSpace = (height: number, options?: { tableHeader?: boolean }) => {
      if (y + height <= CONTENT_BOTTOM) return;

      doc.addPage();
      y = MARGIN;

      if (options?.tableHeader) {
        drawTableHeader();
      }
    };

    const drawPageFooters = () => {
      const range = doc.bufferedPageRange();
      const pageCount = range.count;
      const brandWidth = getAutolabBrandWidth();

      for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
        doc.switchToPage(range.start + pageIndex);

        const page = doc.page;
        const brandTop = page.height - page.margins.bottom - AUTOLAB_BRAND.iconSize - 4;
        const brandX = page.width - page.margins.right - brandWidth;
        const pageNumberY = brandTop + AUTOLAB_BRAND.iconSize / 2 - 4;

        doc.font("regular").fontSize(9).fillColor("#666666");
        doc.text(`Сторінка ${pageIndex + 1} з ${pageCount}`, page.margins.left, pageNumberY, {
          width: page.width - page.margins.left - page.margins.right,
          align: "center",
          lineBreak: false,
        });

        drawAutolabBrand(brandX, brandTop);
      }
    };

    const headerTextX = orgLogoBuffer ? MARGIN + 64 : MARGIN;
    const headerTextWidth = orgLogoBuffer ? CONTENT_WIDTH - 64 : CONTENT_WIDTH;

    if (orgLogoBuffer) {
      doc.image(orgLogoBuffer, MARGIN, y, { fit: [52, 52] });
    }

    doc.font("bold").fontSize(18).fillColor("#111111").text(organization.name, headerTextX, y, {
      width: headerTextWidth,
    });

    const contactParts = [organization.address, organization.phone, organization.email].filter(
      Boolean,
    );
    let headerOffset = doc.heightOfString(organization.name, { width: headerTextWidth });

    if (contactParts.length) {
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#444444")
        .text(contactParts.join(" · "), headerTextX, y + headerOffset + 4, {
          width: headerTextWidth,
        });
      headerOffset += doc.heightOfString(contactParts.join(" · "), { width: headerTextWidth }) + 4;
    }

    if (organization.website) {
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#444444")
        .text(organization.website, headerTextX, y + headerOffset + 4, { width: headerTextWidth });
      headerOffset += 14;
    }

    y += orgLogoBuffer ? Math.max(56, headerOffset + 16) : headerOffset + 16;
    doc
      .moveTo(MARGIN, y)
      .lineTo(PAGE_WIDTH - MARGIN, y)
      .lineWidth(1.5)
      .strokeColor("#111111")
      .stroke();
    y += 18;

    doc
      .font("bold")
      .fontSize(14)
      .fillColor("#111111")
      .text("АКТ ВИКОНАНИХ РОБІТ", MARGIN, y, {
        width: CONTENT_WIDTH,
        align: "center",
      });
    y += 28;

    const columnWidth = CONTENT_WIDTH / 2 - 8;
    drawLabelValue("Дата видачі", dayjs().format("D MMMM YYYY, HH:mm"), MARGIN, y, columnWidth);
    y += 38;

    doc.font("bold").fontSize(10).fillColor("#111111").text("КЛІЄНТ", MARGIN, y);
    y += 14;
    doc
      .font("regular")
      .fontSize(11)
      .text(vehicle?.client ? getClientName(vehicle.client) : "—", MARGIN, y);
    y += 28;

    doc.font("bold").fontSize(10).fillColor("#111111").text("АВТОМОБІЛЬ", MARGIN, y);
    y += 14;
    drawLabelValue(
      "Марка / модель",
      vehicle ? `${vehicle.make} ${vehicle.model}, ${vehicle.year} р.` : "—",
      MARGIN,
      y,
      columnWidth,
    );
    drawLabelValue(
      "Державний номер",
      vehicle?.licensePlate ?? "—",
      MARGIN + columnWidth + 16,
      y,
      columnWidth,
    );
    y += 38;
    drawLabelValue("VIN", vehicle?.vin ?? "—", MARGIN, y, columnWidth);
    y += 42;

    doc.font("bold").fontSize(10).fillColor("#111111").text("ПЕРЕЛІК ПОСЛУГ", MARGIN, y);
    y += 16;

    ensureSpace(22);
    drawTableHeader();

    const services = booking.services ?? [];
    if (!services.length) {
      ensureSpace(24);
      doc.rect(MARGIN, y, tableWidth, 24).stroke("#cccccc");
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#666666")
        .text("Послуги не вказані", colTitle + 4, y + 7);
      y += 24;
    } else {
      services.forEach((service, index) => {
        const description = service.description?.trim();
        doc.font("bold").fontSize(10);
        const titleHeight = doc.heightOfString(service.title, { width: titleWidth });
        doc.font("regular").fontSize(9);
        const descriptionHeight = description
          ? doc.heightOfString(description, { width: titleWidth })
          : 0;
        const rowHeight = Math.max(
          28,
          10 + titleHeight + descriptionHeight + (description ? 4 : 0),
        );

        ensureSpace(rowHeight + 4, { tableHeader: true });

        doc.rect(MARGIN, y, tableWidth, rowHeight).stroke("#cccccc");
        doc
          .font("regular")
          .fontSize(10)
          .fillColor("#111111")
          .text(String(index + 1), colNo + 6, y + 8, {
            width: 20,
          });
        doc
          .font("bold")
          .fontSize(10)
          .text(service.title, colTitle + 4, y + 8, { width: titleWidth });
        if (description) {
          doc
            .font("regular")
            .fontSize(9)
            .fillColor("#444444")
            .text(description, colTitle + 4, y + 8 + titleHeight + 2, { width: titleWidth });
        }
        doc
          .font("regular")
          .fontSize(10)
          .fillColor("#111111")
          .text(
            formatPrice(Number(service.unitPrice ?? service.price) * (service.quantity ?? 1)),
            colPrice,
            y + 8,
            { width: 64, align: "right" },
          );
        y += rowHeight;
      });
    }

    ensureSpace(34);
    y += 8;

    const subtotal = computeReceiptSubtotal(services);
    const discount = computeReceiptDiscount(subtotal, booking.totalPrice);

    if (discount > 0) {
      ensureSpace(28);
      doc.rect(MARGIN, y, tableWidth, 24).stroke("#cccccc");
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#666666")
        .text("Підсумок", MARGIN + 10, y + 7);
      doc.text(formatPrice(subtotal), colPrice, y + 7, { width: 64, align: "right" });
      y += 24;

      ensureSpace(28);
      doc.rect(MARGIN, y, tableWidth, 24).stroke("#cccccc");
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#059669")
        .text("Знижка", MARGIN + 10, y + 7);
      doc.text(`−${formatPrice(discount)}`, colPrice, y + 7, { width: 64, align: "right" });
      y += 24;
    }

    doc.rect(MARGIN, y, tableWidth, 28).lineWidth(1.5).stroke("#111111");
    doc
      .font("bold")
      .fontSize(12)
      .fillColor("#111111")
      .text("Разом до сплати", MARGIN + 10, y + 8);
    doc.text(formatPrice(booking.totalPrice), colPrice, y + 8, { width: 64, align: "right" });
    y += 40;

    if (booking.notes?.trim()) {
      ensureSpace(40);
      doc.font("bold").fontSize(10).fillColor("#111111").text("ПРИМІТКИ", MARGIN, y);
      y += 14;
      doc.font("regular").fontSize(10);
      const notesHeight = doc.heightOfString(booking.notes, { width: CONTENT_WIDTH });
      ensureSpace(notesHeight + 8);
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#111111")
        .text(booking.notes, MARGIN, y, { width: CONTENT_WIDTH });
      y += notesHeight + 16;
    }

    ensureSpace(60);
    y += 12;
    const signatureWidth = (CONTENT_WIDTH - 32) / 2;
    doc
      .moveTo(MARGIN, y)
      .lineTo(MARGIN + signatureWidth, y)
      .stroke("#111111");
    doc
      .moveTo(MARGIN + signatureWidth + 32, y)
      .lineTo(MARGIN + signatureWidth + 32 + signatureWidth, y)
      .stroke("#111111");
    y += 8;
    doc
      .font("regular")
      .fontSize(10)
      .fillColor("#111111")
      .text("Виконав _________________________", MARGIN, y, {
        width: signatureWidth,
      });
    doc.text("Клієнт _________________________", MARGIN + signatureWidth + 32, y, {
      width: signatureWidth,
    });

    drawPageFooters();
    doc.end();
  });

export const buildBookingReceiptPdf = async (input: BookingReceiptPdfInput) => {
  const orgLogoBuffer = input.organization.logo
    ? await resolveImageBuffer(input.organization.logo)
    : null;

  return renderReceiptPdfToBuffer(input, { orgLogoBuffer, autolabLogoBuffer });
};

export type AnalyticsReportBooking = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: keyof typeof statusLabels;
  totalPrice: string;
  clientName: string;
  vehicleLabel: string;
  servicesLabel: string;
};

type AnalyticsPdfInput = {
  organization: {
    name: string;
    logo?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
  analytics: z.infer<typeof organizationAnalyticsOutputSchema>;
  reportBookings: AnalyticsReportBooking[];
};

const formatDateRange = (from: string, to: string) => {
  dayjs.locale("uk");
  const fromDate = dayjs(from);
  const toDate = dayjs(to);

  if (fromDate.isSame(toDate, "day")) {
    return fromDate.format("D MMMM YYYY");
  }

  return `${fromDate.format("D MMM YYYY")} – ${toDate.format("D MMM YYYY")}`;
};

const formatShortDate = (startTime: Date, endTime: Date) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (start.isSame(end, "day")) {
    return `${start.format("D.MM.YY")}\n${start.format("HH:mm")}–${end.format("HH:mm")}`;
  }

  return formatBookingTimeRange(startTime, endTime);
};

const renderAnalyticsPdfToBuffer = (
  input: AnalyticsPdfInput,
  assets: { orgLogoBuffer: Buffer | null; autolabLogoBuffer: Buffer },
) =>
  new Promise<Buffer>((resolve, reject) => {
    dayjs.locale("uk");

    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      autoFirstPage: true,
      bufferPages: true,
      font: false as unknown as string,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("regular", fontRegularData);
    doc.registerFont("bold", fontBoldData);
    doc.registerFont(brandFontKey, resolveBrandFontData(AUTOLAB_BRAND));
    doc.font("regular");

    const { organization, analytics, reportBookings } = input;
    const { orgLogoBuffer, autolabLogoBuffer } = assets;
    let y = MARGIN;

    const drawAutolabBrand = (x: number, topY: number) => {
      const { iconSize, fontSize, gap, text } = AUTOLAB_BRAND;
      const textX = x + iconSize + gap;
      const textY = topY + (iconSize - fontSize) / 2 - 1;

      doc.image(autolabLogoBuffer, x, topY, { fit: [iconSize, iconSize] });
      doc.font(brandFontKey).fontSize(fontSize).fillColor("#111111");
      doc.text(text, textX, textY, { lineBreak: false });
    };

    const getAutolabBrandWidth = () => {
      doc.font(brandFontKey).fontSize(AUTOLAB_BRAND.fontSize);
      return AUTOLAB_BRAND.iconSize + AUTOLAB_BRAND.gap + doc.widthOfString(AUTOLAB_BRAND.text);
    };

    const ensureSpace = (height: number, options?: { tableHeader?: () => void }) => {
      if (y + height <= CONTENT_BOTTOM) return;

      doc.addPage();
      y = MARGIN;
      options?.tableHeader?.();
    };

    const drawPageFooters = () => {
      const range = doc.bufferedPageRange();
      const pageCount = range.count;
      const brandWidth = getAutolabBrandWidth();

      for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
        doc.switchToPage(range.start + pageIndex);

        const page = doc.page;
        const brandTop = page.height - page.margins.bottom - AUTOLAB_BRAND.iconSize - 4;
        const brandX = page.width - page.margins.right - brandWidth;
        const pageNumberY = brandTop + AUTOLAB_BRAND.iconSize / 2 - 4;

        doc.font("regular").fontSize(9).fillColor("#666666");
        doc.text(`Сторінка ${pageIndex + 1} з ${pageCount}`, page.margins.left, pageNumberY, {
          width: page.width - page.margins.left - page.margins.right,
          align: "center",
          lineBreak: false,
        });

        drawAutolabBrand(brandX, brandTop);
      }
    };

    const headerTextX = orgLogoBuffer ? MARGIN + 64 : MARGIN;
    const headerTextWidth = orgLogoBuffer ? CONTENT_WIDTH - 64 : CONTENT_WIDTH;

    if (orgLogoBuffer) {
      doc.image(orgLogoBuffer, MARGIN, y, { fit: [52, 52] });
    }

    doc.font("bold").fontSize(18).fillColor("#111111").text(organization.name, headerTextX, y, {
      width: headerTextWidth,
    });

    const contactParts = [organization.address, organization.phone, organization.email].filter(
      Boolean,
    );
    let headerOffset = doc.heightOfString(organization.name, { width: headerTextWidth });

    if (contactParts.length) {
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#444444")
        .text(contactParts.join(" · "), headerTextX, y + headerOffset + 4, {
          width: headerTextWidth,
        });
      headerOffset += doc.heightOfString(contactParts.join(" · "), { width: headerTextWidth }) + 4;
    }

    if (organization.website) {
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#444444")
        .text(organization.website, headerTextX, y + headerOffset + 4, { width: headerTextWidth });
      headerOffset += 14;
    }

    y += orgLogoBuffer ? Math.max(56, headerOffset + 16) : headerOffset + 16;
    doc
      .moveTo(MARGIN, y)
      .lineTo(PAGE_WIDTH - MARGIN, y)
      .lineWidth(1.5)
      .strokeColor("#111111")
      .stroke();
    y += 18;

    doc
      .font("bold")
      .fontSize(14)
      .fillColor("#111111")
      .text("АНАЛІТИЧНИЙ ЗВІТ", MARGIN, y, {
        width: CONTENT_WIDTH,
        align: "center",
      });
    y += 24;

    doc
      .font("regular")
      .fontSize(10)
      .fillColor("#444444")
      .text(`Період: ${formatDateRange(analytics.from, analytics.to)}`, MARGIN, y, {
        width: CONTENT_WIDTH,
        align: "center",
      });
    y += 14;
    doc.text(`Сформовано: ${dayjs().format("D MMMM YYYY, HH:mm")}`, MARGIN, y, {
      width: CONTENT_WIDTH,
      align: "center",
    });
    y += 28;

    const drawSectionTitle = (title: string) => {
      ensureSpace(24);
      doc.font("bold").fontSize(11).fillColor("#111111").text(title, MARGIN, y);
      y += 18;
    };

    const drawKeyValue = (label: string, value: string) => {
      ensureSpace(18);
      doc.font("regular").fontSize(10).fillColor("#666666").text(label, MARGIN, y, {
        width: 180,
      });
      doc.font("regular").fontSize(10).fillColor("#111111").text(value, MARGIN + 190, y, {
        width: CONTENT_WIDTH - 190,
      });
      y += 16;
    };

    drawSectionTitle("Підсумки");
    drawKeyValue("Усього записів", String(analytics.summary.totalBookings));
    drawKeyValue("Виконано", String(analytics.summary.completedBookings));
    drawKeyValue("В роботі", String(analytics.summary.inProgressBookings));
    drawKeyValue("Скасовано", String(analytics.summary.cancelledBookings));
    drawKeyValue("Дохід (виконані)", formatPrice(analytics.summary.totalRevenue));
    drawKeyValue("Середній чек", formatPrice(analytics.summary.averageTicket));
    drawKeyValue("Нові клієнти", String(analytics.summary.newClients));
    y += 8;

    drawSectionTitle("Записи за статусом");
    if (analytics.statusBreakdown.length) {
      for (const row of analytics.statusBreakdown) {
        drawKeyValue(
          statusLabels[row.status],
          `${row.count} · ${formatPrice(row.revenue)}`,
        );
      }
    } else {
      ensureSpace(16);
      doc.font("regular").fontSize(10).fillColor("#666666").text("Немає даних", MARGIN, y);
      y += 16;
    }
    y += 8;

    drawSectionTitle("Топ послуг");
    if (analytics.topServices.length) {
      for (const service of analytics.topServices) {
        drawKeyValue(
          service.title,
          `${service.count} · ${formatPrice(service.revenue)}`,
        );
      }
    } else {
      ensureSpace(16);
      doc.font("regular").fontSize(10).fillColor("#666666").text("Немає даних", MARGIN, y);
      y += 16;
    }
    y += 8;

    drawSectionTitle("Дохід по днях");
    if (analytics.revenueTimeSeries.length) {
      for (const point of analytics.revenueTimeSeries) {
        drawKeyValue(
          dayjs(point.date).format("D MMM YYYY"),
          `${point.bookingsCount} · ${formatPrice(point.revenue)}`,
        );
      }
    } else {
      ensureSpace(16);
      doc.font("regular").fontSize(10).fillColor("#666666").text("Немає даних", MARGIN, y);
      y += 16;
    }
    y += 12;

    const colNo = MARGIN;
    const colDate = MARGIN + 22;
    const colStatus = MARGIN + 92;
    const colClient = MARGIN + 152;
    const colVehicle = MARGIN + 228;
    const colServices = MARGIN + 312;
    const colPrice = PAGE_WIDTH - MARGIN - 58;
    const tableWidth = CONTENT_WIDTH;

    const colDateWidth = 66;
    const colStatusWidth = 56;
    const colClientWidth = 72;
    const colVehicleWidth = 80;
    const colServicesWidth = colPrice - colServices - 8;
    const colPriceWidth = 58;

    const drawBookingsTableHeader = () => {
      doc.rect(MARGIN, y, tableWidth, 22).fillAndStroke("#f5f5f5", "#cccccc");
      doc.font("bold").fontSize(7).fillColor("#111111");
      doc.text("№", colNo + 4, y + 8, { width: 16 });
      doc.text("ДАТА", colDate, y + 8, { width: colDateWidth });
      doc.text("СТАТУС", colStatus, y + 8, { width: colStatusWidth });
      doc.text("КЛІЄНТ", colClient, y + 8, { width: colClientWidth });
      doc.text("АВТО", colVehicle, y + 8, { width: colVehicleWidth });
      doc.text("ПОСЛУГИ", colServices, y + 8, { width: colServicesWidth });
      doc.text("СУМА", colPrice, y + 8, { width: colPriceWidth, align: "right" });
      y += 22;
    };

    drawSectionTitle(`Записи за період (${reportBookings.length})`);

    if (!reportBookings.length) {
      ensureSpace(16);
      doc.font("regular").fontSize(10).fillColor("#666666").text("Немає записів", MARGIN, y);
      y += 16;
    } else {
      drawBookingsTableHeader();

      let totalRevenue = 0;
      let completedRevenue = 0;

      reportBookings.forEach((booking, index) => {
        const dateText = formatShortDate(booking.startTime, booking.endTime);
        const statusText = statusLabels[booking.status];
        const priceValue = Number(booking.totalPrice);
        totalRevenue += priceValue;
        if (booking.status === "COMPLETED") {
          completedRevenue += priceValue;
        }

        doc.font("regular").fontSize(7);
        const servicesHeight = doc.heightOfString(booking.servicesLabel, {
          width: colServicesWidth,
        });
        const dateHeight = doc.heightOfString(dateText, { width: colDateWidth });
        const rowHeight = Math.max(20, servicesHeight, dateHeight) + 8;

        ensureSpace(rowHeight, { tableHeader: drawBookingsTableHeader });

        const rowY = y;
        const isEven = index % 2 === 0;
        if (isEven) {
          doc.rect(MARGIN, rowY, tableWidth, rowHeight).fill("#fafafa");
        }
        doc.rect(MARGIN, rowY, tableWidth, rowHeight).stroke("#e5e5e5");

        doc.font("regular").fontSize(7).fillColor("#111111");
        doc.text(String(index + 1), colNo + 4, rowY + 5, { width: 16 });
        doc.text(dateText, colDate, rowY + 5, { width: colDateWidth });
        doc.text(statusText, colStatus, rowY + 5, { width: colStatusWidth });
        doc.text(booking.clientName, colClient, rowY + 5, { width: colClientWidth });
        doc.text(booking.vehicleLabel, colVehicle, rowY + 5, { width: colVehicleWidth });
        doc.text(booking.servicesLabel, colServices, rowY + 5, { width: colServicesWidth });
        doc.text(formatPrice(booking.totalPrice), colPrice, rowY + 5, {
          width: colPriceWidth,
          align: "right",
        });

        y += rowHeight;
      });

      const totalsHeight = 28;
      ensureSpace(totalsHeight, { tableHeader: drawBookingsTableHeader });

      doc.rect(MARGIN, y, tableWidth, totalsHeight).fillAndStroke("#f0f0f0", "#cccccc");
      doc.font("bold").fontSize(8).fillColor("#111111");
      doc.text("Підсумок", colServices, y + 9, { width: colServicesWidth - 40 });
      doc.text(formatPrice(totalRevenue), colPrice, y + 9, {
        width: colPriceWidth,
        align: "right",
      });
      y += totalsHeight;

      ensureSpace(16);
      doc
        .font("regular")
        .fontSize(8)
        .fillColor("#666666")
        .text(
          `Дохід від виконаних робіт: ${formatPrice(completedRevenue)}`,
          MARGIN,
          y,
          { width: CONTENT_WIDTH, align: "right" },
        );
      y += 14;
    }

    drawPageFooters();
    doc.end();
  });

const mapReportBooking = (row: {
  id: string;
  startTime: Date;
  endTime: Date;
  status: keyof typeof statusLabels;
  totalPrice: string;
  vehicle?: {
    make: string;
    model: string;
    licensePlate?: string | null;
    client?: {
      firstName: string;
      lastName?: string | null;
      middleName?: string | null;
    } | null;
  } | null;
  employee?: {
    user?: { name?: string | null } | null;
  } | null;
  bookingServices?: Array<{ service?: { title?: string | null } | null }>;
}): AnalyticsReportBooking => ({
  id: row.id,
  startTime: row.startTime,
  endTime: row.endTime,
  status: row.status,
  totalPrice: row.totalPrice,
  clientName: row.vehicle?.client ? getClientName(row.vehicle.client) : "—",
  vehicleLabel: row.vehicle
    ? `${row.vehicle.make} ${row.vehicle.model}${row.vehicle.licensePlate ? ` (${row.vehicle.licensePlate})` : ""}`
    : "—",
  servicesLabel:
    row.bookingServices
      ?.map((entry) => entry.service?.title)
      .filter((title): title is string => Boolean(title))
      .join(", ") || "—",
});

export const buildOrganizationAnalyticsPdf = async (input: AnalyticsPdfInput) => {
  const orgLogoBuffer = input.organization.logo
    ? await resolveImageBuffer(input.organization.logo)
    : null;

  return renderAnalyticsPdfToBuffer(input, { orgLogoBuffer, autolabLogoBuffer });
};

export { mapReportBooking };
