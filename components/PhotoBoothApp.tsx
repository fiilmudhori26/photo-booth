"use client";

import { Camera, Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { renderFilteredShot } from "@/lib/filters";
import {
  downloadDataUrl,
  fileStamp,
  formatStamp,
  renderTemplateToDataUrl,
} from "@/lib/export";
import { sfx } from "@/lib/sound";
import { useCamera } from "@/lib/useCamera";
import type {
  ExportFormat,
  FilterId,
  TemplateId,
} from "@/lib/types";
import CameraView from "./CameraView";
import TemplateSelectionPage, {
  type TemplateCategory,
} from "./TemplateSelectionPage";
import EditorBottomSheet from "./EditorBottomSheet";
import { MobileButton, Stepper, cx } from "./ui";

type Step = "select" | "capture" | "edit" | "export";

const POSE_COUNT = 3;
const DEFAULT_COUNTDOWN = 3;

const STEPS = ["Templates", "Capture", "Edit", "Export"] as const;

export default function PhotoBoothApp() {
  // Step management
  const [step, setStep] = useState<Step>("select");

  // Camera & capture state
  const [raws, setRaws] = useState<string[]>([]);
  const [processed, setProcessed] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [poseIndex, setPoseIndex] = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [flash, setFlash] = useState(false);

  // Editing state
  const [filterId, setFilterId] = useState<FilterId>("normal");
  const [caption, setCaption] = useState("★ PHOTO BOOTH ★");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);

  // Template state
  const [templateId, setTemplateId] = useState<TemplateId>("boarding-pass");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("all");

  // Date
  const [sessionDate, setSessionDate] = useState(() => new Date());
  const [mirror, setMirror] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  // Camera hook
  const camera = useCamera(step === "capture");
  const aliveRef = useRef(true);
  const soundRef = useRef(soundOn);

  // Sticker state (for editor)
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

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const play = useCallback((name: keyof typeof sfx, arg?: number) => {
    if (!soundRef.current) return;
    const fn = sfx[name] as unknown as (value?: number) => void;
    fn(arg);
  }, []);

  // Apply filters to raw images
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

  const dateText = formatStamp(sessionDate);

  const uuid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Capture sequence
  const runSequence = useCallback(async () => {
    if (camera.status !== "ready") return;

    setStep("capture");
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setNotice(null);
    setSessionDate(new Date());
    setCountdown(DEFAULT_COUNTDOWN);

    const shots: string[] = [];

    for (let index = 0; index < POSE_COUNT; index += 1) {
      if (!aliveRef.current) return;
      setPoseIndex(index);
      play("sparkle");

      for (let tick = DEFAULT_COUNTDOWN; tick >= 1; tick -= 1) {
        if (!aliveRef.current) return;
        setCountdown(tick);
        play("tick", tick);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!aliveRef.current) return;
      setCountdown(null);
      setFlash(true);
      play("shutter");

      const frame = camera.captureFrame(mirror);
      await new Promise((resolve) => setTimeout(resolve, 130));
      if (!aliveRef.current) return;
      setFlash(false);

      if (frame) shots.push(frame);
      setCapturedCount(shots.length);

      if (index < POSE_COUNT - 1) {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
    }

    if (!aliveRef.current) return;

    if (shots.length < POSE_COUNT) {
      setCountdown(null);
      setFlash(false);
      setCapturedCount(0);
      setNotice("The camera didn't send a photo — let's try that again.");
      setStep("capture");
      play("pop");
      return;
    }

    setRaws(shots);
    setProcessed(shots);
    play("success");
    setStep("edit");
  }, [camera, mirror, play]);

  const [notice, setNotice] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!processed.length || exporting) return;
    setExporting(true);
    setNotice(null);
    try {
      const dataUrl = await renderTemplateToDataUrl(
        templateId,
        {
          photos: processed,
          caption,
          dateText,
        },
        format,
      );
      downloadDataUrl(
        dataUrl,
        `photo-booth-template-${templateId}-${fileStamp(sessionDate)}.${format}`,
      );
      play("success");
      setNotice("Saved to your device!");
    } catch {
      setNotice("Could not save - please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleRetake = () => {
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setCountdown(null);
    setNotice(null);
    setStep("capture");
  };

  const handleStartOver = () => {
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setCountdown(null);
    setNotice(null);
    setFilterId("normal");
    setCaption("★ PHOTO BOOTH ★");
    setFormat("png");
    setTemplateId("boarding-pass");
    setTemplateCategory("all");
    setStep("select");
  };

  const handleExport = () => {
    setStep("export");
  };

  // Sticker handlers
  const addSticker = (emoji: string) => {
    const uid = uuid();
    setStickers((prev) => [
      ...prev,
      {
        uid,
        kind: "emoji",
        emoji,
        x: 0.22 + Math.random() * 0.56,
        y: 0.1 + Math.random() * 0.32,
        size: 0.15,
        rotation: Math.round((Math.random() - 0.5) * 26),
      },
    ]);
    setSelectedId(uid);
    play("pop");
  };

  const addDateSticker = () => {
    const uid = uuid();
    setStickers((prev) => [
      ...prev,
      { uid, kind: "date", x: 0.5, y: 0.88, size: 0.2, rotation: -3 },
    ]);
    setSelectedId(uid);
    play("pop");
  };

  const updateSticker = (uid: string, patch: { x?: number; y?: number; size?: number; rotation?: number }) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.uid === uid ? { ...sticker, ...patch } : sticker)),
    );
  };

  const moveSticker = useCallback((uid: string, x: number, y: number) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.uid === uid ? { ...sticker, x, y } : sticker)),
    );
  }, []);

  const selectedSticker = stickers.find((s) => s.uid === selectedId) ?? null;

  // Template category options
  const templateCategoryOptions = [
    { id: "all" as const, label: "All" },
    { id: "ticket" as const, label: "Tickets" },
    { id: "retro" as const, label: "Retro" },
    { id: "minimalist" as const, label: "Minimalist" },
  ];

  // Current step index for stepper
  const stepIndex = STEPS.indexOf(step as typeof STEPS[number]);

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
          onClick={() => setSoundOn((value) => !value)}
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
          <TemplateSelectionPage
            selectedTemplate={templateId}
            onSelect={(id) => setTemplateId(id)}
            onContinue={handleExport}
          />
        )}

        {step === "capture" && (
          <div className="mx-auto max-w-3xl space-y-4 px-4">
            <CameraView
              videoRef={camera.videoRef}
              status={camera.status}
              errorMessage={camera.errorMessage}
              onRetry={camera.retry}
              deviceCount={camera.devices.length}
              deviceLabel={camera.activeDeviceLabel}
              onSwitchCamera={camera.switchCamera}
              mirror={mirror}
              onToggleMirror={() => setMirror((value) => !value)}
              countdown={countdown}
              poseIndex={poseIndex}
              capturedCount={capturedCount}
              flash={flash}
              capturing={camera.status === "ready" && countdown !== null}
            />

            {/* Controls */}
            <div className="rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 p-4">
              <h3 className="font-display text-sm text-white mb-2">Tips</h3>
              <ul className="space-y-1 font-hand text-xs text-slate-400">
                <li>• Sit close for best framing</li>
                <li>• Look at the lens, not the screen</li>
                <li>• Hold still during countdown</li>
              </ul>

              <div className="mt-4 flex gap-2">
                <MobileButton
                  variant="primary"
                  onClick={() => void runSequence()}
                  disabled={camera.status !== "ready"}
                >
                  Start Capture
                </MobileButton>
                <MobileButton
                  variant="secondary"
                  onClick={() => {
                    setStep("select");
                    play("pop");
                  }}
                >
                  Back
                </MobileButton>
              </div>

              <p className="mt-3 font-hand text-xs text-slate-500">
                3 poses with {DEFAULT_COUNTDOWN}s countdown
              </p>
            </div>
          </div>
        )}

        {step === "edit" && (
          <div className="mx-auto max-w-3xl space-y-4 px-4 pb-24">
            <div className="rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 p-4">
              <h3 className="font-display text-sm text-white mb-2">Preview</h3>
              <div className="aspect-[4/3] rounded-xl border-2 border-slate-700/50 bg-slate-800/60 flex items-center justify-center">
                {processed.length > 0 ? (
                  <img
                    src={processed[0]}
                    alt="Photo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="font-hand text-xs text-slate-500">No photos captured</p>
                )}
              </div>

              {/* Mini thumbnails */}
              <div className="mt-3 flex gap-2">
                {processed.map((src, index) => (
                  <div
                    key={index}
                    className="h-12 w-12 overflow-hidden rounded-lg border-2 border-slate-700/50 bg-slate-800"
                  >
                    <img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
                {processed.length < 3 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50">
                    <span className="text-xs text-slate-500">{processed.length + 1}</span>
                  </div>
                )}
              </div>
            </div>

            <EditorBottomSheet
              photos={processed}
              filterId={filterId}
              onFilter={setFilterId}
              processing={processing}
              stickers={stickers}
              selectedId={selectedId}
              onMove={moveSticker}
              onAddSticker={addSticker}
              onAddDateSticker={addDateSticker}
              onUpdateSticker={updateSticker}
              onRemoveSticker={() => {}}
              onClearStickers={() => setStickers([])}
              caption={caption}
              onCaption={setCaption}
              dateText={dateText}
              templateId={templateId}
              onTemplate={setTemplateId}
              format={format}
              onFormat={setFormat}
              exporting={exporting}
              onRetake={handleRetake}
              onDownload={handleDownload}
            />
          </div>
        )}

        {step === "export" && (
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
                  onClick={handleDownload}
                  disabled={exporting || !processed.length}
                >
                  {exporting ? "Saving…" : "Download HD"}
                </MobileButton>

                <MobileButton
                  variant="secondary"
                  icon={<Camera className="size-4" />}
                  onClick={() => {
                    // QR code modal would go here
                    setNotice("QR Code feature ready!");
                  }}
                >
                  Generate QR Code
                </MobileButton>

                <MobileButton
                  variant="secondary"
                  onClick={handleStartOver}
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
                  onClick={() => setFormat("png")}
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
                  onClick={() => setFormat("jpg")}
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
        )}
      </main>

      {/* Notice / Alerts */}
      {notice && (
        <div
          role="status"
          className="mx-auto mb-4 max-w-xs rounded-full border-[3px] border-white bg-white/90 px-4 py-2 text-center text-sm font-bold text-ink shadow-[0_18px_36px_-24px_rgba(196,110,160,0.9)]"
          style={{ background: notice.includes("Saved") ? "rgba(162,184,222,0.9)" : "rgba(255,255,255,0.9)" }}
        >
          {notice}
        </div>
      )}
    </div>
  );
}