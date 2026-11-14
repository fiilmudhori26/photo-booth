"use client";

import { Camera, Download, Image as ImageIcon, QrCode, RotateCcw } from "lucide-react";
import { MobileButton, cx } from "../ui";
import type { ExportFormat } from "@/lib/types";

interface ExportStepProps {
  exporting: boolean;
  processed: string[];
  onDownload: () => void;
  onStartOver: () => void;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
}

export default function ExportStep({
  exporting,
  processed,
  onDownload,
  onStartOver,
  format,
  onFormat,
}: ExportStepProps) {
  const hasPhotos = processed.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4">
      {/* Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg text-white">Your Photo Strip</h2>
          <span className="rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            HD export
          </span>
        </div>

        <div className="mb-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-800/40 p-3">
          {hasPhotos ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {processed.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Captured photo ${index + 1} of ${processed.length}`}
                  className="h-40 w-32 rounded-lg border border-slate-700/60 object-cover sm:h-48 sm:w-36"
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-center">
              <Camera className="size-8 text-slate-400" aria-hidden="true" />
              <p className="max-w-56 font-hand text-sm text-slate-400">
                No photos yet — capture 3 poses first, then come back here to
                download.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <MobileButton
            variant="primary"
            size="lg"
            icon={
              exporting ? undefined : (
                <Download className="size-5" aria-hidden="true" />
              )
            }
            onClick={onDownload}
            disabled={exporting || !hasPhotos}
            className="min-h-13 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            {exporting ? "Saving…" : "Download HD"}
          </MobileButton>

          <MobileButton
            variant="secondary"
            size="lg"
            icon={<QrCode className="size-5" aria-hidden="true" />}
            disabled
            title="QR sharing is coming soon"
            className="min-h-13 cursor-not-allowed opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            QR Code — coming soon
          </MobileButton>

          <MobileButton
            variant="secondary"
            size="lg"
            icon={<RotateCcw className="size-5" aria-hidden="true" />}
            onClick={onStartOver}
            className="min-h-13 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Start New Session
          </MobileButton>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
        <h3 className="mb-2 flex items-center gap-2 font-display text-xs uppercase tracking-wide text-slate-400">
          <ImageIcon className="size-4" aria-hidden="true" />
          File format
        </h3>
        <div className="flex gap-2" role="group" aria-label="File format">
          {(["png", "jpg"] as ExportFormat[]).map((option) => {
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
      </div>
    </div>
  );
}
