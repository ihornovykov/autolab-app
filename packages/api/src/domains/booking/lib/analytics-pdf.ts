import { createRequire } from "node:module";

import dayjs from "dayjs";
import "dayjs/locale/uk.js";
import PDFDocument from "pdfkit";
import sharp from "sharp";

import {
  getBrandFontRegistrationKey,
  resolveBrandFontData,
  type PdfBrandFontOptions,
} from "../../../lib/brand-font";
import autolabLogoSvg from "../../../assets/autolab.svg" with { type: "bytes" };
import {
  formatBookingTimeRange,
  formatPrice,
  getClientName,
} from "../../../lib/format";
import type { organizationAnalyticsOutputSchema } from "../validation";
import type { z } from "zod";

const require = createRequire(import.meta.url);
const fontRegularPath = require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans.ttf");
const fontBoldPath = require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf");

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

const loadAutolabLogoBuffer = () =>
  sharp(autolabLogoSvg).resize(128, 128, { fit: "contain" }).png().toBuffer();

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

const renderPdfToBuffer = (
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
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("regular", fontRegularPath);
    doc.registerFont("bold", fontBoldPath);
    doc.registerFont(brandFontKey, resolveBrandFontData(AUTOLAB_BRAND));

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
  const [orgLogoBuffer, autolabLogoBuffer] = await Promise.all([
    input.organization.logo ? resolveImageBuffer(input.organization.logo) : Promise.resolve(null),
    loadAutolabLogoBuffer(),
  ]);

  return renderPdfToBuffer(input, { orgLogoBuffer, autolabLogoBuffer });
};

export { mapReportBooking };
