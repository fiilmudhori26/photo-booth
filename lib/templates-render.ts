/** Canvas renderers for photo booth templates */
import type { TemplateRenderOptions, PhotoBoothTemplate } from "./templates";

const DISPLAY_FONT = '"Cherry Bomb One", "Baloo 2", system-ui, cursive';
const HAND_FONT = '"Gaegu", "M PLUS Rounded 1c", system-ui, cursive';
const SANS_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const W = 1200;
const H = 1600;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
}

function drawPhoto(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number) {
  if (!img) { ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, y, w, h); return; }
  const sw = img.naturalWidth || w, sh = img.naturalHeight || h;
  const scale = Math.max(w / sw, h / sh);
  ctx.drawImage(img, x + (w - sw * scale) / 2, y + (h - sh * scale) / 2, sw * scale, sh * scale);
}

function slots2x2(): { x: number; y: number; w: number; h: number }[] {
  const gap = 24, startX = 60, startY = 140, totalW = W - startX * 2;
  const slotW = (totalW - gap) / 2, slotH = slotW / 1.333;
  return [
    { x: startX, y: startY, w: slotW, h: slotH },
    { x: startX + slotW + gap, y: startY, w: slotW, h: slotH },
    { x: startX, y: startY + slotH + gap, w: slotW, h: slotH },
    { x: startX + slotW + gap, y: startY + slotH + gap, w: slotW, h: slotH },
  ];
}

function slotsVertical(count: number, startX = 80): { x: number; y: number; w: number; h: number }[] {
  const gap = 20, w = 300, h = 225, startY = 120;
  return Array.from({ length: count }, (_, i) => ({ x: startX, y: startY + i * (h + gap), w, h }));
}

function slotsStaggered(count: number, startX = 80): { x: number; y: number; w: number; h: number }[] {
  const gap = 20, w = 300, h = 225, colGap = gap + 40;
  const col1X = startX, col2X = W - startX - w;
  return Array.from({ length: count }, (_, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    return { x: col === 0 ? col1X : col2X, y: 120 + row * (h + gap), w, h };
  });
}

function slotsDual(count: number, rowsPerColumn: number, startX = 80): { x: number; y: number; w: number; h: number }[] {
  const gap = 20, w = 300, h = 225, colGap = gap + 40;
  const col1X = startX, col2X = W - startX - w, startY = 120;
  const slots: { x: number; y: number; w: number; h: number }[] = [];
  for (let row = 0; row < rowsPerColumn; row++) {
    const y = startY + row * (h + gap);
    slots.push({ x: col1X, y, w, h }, { x: col2X, y, w, h });
  }
  return slots;
}

function renderBoardingPass(ctx: CanvasRenderingContext2D, opts: TemplateRenderOptions, scale: number) {
  const slots = slots2x2();

  // Background: White
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);

  // Border: Maroon (aksen)
  ctx.strokeStyle = "#7B1E2A"; ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Header: BOARDING PASS (large text)
  ctx.fillStyle = "#7B1E2A";
  ctx.font = `48px ${DISPLAY_FONT}`; ctx.textAlign = "center";
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
  ctx.strokeStyle = "#CCCCCC"; ctx.lineWidth = 1;
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
    ctx.fillStyle = "rgba(255,255,255,0.95)"; roundRect(ctx, s.x, s.y, s.w, s.h, 16);
    ctx.save(); ctx.clip(); drawPhoto(ctx, opts.photos[i], s.x, s.y, s.w, s.h); ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
  }
}

function renderVintageMovie(ctx: CanvasRenderingContext2D, opts: TemplateRenderOptions, scale: number) {
  const slots = slotsVertical(4);

  // Background biru dengan efek scalloped edges (bergerigi)
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);

  // Scalloped border effect - biru
  ctx.strokeStyle = "#1E3A8A"; ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const x = i * (W / 12);
    ctx.beginPath();
    ctx.arc(x, 45, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header: MOVIE TICKETS
  ctx.fillStyle = "#1E3A8A";
  ctx.font = `42px ${DISPLAY_FONT}`; ctx.textAlign = "center";
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
    ctx.strokeStyle = "#1E3A8A"; ctx.lineWidth = 2; ctx.stroke();
  }

  // Footer
  ctx.fillStyle = "#1E3A8A";
  ctx.font = `26px ${DISPLAY_FONT}`;
  ctx.fillText("THANK YOU ★ SEE YOU AGAIN", W / 2, H - 160);
  ctx.font = `20px ${DISPLAY_FONT}`;
  ctx.fillText("PHOTO BOOTH", W / 2, H - 75);
}

