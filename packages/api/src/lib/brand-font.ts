import geistBoldItalic from "../assets/fonts/Geist-BoldItalic.ttf" with { type: "bytes" };

import { toBinaryAssetBuffer } from "./pdf-assets";

export type PdfBrandFontFamily = "geist";
export type PdfBrandFontWeight = 400 | 500 | 600 | 700;
export type PdfBrandFontStyle = "normal" | "italic";

export type PdfBrandFontOptions = {
  fontFamily: PdfBrandFontFamily;
  fontWeight: PdfBrandFontWeight;
  fontStyle: PdfBrandFontStyle;
};

export const resolveBrandFontData = (options: PdfBrandFontOptions): Uint8Array => {
  if (options.fontFamily !== "geist") {
    throw new Error(`Unsupported brand font family: ${options.fontFamily}`);
  }

  if (options.fontWeight === 700 && options.fontStyle === "italic") {
    return new Uint8Array(
      toBinaryAssetBuffer(geistBoldItalic, "../assets/fonts/Geist-BoldItalic.ttf"),
    );
  }

  throw new Error(
    `Unsupported brand font variant: ${options.fontWeight} ${options.fontStyle}`,
  );
};

export const getBrandFontRegistrationKey = (options: PdfBrandFontOptions) =>
  `brand-${options.fontFamily}-${options.fontWeight}-${options.fontStyle}`;
