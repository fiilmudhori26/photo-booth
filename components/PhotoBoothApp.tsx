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

const PHOTO_COUNTS = [3, 4, 5, 6] as const;

const DECOR: { emoji: string; className: string; delay: string }[] = [
  { emoji: "💖", className: "left-[4%] top-[14%]", delay: "0s" },
  { emoji: "✨", className: "left-[16%] top-[62%]", delay: "1.4s" },
  { emoji: "🎀", className: "right-[7%] top-[22%]", delay: "0.7s" },
  { emoji: "🌸", className: "right-[15%] bottom-[16%]", delay: "2s" },
  { emoji: "⭐", className: "left-[46%] top-[6%]", delay: "1s" },
  { emoji: "🫧", className: "right-[30%] bottom-[8%]", delay: "0.3s" },
];

const STEPS = ["Foto", "Jepret pose", "Hias strip"];

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
  const [photoCount, setPhotoCount] = useState(3);
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

    for (let index = 0; index < photoCount; index += 1) {
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

      if (index < photoCount - 1) {
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
      setNotice("Tersimpan di perangkat kamu — kawaii! 💖");
    } catch {
      setNotice("Hmm, stripnya gagal disimpan. Coba lagi, ya.");
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
        format,
      );
      const result = await shareImage(dataUrl, {
        title: "my dipaaa",
        text: "Strip foto aku 💖",
        format,
      });
      setNotice(
        result === "shared"
          ? "Terkirim — kawaii! 💌"
          : "Tersimpan di perangkat kamu — kawaii! 💖",
      );
    } catch {
      setNotice("Hmm, stripnya gagal dibagikan. Coba lagi, ya.");
    } finally {
      setSharing(false);
    }
  };

  const handleGif = async () => {
    if (!processed.length || gifBusy || exporting) return;
    if (!isCameraSession || !gifGrabsRef.current.some((grabs) => grabs.length)) {
      setNotice("GIF cuma bisa setelah jepret pakai kamera — strip ini dari galeri.");
      return;
    }
    setGifBusy(true);
    setNotice(null);
    try {
      const bakedGrabs = await Promise.all(
        gifGrabsRef.current.map((pose) =>
          Promise.all(pose.map((grab) => renderFilteredShot(grab, filterId))),
        ),
      );
      const dataUrl = await renderStripGif({
        grabs: bakedGrabs,
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
        text: "Strip foto animasi aku 💖",
        format: "gif",
      });
      setNotice(
        result === "shared"
          ? "GIF terkirim — kawaii! 💌"
          : "GIF tersimpan di perangkat kamu — kawaii! 💖",
      );
    } catch {
      setNotice("Hmm, GIF-nya gagal dibuat. Coba strip biasa aja.");
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
              jepret {photoCount} pose lucu · hias · unduh
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
          {soundOn ? "Suara nyala" : "Senyap"}
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
              Selamat datang di photo booth paling imut
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink/80 sm:text-base">
              Izinkan akses kamera, lalu jepret {photoCount} foto dengan hitung mundur —
              atau upload foto dari galeri kamu. Setelah itu hias stripnya dengan
              filter pastel, bingkai, dan stiker. Semuanya tetap di perangkat kamu.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { icon: <Camera className="size-5" />, title: `${photoCount} foto`, text: "Hitung mundur, flash, dan arahan pose yang lucu." },
                { icon: <WandSparkles className="size-5" />, title: "8 filter", text: "Pastel bloom, vintage hangat, mono, dan lainnya." },
                { icon: <Sparkles className="size-5" />, title: "Stiker", text: "Bingkai, pola, hati, dan stempel tanggal." },
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

            <div className="mt-6">
              <p className="font-display text-base text-ink">Jumlah foto per strip</p>
              <div
                role="radiogroup"
                aria-label="Jumlah foto per strip"
                className="mt-2 inline-flex flex-wrap items-center gap-2"
              >
                {PHOTO_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={photoCount === count}
                    onClick={() => setPhotoCount(count)}
                    className={cx(
                      "size-14 rounded-2xl border-[3px] text-lg font-black transition active:translate-y-[2px]",
                      photoCount === count
                        ? "border-white bg-gradient-to-b from-bubble to-rose text-white shadow-[0_12px_24px_-16px_rgba(196,110,160,0.95)]"
                        : "border-white/80 bg-white/70 text-ink hover:bg-white",
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
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
                Mulai Photo Booth
              </KawaiiButton>
              <KawaiiButton
                icon={<ImageUp className="size-5" />}
                onClick={() => {
                  play("sparkle");
                  setStage("upload");
                }}
              >
                Upload dari Galeri
              </KawaiiButton>
            </div>

            <div className="mt-4 flex justify-center">
              <StatPill icon={<Heart className="size-3.5" />}>
                Foto kamu tidak diunggah ke mana pun
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
              poseCount={photoCount}
              flash={flash}
              capturing={capturing}
            />

            <Panel className="lg:sticky lg:top-6">
              <h2 className="font-display text-xl leading-tight text-ink">
                {capturing ? "Ucapkan cheeeeese!" : "Siap kapan pun kamu mau"}
              </h2>
              <p className="mt-2 font-hand text-base leading-snug text-inksoft">
                {capturing
                  ? `Pose ${poseIndex + 1} dari ${photoCount} — tahan senyummu, flashnya sebentar lagi.`
                  : `${photoCount} foto dengan hitung mundur 3-2-1, lalu waktunya menghias strip.`}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatPill icon={<Camera className="size-3.5" />}>
                  {camera.status === "ready" ? "Kamera aktif" : "Kamera belum aktif"}
                </StatPill>
                <StatPill icon={<Heart className="size-3.5" />}>
                  {capturedCount}/{photoCount} terjepret
                </StatPill>
              </div>

              <ol className="mt-5 space-y-2.5">
                {[
                  "Duduk agak dekat — booth ini membingkai foto 4:3.",
                  "Lihat ke lensa, bukan layar, supaya matamu berkilau.",
                  "Miringkan kepalamu dan tambahkan properti biar makin imut.",
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
                  {capturing ? "Lagi memotret…" : "Mulai Photo Booth"}
                </KawaiiButton>

                {stage === "camera" && (
                  <>
                    <KawaiiButton
                      block
                      onClick={() => setStage("upload")}
                      icon={<ImageUp className="size-5" />}
                    >
                      Upload dari galeri
                    </KawaiiButton>
                    <KawaiiButton block onClick={() => setStage("intro")}>
                      Kembali
                    </KawaiiButton>
                  </>
                )}
              </div>

              <p className="mt-4 font-hand text-sm leading-snug text-inksoft">
                Tip: filter, bingkai, dan stiker baru diterapkan setelah jepret,
                jadi kamu bisa berubah pikiran berkali-kali.
              </p>
            </Panel>
          </div>
        )}

        {stage === "upload" && (
          <UploadStage
            onBack={() => setStage("intro")}
            onComplete={useGalleryShots}
            photoCount={photoCount}
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
        dibuat dengan 💖 · foto kamu tidak pernah keluar dari perangkat ini
      </footer>
    </div>
  );
}

