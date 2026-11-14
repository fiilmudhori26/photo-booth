"use client";

import { useState } from "react";
import type {
  ExportFormat,
  FilterId,
  StickerItem,
  TemplateId,
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
  templateId: TemplateId;
  onTemplate: (id: TemplateId) => void;
  dateText: string;
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

export default function EditStep({
  photos,
  filterId,
  onFilter,
  caption,
  onCaption,
  format,
  onFormat,
  templateId,
  onTemplate,
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

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "filters", label: "Filters", icon: () => <span className="size-4">🎨</span> },
    { id: "retake", label: "Retake", icon: () => <span className="size-4">↻</span> },
    { id: "adjust", label: "Adjust", icon: () => <span className="size-4">🔍</span> },
    { id: "decorate", label: "Decorate", icon: () => <span className="size-4">✨</span> },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-24">
      <div className="rounded-2xl border-[3px] border-slate-700/50 bg-slate-800/60 flex items-center justify-center">
        {photos.length > 0 ? (
          <img
            src={photos[0]}
            alt="Photo preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="font-hand text-xs text-slate-500">No photos captured</p>
        )}
      </div>

      {/* Mini thumbnails */}
      <div className="mt-3 flex gap-2">
        {photos.map((src, index) => (
          <div
            key={index}
            className="h-12 w-12 overflow-hidden rounded-lg border-2 border-slate-700/50 bg-slate-800"
          >
            <img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
        {photos.length < 3 && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50">
            <span className="text-xs text-slate-500">{photos.length + 1}</span>
          </div>
        )}
      </div>

      <EditorBottomSheet open={true} onClose={onRetake}>
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
            templateId={templateId}
            onTemplate={onTemplate}
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
    </div>
  );
}