function renderModernGraphic(ctx: CanvasRenderingContext2D, opts: TemplateRenderOptions, scale: number) {
  const slots = slotsStaggered(8);

  // Background: Gradient biru tebal dengan grain texture
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#1E3A8A");
  gradient.addColorStop(1, "#334155");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);

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
    ctx.save(); ctx.clip(); drawPhoto(ctx, opts.photos[i], s.x + 2, s.y + 2, s.w - 4, s.h - 4); ctx.restore();
  }

  // Date footer
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `22px ${HAND_FONT}`;
  ctx.fillText(opts.dateText, W / 2, H - 55);
}

function renderAirMail(ctx: CanvasRenderingContext2D, opts: TemplateRenderOptions, scale: number) {
  const slots = slotsDual(8, 4);

  // Background: Putih
  ctx.fillStyle = "#F8FAFC"; ctx.fillRect(0, 0, W, H);

  // Diagonal borders (merah-biru-putih)
  ctx.strokeStyle = "#B91C1C"; ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.2 - i * 15); ctx.lineTo(W, 0);
    ctx.moveTo(0, H * 0.8 + i * 15); ctx.lineTo(W, H);
    ctx.stroke();
  }

  // Header: AIR MAIL POSTAL
  ctx.fillStyle = "#0F172A";
  ctx.font = `42px ${DISPLAY_FONT}`; ctx.textAlign = "center";
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
  ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "10px system-ui";
  ctx.fillText("📦", W / 2 - 45, 72);

  // SEND TO field
  ctx.fillStyle = "#0F172A";
  ctx.font = `24px ${DISPLAY_FONT}`;
  ctx.fillText("SEND TO: " + (opts.toText || " DESTINATION"), W / 2, H - 180);

  // Photos (8 total, dual strip 2x4)
  for (let i = 0; i < 8; i++) {
    const s = slots[i];

    // Photo background
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, s.x, s.y, s.w, s.h, 14);
    ctx.save(); ctx.clip(); drawPhoto(ctx, opts.photos[i], s.x, s.y, s.w, s.h); ctx.restore();

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

function renderTheaterTicket(ctx: CanvasRenderingContext2D, opts: TemplateRenderOptions, scale: number) {
  const slots = slotsDual(8, 4);

  // Background: Maroon gelap
  ctx.fillStyle = "#7B1E2A"; ctx.fillRect(0, 0, W, H);

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
    ctx.strokeStyle = "#FCD34D"; ctx.lineWidth = 2; ctx.stroke();
  }

  // Footer: SAVE THE BEST MOMENT
  ctx.font = `28px ${DISPLAY_FONT}`;
  ctx.fillStyle = "#FDE68A";
  ctx.fillText("SAVE THE BEST MOMENT", W / 2, H - 160);

  // PHOTO BOOTH
  ctx.font = `20px ${DISPLAY_FONT}`;
  ctx.fillText("PHOTO BOOTH", W / 2, H - 75);
}

export const TEMPLATE_LIST: PhotoBoothTemplate[] = [
  {
    id: "boarding-pass",
    name: "Boarding Pass",
    aspectRatio: 1200 / 800,
    designWidth: W,
    exportScale: 1,
    photoSlots: slots2x2(),
    render: renderBoardingPass,
  },
  {
    id: "vintage-movie",
    name: "Vintage Movie Ticket",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsVertical(4),
    render: renderVintageMovie,
  },
  {
    id: "modern-graphic",
    name: "Modern Graphic",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsStaggered(8),
    render: renderModernGraphic,
  },
  {
    id: "air-mail",
    name: "Air Mail Postal",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsDual(8, 4),
    render: renderAirMail,
  },
  {
    id: "theater-ticket",
    name: "Theater Show Ticket",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsDual(8, 4),
    render: renderTheaterTicket,
  },
];

export function getTemplate(id: string): PhotoBoothTemplate {
  return TEMPLATE_LIST.find((t) => t.id === id) ?? TEMPLATE_LIST[0];
}