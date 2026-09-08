import dayjs from "dayjs";

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "dokument";

const formatDateLabel = (date: Date) => dayjs(date).format("YYYY-MM-DD");

export const buildBookingReceiptFilename = (input: {
  startTime: Date;
  licensePlate?: string | null;
  make?: string;
  model?: string;
}) => {
  const date = formatDateLabel(input.startTime);
  const vehicleLabel = input.licensePlate?.trim()
    ? sanitizeFilenamePart(input.licensePlate)
    : sanitizeFilenamePart([input.make, input.model].filter(Boolean).join(" "));

  return `akt-${date}-${vehicleLabel}.pdf`;
};

export const buildAnalyticsReportFilename = (input: {
  organizationName: string;
  from: Date;
  to: Date;
}) => {
  const organization = sanitizeFilenamePart(input.organizationName);
  const from = formatDateLabel(input.from);
  const to = formatDateLabel(input.to);
  const range = from === to ? from : `${from}-${to}`;

  return `zvit-${organization}-${range}.pdf`;
};
