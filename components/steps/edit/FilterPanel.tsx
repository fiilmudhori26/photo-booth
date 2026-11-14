"use client";

import { LoaderCircle } from "lucide-react";
import { FILTER_PRESETS } from "@/lib/filters";
import type { FilterId } from "@/lib/types";
import { cx } from "../../ui";

interface FilterPanelProps {
  filterId: FilterId;
  onFilter: (id: FilterId) => void;
  processing: boolean;
}

export default function FilterPanel({
  filterId,
  onFilter,
  processing,
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base text-white">Filters</h3>

      {processing && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2"
        >
          <LoaderCircle
            className="size-4 animate-spin text-indigo-300"
            aria-hidden="true"
          />
          <span className="text-sm text-indigo-200">Applying filters…</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FILTER_PRESETS.map((preset) => {
          const active = filterId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onFilter(preset.id)}
              disabled={processing}
              aria-pressed={active}
              className={cx(
                "flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border p-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-50",
                active
                  ? "border-indigo-500 bg-indigo-500/15 shadow-[0_0_0_1px_#6366f1]"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/70",
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                {preset.icon}
              </span>
              <span className="text-xs font-bold text-white">
                {preset.label}
              </span>
              <span className="font-hand text-xs leading-tight text-slate-400">
                {preset.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
