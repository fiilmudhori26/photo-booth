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
import { KawaiiButton, cx } from "./ui";

interface CameraStageProps {
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
  poseCount?: number;
  flash: boolean;
  capturing: boolean;
}

const CORNERS = [
  "left-3 top-3",
  "right-3 top-3",
  "left-3 bottom-3",
  "right-3 bottom-3",
];

export default function CameraStage({
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
  poseCount = 3,
  flash,
  capturing,
}: CameraStageProps) {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[2.25rem] border-[5px] border-white bg-gradient-to-br from-lilac via-blush to-butter shadow-[0_30px_60px_-30px_rgba(140,80,120,0.8)]">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{ transform: mirror ? "scaleX(-1)" : undefined }}
          className={cx(
            "block aspect-[4/3] h-full w-full object-cover transition-opacity duration-500",
            status === "ready" ? "opacity-100" : "opacity-0",
          )}
        />

        {/* soft vignette for a dreamy booth look */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_45%,rgba(140,80,120,0.28)_100%)]" />

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

        {status === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/75 backdrop-blur-sm">
            <LoaderCircle className="size-10 animate-spin text-rose" />
            <p className="font-display text-lg text-ink">Waking up the camera…</p>
            <p className="font-hand text-base text-inksoft">
              say cheese in a second 🌸
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blush to-lilac px-6 text-center">
            <CameraOff className="size-10 text-rose" />
            <p className="font-display text-lg text-ink">Camera said no 🙈</p>
            <p className="max-w-sm text-sm leading-relaxed text-ink/80">{errorMessage}</p>
            <KawaiiButton
              variant="primary"
              icon={<RefreshCw className="size-4" />}
              onClick={onRetry}
            >
              Try again
            </KawaiiButton>
          </div>
        )}

        {status === "ready" && capturing && (
          <>
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
              <span
                key={`pose-${poseIndex}`}
                className="anim-pop inline-flex items-center gap-2 rounded-full border-2 border-white bg-rose/90 px-4 py-1.5 font-display text-sm text-white shadow-lg"
              >
                💗 Pose {poseIndex + 1} of {poseCount}
              </span>
            </div>

            {countdown !== null && countdown > 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                  key={`count-${countdown}`}
                  className="anim-count font-display text-[7rem] leading-none text-white kawaii-text-shadow sm:text-[9rem]"
                >
                  {countdown}
                </span>
              </div>
            )}
          </>
        )}

        {flash && <div className="anim-flash pointer-events-none absolute inset-0 bg-white" />}

        {/* floating controls */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleMirror}
            aria-pressed={mirror}
            className={cx(
              "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white px-3 text-xs font-bold shadow-lg backdrop-blur transition active:translate-y-[2px]",
              mirror ? "bg-rose text-white" : "bg-white/85 text-ink hover:bg-white",
            )}
          >
            <ArrowLeftRight className="size-4" />
            Mirror
          </button>

          {deviceCount > 1 && (
            <button
              type="button"
              onClick={onSwitchCamera}
              className="inline-flex min-h-11 max-w-[13rem] items-center gap-2 rounded-full border-2 border-white bg-white/85 px-3 text-xs font-bold text-ink shadow-lg backdrop-blur transition hover:bg-white active:translate-y-[2px]"
            >
              <SwitchCamera className="size-4 shrink-0" />
              <span className="truncate">{deviceLabel || "Switch camera"}</span>
            </button>
          )}
        </div>

        {/* capture progress hearts */}
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
      </div>
    </div>
  );
}
