import { getFrame } from "./frames";
import type { FrameId, PatternId, StickerItem } from "./types";

/** Strip geometry is expressed in fixed "strip units"; export just scales it. */
export const STRIP_W = 720;
export const PHOTO_ASPECT = 4 / 3;
export const PHOTO_GAP = 20;
export const FOOTER_H = 96;
export const PHOTO_RADIUS = 14;

export const PAD_MIN = 14;
export const PAD_MAX = 72;
export const PAD_DEFAULT = 32;
export const PAD_STEP = 2;

/** Camera grabs are stored at this size so the 2x export stays crisp. */
export const CAPTURE_W = 1200;
export const CAPTURE_H = 900;

export const MAX_STICKERS = 14;

export interface PhotoBox {
  w: number;
  h: number;
}

export function photoBox(pad: number): PhotoBox {
  const w = STRIP_W - pad * 2;
  return { w, h: w / PHOTO_ASPECT };
}

/** Strip height for a given number of photo slots (defaults to 3). */
export function stripHeight(pad: number, count = 3): number {
  const { h } = photoBox(pad);
  return pad * 2 + FOOTER_H + h * count + PHOTO_GAP * (count - 1);
}

export function photoSlot(index: number, pad: number) {
  const { w, h } = photoBox(pad);
  return { x: pad, y: pad + index * (h + PHOTO_GAP), w, h };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function heartPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.32);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.32);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.62, x, y + s * 0.84, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.84, x + s * 0.5, y + s * 0.62, x + s * 0.5, y + s * 0.32);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.32);
  ctx.closePath();
}

function sparklePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath();
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  id: PatternId,
  w: number,
  h: number,
  color: string,
) {
  if (id === "none") return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const tile = 56;

  if (id === "dots") {
    for (let row = 0, y = tile / 2; y < h + tile; row++, y += tile) {
      const start = row % 2 ? tile : tile / 2;
      for (let x = start; x < w + tile; x += tile) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (id === "hearts") {
    for (let row = 0, y = tile / 2; y < h + tile; row++, y += tile) {
      const start = row % 2 ? tile : tile / 2;
      for (let x = start; x < w + tile; x += tile) {
        heartPath(ctx, x, y - 9, 19);
        ctx.fill();
      }
    }
  } else if (id === "stripes") {
    ctx.lineWidth = 15;
    for (let x = -h; x < w + h; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
  } else if (id === "checker") {
    const s = 34;
    for (let row = 0, y = 0; y < h; y += s, row++) {
      for (let col = 0, x = 0; x < w; x += s, col++) {
        if ((row + col) % 2 === 0) ctx.fillRect(x, y, s, s);
      }
    }
  } else if (id === "grid") {
    ctx.lineWidth = 1.5;
    const tile = 38;
    for (let x = 0; x <= w; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else if (id === "sparkle") {
    for (let row = 0, y = tile / 2; y < h + tile; row++, y += tile) {
      const offset = row % 2 ? tile / 2 : 0;
      for (let x = offset + tile / 2; x < w + tile; x += tile) {
        sparklePath(ctx, x, y, 9);
        ctx.fill();
      }
    }
  } else if (id === "waves") {
    ctx.lineWidth = 6;
    const amplitude = 9;
    const wavelength = 64;
    for (let y = tile / 2; y < h + tile; y += 48) {
      ctx.beginPath();
      for (let x = 0; x <= w + wavelength; x += 4) {
        const yy = y + Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const sw = img.naturalWidth || w;
  const sh = img.naturalHeight || h;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';
const DISPLAY_FONT = '"Cherry Bomb One", "Baloo 2", system-ui, sans-serif';
const HAND_FONT = '"Gaegu", "M PLUS Rounded 1c", system-ui, sans-serif';

function drawSticker(
  ctx: CanvasRenderingContext2D,
  sticker: StickerItem,
  stripH: number,
  ink: string,
  dateText: string,
  selected: boolean,
) {
  const cx = sticker.x * STRIP_W;
  const cy = sticker.y * stripH;
  const unit = sticker.size * STRIP_W;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((sticker.rotation * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (sticker.kind === "date") {
    ctx.font = `700 ${unit * 0.5}px ${HAND_FONT}`;
    const textW = ctx.measureText(dateText).width;
    const bw = textW + unit * 0.75;
    const bh = unit * 0.95;

    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();
    ctx.lineWidth = Math.max(2, unit * 0.05);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.stroke();

    ctx.fillStyle = ink;
    ctx.fillText(dateText, 0, unit * 0.02);
  } else {
    ctx.font = `${unit}px ${EMOJI_FONT}`;
    ctx.fillText(sticker.emoji ?? "💖", 0, 0);
  }

  if (selected) {
    const r = unit * 0.7;
    ctx.setLineDash([8, 7]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(244,114,182,0.95)";
    roundRect(ctx, -r, -r, r * 2, r * 2, 12);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

export interface StripRenderOptions {
  photos: (HTMLImageElement | null)[];
  frameId: FrameId;
  pattern: PatternId;
  pad: number;
  stickers: StickerItem[];
  selectedStickerId?: string | null;
  caption: string;
  dateText: string;
  /** Optional free-text event line rendered below caption and date (footer). */
  eventText?: string;
}

/**
 * Paints the whole strip. Used for both the live on-screen preview and the
 * high-resolution export, so what the user sees is exactly what they get.
 */
export function drawStrip(
  ctx: CanvasRenderingContext2D,
  opts: StripRenderOptions,
  scale = 1,
) {
  const frame = getFrame(opts.frameId);
  const height = stripHeight(opts.pad, opts.photos.length || 3);

  ctx.save();
  ctx.scale(scale, scale);

  const grad = ctx.createLinearGradient(0, 0, STRIP_W * 0.65, height);
  grad.addColorStop(0, frame.bg);
  grad.addColorStop(1, frame.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STRIP_W, height);

  drawPattern(ctx, opts.pattern, STRIP_W, height, frame.patternInk);

  opts.photos.forEach((img, index) => {
    const slot = photoSlot(index, opts.pad);

    ctx.save();
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, PHOTO_RADIUS);
    ctx.shadowColor = "rgba(107,74,90,0.28)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = frame.photoBack;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.clip();

    if (img) {
      drawCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    }
    ctx.restore();

    ctx.save();
    roundRect(ctx, slot.x + 1, slot.y + 1, slot.w - 2, slot.h - 2, PHOTO_RADIUS - 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.stroke();
    ctx.restore();
  });

  const footerY = height - FOOTER_H / 2 + 6;
  const eventLine = opts.eventText?.trim() ?? "";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (eventLine) {
    ctx.fillStyle = frame.ink;
    ctx.font = `400 ${26}px ${DISPLAY_FONT}`;
    ctx.fillText(opts.caption || "★ PHOTO BOOTH ★", STRIP_W / 2, footerY - 26);
    ctx.fillStyle = frame.ink;
    ctx.font = `700 ${19}px ${HAND_FONT}`;
    ctx.fillText(opts.dateText, STRIP_W / 2, footerY + 1);
    ctx.font = `700 ${16}px ${HAND_FONT}`;
    ctx.fillText(eventLine, STRIP_W / 2, footerY + 24);
  } else {
    ctx.fillStyle = frame.ink;
    ctx.font = `400 ${32}px ${DISPLAY_FONT}`;
    ctx.fillText(opts.caption || "★ PHOTO BOOTH ★", STRIP_W / 2, footerY - 15);
    ctx.fillStyle = frame.inkSoft;
    ctx.font = `700 ${23}px ${HAND_FONT}`;
    ctx.fillText(opts.dateText, STRIP_W / 2, footerY + 22);
  }
  ctx.restore();

  for (const sticker of opts.stickers) {
    drawSticker(
      ctx,
      sticker,
      height,
      frame.ink,
      opts.dateText,
      opts.selectedStickerId === sticker.uid,
    );
  }

  ctx.restore();
}

/** Finds the sticker under a point expressed in strip units. */
export function hitTestSticker(
  stickers: StickerItem[],
  x: number,
  y: number,
  stripH: number,
): StickerItem | null {
  for (let i = stickers.length - 1; i >= 0; i -= 1) {
    const sticker = stickers[i];
    const unit = sticker.size * STRIP_W;
    const dx = x - sticker.x * STRIP_W;
    const dy = y - sticker.y * stripH;
    if (Math.abs(dx) <= unit * 0.62 && Math.abs(dy) <= unit * 0.62) {
      return sticker;
    }
  }
  return null;
}
