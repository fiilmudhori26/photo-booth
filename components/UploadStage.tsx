"use client";

import { ArrowLeft, CirclePlus, LoaderCircle, Sparkles, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { fileToShot, isImageFile } from "@/lib/upload";
import { KawaiiButton, Panel, cx } from "./ui";

interface UploadStageProps {
  onBack: () => void;
  onComplete: (shots: string[]) => void;
  photoCount?: number;
}

export default function UploadStage({ onBack, onComplete, photoCount = 3 }: UploadStageProps) {
  const [slots, setSlots] = useState<(string | null)[]>(
    Array.from({ length: photoCount }, () => null),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const targetRef = useRef(0);

  const shots = slots.filter((slot): slot is string => Boolean(slot));
  const missing = photoCount - shots.length;

  const pick = (index: number) => {
    targetRef.current = index;
    setError(null);
    inputRef.current?.click();
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;

    const files = Array.from(list).filter(isImageFile);
    if (!files.length) {
      setError("Itu bukan foto — pilih file PNG, JPG, atau WEBP.");
      return;
    }

    setError(null);
    setBusy(true);

    const next = [...slots];
    const target = targetRef.current;
    // The tapped slot is filled (or replaced) first, then any empty ones.
    const order = [target];
    for (let i = 0; i < photoCount; i += 1) {
      if (i !== target && !next[i]) order.push(i);
    }

    for (let i = 0; i < files.length; i += 1) {
      const index = order[i];
      if (index === undefined) break;
      try {
        next[index] = await fileToShot(files[i]);
      } catch {
        setError("Hmm, salah satu foto itu gagal dibaca.");
      }
    }

    setSlots([...next]);
    setBusy(false);
  };

  const clearSlot = (index: number) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? null : slot)));
    setError(null);
  };

  return (
    <Panel
      title="Upload dari Galeri"
      icon="🖼️"
      hint={`${shots.length}/${photoCount} dipilih`}
      className="mx-auto max-w-3xl"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <p className="font-hand text-base leading-snug text-inksoft">
        Pilih {photoCount} foto dari galeri, tangkapan layar — apa pun. Ketuk slot lagi kapan pun untuk mengganti fotonya.
      </p>

      <div
        className="mt-5 grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${photoCount}, minmax(0, 1fr))` }}
      >
        {slots.map((slot, index) => (
          <div key={index} className="relative">
            <button
              type="button"
              onClick={() => pick(index)}
              aria-label={slot ? `Ganti foto ${index + 1}` : `Tambah foto ${index + 1}`}
              className={cx(
                "flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-[3px] transition active:translate-y-[2px]",
                slot
                  ? "border-white bg-white shadow-[0_12px_22px_-16px_rgba(196,110,160,0.9)]"
                  : "border-dashed border-petal bg-white/60 hover:bg-white",
              )}
            >
              {slot ? (
                <img
                  src={slot}
                  alt={`Foto pilihan ${index + 1}`}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-1 text-inksoft">
                  <CirclePlus className="size-6" />
                  <span className="text-[0.6875rem] font-bold">Foto {index + 1}</span>
                </span>
              )}
            </button>

            {slot && (
              <button
                type="button"
                onClick={() => clearSlot(index)}
                aria-label={`Hapus foto ${index + 1}`}
                className="absolute right-1.5 top-1.5 inline-flex size-8 items-center justify-center rounded-full border-2 border-white bg-white/90 text-rose shadow transition hover:bg-blush"
              >
                <Trash className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-2xl border-2 border-white bg-blush/70 px-4 py-3 text-center text-sm font-bold text-ink"
        >
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        <KawaiiButton
          block
          variant="primary"
          disabled={missing > 0 || busy}
          onClick={() => onComplete(shots)}
          icon={
            busy ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )
          }
        >
          {busy
            ? "Memuat foto…"
            : missing > 0
              ? `Pilih ${missing} foto lagi`
              : "Hias strip aku"}
        </KawaiiButton>

        <KawaiiButton block onClick={onBack} icon={<ArrowLeft className="size-5" />}>
          Kembali
        </KawaiiButton>
      </div>

      <p className="mt-4 font-hand text-sm leading-snug text-inksoft">
        Foto diproses langsung di browser kamu — tidak diunggah ke mana-mana.
      </p>
    </Panel>
  );
}

