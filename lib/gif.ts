import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { STRIP_W, drawStrip, stripHeight } from "./strip";
import { loadImage } from "./filters";
import type { FrameId, PatternId, StickerItem } from "./types";

export interface StripGifOptions {
  /** Small grab frames per pose (360×270 JPEGs) — all slot boomerang in sync. */
  grabs: string[][];
  frameId: FrameId;
  pattern: PatternId;
  pad: number;
  stickers: StickerItem[];
  caption: string;
  dateText: string;
  eventText?: string;
  /** Strip render scale (0.5 → 360 px wide). */
  scale?: number;
  /** Frame delay in milliseconds. */
  delay?: number;
}

/**
 * Renders the full strip — frame, pattern, photos, stickers, event text —
 * as an animated GIF: every slot boomerangs its pose in sync (0..n-1 then
 * back down to 1), so the "photo booth" feel survives the file format.
 */
export async function renderStripGif(opts: StripGifOptions): Promise<string> {
  const scale = opts.scale ?? 0.5;
  const perPose = opts.grabs.map((pose) => pose.filter(Boolean));
  const framesPerPose = Math.min(...perPose.map((pose) => pose.length));
  if (!framesPerPose || !perPose.length) {
    throw new Error("Belum ada rekaman GIF — strip ini tidak dipotret dengan kamera.");
  }

  const images = await Promise.all(
    perPose.map((pose) =>
      Promise.all(pose.map((src) => loadImage(src).catch(() => null))),
    ),
  );

  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const height = stripHeight(opts.pad, opts.grabs.length || 3);
  const width = Math.round(STRIP_W * scale);
  const canvasHeight = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia di browser ini.");

  const encoder = GIFEncoder();
  const forward = [...Array(framesPerPose).keys()];
  const backward = [...Array(Math.max(framesPerPose - 1, 0)).keys()].reverse();
  const timeline = [...forward, ...backward];

  for (const index of timeline) {
    ctx.clearRect(0, 0, width, canvasHeight);
    drawStrip(
      ctx,
      {
        photos: images.map((pose) => pose[index] ?? pose[0]),
        frameId: opts.frameId,
        pattern: opts.pattern,
        pad: opts.pad,
        stickers: opts.stickers,
        caption: opts.caption,
        dateText: opts.dateText,
        eventText: opts.eventText,
        selectedStickerId: null,
      },
      scale,
    );
    const { data } = ctx.getImageData(0, 0, width, canvasHeight);
    const palette = quantize(data, 256, { format: "rgb565" });
    const indexed = applyPalette(data, palette, "rgb565");
    encoder.writeFrame(indexed, width, canvasHeight, {
      palette,
      delay: opts.delay ?? 120,
    });
  }

  encoder.finish();
  const bytes = encoder.bytes();
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:image/gif;base64,${btoa(binary)}`;
}

