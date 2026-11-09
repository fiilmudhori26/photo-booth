/** Render a photo strip to a data URL. */

import { loadImage } from "./filters";
import {
  STRIP_W,
  drawStrip,
  stripHeight,
  type StripRenderOptions,
} from "./strip";
import type { ExportFormat } from "./types";

/** Resolution multiplier used for the downloaded file (preview is 1x). */
export const STRIP_EXPORT_SCALE = 2;

export async function renderStripToDataUrl(
  options: Omit<StripRenderOptions, "photos"> & { photos: string[] },
  format: ExportFormat,
): Promise<string> {
  // Make sure webfonts are ready so captions and stickers render correctly.
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const images = await Promise.all(
    options.photos.map((src) => loadImage(src).catch(() => null)),
  );

  const height = stripHeight(options.pad);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(STRIP_W * STRIP_EXPORT_SCALE);
  canvas.height = Math.round(height * STRIP_EXPORT_SCALE);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  drawStrip(
    ctx,
    { ...options, photos: images, selectedStickerId: null },
    STRIP_EXPORT_SCALE,
  );

  return canvas.toDataURL(
    format === "png" ? "image/png" : "image/jpeg",
    0.95,
  );
}
