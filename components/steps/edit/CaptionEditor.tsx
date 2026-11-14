"use client";

import { Download, LoaderCircle } from "lucide-react";
import type { ExportFormat } from "@/lib/types";
import FormatToggle from "./FormatToggle";
import { cx } from "../../ui";

interface CaptionEditorProps {
  caption: string;
  onCaption: (value: string) => void;
  dateText: string;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  exporting: boolean;
  hasPhotos: boolean;
  onDownload: () => void;
}

export default function CaptionEditor({
  caption,
  onCaption,
  dateText,
  format,
  onFormat,
  exporting,
  hasPhotos,
  onDownload,
}: CaptionEditorProps) {
  const canDownload = hasPhotos && !exporting;

  return (
    <div className="space-y-4">
      {/* Caption */}
      <div>
        <label
          htmlFor="strip-caption"
          className="mb-2 block font-display text-base text-white"
        >
          Caption
        </label>
        <input
          id="strip-caption"
          value={caption}
          onChange={(e) => onCaption(e.target.value.slice(0, 22))}
          placeholder="★ PHOTO BOOTH ★"
          maxLength={22}
          aria-describedby="strip-caption-count"
          className="min-h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-bold text-white transition outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
        <span
          id="strip-caption-count"
          className="mt-1.5 block font-hand text-xs text-slate-400"
        >
          {22 - caption.length} characters left
        </span>
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="strip-date"
          className="mb-2 block font-display text-base text-white"
        >
          Date
        </label>
        <input
          id="strip-date"
          value={dateText}
          readOnly
          className="min-h-12 w-full rounded-2xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-sm font-bold text-slate-300"
        />
      </div>

      {/* Format toggle */}
      <FormatToggle format={format} onFormat={onFormat} />

      {/* Download */}
      <button
        type="button"
        onClick={onDownload}
        disabled={!canDownload}
        className={cx(
          "flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-60",
          canDownload
            ? "border-transparent bg-indigo-600 text-white hover:bg-indigo-500"
            : "border-slate-800 bg-slate-800/60 text-slate-400",
        )}
      >
        {exporting ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : (
          <>
            <Download className="size-5" aria-hidden="true" />
            Download
          </>
        )}
      </button>
      {!hasPhotos && (
        <p className="text-center font-hand text-sm text-slate-400">
          Capture 3 poses first to enable download
        </p>
      )}
    </div>
  );
}
