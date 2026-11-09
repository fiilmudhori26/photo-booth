"use client";

import { Camera, Heart } from "lucide-react";
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
import { MobileButton, Stepper, cx } from "./ui";

type Step = "select" | "capture" | "edit" | "export";

const POSE_COUNT = 3;
const DEFAULT_COUNTDOWN = 3;

const STEPS = ["Templates", "Capture", "Edit", "Export"] as const;

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

  const play = useCallback((name: keyof typeof sfx, arg?: number) => {
    if (!soundRef.current) return;
    const fn = sfx[name] as unknown as (value?: number) => void;
    fn(arg);
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
      // notice handled by EditStep via fallback
    } finally {
      setExporting(false);
    }
  };

  const handleRetake = () => {
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setCapturedCountLocal(0);
    setStep("capture");
    play("pop");
  };

  const handleStartOver = () => {
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

  const handleExport = () => {
    setStep("export");
  };

  const handleToggleMirror = () => setMirror((v) => !v);
  const handleToggleSound = () => setSoundOn((v) => !v);

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
    <div className="flex h-full flex-col bg-slate-900">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[1.25rem] border-[3px] border-white bg-gradient-to-br from-petal to-violet text-2xl shadow-[0_14px_26px_-16px_rgba(192,132,252,0.95)]">
            📷
          </span>
          <div>
            <h1 className="font-display text-lg text-white">Photo Booth</h1>
            <p className="font-hand text-xs text-slate-400">
              {step === "edit" ? "Edit your photos" : step === "export" ? "Download ready" : "Capture 3 poses"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleSound}
          aria-pressed={soundOn}
          className="rounded-full border-[3px] border-white px-3 py-1.5 text-xs font-bold transition"
          style={{
            backgroundColor: soundOn ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
            color: soundOn ? "#6b4a5a" : "#a3809a",
          }}
        >
          {soundOn ? "🔊 On" : "🔇 Off"}
        </button>
      </header>

      {/* Step indicator */}
      <div className="mx-auto mb-4 max-w-4xl px-4">
        <Stepper step={step} onChange={setStep} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {step === "select" && (
          <SelectStep
            selectedTemplate={templateId}
            onSelect={setTemplateId}
            onContinue={handleExport}
          />
        )}

        {step === "capture" && (
          <CaptureStep
            onPhotosCaptured={handlePhotosCaptured}
            onBack={() => setStep("select")}
            mirror={mirror}
            onToggleMirror={handleToggleMirror}
            soundOn={soundOn}
            onToggleSound={handleToggleSound}
          />
        )}

        {step === "edit" && (
          <EditStep
            photos={processed}
            filterId={filterId}
            onFilter={setFilterId}
            caption={caption}
            onCaption={setCaption}
            format={format}
            onFormat={setFormat}
            templateId={templateId}
            onTemplate={setTemplateId}
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
            templateId={templateId}
            onDownload={handleDownload}
            onStartOver={handleStartOver}
            format={format}
            onFormat={setFormat}
          />
        )}
      </main>

      {/* Notice / Alerts */}
      <div className="mx-auto mb-4 max-w-xs rounded-full border-[3px] border-white bg-white/90 px-4 py-2 text-center text-sm font-bold text-ink shadow-[0_18px_36px_-24px_rgba(196,110,160,0.9)]">
        {step === "export" && exporting ? "Saving…" : ""}
      </div>
    </div>
  );
}
