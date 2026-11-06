import { loadImage } from "./filters";
import { STRIP_W, drawStrip, stripHeight, type StripRenderOptions } from "./strip";
import { TEMPLATE_W, TEMPLATE_H, type PhotoBoothTemplate, type TemplateRenderOptions, getTemplate } from "./templates";
import type { ExportFormat, TemplateId } from "./types";

/** Resolution multiplier used for the downloaded file (preview is 1x). */
export const EXPORT_SCALE = 2;

/** Export using a template (returns 1200px wide for print quality). */
export async function renderTemplateToDataUrl(
  templateId: TemplateId,
  options: { photos: string[]; caption: string; dateText: string } & Record<string, unknown>,
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
    ...(options as Omit<TemplateRenderOptions, 'photos' | 'caption' | 'dateText'>),
  } as TemplateRenderOptions, 1);

  return canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
}

export function formatStamp(date: Date): string {
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function fileStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}`;
}

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
  canvas.width = Math.round(STRIP_W * EXPORT_SCALE);
  canvas.height = Math.round(height * EXPORT_SCALE);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  drawStrip(
    ctx,
    { ...options, photos: images, selectedStickerId: null },
    EXPORT_SCALE,
  );

  return canvas.toDataURL(
    format === "png" ? "image/png" : "image/jpeg",
    0.95,
  );
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
