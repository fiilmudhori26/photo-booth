"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
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
      <div>
        <h3 className="font-display text-base text-white">Retake Photos</h3>
        <p className="font-hand text-sm text-slate-400">
          Start the capture sequence again — your current photos will be
          replaced.
        </p>
      </div>

      <button
        type="button"
        onClick={onRetake}
        disabled={processing}
        className={cx(
          "flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-50",
          processing
            ? "border-slate-800 bg-slate-800/60 text-slate-400"
            : "border-rose-500/40 bg-rose-500/10 text-rose-200 hover:border-rose-500/60 hover:bg-rose-500/20",
        )}
      >
        {processing ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <RotateCcw className="size-5" aria-hidden="true" />
        )}
        {processing ? "Processing…" : "Retake All Photos"}
      </button>

      <p className="text-center font-hand text-xs text-slate-400">
        {photos.length} of 3 poses captured
      </p>
    </div>
  );
}
