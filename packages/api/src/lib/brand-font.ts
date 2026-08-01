import { geistBoldItalicBase64 } from "../assets/generated/geist-bold-italic";
import { bufferFromBase64 } from "./pdf-assets";

export type PdfBrandFontFamily = "geist";
export type PdfBrandFontWeight = 400 | 500 | 600 | 700;
export type PdfBrandFontStyle = "normal" | "italic";

export type PdfBrandFontOptions = {
  fontFamily: PdfBrandFontFamily;
  fontWeight: PdfBrandFontWeight;
  fontStyle: PdfBrandFontStyle;
};

export const resolveBrandFontData = (options: PdfBrandFontOptions): Buffer => {
  if (options.fontFamily !== "geist") {
    throw new Error(`Unsupported brand font family: ${options.fontFamily}`);
  }

  if (options.fontWeight === 700 && options.fontStyle === "italic") {
    return bufferFromBase64(geistBoldItalicBase64);
  }

  throw new Error(
    `Unsupported brand font variant: ${options.fontWeight} ${options.fontStyle}`,
  );
};

export const getBrandFontRegistrationKey = (options: PdfBrandFontOptions) =>
  `brand-${options.fontFamily}-${options.fontWeight}-${options.fontStyle}`;
