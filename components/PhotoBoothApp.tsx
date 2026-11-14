"use client";

import {
  Camera,
  Check,
  Heart,
  ImageUp,
  Sparkles,
  Volume2,
  VolumeX,
  WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { renderFilteredShot } from "@/lib/filters";
import { DEFAULT_FRAME } from "@/lib/frames";
import { shareImage } from "@/lib/share";
import { renderStripGif } from "@/lib/gif";
import {
  downloadDataUrl,
  fileStamp,
  formatStamp,
  renderStripToDataUrl,
} from "@/lib/export";
import { sfx, vibrate } from "@/lib/sound";
import { MAX_STICKERS, PAD_DEFAULT } from "@/lib/strip";
import { useCamera } from "@/lib/useCamera";
import type {
  ExportFormat,
  FilterId,
  FrameId,
  PatternId,
  StickerItem,
} from "@/lib/types";
import CameraStage from "./CameraStage";
import StudioStage from "./StudioStage";
import UploadStage from "./UploadStage";
import { KawaiiButton, Panel, StatPill, cx } from "./ui";

type Stage = "intro" | "camera" | "capturing" | "upload" | "studio";

const POSE_COUNT = 3;

const DECOR: { emoji: string; className: string; delay: string }[] = [
  { emoji: "💖", className: "left-[4%] top-[14%]", delay: "0s" },
  { emoji: "✨", className: "left-[16%] top-[62%]", delay: "1.4s" },
  { emoji: "🎀", className: "right-[7%] top-[22%]", delay: "0.7s" },
  { emoji: "🌸", className: "right-[15%] bottom-[16%]", delay: "2s" },
  { emoji: "⭐", className: "left-[46%] top-[6%]", delay: "1s" },
  { emoji: "🫧", className: "right-[30%] bottom-[8%]", delay: "0.3s" },
];

const STEPS = ["Photos", "Snap poses", "Decorate"];

function stepIndex(stage: Stage) {
  if (stage === "capturing") return 1;
  if (stage === "studio") return 2;
  return 0;
}

export default function PhotoBoothApp() {
  const [stage, setStage] = useState<Stage>("intro");

  const [raws, setRaws] = useState<string[]>([]);
  const [processed, setProcessed] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const [filterId, setFilterId] = useState<FilterId>("normal");
  const [frameId, setFrameId] = useState<FrameId>(DEFAULT_FRAME);
  const [pattern, setPattern] = useState<PatternId>("dots");
  const [pad, setPad] = useState(PAD_DEFAULT);
  const [caption, setCaption] = useState("★ PHOTO BOOTH ★");
  const [eventText, setEventText] = useState("");

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [format, setFormat] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);
  const [isCameraSession, setIsCameraSession] = useState(false);

  const [sessionDate, setSessionDate] = useState(() => new Date());
  const [mirror, setMirror] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [poseIndex, setPoseIndex] = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const camera = useCamera(stage === "camera" || stage === "capturing");
  const aliveRef = useRef(true);
  const soundRef = useRef(soundOn);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const play = useCallback((name: keyof typeof sfx, arg?: number) => {
    if (!soundRef.current) return;
    const fn = sfx[name] as unknown as (value?: number) => void;
    fn(arg);
  }, []);

  /** Filters are baked into the pixels so preview and export always match. */
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

  const gifGrabsRef = useRef<string[][]>([]);

  const runSequence = useCallback(async () => {
    setIsCameraSession(true);
    gifGrabsRef.current = [];
    if (camera.status !== "ready") return;

    setStage("capturing");
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setSessionDate(new Date());

    const shots: string[] = [];

    for (let index = 0; index < POSE_COUNT; index += 1) {
      if (!aliveRef.current) return;
      setPoseIndex(index);
      play("sparkle");

      for (let tick = 3; tick >= 1; tick -= 1) {
        if (!aliveRef.current) return;
        setCountdown(tick);
        play("tick", tick);
        if (soundRef.current) vibrate(15);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!aliveRef.current) return;
      const grabs: string[] = [];
      const pre1 = camera.captureSmallFrame(mirror);
      await new Promise((resolve) => setTimeout(resolve, 150));
      const pre2 = camera.captureSmallFrame(mirror);
      if (pre1) grabs.push(pre1);
      if (pre2) grabs.push(pre2);

      setCountdown(null);
      setFlash(true);
      play("shutter");
      if (soundRef.current) vibrate([40, 60, 40]);

      const frame = camera.captureFrame(mirror);
      const mid = camera.captureSmallFrame(mirror);
      if (mid) grabs.push(mid);
      await new Promise((resolve) => setTimeout(resolve, 160));
      const post1 = camera.captureSmallFrame(mirror);
      if (post1) grabs.push(post1);
      await new Promise((resolve) => setTimeout(resolve, 160));
      const post2 = camera.captureSmallFrame(mirror);
      if (post2) grabs.push(post2);
      gifGrabsRef.current[index] = grabs;

      if (!aliveRef.current) return;
      setFlash(false);

      if (frame) shots.push(frame);
      setCapturedCount(shots.length);

      if (index < POSE_COUNT - 1) {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
    }

    if (!aliveRef.current) return;
    setRaws(shots);
    setProcessed(shots);
    play("success");
    setStage("studio");
  }, [camera, mirror, play]);

  /** Same hand-off as a camera shoot, but the three shots came from the gallery. */
  const useGalleryShots = (shots: string[]) => {
    setIsCameraSession(false);
    gifGrabsRef.current = [];
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setCountdown(null);
    setNotice(null);
    setSessionDate(new Date());
    setRaws(shots);
    setProcessed(shots);
    play("success");
    setStage("studio");
  };

  const addSticker = (emoji: string) => {
    if (stickers.length >= MAX_STICKERS) return;
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
    if (stickers.length >= MAX_STICKERS) return;
    const uid = uuid();
    setStickers((prev) => [
      ...prev,
      { uid, kind: "date", x: 0.5, y: 0.88, size: 0.2, rotation: -3 },
    ]);
    setSelectedId(uid);
    play("pop");
  };

  const updateSticker = (uid: string, patch: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.uid === uid ? { ...sticker, ...patch } : sticker)),
    );
  };

  /** Stable callback so dragging never re-binds pointer handlers mid-gesture. */
  const moveSticker = useCallback((uid: string, x: number, y: number) => {
    setStickers((prev) =>
      prev.map((sticker) => (sticker.uid === uid ? { ...sticker, x, y } : sticker)),
    );
  }, []);

  const handleDownload = async () => {
    if (!processed.length || exporting) return;
    setExporting(true);
    setNotice(null);
    try {
      const dataUrl = await renderStripToDataUrl(
        {
          photos: processed,
          frameId,
          pattern,
          pad,
          stickers,
          caption,
          dateText,
          eventText,
        },
        format,
      );
      downloadDataUrl(
        dataUrl,
        `my-dipaaa-${fileStamp(sessionDate)}.${format}`,
      );
      play("success");
      setNotice("Saved to your device — kawaii! 💖");
    } catch {
      setNotice("Hmm, the strip could not be saved. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!processed.length || sharing || exporting) return;
    setSharing(true);
    setNotice(null);
    try {
      const dataUrl = await renderStripToDataUrl(
        {
          photos: processed,
          frameId,
          pattern,
          pad,
          stickers,
          caption,
          dateText,
          eventText,
        },
        "png",
      );
      const result = await shareImage(dataUrl, {
        title: "my dipaaa",
        text: "My photo strip 💖",
        format: "png",
      });
      setNotice(
        result === "shared"
          ? "Shared — kawaii! 💌"
          : "Saved to your device — kawaii! 💖",
      );
    } catch {
      setNotice("Hmm, the strip could not be shared. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleGif = async () => {
    if (!processed.length || gifBusy || exporting) return;
    if (!isCameraSession || !gifGrabsRef.current.some((grabs) => grabs.length)) {
      setNotice("GIF works after a camera shoot — this strip came from the gallery.");
      return;
    }
    setGifBusy(true);
    setNotice(null);
    try {
      const dataUrl = await renderStripGif({
        grabs: gifGrabsRef.current,
        frameId,
        pattern,
        pad,
        stickers,
        caption,
        dateText,
        eventText,
      });
      const result = await shareImage(dataUrl, {
        title: "my dipaaa",
        text: "My animated photo strip 💖",
        format: "gif",
      });
      setNotice(
        result === "shared"
          ? "GIF shared — kawaii! 💌"
          : "GIF saved to your device — kawaii! 💖",
      );
    } catch {
      setNotice("Hmm, the GIF could not be created. Try the plain strip instead.");
    } finally {
      setGifBusy(false);
    }
  };

  const retakePhotos = () => {
    setRaws([]);
    setProcessed([]);
    setStickers([]);
    setSelectedId(null);
    setCapturedCount(0);
    setCountdown(null);
    setNotice(null);
    setStage("camera");
  };

  const startOver = () => {
    retakePhotos();
    setFilterId("normal");
    setFrameId(DEFAULT_FRAME);
    setPattern("dots");
    setPad(PAD_DEFAULT);
    setCaption("★ PHOTO BOOTH ★");
    setEventText("");
  };

  const capturing = stage === "capturing";

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        {DECOR.map((item) => (
          <span
            key={item.emoji + item.className}
            className={cx(
              "anim-float absolute select-none text-3xl opacity-40 sm:text-4xl",
              item.className,
            )}
            style={{ animationDelay: item.delay }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="anim-wiggle grid size-12 place-items-center rounded-[1.25rem] border-[3px] border-white bg-gradient-to-br from-petal to-violet text-2xl shadow-[0_14px_26px_-16px_rgba(192,132,252,0.95)] sm:size-14 sm:text-3xl">
            📷
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl leading-none text-ink sm:text-2xl">
              my dipaaa💕
            </h1>
            <p className="font-hand text-sm text-inksoft sm:text-base">
              snap 3 cute poses · decorate · download
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundOn((value) => !value)}
          aria-pressed={soundOn}
          className={cx(
            "inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] px-4 text-xs font-bold transition active:translate-y-[2px]",
            soundOn
              ? "border-white bg-white/85 text-ink shadow-[0_10px_20px_-14px_rgba(196,110,160,0.9)]"
              : "border-white/70 bg-white/50 text-inksoft",
          )}
        >
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          {soundOn ? "Sound on" : "Muted"}
        </button>
      </header>

      <div className="mx-auto mt-5 w-full max-w-6xl px-4 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2">
          {STEPS.map((label, index) => {
            const current = stepIndex(stage);
            const done = index < current;
            return (
              <li
                key={label}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition",
                  index === current
                    ? "border-rose bg-gradient-to-b from-bubble to-blush text-ink"
                    : done
                      ? "border-white bg-white/80 text-inksoft"
                      : "border-white/70 bg-white/50 text-inksoft/70",
                )}
              >
                <span
                  className={cx(
                    "grid size-5 place-items-center rounded-full text-[0.625rem]",
                    index === current
                      ? "bg-rose text-white"
                      : done
                        ? "bg-mint text-ink"
                        : "bg-white text-inksoft",
                  )}
                >
                  {done ? <Check className="size-3" /> : index + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6">
        {stage === "intro" && (
          <Panel className="mx-auto max-w-3xl overflow-hidden text-center">
            <div className="anim-bob mx-auto mb-3 flex justify-center gap-2 text-4xl sm:text-5xl">
              <span>📸</span>
              <span>💖</span>
              <span>✨</span>
            </div>
            <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl">
              Welcome to the cutest little photo booth
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink/80 sm:text-base">
              Allow your camera and snap three poses with a countdown — or upload
              photos from your gallery instead. Then dress up your strip with pastel
              filters, frames and stickers. Everything stays on your device.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { icon: <Camera className="size-5" />, title: "3 poses", text: "Countdown, flash and cute pose prompts." },
                { icon: <WandSparkles className="size-5" />, title: "5 filters", text: "Pastel bloom, vintage warm, mono and more." },
                { icon: <Sparkles className="size-5" />, title: "Stickers", text: "Frames, patterns, hearts and date stamps." },
              ].map((item) => (
                <div key={item.title} className="kawaii-inset px-4 py-5">
                  <span className="mx-auto mb-2 grid size-10 place-items-center rounded-2xl border-2 border-white bg-gradient-to-br from-bubble to-lilac text-ink">
                    {item.icon}
                  </span>
                  <h3 className="font-display text-base text-ink">{item.title}</h3>
                  <p className="mt-1 font-hand text-base leading-snug text-inksoft">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <KawaiiButton
                variant="primary"
                icon={<Camera className="size-5" />}
                onClick={() => {
                  play("sparkle");
                  setStage("camera");
                }}
              >
                Start Photo Booth
              </KawaiiButton>
              <KawaiiButton
                icon={<ImageUp className="size-5" />}
                onClick={() => {
                  play("sparkle");
                  setStage("upload");
                }}
              >
                Upload from Gallery
              </KawaiiButton>
            </div>

            <div className="mt-4 flex justify-center">
              <StatPill icon={<Heart className="size-3.5" />}>
                Nothing is uploaded anywhere
              </StatPill>
            </div>
          </Panel>
        )}

        {(stage === "camera" || stage === "capturing") && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_22rem] lg:items-start">
            <CameraStage
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
              capturing={capturing}
            />

            <Panel className="lg:sticky lg:top-6">
              <h2 className="font-display text-xl leading-tight text-ink">
                {capturing ? "Say cheeeese!" : "Ready when you are"}
              </h2>
              <p className="mt-2 font-hand text-base leading-snug text-inksoft">
                {capturing
                  ? `Pose ${poseIndex + 1} of ${POSE_COUNT} — hold that smile, the flash is coming.`
                  : "Three quick poses with a 3-2-1 countdown, then it is decorating time."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatPill icon={<Camera className="size-3.5" />}>
                  {camera.status === "ready" ? "Camera live" : "Camera idle"}
                </StatPill>
                <StatPill icon={<Heart className="size-3.5" />}>
                  {capturedCount}/{POSE_COUNT} snapped
                </StatPill>
              </div>

              <ol className="mt-5 space-y-2.5">
                {[
                  "Sit close — the booth frames a 4:3 shot.",
                  "Look at the lens, not the screen, for the sparkle.",
                  "Tilt your head and add a prop for extra cuteness.",
                ].map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm leading-snug text-ink/80">
                    <span className="mt-0.5 text-petal">💗</span>
                    {tip}
                  </li>
                ))}
              </ol>

              <div className="mt-6 space-y-3">
                <KawaiiButton
                  block
                  variant="primary"
                  disabled={camera.status !== "ready" || capturing}
                  onClick={() => void runSequence()}
                  icon={<Sparkles className="size-5" />}
                >
                  {capturing ? "Capturing…" : "Start Photo Booth"}
                </KawaiiButton>

                {stage === "camera" && (
                  <>
                    <KawaiiButton
                      block
                      onClick={() => setStage("upload")}
                      icon={<ImageUp className="size-5" />}
                    >
                      Upload from gallery
                    </KawaiiButton>
                    <KawaiiButton block onClick={() => setStage("intro")}>
                      Back
                    </KawaiiButton>
                  </>
                )}
              </div>

              <p className="mt-4 font-hand text-sm leading-snug text-inksoft">
                Tip: filters, frames and stickers are applied after the shoot, so
                you can change your mind as many times as you like.
              </p>
            </Panel>
          </div>
        )}

        {stage === "upload" && (
          <UploadStage
            onBack={() => setStage("intro")}
            onComplete={useGalleryShots}
          />
        )}

        {stage === "studio" && (
          <StudioStage
            photos={processed}
            filterId={filterId}
            onFilter={(id) => {
              setFilterId(id);
              play("pop");
            }}
            processing={processing}
            frameId={frameId}
            onFrame={setFrameId}
            pattern={pattern}
            onPattern={setPattern}
            pad={pad}
            onPad={setPad}
            stickers={stickers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={moveSticker}
            onAddSticker={addSticker}
            onAddDateSticker={addDateSticker}
            onUpdateSticker={updateSticker}
            onRemoveSticker={(uid) => {
              setStickers((prev) => prev.filter((sticker) => sticker.uid !== uid));
              setSelectedId((current) => (current === uid ? null : current));
            }}
            onClearStickers={() => setStickers([])}
            caption={caption}
            onCaption={setCaption}
            dateText={dateText}
            eventText={eventText}
            onEventText={setEventText}
            format={format}
            onFormat={setFormat}
            onDownload={() => void handleDownload()}
            exporting={exporting}
            onShare={() => void handleShare()}
            sharing={sharing}
            onGif={() => void handleGif()}
            gifBusy={gifBusy}
            gifAvailable={isCameraSession}
            onRetake={retakePhotos}
            onStartOver={startOver}
          />
        )}

        {notice && (
          <p
            role="status"
            className="anim-pop mx-auto mt-6 max-w-md rounded-3xl border-[3px] border-white bg-white/90 px-5 py-3 text-center text-sm font-bold text-ink shadow-[0_18px_36px_-24px_rgba(196,110,160,0.9)]"
          >
            {notice}
          </p>
        )}
      </main>

      <footer className="pb-10 text-center font-hand text-base text-inksoft">
        made with 💖 · your photos never leave this device
      </footer>
    </div>
  );
}
