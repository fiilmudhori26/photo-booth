"use client";

import {
  Calendar,
  Eraser,
  Image as ImageIcon,
  LoaderCircle,
  Palette,
  RefreshCw,
  ZoomIn,
  Sticker as StickerIcon,
} from "lucide-react";
import { useState } from "react";
import { FILTER_PRESETS } from "@/lib/filters";
import { FRAMES, PATTERNS } from "@/lib/frames";
import { STICKER_PRESETS } from "@/lib/stickers";
import { MAX_STICKERS } from "@/lib/strip";
import type {
  ExportFormat,
  FilterId,
  FrameId,
  PatternId,
  StickerItem,
  TemplateId,
} from "@/lib/types";
import { cx } from "./ui";

type Tab = "filters" | "retake" | "adjust" | "decorate";

interface EditorBottomSheetProps {
  photos: string[];
  filterId: FilterId;
  onFilter: (id: FilterId) => void;
  processing: boolean;
  stickers: StickerItem[];
  selectedId: string | null;
  onMove: (uid: string, x: number, y: number) => void;
  onAddSticker: (emoji: string) => void;
  onAddDateSticker: () => void;
  onUpdateSticker: (uid: string, patch: Partial<StickerItem>) => void;
  onRemoveSticker: (uid: string) => void;
  onClearStickers: () => void;
  caption: string;
  onCaption: (value: string) => void;
  dateText: string;
  templateId: TemplateId;
  onTemplate: (id: TemplateId) => void;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  exporting: boolean;
  onRetake: () => void;
  onDownload: () => void;
}

export default function EditorBottomSheet(props: EditorBottomSheetProps) {
  const {
    photos,
    filterId,
    onFilter,
    processing,
    stickers,
    selectedId,
    onMove,
    onAddSticker,
    onAddDateSticker,
    onUpdateSticker,
    onRemoveSticker,
    onClearStickers,
    caption,
    onCaption,
    dateText,
    templateId,
    onTemplate,
    format,
    onFormat,
    exporting,
    onRetake,
    onDownload,
  } = props;

  const [tab, setTab] = useState<Tab>("filters");

  const selectedSticker = stickers.find((s) => s.uid === selectedId) ?? null;
  const full = stickers.length >= MAX_STICKERS;

  const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
    { id: "filters", label: "Filters", icon: Palette },
    { id: "retake", label: "Retake", icon: RefreshCw },
    { id: "adjust", label: "Adjust", icon: ZoomIn },
    { id: "decorate", label: "Decorate", icon: StickerIcon },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-4">
        <div className="flex items-center gap-1 rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cx(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition",
                tab === id
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === "filters" && (
        <FiltersTab
          filterId={filterId}
          onFilter={onFilter}
          processing={processing}
        />
      )}

      {tab === "retake" && (
        <RetakeTab
          photos={photos}
          onRetake={onRetake}
          processing={processing}
        />
      )}

      {tab === "adjust" && (
        <AdjustTab
          caption={caption}
          onCaption={onCaption}
          dateText={dateText}
          format={format}
          onFormat={onFormat}
          exporting={exporting}
          templateId={templateId}
          onTemplate={onTemplate}
          onDownload={onDownload}
        />
      )}

      {tab === "decorate" && (
        <DecorateTab
          stickers={stickers}
          selectedId={selectedId}
          selectedSticker={selectedSticker}
          onUpdateSticker={onUpdateSticker}
          onRemoveSticker={onRemoveSticker}
          onClearStickers={onClearStickers}
          full={full}
          onAddSticker={onAddSticker}
          onAddDateSticker={onAddDateSticker}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────

function FiltersTab({
  filterId,
  onFilter,
  processing,
}: {
  filterId: FilterId;
  onFilter: (id: FilterId) => void;
  processing: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base text-white">Filters</h3>

      {processing && (
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 px-3 py-2">
          <LoaderCircle className="size-4 animate-spin text-indigo-400" />
          <span className="text-sm text-slate-300">Processing...</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onFilter(preset.id)}
            className={cx(
              "flex min-h-[5rem] flex-col items-center justify-center gap-1 rounded-2xl border-[3px] p-2 transition",
              filterId === preset.id
                ? "border-indigo-500 bg-gradient-to-b from-slate-800 to-slate-700 shadow"
                : "border-slate-700/50 bg-slate-900/40 hover:bg-slate-800",
            )}
          >
            <span className="text-2xl">{preset.icon}</span>
            <span className="text-xs font-bold text-white">{preset.label}</span>
            <span className="font-hand text-xs text-slate-400">{preset.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RetakeTab({
  photos,
  onRetake,
  processing,
}: {
  photos: string[];
  onRetake: () => void;
  processing: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base text-white">Retake Photos</h3>

      <button
        type="button"
        onClick={onRetake}
        disabled={processing}
        className={cx(
          "flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] px-4 py-3 font-bold transition",
          processing
            ? "border-slate-700/50 bg-slate-800/60 text-slate-500"
            : "border-white bg-white/10 text-white hover:bg-white/20",
        )}
      >
        {processing ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <RefreshCw className="size-5" />
        )}
        Retake All Photos
      </button>
    </div>
  );
}

function AdjustTab({
  caption,
  onCaption,
  dateText,
  format,
  onFormat,
  exporting,
  templateId,
  onTemplate,
  onDownload,
}: {
  caption: string;
  onCaption: (value: string) => void;
  dateText: string;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  exporting: boolean;
  templateId: TemplateId;
  onTemplate: (id: TemplateId) => void;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Caption */}
      <div>
        <h3 className="mb-2 font-display text-base text-white">Caption</h3>
        <input
          value={caption}
          onChange={(e) => onCaption(e.target.value.slice(0, 22))}
          placeholder="★ PHOTO BOOTH ★"
          className="w-full rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-indigo-500"
        />
        <span className="mt-1 font-hand text-xs text-slate-400">
          {22 - caption.length} characters left
        </span>
      </div>

      {/* Date */}
      <div>
        <h3 className="mb-2 font-display text-base text-white">Date</h3>
        <input
          value={dateText}
          readOnly
          className="w-full rounded-2xl border-[3px] border-slate-700/50 bg-slate-800/40 px-4 py-3 text-sm font-bold text-slate-300"
        />
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={exporting}
        className={cx(
          "w-full rounded-2xl border-[3px] px-4 py-3 font-bold transition",
          exporting
            ? "border-slate-700/50 bg-slate-800/60 text-slate-500"
            : "border-transparent bg-indigo-600 text-white hover:bg-indigo-500",
        )}
      >
        {exporting ? "Saving…" : "Download"}
      </button>
    </div>
  );
}

function DecorateTab({
  stickers,
  selectedId,
  selectedSticker,
  onUpdateSticker,
  onRemoveSticker,
  onClearStickers,
  full,
  onAddSticker,
  onAddDateSticker,
}: {
  stickers: StickerItem[];
  selectedId: string | null;
  selectedSticker: StickerItem | null;
  onUpdateSticker: (uid: string, patch: Partial<StickerItem>) => void;
  onRemoveSticker: (uid: string) => void;
  onClearStickers: () => void;
  full: boolean;
  onAddSticker: (emoji: string) => void;
  onAddDateSticker: () => void;
}) {
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
              "flex aspect-square items-center justify-center rounded-xl border-[3px] text-xl transition",
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
          "w-full rounded-2xl border-[3px] px-4 py-3 font-bold transition",
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