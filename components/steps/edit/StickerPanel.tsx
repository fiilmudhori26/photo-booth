"use client";

import {
  Calendar,
  Eraser,
  ZoomIn,
  Sticker as StickerIcon,
} from "lucide-react";
import { STICKER_PRESETS } from "@/lib/stickers";
import { MAX_STICKERS } from "@/lib/strip";
import type { StickerItem } from "@/lib/types";
import { cx } from "../../ui";

interface StickerPanelProps {
  stickers: StickerItem[];
  selectedId: string | null;
  onUpdateSticker: (uid: string, patch: Partial<StickerItem>) => void;
  onRemoveSticker: (uid: string) => void;
  onClearStickers: () => void;
  onAddSticker: (emoji: string) => void;
  onAddDateSticker: () => void;
}

export default function StickerPanel({
  stickers,
  selectedId,
  onUpdateSticker,
  onRemoveSticker,
  onClearStickers,
  onAddSticker,
  onAddDateSticker,
}: StickerPanelProps) {
  const full = stickers.length >= MAX_STICKERS;
  const selectedSticker = stickers.find((s) => s.uid === selectedId) ?? null;

  return (
    <div className="space-y-4">
      {/* Sticker Picker */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base text-white">Stickers</h3>
        <span className="rounded-full border-2 border-slate-700/50 bg-slate-900/60 px-3 py-1 text-xs font-bold text-slate-300">
          {stickers.length}/{MAX_STICKERS}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {STICKER_PRESETS.map((preset) => (
          <button
            key={preset.emoji}
            type="button"
            title={preset.label}
            disabled={full}
            onClick={() => onAddSticker(preset.emoji)}
            className={cx(
              "flex aspect-square items-center justify-center rounded-xl border-[3px] text-xl transition disabled:opacity-50",
              full
                ? "border-slate-700/50 bg-slate-800/60 text-slate-500"
                : "border-white bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {preset.emoji}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddDateSticker}
        disabled={full}
        className={cx(
          "w-full rounded-2xl border-[3px] px-4 py-3 font-bold transition disabled:opacity-50",
          full
            ? "border-slate-700/50 bg-slate-800/60 text-slate-500"
            : "border-white bg-white/10 text-white hover:bg-white/20",
        )}
      >
        <Calendar className="mb-1 size-5" />
        Add Date
      </button>

      {/* Selected sticker controls */}
      {selectedSticker && (
        <div className="space-y-3 rounded-2xl border-[3px] border-indigo-500/50 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {selectedSticker.kind === "date" ? "📅" : selectedSticker.emoji}
            </span>
            <span className="font-display text-sm text-white">
              {selectedSticker.kind === "date" ? "Date" : "Sticker"}
            </span>
            <button
              type="button"
              onClick={() => onRemoveSticker(selectedSticker.uid)}
              className="ml-auto rounded-full border-2 border-white bg-white/80 text-rose transition"
            >
              <Eraser className="size-4" />
            </button>
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="inline-flex items-center gap-1">
                <ZoomIn className="size-3.5" /> Size
              </span>
              <span>{Math.round(selectedSticker.size * 100)}%</span>
            </label>
            <input
              type="range"
              min={0.07}
              max={0.34}
              step={0.01}
              value={selectedSticker.size}
              onChange={(e) =>
                onUpdateSticker(selectedSticker.uid, {
                  size: Number(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdateSticker(selectedSticker.uid, {
                  rotation: selectedSticker.rotation - 15,
                })
              }
              className="rounded-full border-2 border-slate-700/50 bg-slate-900/40 px-3 py-1.5 text-xs font-bold text-slate-300 transition"
            >
              Rotate −
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateSticker(selectedSticker.uid, {
                  rotation: selectedSticker.rotation + 15,
                })
              }
              className="rounded-full border-2 border-slate-700/50 bg-slate-900/40 px-3 py-1.5 text-xs font-bold text-slate-300 transition"
            >
              Rotate +
            </button>
          </div>
        </div>
      )}

      {stickers.length > 0 && (
        <button
          type="button"
          onClick={onClearStickers}
          className="w-full rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/40 px-4 py-3 font-bold text-slate-300 transition"
        >
          Clear all stickers
        </button>
      )}
    </div>
  );
}
