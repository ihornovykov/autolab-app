import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import dayjs from "dayjs";
import "dayjs/locale/uk.js";
import PDFDocument from "pdfkit";
import sharp from "sharp";

import {
  formatBookingTimeRange,
  formatDuration,
  formatPrice,
  getClientName,
} from "../../../lib/format";
import {
  getBrandFontRegistrationKey,
  resolveBrandFontPath,
  type PdfBrandFontOptions,
} from "../../../lib/brand-font";

const require = createRequire(import.meta.url);
const currentDir = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(currentDir, "../../../assets");
const autolabLogoPath = join(assetsDir, "autolab.svg");
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

const roleLabels = {
  OWNER: "Власник",
  MANAGER: "Менеджер",
  TECHNICIAN: "Працівник",
} as const;

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
  role: keyof typeof roleLabels;
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

const loadAutolabLogoBuffer = () =>
  sharp(autolabLogoPath).resize(128, 128, { fit: "contain" }).png().toBuffer();

const renderPdfToBuffer = (
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
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("regular", fontRegularPath);
    doc.registerFont("bold", fontBoldPath);
    doc.registerFont(brandFontKey, resolveBrandFontPath(AUTOLAB_BRAND));

    const { booking, organization, vehicle, employee } = input;
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
    const colDuration = PAGE_WIDTH - MARGIN - 150;
    const colPrice = PAGE_WIDTH - MARGIN - 70;
    const titleWidth = colDuration - colTitle - 8;
    const tableWidth = CONTENT_WIDTH;

    const drawTableHeader = () => {
      doc.rect(MARGIN, y, tableWidth, 22).fillAndStroke("#f5f5f5", "#cccccc");
      doc.font("bold").fontSize(8).fillColor("#111111");
      doc.text("№", colNo + 6, y + 7, { width: 20 });
      doc.text("ПОСЛУГА / ОПИС РОБІТ", colTitle + 4, y + 7, { width: titleWidth });
      doc.text("ТРИВАЛІСТЬ", colDuration, y + 7, { width: 70, align: "right" });
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
      .text("КВИТАНЦІЯ ПРО ВИКОНАНІ РОБОТИ", MARGIN, y, {
        width: CONTENT_WIDTH,
        align: "center",
      });
    y += 28;

    const columnWidth = CONTENT_WIDTH / 2 - 8;
    drawLabelValue("Номер запису", booking.id, MARGIN, y, columnWidth);
    drawLabelValue(
      "Дата видачі",
      dayjs().format("D MMMM YYYY, HH:mm"),
      MARGIN + columnWidth + 16,
      y,
      columnWidth,
    );
    y += 38;
    const totalDuration =
      booking.services?.reduce(
        (sum, service) => sum + service.duration * (service.quantity ?? 1),
        0,
      ) ?? 0;
    drawLabelValue("Статус", statusLabels[booking.status], MARGIN, y, columnWidth);
    drawLabelValue(
      "Загальна тривалість",
      totalDuration ? formatDuration(totalDuration) : "—",
      MARGIN + columnWidth + 16,
      y,
      columnWidth,
    );
    y += 42;

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

    doc.font("bold").fontSize(10).fillColor("#111111").text("ВИКОНАННЯ РОБІТ", MARGIN, y);
    y += 14;
    drawLabelValue(
      "Дата та час",
      formatBookingTimeRange(booking.startTime, booking.endTime),
      MARGIN,
      y,
      columnWidth,
    );
    const employeeName = employee?.name ?? "—";
    const employeeRole = employee ? roleLabels[employee.role] : "—";
    drawLabelValue(
      "Майстер",
      `${employeeName} (${employeeRole})`,
      MARGIN + columnWidth + 16,
      y,
      columnWidth,
    );
    y += 38;

    if (booking.allowsOvertime) {
      doc
        .font("regular")
        .fontSize(10)
        .fillColor("#666666")
        .text("Дозволено понаднормове обслуговування", MARGIN, y);
      y += 18;
    }

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
            formatDuration(service.duration * (service.quantity ?? 1)),
            colDuration,
            y + 8,
            {
              width: 70,
              align: "right",
            },
          );
        doc.text(
          formatPrice(
            Number(service.unitPrice ?? service.price) * (service.quantity ?? 1),
          ),
          colPrice,
          y + 8,
          { width: 64, align: "right" },
        );
        y += rowHeight;
      });
    }

    ensureSpace(34);
    y += 8;
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
  const [orgLogoBuffer, autolabLogoBuffer] = await Promise.all([
    input.organization.logo ? resolveImageBuffer(input.organization.logo) : Promise.resolve(null),
    loadAutolabLogoBuffer(),
  ]);

  return renderPdfToBuffer(input, { orgLogoBuffer, autolabLogoBuffer });
};
