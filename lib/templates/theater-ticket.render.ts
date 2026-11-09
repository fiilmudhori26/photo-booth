/** Theater Show Ticket template renderer */
import type { TemplateCoreOptions } from "../templates";
import {
  drawPhoto,
  roundRect,
  slotsDual,
  DISPLAY_FONT,
  HAND_FONT,
  W,
  H,
} from "./slots";

export function renderTheaterTicket(
  ctx: CanvasRenderingContext2D,
  opts: TemplateCoreOptions,
  scale: number,
) {
  const slots = slotsDual(8, 4);

  // Background: Maroon gelap
  ctx.fillStyle = "#7B1E2A";
  ctx.fillRect(0, 0, W, H);

  // 2 slip tiket krem bergerigi (dari atas)
  for (let i = 0; i < 2; i++) {
    const y = 100 + i * 700;
    ctx.fillStyle = "#FDE68A";
    ctx.beginPath();

    // Scalloped top edge (bergerigi)
    const r = 20;
    ctx.moveTo(30, y);
    for (let j = 0; j < 6; j++) {
      const x = 30 + j * 190;
      ctx.lineTo(x + 160, y);
      ctx.quadraticCurveTo(x + 200, y, x + 200, y + r);
      ctx.lineTo(x + 200, y + 700 - r);
      ctx.quadraticCurveTo(x + 200, y + 700, x + 160, y + 700);
    }
    ctx.closePath();
    ctx.fill();

    // Separator line
    ctx.strokeStyle = "#FCD34D";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, y + 350);
    ctx.lineTo(W - 30, y + 350);
    ctx.stroke();
  }

  // Header serif: Theater Show
  ctx.fillStyle = "#FDE68A";
  ctx.font = `50px ${HAND_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("Theater Show", W / 2, 70);

  // Row B2, Show 02
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `28px ${DISPLAY_FONT}`;
  ctx.fillText("ROW B2   SHOW 02", W / 2, 170);

  // Ticket info
  ctx.font = `22px ${HAND_FONT}`;
  ctx.fillText("TIME: 8:00 PM  " + opts.dateText, W / 2, 280);

  // Photos (8 total, dual strip 2x4)
  for (let i = 0; i < 8; i++) {
    const s = slots[i];

    // Scalloped frame effect
    ctx.save();
    ctx.beginPath();
    const r = 18;
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

    // Border: krem/yellow
    roundRect(ctx, s.x - 4, s.y - 4, s.w + 8, s.h + 8, 22);
    ctx.strokeStyle = "#FCD34D";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Footer: SAVE THE BEST MOMENT
  ctx.font = `28px ${DISPLAY_FONT}`;
  ctx.fillStyle = "#FDE68A";
  ctx.fillText("SAVE THE BEST MOMENT", W / 2, H - 160);

  // PHOTO BOOTH
  ctx.font = `20px ${DISPLAY_FONT}`;
  ctx.fillText("PHOTO BOOTH", W / 2, H - 75);
}
