import { downloadDataUrl, fileStamp } from "./export";
import type { ExportFormat } from "./types";

export function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Data gambar tidak valid");
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Shares a rendered strip image via the native share sheet. Falls back to a
 * plain download when the Web Share API (or file sharing) is unavailable —
 * so desktop browsers still get the file.
 */
export async function shareImage(
  dataUrl: string,
  options: { title: string; text?: string; format?: ExportFormat | "gif" } = {
    title: "my dipaaa",
  },
): Promise<"shared" | "downloaded"> {
  const format = options.format ?? "png";
  const ext = format === "jpg" ? "jpg" : format;
  const mime =
    format === "gif" ? "image/gif" : format === "jpg" ? "image/jpeg" : "image/png";
  const filename = `my-dipaaa-${fileStamp(new Date())}.${ext}`;
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], filename, { type: mime });

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFiles && typeof navigator.share === "function") {
    try {
      await navigator.share({ files: [file], title: options.title, text: options.text });
      return "shared";
    } catch (error) {
      // User dismissed the sheet — don't surprise them with a download.
      if (error instanceof DOMException && error.name === "AbortError") {
        return "shared";
      }
      // Anything else (e.g. NotAllowedError / share not allowed) — fall back.
    }
  }

  downloadDataUrl(dataUrl, filename);
  return "downloaded";
}
