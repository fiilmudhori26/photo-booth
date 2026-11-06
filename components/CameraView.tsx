"use client";

import {
  ArrowLeftRight,
  CameraOff,
  LoaderCircle,
  RefreshCw,
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
  onCountdownChange?: (value: number | null) => void;
}

const CORNERS = [
  "left-3 top-3",
  "right-3 top-3",
  "left-3 bottom-3",
  "right-3 bottom-3",
];

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
  onCountdownChange,
}: CameraViewProps) {
  return (
    <div className="relative aspect-[4/3] w-full rounded-[2rem] border-[5px] border-white bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-pink-900/30 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
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

      {/* Corner sparkles */}
      {CORNERS.map((position) => (
        <span
          key={position}
          className={cx(
            "pointer-events-none absolute select-none text-2xl drop-shadow-sm",
            position,
          )}
        >
          ✨
        </span>
      ))}

      {/* Loading overlay */}
      {status === "requesting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/75 backdrop-blur-sm rounded-[2rem]">
          <LoaderCircle className="size-10 animate-spin text-indigo-600" />
          <p className="font-display text-lg text-ink">
            Wake up the camera...
          </p>
          <p className="font-hand text-base text-slate-500">
            Get ready for the magic ✨
          </p>
        </div>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-br from-red-900/50 to-pink-900/50 p-6 text-center">
          <CameraOff className="size-10 text-rose" />
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
              className="anim-pop inline-flex items-center gap-2 rounded-full border-2 border-white bg-rose/90 px-4 py-1.5 font-bold text-sm text-white shadow-lg"
            >
              💗 Pose {poseIndex + 1} of 3
            </span>
          </div>

          {/* Countdown numbers */}
          {countdown !== null && countdown > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span
                key={`count-${countdown}`}
                className="anim-count font-bold text-white drop-shadow-lg sm:text-[10rem]"
                style={{ textShadow: "0 4px 0 rgba(0,0,0,0.5)" }}
              >
                {countdown}
              </span>
            </div>
          )}
        </>
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
            "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white px-3 text-xs font-bold shadow-lg backdrop-blur transition active:translate-y-[2px]",
            mirror
              ? "bg-rose text-white"
              : "bg-white/85 text-indigo-200 hover:bg-white",
          )}
        >
          <ArrowLeftRight className="size-4" />
          Mirror
        </button>

        {deviceCount > 1 && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="inline-flex max-w-[10rem] items-center gap-2 rounded-full border-2 border-white bg-white/85 px-3 text-xs font-bold text-indigo-200 shadow-lg backdrop-blur transition hover:bg-white active:translate-y-[2px]"
          >
            <SwitchCamera className="size-4 shrink-0" />
            <span className="truncate">{deviceLabel || "Switch"}</span>
          </button>
        )}
      </div>

      {/* Capture progress hearts */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border-2 border-white bg-white/80 px-3 py-1.5 shadow-lg backdrop-blur">
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

      {/* Bottom sheet capture controls - only visible in camera ready state */}
      {status === "ready" && !capturing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border-2 border-white bg-white/80 px-4 py-2 shadow-lg backdrop-blur">
            <span className="text-xs font-bold text-indigo-600">Countdown:</span>
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  if (onCountdownChange) onCountdownChange(sec);
                }}
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-bold transition",
                  countdown === sec
                    ? "bg-indigo-600 text-white"
                    : "bg-white/70 text-indigo-600 hover:bg-white",
                )}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}