/** Modern Graphic template renderer */
import type { TemplateCoreOptions } from "../templates";
import {
  drawPhoto,
  roundRect,
  slotsStaggered,
  DISPLAY_FONT,
  HAND_FONT,
  W,
  H,
} from "./slots";

export function renderModernGraphic(
  ctx: CanvasRenderingContext2D,
  opts: TemplateCoreOptions,
  scale: number,
) {
  const slots = slotsStaggered(8);

  // Background: Gradient biru tebal dengan grain texture
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#1E3A8A");
  gradient.addColorStop(1, "#334155");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Grain texture overlay
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillRect(x, y, 1, 1);
  }

  // Header: EVERY MOMENT 1.0 (bold)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `48px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("EVERY MOMENT 1.0", W / 2, 85);

  // Horizontal barcode
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 180);
  ctx.lineTo(W - 100, 180);
  ctx.stroke();

  // Barcode pattern
  ctx.fillStyle = "#CBD5E1";
  for (let i = 0; i < 25; i++) {
    const barHeight = 15 + Math.random() * 30;
    ctx.fillRect(100 + i * 28, 180 - barHeight, 14, barHeight);
  }

  // Slot borders
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  }

  // Photos
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, s.x + 2, s.y + 2, s.w - 4, s.h - 4, 12);
    ctx.save();
    ctx.clip();
    drawPhoto(ctx, opts.photos[i], s.x + 2, s.y + 2, s.w - 4, s.h - 4);
    ctx.restore();
  }

  // Date footer
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `22px ${HAND_FONT}`;
  ctx.fillText(opts.dateText, W / 2, H - 55);
}
