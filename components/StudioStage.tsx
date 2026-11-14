"use client";

import {
  Calendar,
  Download,
  Eraser,
  Image as ImageIcon,
  LoaderCircle,
  MousePointerClick,
  Palette,
  Redo2,
  RefreshCw,
  Share2,
  RotateCcw,
  Sparkles,
  Sticker as StickerIcon,
  Trash,
  WandSparkles,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { FILTER_PRESETS } from "@/lib/filters";
import { FRAMES, PATTERNS } from "@/lib/frames";
import { STICKER_PRESETS } from "@/lib/stickers";
import { MAX_STICKERS, PAD_MAX, PAD_MIN, PAD_STEP } from "@/lib/strip";
import type { ExportFormat, FilterId, FrameId, PatternId, StickerItem } from "@/lib/types";
import StripCanvas from "./StripCanvas";
import { Chip, KawaiiButton, Panel, cx } from "./ui";

type Tab = "filters" | "frame" | "stickers";

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "filters", label: "Filters", icon: WandSparkles },
  { id: "frame", label: "Frame", icon: Palette },
  { id: "stickers", label: "Stickers", icon: StickerIcon },
];

interface StudioStageProps {
  photos: string[];
  filterId: FilterId;
  onFilter: (id: FilterId) => void;
  processing: boolean;

  frameId: FrameId;
  onFrame: (id: FrameId) => void;
  pattern: PatternId;
  onPattern: (id: PatternId) => void;
  pad: number;
  onPad: (value: number) => void;

  stickers: StickerItem[];
  selectedId: string | null;
  onSelect: (uid: string | null) => void;
  onMove: (uid: string, x: number, y: number) => void;
  onAddSticker: (emoji: string) => void;
  onAddDateSticker: () => void;
  onUpdateSticker: (uid: string, patch: Partial<StickerItem>) => void;
  onRemoveSticker: (uid: string) => void;
  onClearStickers: () => void;

  caption: string;
  onCaption: (value: string) => void;
  dateText: string;
  eventText: string;
  onEventText: (value: string) => void;

  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  onDownload: () => void;
  exporting: boolean;
  onShare: () => void;
  sharing: boolean;

  onRetake: () => void;
  onStartOver: () => void;
}

