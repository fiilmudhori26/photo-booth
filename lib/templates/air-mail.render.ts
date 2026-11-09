/** Air Mail Postal template renderer */
import type { TemplateCoreOptions, TemplateExtraOptions } from "../templates";
import {
  drawPhoto,
  roundRect,
  slotsDual,
  DISPLAY_FONT,
  HAND_FONT,
  W,
  H,
} from "./slots";

export function renderAirMail(
  ctx: CanvasRenderingContext2D,
  opts: TemplateCoreOptions,
  scale: number,
) {
  const extra = opts as TemplateExtraOptions;
  const slots = slotsDual(8, 4);

  // Background: Putih
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, W, H);

  // Diagonal borders (merah-biru-putih)
  ctx.strokeStyle = "#B91C1C";
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.2 - i * 15);
    ctx.lineTo(W, 0);
    ctx.moveTo(0, H * 0.8 + i * 15);
    ctx.lineTo(W, H);
    ctx.stroke();
  }

  // Header: AIR MAIL POSTAL
  ctx.fillStyle = "#0F172A";
  ctx.font = `42px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("AIR MAIL POSTAL", W / 2, 70);

  // APPROVED stamp (merah-putih)
  ctx.fillStyle = "#B91C1C";
  ctx.fillRect(W / 2 - 200, 100, 160, 50);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `22px ${HAND_FONT}`;
  ctx.fillText("APPROVED", W / 2 - 120, 130);

  // POSTAL SERVICE stamp
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(W / 2 + 40, 100, 140, 35);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `16px ${HAND_FONT}`;
  ctx.fillText("POSTAL", W / 2 + 55, 122);
  ctx.font = `14px ${HAND_FONT}`;
  ctx.fillText("SERVICE", W / 2 + 55, 138);

  // Package sticker
  ctx.fillStyle = "#FBBF24";
  ctx.beginPath();
  ctx.rect(W / 2 - 60, 55, 50, 30);
  ctx.fill();
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "10px system-ui";
  ctx.fillText("📦", W / 2 - 45, 72);

  // SEND TO field
  ctx.fillStyle = "#0F172A";
  ctx.font = `24px ${DISPLAY_FONT}`;
  ctx.fillText(
    "SEND TO: " + (extra.toText || " DESTINATION"),
    W / 2,
    H - 180,
  );

  // Photos (8 total, dual strip 2x4)
  for (let i = 0; i < 8; i++) {
    const s = slots[i];

    // Photo background
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, s.x, s.y, s.w, s.h, 14);
    ctx.save();
    ctx.clip();
    drawPhoto(ctx, opts.photos[i], s.x, s.y, s.w, s.h);
    ctx.restore();

    // Border (merah-biru-putih scheme)
    ctx.strokeStyle = i % 3 === 0 ? "#B91C1C" : i % 3 === 1 ? "#1E3A8A" : "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
  }

  // Date footer
  ctx.font = `20px ${DISPLAY_FONT}`;
  ctx.fillStyle = "#0F172A";
  ctx.fillText("DATE: " + opts.dateText, W / 2, H - 55);
}
