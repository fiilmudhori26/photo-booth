"use client";

import type { ExportFormat } from "@/lib/types";
import { cx } from "../../ui";

interface FormatToggleProps {
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
}

export default function FormatToggle({
  format,
  onFormat,
}: FormatToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onFormat("png")}
        className={cx(
          "rounded-full border-2 px-3 py-1 text-xs font-bold transition",
          format === "png"
            ? "border-indigo-500 bg-indigo-600/20 text-white"
            : "border-slate-700/50 bg-slate-800/40 text-slate-300",
        )}
      >
        PNG
      </button>
      <button
        type="button"
        onClick={() => onFormat("jpg")}
        className={cx(
          "rounded-full border-2 px-3 py-1 text-xs font-bold transition",
          format === "jpg"
            ? "border-indigo-500 bg-indigo-600/20 text-white"
            : "border-slate-700/50 bg-slate-800/40 text-slate-300",
        )}
      >
        JPG
      </button>
    </div>
  );
}
