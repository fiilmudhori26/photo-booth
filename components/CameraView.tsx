"use client";

import {
  ArrowLeftRight,
  CameraOff,
  LoaderCircle,
  SwitchCamera,
} from "lucide-react";
import type { RefObject } from "react";
import type { CameraStatus } from "@/lib/useCamera";
import { cx } from "./ui";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  errorMessage: string;
  onRetry: () => void;
  deviceCount: number;
  deviceLabel: string;
  onSwitchCamera: () => void;
  mirror: boolean;
  onToggleMirror: () => void;
  countdown: number | null;
  poseIndex: number;
  capturedCount: number;
  flash: boolean;
  capturing: boolean;
  countdownLength: number;
  onCountdownChange: (value: number) => void;
}

export default function CameraView({
  videoRef,
  status,
  errorMessage,
  onRetry,
  deviceCount,
  deviceLabel,
  onSwitchCamera,
  mirror,
  onToggleMirror,
  countdown,
  poseIndex,
  capturedCount,
  flash,
  capturing,
  countdownLength,
  onCountdownChange,
}: CameraViewProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-[5px] border-white bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-pink-900/30 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
      {/* Video feed */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        style={{ transform: mirror ? "scaleX(-1)" : undefined }}
        className={cx(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          status === "ready" ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Soft vignette for dreamy booth look */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_45%,rgba(0,0,0,0.28)_100%)]" />


      {/* Loading overlay */}
      {status === "requesting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-slate-900/85 backdrop-blur-sm">
          <LoaderCircle className="size-10 animate-spin text-indigo-400" />
          <p className="font-display text-lg text-white">
            Wake up the camera...
          </p>
          <p className="font-hand text-base text-slate-300">
            Get ready for the magic ✨
          </p>
        </div>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-br from-red-900/50 to-pink-900/50 p-6 text-center">
          <CameraOff className="size-10 text-rose-400" aria-hidden="true" />
          <p className="font-display text-lg text-white">
            Camera not available 🙈
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-slate-300">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border-2 border-white bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
          >
            Try again
          </button>
        </div>
      )}

      {/* Capture overlay */}
      {status === "ready" && capturing && (
        <>
          {/* Pose indicator */}
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
            <span
              key={`pose-${poseIndex}`}
              className="anim-pop inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-600/90 px-4 py-1.5 font-bold text-sm text-white shadow-lg"
            >
              💗 Pose {poseIndex + 1} of 3
            </span>
          </div>

          {/* Countdown numbers */}
          {countdown !== null && countdown > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span
                key={`count-${countdown}`}
                className="anim-count font-display font-bold text-8xl text-white drop-shadow-lg sm:text-[10rem]"
                style={{ textShadow: "0 4px 0 rgba(0,0,0,0.5)" }}
              >
                {countdown}
              </span>
            </div>
          )}
        </>
      )}

      {/* Countdown picker - top center, only when idle */}
      {status === "ready" && !capturing && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/85 py-1.5 pl-4 pr-1.5 shadow-lg backdrop-blur">
            <span
              id="countdown-picker-label"
              className="text-xs font-bold text-slate-400"
            >
              Countdown
            </span>
            <div
              role="group"
              aria-labelledby="countdown-picker-label"
              className="flex items-center gap-1"
            >
              {[3, 5, 10].map((sec) => {
                const active = countdownLength === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onCountdownChange(sec)}
                    aria-pressed={active}
                    className={cx(
                      "min-h-11 min-w-11 rounded-full px-3 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400",
                      active
                        ? "bg-indigo-500 text-white shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    {sec}s
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Flash effect */}
      {flash && (
        <div className="anim-flash pointer-events-none absolute inset-0 bg-white" />
      )}

      {/* Floating controls - bottom left */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleMirror}
          aria-pressed={mirror}
          className={cx(
            "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold shadow-lg backdrop-blur transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:translate-y-[1px]",
            mirror
              ? "border-rose-400/50 bg-rose-600 text-white"
              : "border-slate-700 bg-slate-900/85 text-slate-100 hover:border-slate-600",
          )}
        >
          <ArrowLeftRight className="size-4" />
          Mirror
        </button>

        {deviceCount > 1 && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="inline-flex min-h-11 max-w-[11rem] items-center gap-2 rounded-full border border-slate-700 bg-slate-900/85 px-3.5 text-xs font-bold text-slate-100 shadow-lg backdrop-blur transition hover:border-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <SwitchCamera className="size-4 shrink-0" />
            <span className="truncate">{deviceLabel || "Switch"}</span>
          </button>
        )}
      </div>

      {/* Capture progress hearts */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/85 px-3 py-2 shadow-lg backdrop-blur">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cx(
              "text-base leading-none transition",
              index < capturedCount ? "opacity-100" : "opacity-25 grayscale",
            )}
          >
            💗
          </span>
        ))}
      </div>
    </div>
  );
}