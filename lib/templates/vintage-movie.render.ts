/** Vintage Movie Ticket template renderer */
import type { TemplateCoreOptions } from "../templates";
import {
  drawPhoto,
  roundRect,
  slotsVertical,
  DISPLAY_FONT,
  HAND_FONT,
  W,
  H,
} from "./slots";

export function renderVintageMovie(
  ctx: CanvasRenderingContext2D,
  opts: TemplateCoreOptions,
  scale: number,
) {
  const slots = slotsVertical(4);

  // Background biru dengan efek scalloped edges (bergerigi)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // Scalloped border effect - biru
  ctx.strokeStyle = "#1E3A8A";
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const x = i * (W / 12);
    ctx.beginPath();
    ctx.arc(x, 45, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header: MOVIE TICKETS
  ctx.fillStyle = "#1E3A8A";
  ctx.font = `42px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("MOVIE TICKETS", W / 2, 65);

  // Date
  ctx.font = `24px ${HAND_FONT}`;
  ctx.fillText(opts.dateText, W / 2, 110);

  // Row 01, Seat 26 dalam frame merah-putih
  ctx.fillStyle = "#EF4444";
  ctx.fillRect(W / 2 - 140, 125, 80, 40);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `20px ${HAND_FONT}`;
  ctx.fillText("ROW 01", W / 2 - 115, 150);
  ctx.fillText("SEAT 26", W / 2 + 25, 150);

  // Photos with scalloped frame effect
  for (let i = 0; i < 4; i++) {
    const s = slots[i];

    // Scalloped frame effect
    ctx.save();
    ctx.beginPath();
    const r = 16;
    ctx.moveTo(s.x + r, s.y);
    ctx.lineTo(s.x + s.w - r, s.y);
    ctx.quadraticCurveTo(s.x + s.w, s.y, s.x + s.w, s.y + r);
    ctx.lineTo(s.x + s.w, s.y + s.h - r);
    ctx.quadraticCurveTo(s.x + s.w, s.y + s.h, s.x + s.w - r, s.y + s.h);
    ctx.lineTo(s.x + r, s.y + s.h);
    ctx.quadraticCurveTo(s.x, s.y + s.h, s.x, s.y + s.h - r);
    ctx.lineTo(s.x, s.y + r);
    ctx.quadraticCurveTo(s.x, s.y, s.x + r, s.y);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    drawPhoto(ctx, opts.photos[i], s.x, s.y, s.w, s.h);
    ctx.restore();

    // Border frame merah-putih
    roundRect(ctx, s.x - 2, s.y - 2, s.w + 4, s.h + 4, 20);
    ctx.strokeStyle = "#1E3A8A";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Footer
  ctx.fillStyle = "#1E3A8A";
  ctx.font = `26px ${DISPLAY_FONT}`;
  ctx.fillText("THANK YOU ★ SEE YOU AGAIN", W / 2, H - 160);
  ctx.font = `20px ${DISPLAY_FONT}`;
  ctx.fillText("PHOTO BOOTH", W / 2, H - 75);
}
