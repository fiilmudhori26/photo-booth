"use client";

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
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 px-3 py-2">
          <span className="size-4 animate-spin text-indigo-400">⟳</span>
          <span className="text-sm text-slate-300">Processing…</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onFilter(preset.id)}
            disabled={processing}
            className={cx(
              "flex min-h-[5rem] flex-col items-center justify-center gap-1 rounded-2xl border-[3px] p-2 transition disabled:opacity-50",
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
