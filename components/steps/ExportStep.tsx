"use client";

import { Camera } from "lucide-react";
import { MobileButton, cx } from "../ui";
import type { ExportFormat } from "@/lib/types";

interface ExportStepProps {
  exporting: boolean;
  processed: string[];
  templateId: string;
  onDownload: () => void;
  onStartOver: () => void;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
}

export default function ExportStep({
  exporting,
  processed,
  templateId,
  onDownload,
  onStartOver,
  format,
  onFormat,
}: ExportStepProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4">
      <div className="rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 p-4">
        <h3 className="font-display text-lg text-white mb-3">Export Options</h3>

        <div className="aspect-[4/3] rounded-xl border-2 border-slate-700/50 bg-slate-800/60 flex items-center justify-center mb-4">
          <div className="text-center">
            <Camera className="mx-auto mb-2 h-8 w-8 text-indigo-400" />
            <p className="font-hand text-xs text-slate-400">High resolution preview</p>
          </div>
        </div>

        <div className="grid gap-3">
          <MobileButton
            variant="primary"
            icon={<Camera className="size-4" />}
            onClick={onDownload}
            disabled={exporting || !processed.length}
          >
            {exporting ? "Saving…" : "Download HD"}
          </MobileButton>

          <MobileButton
            variant="secondary"
            icon={<Camera className="size-4" />}
            onClick={() => {
              // QR code modal would go here
            }}
          >
            Generate QR Code
          </MobileButton>

          <MobileButton
            variant="secondary"
            onClick={onStartOver}
          >
            Start New Session
          </MobileButton>
        </div>
      </div>

      <div className="rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 p-4">
        <h4 className="font-display text-xs text-slate-400 mb-2">Settings</h4>
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
      </div>
    </div>
  );
}
