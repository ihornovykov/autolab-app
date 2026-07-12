import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

export type PdfBrandFontFamily = "geist";
export type PdfBrandFontWeight = 400 | 500 | 600 | 700;
export type PdfBrandFontStyle = "normal" | "italic";

export type PdfBrandFontOptions = {
  fontFamily: PdfBrandFontFamily;
  fontWeight: PdfBrandFontWeight;
  fontStyle: PdfBrandFontStyle;
};

const geistWeightStyleFiles: Record<PdfBrandFontWeight, Record<PdfBrandFontStyle, string>> = {
  400: { normal: "Geist-Regular.ttf", italic: "Geist-Italic.ttf" },
  500: { normal: "Geist-Medium.ttf", italic: "Geist-MediumItalic.ttf" },
  600: { normal: "Geist-SemiBold.ttf", italic: "Geist-SemiBoldItalic.ttf" },
  700: { normal: "Geist-Bold.ttf", italic: "Geist-BoldItalic.ttf" },
};

const geistSansEntry = require.resolve("geist/font/sans");
const geistFontsDir = join(dirname(geistSansEntry), "fonts/geist-sans");

export const resolveBrandFontPath = (options: PdfBrandFontOptions) => {
  if (options.fontFamily !== "geist") {
    throw new Error(`Unsupported brand font family: ${options.fontFamily}`);
  }

  const fileName = geistWeightStyleFiles[options.fontWeight][options.fontStyle];
  return join(geistFontsDir, fileName);
};

export const getBrandFontRegistrationKey = (options: PdfBrandFontOptions) =>
  `brand-${options.fontFamily}-${options.fontWeight}-${options.fontStyle}`;
