/** Render a photo booth template to a data URL (1200px wide for print quality). */

import { loadImage } from "./filters";
import {
  TEMPLATE_W,
  TEMPLATE_H,
  type PhotoBoothTemplate,
  type TemplateCoreOptions,
  getTemplate,
} from "./templates";
import type { ExportFormat, TemplateId } from "./types";

/** Resolution multiplier used for the downloaded file (preview is 1x). */
export const TEMPLATE_EXPORT_SCALE = 1;

export async function renderTemplateToDataUrl(
  templateId: TemplateId,
  options: {
    photos: string[];
    caption: string;
    dateText: string;
  } & Record<string, unknown>,
  format: ExportFormat,
): Promise<string> {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const images = await Promise.all(
    options.photos.map((src: string) => loadImage(src).catch(() => null)),
  );

  const template: PhotoBoothTemplate = getTemplate(templateId);
  const height = TEMPLATE_H;

  const canvas = document.createElement("canvas");
  canvas.width = TEMPLATE_W;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  template.render(ctx, {
    photos: images,
    caption: options.caption as string,
    dateText: options.dateText as string,
  } as TemplateCoreOptions, TEMPLATE_EXPORT_SCALE);

  return canvas.toDataURL(
    format === "png" ? "image/png" : "image/jpeg",
    0.95,
  );
}
