"use client";

import { useEffect, useRef, useState } from "react";
import { loadImage } from "@/lib/filters";
import { STRIP_W, drawStrip, hitTestSticker, stripHeight } from "@/lib/strip";
import type { FrameId, PatternId, StickerItem } from "@/lib/types";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

interface StripCanvasProps {
  photos: string[];
  frameId: FrameId;
  pattern: PatternId;
  pad: number;
  stickers: StickerItem[];
  caption: string;
  dateText: string;
  eventText?: string;
  selectedId: string | null;
  onSelect: (uid: string | null) => void;
  onMove: (uid: string, x: number, y: number) => void;
  className?: string;
}

/**
 * Renders the strip on a real <canvas> using the exact same routine as the
 * export — so the preview is pixel-faithful to the downloaded file.
 * Stickers can be dragged straight on the preview.
 */
export default function StripCanvas({
  photos,
  frameId,
  pattern,
  pad,
  stickers,
  caption,
  dateText,
  eventText,
  selectedId,
  onSelect,
  onMove,
  className,
}: StripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ uid: string; dx: number; dy: number } | null>(null);

  const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
  const [fontsReady, setFontsReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  const height = stripHeight(pad);
  const photosKey = photos.join("|");

  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => setFontsReady(true)).catch(() => setFontsReady(true));
    } else {
      setFontsReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!photos.length) {
      setImages([]);
      return;
    }
    Promise.all(photos.map((src) => loadImage(src).catch(() => null))).then((loaded) => {
      if (!cancelled) setImages(loaded);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = STRIP_W;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, STRIP_W, height);
    drawStrip(
      ctx,
      {
        photos: images,
        frameId,
        pattern,
        pad,
        stickers,
        caption,
        dateText,
        eventText,
        selectedStickerId: selectedId,
      },
      1,
    );
  }, [
    images,
    frameId,
    pattern,
    pad,
    stickers,
    caption,
    dateText,
    eventText,
    selectedId,
    height,
    fontsReady,
  ]);

  const toStrip = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * STRIP_W,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toStrip(event);
    const hit = hitTestSticker(stickers, x, y, height);
    if (!hit) {
      onSelect(null);
      return;
    }
    onSelect(hit.uid);
    dragRef.current = {
      uid: hit.uid,
      dx: x - hit.x * STRIP_W,
      dy: y - hit.y * height,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { x, y } = toStrip(event);
    onMove(
      drag.uid,
      clamp((x - drag.dx) / STRIP_W, 0.04, 0.96),
      clamp((y - drag.dy) / height, 0.02, 0.98),
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ touchAction: "none" }}
        aria-label="Photo strip preview. Drag stickers to reposition them."
        className={[
          "mx-auto block h-auto w-auto max-h-[64vh] max-w-full rounded-[1.75rem]",
          "shadow-[0_30px_60px_-30px_rgba(140,80,120,0.75)] ring-4 ring-white/80",
          dragging ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
      />
    </div>
  );
}

