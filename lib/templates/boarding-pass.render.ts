/** Boarding Pass template renderer */
import type { TemplateCoreOptions } from "../templates";
import {
  drawPhoto,
  roundRect,
  slots2x2,
  DISPLAY_FONT,
  HAND_FONT,
  W,
  H,
} from "./slots";

export function renderBoardingPass(
  ctx: CanvasRenderingContext2D,
  opts: TemplateCoreOptions,
  scale: number,
) {
  const slots = slots2x2();

  // Background: White
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // Border: Maroon (aksen)
  ctx.strokeStyle = "#7B1E2A";
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Header: BOARDING PASS (large text)
  ctx.fillStyle = "#7B1E2A";
  ctx.font = `48px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("BOARDING PASS", W / 2, 80);

  // Route: USA ✈ CN (besar, mencolok)
  ctx.fillStyle = "#333333";
  ctx.font = `32px ${HAND_FONT}`;
  ctx.fillText("USA ✈ CN", W / 2, 155);

  // Flight Number: GF 6815
  ctx.font = `28px ${HAND_FONT}`;
  ctx.fillText("FLIGHT GF 6815", W / 2, 200);

  // Gate & Seat (centered)
  ctx.font = `22px ${HAND_FONT}`;
  ctx.fillText("GATE B12   SEAT 14A", W / 2, 250);

  // Horizontal Barcode (above photos section)
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 340);
  ctx.lineTo(W - 120, 340);
  ctx.stroke();

  // Add barcode pattern
  ctx.fillStyle = "#000000";
  for (let i = 0; i < 20; i++) {
    const barHeight = 8 + Math.random() * 20;
    ctx.fillRect(120 + i * 24, 340 - barHeight, 18, barHeight);
  }

  // QR Code (bottom right corner)
  ctx.fillStyle = "#000000";
  ctx.fillRect(W - 160, H - 200, 90, 90);
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 1;
  ctx.strokeRect(W - 160, H - 200, 90, 90);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "8px monospace";
  ctx.fillText("QR", W - 150, H - 180);
  ctx.fillText("CODE", W - 150, H - 170);

  // Date
  ctx.fillStyle = "#6B4A5A";
  ctx.font = `20px ${HAND_FONT}`;
  ctx.fillText("DATE: " + opts.dateText, W / 2, H - 130);

  // Footer: PHOTO BOOTH
  ctx.fillStyle = "#7B1E2A";
  ctx.font = `24px ${DISPLAY_FONT}`;
  ctx.fillText("PHOTO BOOTH", W / 2, H - 75);

  // Photos (4 slots in 2x2 grid position)
  for (let i = 0; i < 4; i++) {
    const s = slots[i];
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    roundRect(ctx, s.x, s.y, s.w, s.h, 16);
    ctx.save();
    ctx.clip();
    drawPhoto(ctx, opts.photos[i], s.x, s.y, s.w, s.h);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
  }
}
