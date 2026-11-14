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
  const options: ExportFormat[] = ["png", "jpg"];

  return (
    <fieldset>
      <legend className="mb-2 font-display text-base text-white">
        File format
      </legend>
      <div className="flex gap-2" role="group" aria-label="File format">
        {options.map((option) => {
          const active = format === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onFormat(option)}
              aria-pressed={active}
              className={cx(
                "min-h-11 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400",
                active
                  ? "border-indigo-500 bg-indigo-600 text-white shadow"
                  : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:text-white",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
