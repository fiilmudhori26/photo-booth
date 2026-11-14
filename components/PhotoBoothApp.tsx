"use client";

import { Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatStamp, fileStamp } from "@/lib/date-stamp";
import { downloadDataUrl } from "@/lib/download";
import { renderTemplateToDataUrl } from "@/lib/template-export";
import { renderFilteredShot } from "@/lib/filters";
import { sfx } from "@/lib/sound";
import type {
  ExportFormat,
  FilterId,
  StickerItem,
  TemplateId,
} from "@/lib/types";
import SelectStep from "./steps/SelectStep";
import CaptureStep from "./steps/CaptureStep";
import EditStep from "./steps/EditStep";
import ExportStep from "./steps/ExportStep";
import { Stepper } from "./ui";

type Step = "select" | "capture" | "edit" | "export";

export default function PhotoBoothApp() {
  // Step management
  const [step, setStep] = useState<Step>("select");

  // Shared photo state
  const [raws, setRaws] = useState<string[]>([]);
  const [processed, setProcessed] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Shared template / export state
  const [templateId, setTemplateId] = useState<TemplateId>("boarding-pass");
  const [sessionDate, setSessionDate] = useState(() => new Date());
  const [mirror, setMirror] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  // Shared editing state
  const [filterId, setFilterId] = useState<FilterId>("normal");
  const [caption, setCaption] = useState("★ PHOTO BOOTH ★");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [captureRunning, setCaptureRunning] = useState(false);

  // Sticker state
  const [stickers, setStickers] = useState<Array<{
    uid: string;
    kind: "emoji" | "date";
    emoji?: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
  }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cameraAliveRef = useRef(true);
  const soundRef = useRef(soundOn);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    cameraAliveRef.current = true;
    return () => {
      cameraAliveRef.current = false;
    };
  }, []);

  // Any step change (including CaptureStep unmount) re-enables step navigation
  useEffect(() => {
    setCaptureRunning(false);
  }, [step]);

  const play = useCallback((name: keyof typeof sfx, arg?: number) => {
    if (!soundRef.current) return;
    const fn = sfx[name] as unknown as (value?: number) => void;
    fn(arg);
  }, []);

  const handleCaptureRunningChange = useCallback((running: boolean) => {
    setCaptureRunning(running);
  }, []);

  const dateText = formatStamp(sessionDate);

  // Apply filters to raw images when raws or filterId changes
  useEffect(() => {
    if (!raws.length) {
      setProcessed([]);
      return;
    }
    let cancelled = false;
    setProcessing(true);
    Promise.all(raws.map((raw) => renderFilteredShot(raw, filterId)))
      .then((result) => {
        if (cancelled) return;
        setProcessed(result);
      })
      .catch(() => {
        if (!cancelled) setProcessed(raws);
      })
      .finally(() => {
        if (!cancelled) setProcessing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [raws, filterId]);

  const uuid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Called by CaptureStep when 3 photos are ready
  const handlePhotosCaptured = useCallback((photos: string[]) => {
    setRaws(photos);
    setProcessed(photos);
    play("success");
    setStep("edit");
  }, [play]);

  const handleDownload = async () => {
    if (!processed.length || exporting) return;
    setDownloadError(null);
    setExporting(true);
    try {
      const dataUrl = await renderTemplateToDataUrl(
        templateId,
        { photos: processed, caption, dateText },
        format,
      );
      downloadDataUrl(
        dataUrl,
        `photo-booth-template-${templateId}-${fileStamp(sessionDate)}.${format}`,
      );
      play("success");
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleRetake = () => {
    setDownloadError(null);
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setCapturedCountLocal(0);
    setStep("capture");
    play("pop");
  };

  const handleStartOver = () => {
    setDownloadError(null);
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setFilterId("normal");
    setCaption("★ PHOTO BOOTH ★");
    setFormat("png");
    setTemplateId("boarding-pass");
    setStep("select");
    play("pop");
  };

  const handleToggleMirror = () => setMirror((v) => !v);
  const handleToggleSound = () => setSoundOn((v) => !v);
  const handleContinueToCamera = () => setStep("capture");

  // Sticker handlers
  const addSticker = (emoji: string) => {
    setStickers((prev) => [
      ...prev,
      {
        uid: uuid(),
        kind: "emoji",
        emoji,
        x: 0.22 + Math.random() * 0.56,
        y: 0.1 + Math.random() * 0.32,
        size: 0.15,
        rotation: Math.round((Math.random() - 0.5) * 26),
      },
    ]);
    play("pop");
  };

  const addDateSticker = () => {
    setStickers((prev) => [
      ...prev,
      { uid: uuid(), kind: "date", x: 0.5, y: 0.88, size: 0.2, rotation: -3 },
    ]);
    play("pop");
  };

  const updateSticker = (uid: string, patch: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.uid === uid ? { ...sticker, ...patch } : sticker)),
    );
  };

  const moveSticker = useCallback((uid: string, x: number, y: number) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.uid === uid ? { ...sticker, x, y } : sticker)),
    );
  }, []);

  const removeSticker = (uid: string) => {
    setStickers((prev) => prev.filter((s) => s.uid !== uid));
    if (selectedId === uid) setSelectedId(null);
  };

  const clearStickers = () => setStickers([]);

  // Local captured count for capture-step display (kept in PhotoBoothApp so
  // CaptureStep can reset it without owning cross-step state).
  const [capturedCountLocal, setCapturedCountLocal] = useState(0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-rose-400 via-pink-500 to-violet-600 text-[1.35rem] shadow-[0_12px_30px_-12px_rgba(168,85,247,0.7)]"
          >
            📷
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl leading-tight text-white">
              Photo Booth
            </h1>
            <p className="font-hand text-sm leading-tight text-slate-400">
              {step === "select" && "Choose a template to start"}
              {step === "capture" && "Capture 3 poses"}
              {step === "edit" && "Edit your photos"}
              {step === "export" && "Download your strip"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Turn sound effects off" : "Turn sound effects on"}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/80 px-4 text-xs font-bold text-slate-200 transition hover:border-slate-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          {soundOn ? (
            <Volume2 className="size-4 text-indigo-300" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4 text-slate-400" aria-hidden="true" />
          )}
          {soundOn ? "On" : "Off"}
        </button>
      </header>

      {/* Step indicator (fixed bottom bar) */}
      <Stepper step={step} onChange={setStep} disabled={captureRunning} />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        {(step === "edit" || step === "export") && downloadError && (
          <div
            role="alert"
            className="mx-auto mb-3 flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200"
          >
            <span>{downloadError}</span>
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              aria-label="Dismiss error"
              className="grid size-9 shrink-0 place-items-center rounded-full text-rose-300 transition hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {step === "select" && (
          <SelectStep
            selectedTemplate={templateId}
            onSelect={setTemplateId}
            onContinue={handleContinueToCamera}
          />
        )}

        {step === "capture" && (
          <CaptureStep
            onPhotosCaptured={handlePhotosCaptured}
            onBack={() => setStep("select")}
            mirror={mirror}
            onToggleMirror={handleToggleMirror}
            soundOn={soundOn}
            onRunningChange={handleCaptureRunningChange}
          />
        )}

        {step === "edit" && (
          <EditStep
            onContinue={() => setStep("export")}
            photos={processed}
            filterId={filterId}
            onFilter={setFilterId}
            caption={caption}
            onCaption={setCaption}
            format={format}
            onFormat={setFormat}
            dateText={dateText}
            exporting={exporting}
            onDownload={handleDownload}
            onRetake={handleRetake}
            processing={processing}
            stickers={stickers}
            selectedId={selectedId}
            onMove={moveSticker}
            onAddSticker={addSticker}
            onAddDateSticker={addDateSticker}
            onUpdateSticker={updateSticker}
            onRemoveSticker={removeSticker}
            onClearStickers={clearStickers}
          />
        )}

        {step === "export" && (
          <ExportStep
            exporting={exporting}
            processed={processed}
            onDownload={handleDownload}
            onStartOver={handleStartOver}
            format={format}
            onFormat={setFormat}
          />
        )}
      </main>

      {/* Notice / Alerts */}
      {step === "export" && exporting && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-800/95 px-5 py-2 text-sm font-semibold text-slate-100 shadow-lg backdrop-blur"
        >
          Saving…
        </div>
      )}
    </div>
  );
}
