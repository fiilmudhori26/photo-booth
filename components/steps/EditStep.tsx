"use client";

import { useState } from "react";
import {
  ArrowRight,
  Image as ImageIcon,
  RotateCcw,
  Sticker,
  Type,
  Wand2,
} from "lucide-react";
import type {
  ExportFormat,
  FilterId,
  StickerItem,
} from "@/lib/types";
import EditorBottomSheet from "../EditorBottomSheet";
import FilterPanel from "./edit/FilterPanel";
import RetakePanel from "./edit/RetakePanel";
import CaptionEditor from "./edit/CaptionEditor";
import StickerPanel from "./edit/StickerPanel";
import { cx } from "../ui";

type Tab = "filters" | "retake" | "adjust" | "decorate";

interface EditStepProps {
  photos: string[];
  filterId: FilterId;
  onFilter: (id: FilterId) => void;
  caption: string;
  onCaption: (value: string) => void;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  dateText: string;
  onContinue: () => void;
  exporting: boolean;
  onDownload: () => void;
  onRetake: () => void;
  processing: boolean;
  stickers: StickerItem[];
  selectedId: string | null;
  onMove: (uid: string, x: number, y: number) => void;
  onAddSticker: (emoji: string) => void;
  onAddDateSticker: () => void;
  onUpdateSticker: (uid: string, patch: Partial<StickerItem>) => void;
  onRemoveSticker: (uid: string) => void;
  onClearStickers: () => void;
}

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "filters", label: "Filters", icon: Wand2 },
  { id: "retake", label: "Retake", icon: RotateCcw },
  { id: "adjust", label: "Adjust", icon: Type },
  { id: "decorate", label: "Decorate", icon: Sticker },
];

export default function EditStep({
  photos,
  filterId,
  onFilter,
  caption,
  onCaption,
  format,
  onFormat,
  onContinue,
  dateText,
  exporting,
  onDownload,
  onRetake,
  processing,
  stickers,
  selectedId,
  onMove,
  onAddSticker,
  onAddDateSticker,
  onUpdateSticker,
  onRemoveSticker,
  onClearStickers,
}: EditStepProps) {
  const [tab, setTab] = useState<Tab>("filters");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4">
      {/* Preview */}
      <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/40 p-3">
        {photos.length > 0 ? (
          <img
            src={photos[0]}
            alt="Preview of the first captured photo"
            className="mx-auto max-h-[42vh] w-auto max-w-full rounded-xl object-contain sm:max-h-[50vh]"
          />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <ImageIcon className="size-8 text-slate-400" aria-hidden="true" />
            <p className="text-sm text-slate-400">
              No photos captured yet — go back to Capture to snap your poses.
            </p>
          </div>
        )}
      </figure>

      {/* Mini thumbnails */}
      <div className="flex gap-2" aria-label="Captured photos">
        {photos.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Captured photo ${index + 1} of ${photos.length}`}
            className="h-14 w-14 rounded-xl border border-slate-800 bg-slate-800 object-cover"
          />
        ))}
        {Array.from({ length: Math.max(0, 3 - photos.length) }).map(
          (_, index) => (
            <div
              key={`empty-${index}`}
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs font-bold text-slate-400"
            >
              {photos.length + index + 1}
            </div>
          ),
        )}
      </div>

      <EditorBottomSheet open title="Studio tools">
        {/* Tab Navigation */}
        <div
          role="group"
          aria-label="Editing tools"
          className="mb-4 flex gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-1"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={active}
                className={cx(
                  "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:gap-2 sm:px-3 sm:text-xs",
                  active
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {tab === "filters" && (
          <FilterPanel
            filterId={filterId}
            onFilter={onFilter}
            processing={processing}
          />
        )}

        {tab === "retake" && (
          <RetakePanel
            photos={photos}
            onRetake={onRetake}
            processing={processing}
          />
        )}

        {tab === "adjust" && (
          <CaptionEditor
            caption={caption}
            onCaption={onCaption}
            dateText={dateText}
            format={format}
            onFormat={onFormat}
            exporting={exporting}
            hasPhotos={photos.length > 0}
            onDownload={onDownload}
          />
        )}

        {tab === "decorate" && (
          <StickerPanel
            stickers={stickers}
            selectedId={selectedId}
            onUpdateSticker={onUpdateSticker}
            onRemoveSticker={onRemoveSticker}
            onClearStickers={onClearStickers}
            onAddSticker={onAddSticker}
            onAddDateSticker={onAddDateSticker}
          />
        )}
      </EditorBottomSheet>

      {/* Primary CTA: continue to export */}
      <button
        type="button"
        onClick={onContinue}
        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-[0_16px_36px_-16px_rgba(99,102,241,0.65)] transition hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Continue to Export
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
