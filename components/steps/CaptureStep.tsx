"use client";

import { Camera, Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatStamp } from "@/lib/date-stamp";
import { renderFilteredShot } from "@/lib/filters";
import { sfx } from "@/lib/sound";
import { useCamera } from "@/lib/useCamera";
import type { FilterId } from "@/lib/types";
import CameraView from "../CameraView";
import { MobileButton, cx } from "../ui";

type Step = "select" | "capture" | "edit" | "export";

interface CaptureStepProps {
  onPhotosCaptured: (photos: string[]) => void;
  onBack?: () => void;
  mirror: boolean;
  onToggleMirror: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

const POSE_COUNT = 3;
const DEFAULT_COUNTDOWN = 3;

export default function CaptureStep({
  onPhotosCaptured,
  onBack,
  mirror,
  onToggleMirror,
  soundOn,
  onToggleSound,
}: CaptureStepProps) {
  // Camera & capture state
  const [raws, setRaws] = useState<string[]>([]);
  const [processed, setProcessed] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [poseIndex, setPoseIndex] = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [flash, setFlash] = useState(false);

  // Camera hook
  const camera = useCamera(true);
  const aliveRef = useRef(true);
  const soundRef = useRef(soundOn);

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
    Promise.all(raws.map((raw) => renderFilteredShot(raw, "normal"))).then(
      (result) => {
        if (cancelled) return;
        setProcessed(result);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [raws]);

  const dateText = formatStamp(new Date());

  const uuid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Capture sequence
  const runSequence = useCallback(async () => {
    if (camera.status !== "ready") return;

    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
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
      play("pop");
      return;
    }

    setRaws(shots);
    setProcessed(shots);
    play("success");
    onPhotosCaptured(shots);
  }, [camera, mirror, play, onPhotosCaptured]);

  const [notice, setNotice] = useState<string | null>(null);
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

  const handleRetake = () => {
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setCountdown(null);
    setNotice(null);
  };

  const stepIndex = 1;

  return (
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
        onToggleMirror={onToggleMirror}
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
          {onBack && (
            <MobileButton
              variant="secondary"
              onClick={onBack}
            >
              Back
            </MobileButton>
          )}
        </div>

        <p className="mt-3 font-hand text-xs text-slate-500">
          3 poses with {DEFAULT_COUNTDOWN}s countdown
        </p>
      </div>

      {/* Sound toggle */}
      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        className="rounded-full border-[3px] border-white px-3 py-1.5 text-xs font-bold transition"
        style={{
          backgroundColor: soundOn ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
          color: soundOn ? "#6b4a5a" : "#a3809a",
        }}
      >
        {soundOn ? "🔊 On" : "🔇 Off"}
      </button>

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