export default function StudioStage(props: StudioStageProps) {
  const {
    photos,
    filterId,
    onFilter,
    processing,
    frameId,
    onFrame,
    pattern,
    onPattern,
    pad,
    onPad,
    stickers,
    selectedId,
    onSelect,
    onMove,
    onAddSticker,
    onAddDateSticker,
    onUpdateSticker,
    onRemoveSticker,
    onClearStickers,
    caption,
    onCaption,
    dateText,
    eventText,
    onEventText,
    format,
    onFormat,
    onDownload,
    exporting,
    onShare,
    sharing,
    onRetake,
    onStartOver,
  } = props;

  const [tab, setTab] = useState<Tab>("filters");
  const selected = stickers.find((sticker) => sticker.uid === selectedId) ?? null;
  const full = stickers.length >= MAX_STICKERS;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      {/* ── Preview ─────────────────────────────────────────── */}
      <Panel
        title="Your Photo Strip"
        icon="📸"
        hint="drag stickers to move them"
        className="lg:sticky lg:top-6"
      >
        <div className="kawaii-inset relative px-4 py-6 sm:px-8">
          <span className="anim-float pointer-events-none absolute -left-1 top-2 text-2xl">🌷</span>
          <span
            className="anim-float pointer-events-none absolute -right-1 top-10 text-2xl"
            style={{ animationDelay: "1.2s" }}
          >
            🫧
          </span>
          <span
            className="anim-float pointer-events-none absolute bottom-3 -right-1 text-2xl"
            style={{ animationDelay: "0.6s" }}
          >
            💖
          </span>

          <div key={photos.length} className="anim-strip-in">
            <StripCanvas
              photos={photos}
              frameId={frameId}
              pattern={pattern}
              pad={pad}
              stickers={stickers}
              caption={caption}
              dateText={dateText}
              eventText={eventText}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
            />
          </div>

          {processing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-white/70 backdrop-blur-sm">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/90 px-4 py-2 text-sm font-bold text-ink shadow-lg">
                <LoaderCircle className="size-4 animate-spin text-rose" />
                Mixing pastel magic…
              </span>
            </div>
          )}
        </div>

        <p className="mt-3 flex items-center justify-center gap-2 font-hand text-base text-inksoft">
          <MousePointerClick className="size-4" />
          Tap a sticker on the strip to edit it
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <KawaiiButton
            variant="primary"
            block
            disabled={exporting || sharing || !photos.length}
            onClick={onDownload}
            icon={
              exporting ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Download className="size-5" />
              )
            }
          >
            {exporting ? "Saving…" : "Download Strip"}
          </KawaiiButton>
          <KawaiiButton
            block
            disabled={exporting || sharing || !photos.length}
            onClick={onShare}
            icon={
              sharing ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Share2 className="size-5" />
              )
            }
          >
            {sharing ? "Sharing…" : "Share Strip"}
          </KawaiiButton>
          <KawaiiButton
            block
            onClick={onRetake}
            icon={<RefreshCw className="size-5" />}
          >
            Retake Photos
          </KawaiiButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-inksoft">
          <span className="inline-flex items-center gap-1.5">
            <ImageIcon className="size-4" />
            Exports at 1440 px wide
          </span>
          <div className="inline-flex items-center gap-1 rounded-full border-2 border-white bg-white/70 p-1">
            {(["png", "jpg"] as ExportFormat[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onFormat(value)}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-bold uppercase transition",
                  format === value
                    ? "bg-gradient-to-b from-petal to-rose text-white shadow"
                    : "text-inksoft hover:text-ink",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* ── Controls ────────────────────────────────────────── */}
      <Panel className="lg:sticky lg:top-6">
        <div className="mb-5 flex items-center gap-1 rounded-2xl border-2 border-white bg-white/60 p-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cx(
                "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition",
                tab === id
                  ? "bg-gradient-to-b from-bubble to-blush text-ink shadow-[0_8px_16px_-12px_rgba(244,114,182,1)]"
                  : "text-inksoft hover:bg-white/70 hover:text-ink",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "filters" && (
          <div className="space-y-3">
            <h3 className="font-display text-base text-ink">Photo Filters</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onFilter(preset.id)}
                  className={cx(
                    "flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-[3px] px-2 py-3 text-center transition active:translate-y-[2px]",
                    filterId === preset.id
                      ? "border-rose bg-gradient-to-b from-bubble to-blush shadow-[0_12px_22px_-16px_rgba(244,114,182,1)]"
                      : "border-white bg-white/70 hover:bg-white",
                  )}
                >
                  <span className="text-2xl leading-none">{preset.icon}</span>
                  <span className="text-xs font-bold text-ink">{preset.label}</span>
                  <span className="font-hand text-xs text-inksoft">{preset.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "frame" && (
          <div className="space-y-5">
            <div>
              <h3 className="mb-3 font-display text-base text-ink">Frame Colour</h3>
              <div className="grid grid-cols-3 gap-2">
                {FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => onFrame(frame.id)}
                    className={cx(
                      "flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border-[3px] px-1 py-2 text-center transition active:translate-y-[2px]",
                      frameId === frame.id
                        ? "border-rose bg-white shadow-[0_12px_22px_-16px_rgba(244,114,182,1)]"
                        : "border-white bg-white/70 hover:bg-white",
                    )}
                  >
                    <span
                      className="size-7 rounded-full border-2 border-white shadow-inner"
                      style={{
                        background: `linear-gradient(135deg, ${frame.bg}, ${frame.bg2})`,
                      }}
                    />
                    <span className="text-[0.6875rem] font-bold leading-tight text-ink">
                      {frame.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-display text-base text-ink">Pattern</h3>
              <div className="flex flex-wrap gap-2">
                {PATTERNS.map((item) => (
                  <Chip
                    key={item.id}
                    active={pattern === item.id}
                    onClick={() => onPattern(item.id)}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-base text-ink">Frame Margin</h3>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-inksoft">
                  {pad} px
                </span>
              </div>
              <input
                type="range"
                className="kawaii-range"
                min={PAD_MIN}
                max={PAD_MAX}
                step={PAD_STEP}
                value={pad}
                onChange={(event) => onPad(Number(event.target.value))}
                aria-label="Frame margin"
              />
            </div>

            <div>
              <h3 className="mb-2 font-display text-base text-ink">Strip Caption</h3>
              <input
                value={caption}
                onChange={(event) => onCaption(event.target.value.slice(0, 22))}
                placeholder="★ PHOTO BOOTH ★"
                className="w-full rounded-2xl border-[3px] border-white bg-white/80 px-4 py-3 text-sm font-bold text-ink outline-none transition placeholder:font-normal placeholder:text-inksoft/70 focus:border-petal"
              />
              <p className="mt-1.5 font-hand text-sm text-inksoft">
                {22 - caption.length} characters left
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-display text-base text-ink">Event Text</h3>
              <input
                value={eventText}
                onChange={(event) => onEventText(event.target.value.slice(0, 22))}
                placeholder="Rani & Andre — Wedding 2026"
                className="w-full rounded-2xl border-[3px] border-white bg-white/80 px-4 py-3 text-sm font-bold text-ink outline-none transition placeholder:font-normal placeholder:text-inksoft/70 focus:border-petal"
              />
              <p className="mt-1.5 font-hand text-sm text-inksoft">
                Shown on the strip footer — optional
              </p>
            </div>
          </div>
        )}

        {tab === "stickers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base text-ink">Sticker Picker</h3>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-inksoft">
                {stickers.length}/{MAX_STICKERS}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {STICKER_PRESETS.map((preset) => (
                <button
                  key={preset.emoji}
                  type="button"
                  title={preset.label}
                  aria-label={`Add ${preset.label} sticker`}
                  disabled={full}
                  onClick={() => onAddSticker(preset.emoji)}
                  className="flex aspect-square items-center justify-center rounded-2xl border-[3px] border-white bg-white/70 text-xl transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 disabled:opacity-40"
                >
                  {preset.emoji}
                </button>
              ))}
            </div>

            <KawaiiButton
              block
              variant="secondary"
              disabled={full}
              onClick={onAddDateSticker}
              icon={<Calendar className="size-5" />}
            >
              Add date stamp
            </KawaiiButton>

            {selected ? (
              <div className="kawaii-inset space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">
                    {selected.kind === "date" ? "📅" : selected.emoji}
                  </span>
                  <span className="font-display text-sm text-ink">
                    {selected.kind === "date" ? "Date stamp" : "Sticker"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSticker(selected.uid)}
                    className="ml-auto inline-flex size-11 items-center justify-center rounded-full border-2 border-white bg-white/80 text-rose transition hover:bg-blush"
                    aria-label="Delete sticker"
                  >
                    <Trash className="size-4" />
                  </button>
                </div>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-bold text-inksoft">
                    <span className="inline-flex items-center gap-1">
                      <ZoomIn className="size-3.5" /> Size
                    </span>
                    <span>{Math.round(selected.size * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    className="kawaii-range"
                    min={0.07}
                    max={0.34}
                    step={0.01}
                    value={selected.size}
                    onChange={(event) =>
                      onUpdateSticker(selected.uid, { size: Number(event.target.value) })
                    }
                    aria-label="Sticker size"
                  />
                </label>

                <div className="flex gap-2">
                  <KawaiiButton
                    small
                    block
                    onClick={() =>
                      onUpdateSticker(selected.uid, { rotation: selected.rotation - 15 })
                    }
                    icon={<Redo2 className="size-4 -scale-x-100" />}
                  >
                    Rotate
                  </KawaiiButton>
                  <KawaiiButton
                    small
                    block
                    onClick={() =>
                      onUpdateSticker(selected.uid, { rotation: selected.rotation + 15 })
                    }
                    icon={<Redo2 className="size-4" />}
                  >
                    Rotate
                  </KawaiiButton>
                  <KawaiiButton
                    small
                    onClick={() => onUpdateSticker(selected.uid, { rotation: 0 })}
                    icon={<RotateCcw className="size-4" />}
                  >
                    Level
                  </KawaiiButton>
                </div>
              </div>
            ) : (
              <p className="kawaii-inset px-4 py-3 font-hand text-base text-inksoft">
                Pick a sticker above, then drag it anywhere on the strip 💫
              </p>
            )}

            {stickers.length > 0 && (
              <KawaiiButton
                block
                onClick={() => {
                  onSelect(null);
                  onClearStickers();
                }}
                icon={<Eraser className="size-5" />}
              >
                Clear all stickers
              </KawaiiButton>
            )}
          </div>
        )}

        <div className="mt-6 border-t-2 border-dashed border-bubble pt-5">
          <KawaiiButton
            block
            variant="ghost"
            onClick={onStartOver}
            icon={<RefreshCw className="size-4" />}
          >
            Start a brand new session
          </KawaiiButton>
        </div>
      </Panel>
    </div>
  );
}
