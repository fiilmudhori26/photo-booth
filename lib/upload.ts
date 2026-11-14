import { CAPTURE_H, CAPTURE_W } from "./strip";

function decode(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };
    img.src = url;
  });
}

/**
 * Turns a photo picked from the gallery into a 4:3 JPEG data URL identical in
 * shape to a camera grab, so filters, preview and export behave the same.
 */
export async function fileToShot(file: File): Promise<string> {
  const img = await decode(file);
  const sw = img.naturalWidth || CAPTURE_W;
  const sh = img.naturalHeight || CAPTURE_H;

  const canvas = document.createElement("canvas");
  canvas.width = CAPTURE_W;
  canvas.height = CAPTURE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");

  const scale = Math.max(CAPTURE_W / sw, CAPTURE_H / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, (CAPTURE_W - dw) / 2, (CAPTURE_H - dh) / 2, dw, dh);

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
