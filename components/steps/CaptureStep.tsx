"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatStamp } from "@/lib/date-stamp";
import { renderFilteredShot } from "@/lib/filters";
import { sfx } from "@/lib/sound";
import { useCamera } from "@/lib/useCamera";
import type { FilterId } from "@/lib/types";
import CameraView from "../CameraView";
import { MobileButton } from "../ui";

interface CaptureStepProps {
  onPhotosCaptured: (photos: string[]) => void;
  onBack?: () => void;
  mirror: boolean;
  onToggleMirror: () => void;
  soundOn: boolean;
  /** Report capture-sequence state to the parent (e.g. to lock navigation). */
  onRunningChange?: (running: boolean) => void;
}

const POSE_COUNT = 3;
const DEFAULT_COUNTDOWN = 3;

export default function CaptureStep({
  onPhotosCaptured,
  onBack,
  mirror,
  onToggleMirror,
  soundOn,
  onRunningChange,
}: CaptureStepProps) {
  // Camera & capture state
  const [raws, setRaws] = useState<string[]>([]);
  const [processed, setProcessed] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownLength, setCountdownLength] = useState(DEFAULT_COUNTDOWN);
  const [poseIndex, setPoseIndex] = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [running, setRunning] = useState(false);

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

  // Report sequence state to the parent (e.g. to lock the stepper). The
  // cleanup fires both on every "running" change and on unmount, so the
  // parent can never get stuck with a permanently-locked stepper.
  useEffect(() => {
    onRunningChange?.(running);
    return () => onRunningChange?.(false);
  }, [running, onRunningChange]);

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
    if (running || camera.status !== "ready") return;

    setRunning(true);
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setCountdown(countdownLength);

    const shots: string[] = [];

    try {
      for (let index = 0; index < POSE_COUNT; index += 1) {
        if (!aliveRef.current) return;
        setPoseIndex(index);
        play("sparkle");

        for (let tick = countdownLength; tick >= 1; tick -= 1) {
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
    } finally {
      if (aliveRef.current) setRunning(false);
    }
  }, [camera, mirror, play, onPhotosCaptured, running, countdownLength]);

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
        capturing={camera.status === "ready" && (countdown !== null || running)}
        countdownLength={countdownLength}
        onCountdownChange={setCountdownLength}
      />

      {/* Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
        <h2 className="mb-2 font-display text-sm tracking-wide text-white">
          Tips for a good shot
        </h2>
        <ul className="space-y-1.5 font-hand text-sm leading-snug text-slate-400">
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5 text-indigo-400">•</span>
            Sit close for best framing
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5 text-indigo-400">•</span>
            Look at the lens, not the screen
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5 text-indigo-400">•</span>
            Hold still during countdown
          </li>
        </ul>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <MobileButton
            variant="primary"
            size="lg"
            icon={
              running ? (
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-5" aria-hidden="true" />
              )
            }
            onClick={() => void runSequence()}
            disabled={camera.status !== "ready" || running}
            className="min-h-12 flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            {running
              ? "Capturing…"
              : camera.status === "ready"
                ? "Start Capture"
                : "Camera not ready"}
          </MobileButton>
          {onBack && (
            <MobileButton
              variant="secondary"
              size="lg"
              onClick={onBack}
              disabled={running}
              className="min-h-12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Back
            </MobileButton>
          )}
        </div>

        <p className="mt-3 font-hand text-sm text-slate-400">
          3 poses with a {countdownLength}s countdown
        </p>
      </div>
    </div>
  );
}
