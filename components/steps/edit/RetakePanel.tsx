"use client";

import { useState } from "react";
import { cx } from "../../ui";

interface RetakePanelProps {
  photos: string[];
  onRetake: () => void;
  processing: boolean;
}

export default function RetakePanel({
  photos,
  onRetake,
  processing,
}: RetakePanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base text-white">Retake Photos</h3>

      <button
        type="button"
        onClick={onRetake}
        disabled={processing}
        className={cx(
          "flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] px-4 py-3 font-bold transition disabled:opacity-50",
          processing
            ? "border-slate-700/50 bg-slate-800/60 text-slate-500"
            : "border-white bg-white/10 text-white hover:bg-white/20",
        )}
      >
        {processing ? "⟳" : "↻"}
        Retake All Photos
      </button>
    </div>
  );
}
