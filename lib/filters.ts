import type { FilterId } from "./types";

export interface FilterPreset {
  id: FilterId;
  label: string;
  icon: string;
  hint: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "normal", label: "Soft Normal", icon: "🌸", hint: "True to life" },
  { id: "bw", label: "Classic Mono", icon: "🎞️", hint: "Timeless B&W" },
  { id: "vintage", label: "Vintage Warm", icon: "🍮", hint: "Faded & toasty" },
  { id: "pink", label: "Pastel Bloom", icon: "🧁", hint: "Dreamy pink glow" },
  { id: "contrast", label: "Punchy Pop", icon: "🍬", hint: "High contrast" },
];

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * Applies a preset to raw RGBA pixel data. Done by hand (instead of
 * `ctx.filter`) so the exported strip matches the on-screen preview
 * everywhere, including Safari where `ctx.filter` is unsupported.
 */
export function applyFilterToData(id: FilterId, d: Uint8ClampedArray) {
  if (id === "normal") return;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    switch (id) {
      case "bw": {
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        const v = clamp255((l - 128) * 1.14 + 133);
        r = g = b = v;
        break;
      }
      case "vintage": {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r * 0.34 + sr * 0.66;
        g = g * 0.34 + sg * 0.66;
        b = b * 0.34 + sb * 0.66;
        r = clamp255(r * 0.9 + 30);
        g = clamp255(g * 0.9 + 21);
        b = clamp255(b * 0.88 + 13);
        break;
      }
      case "pink": {
        r = r + (255 - r) * 0.26;
        g = g + (255 - g) * 0.3;
        b = b + (255 - b) * 0.22;
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        r = r * 0.84 + l * 0.16;
        g = g * 0.84 + l * 0.16;
        b = b * 0.84 + l * 0.16;
        r = clamp255(r + 17);
        g = clamp255(g - 3);
        b = clamp255(b + 11);
        break;
      }
      case "contrast": {
        r = clamp255((r - 128) * 1.52 + 134);
        g = clamp255((g - 128) * 1.52 + 134);
        b = clamp255((b - 128) * 1.52 + 134);
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        r = clamp255(l + (r - l) * 1.16);
        g = clamp255(l + (g - l) * 1.16);
        b = clamp255(l + (b - l) * 1.16);
        break;
      }
      default:
        break;
    }

    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = src;
  });
}

/** Re-renders a captured frame with the chosen filter baked in. */
export async function renderFilteredShot(
  raw: string,
  id: FilterId,
): Promise<string> {
  if (id === "normal") return raw;

  const img = await loadImage(raw);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;

  ctx.drawImage(img, 0, 0);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyFilterToData(id, frame.data);
  ctx.putImageData(frame, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.92);
}
