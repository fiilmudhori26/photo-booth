"use client";

import { useState } from "react";
import type { ExportFormat, TemplateId } from "@/lib/types";
import FormatToggle from "./FormatToggle";
import { cx } from "../../ui";

interface CaptionEditorProps {
  caption: string;
  onCaption: (value: string) => void;
  dateText: string;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  exporting: boolean;
  templateId: TemplateId;
  onTemplate: (id: TemplateId) => void;
  onDownload: () => void;
}

export default function CaptionEditor({
  caption,
  onCaption,
  dateText,
  format,
  onFormat,
  exporting,
  templateId,
  onTemplate,
  onDownload,
}: CaptionEditorProps) {
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

      {/* Format toggle */}
      <FormatToggle format={format} onFormat={onFormat} />

      {/* Download */}
      <button
        type="button"
        onClick={onDownload}
        disabled={exporting}
        className={cx(
          "w-full rounded-2xl border-[3px] px-4 py-3 font-bold transition disabled:opacity-50",
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
