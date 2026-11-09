/** Shared canvas rendering helpers for photo booth templates. */

import type { PhotoSlot } from "../templates";

export const W = 1200;
export const H = 1600;

export const DISPLAY_FONT = '"Cherry Bomb One", "Baloo 2", system-ui, cursive';
export const HAND_FONT = '"Gaegu", "M PLUS Rounded 1c", system-ui, cursive';
export const SANS_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!img) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const sw = img.naturalWidth || w;
  const sh = img.naturalHeight || h;
  const scale = Math.max(w / sw, h / sh);
  ctx.drawImage(
    img,
    x + (w - sw * scale) / 2,
    y + (h - sh * scale) / 2,
    sw * scale,
    sh * scale,
  );
}

export function slots2x2(): PhotoSlot[] {
  const gap = 24;
  const startX = 60;
  const startY = 140;
  const totalW = W - startX * 2;
  const slotW = (totalW - gap) / 2;
  const slotH = slotW / 1.333;
  return [
    { x: startX, y: startY, w: slotW, h: slotH },
    { x: startX + slotW + gap, y: startY, w: slotW, h: slotH },
    { x: startX, y: startY + slotH + gap, w: slotW, h: slotH },
    { x: startX + slotW + gap, y: startY + slotH + gap, w: slotW, h: slotH },
  ];
}

export function slotsVertical(
  count: number,
  startX = 80,
): PhotoSlot[] {
  const gap = 20;
  const w = 300;
  const h = 225;
  const startY = 120;
  return Array.from({ length: count }, (_, i) => ({
    x: startX,
    y: startY + i * (h + gap),
    w,
    h,
  }));
}

export function slotsStaggered(count: number, startX = 80): PhotoSlot[] {
  const gap = 20;
  const w = 300;
  const h = 225;
  const colGap = gap + 40;
  const col1X = startX;
  const col2X = W - startX - w;
  return Array.from({ length: count }, (_, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    return {
      x: col === 0 ? col1X : col2X,
      y: 120 + row * (h + gap),
      w,
      h,
    };
  });
}

export function slotsDual(
  count: number,
  rowsPerColumn: number,
  startX = 80,
): PhotoSlot[] {
  const gap = 20;
  const w = 300;
  const h = 225;
  const colGap = gap + 40;
  const col1X = startX;
  const col2X = W - startX - w;
  const startY = 120;
  const slots: PhotoSlot[] = [];
  for (let row = 0; row < rowsPerColumn; row++) {
    const y = startY + row * (h + gap);
    slots.push({ x: col1X, y, w, h }, { x: col2X, y, w, h });
  }
  return slots;
}
