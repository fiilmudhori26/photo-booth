let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  delay: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12,
) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

function click(delay: number, duration: number, volume: number) {
  const ac = audio();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  }
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buffer;
  gain.gain.value = volume;
  src.connect(gain).connect(ac.destination);
  src.start(ac.currentTime + delay);
}

/** Tiny synthesised sound effects — no audio assets required. */
export function vibrate(pattern: number | number[] = 30): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

export const sfx = {
  tick(count: number) {
    tone(count <= 1 ? 1180 : 880, 0, 0.13, "triangle", 0.1);
  },
  shutter() {
    click(0, 0.12, 0.45);
    click(0.035, 0.06, 0.28);
    tone(190, 0, 0.09, "square", 0.12);
    tone(72, 0, 0.14, "sine", 0.16);
  },
  pop() {
    tone(680, 0, 0.08, "sine", 0.09);
    tone(1020, 0.05, 0.08, "sine", 0.06);
  },
  sparkle() {
    [1318, 1568, 2093].forEach((f, i) => tone(f, i * 0.05, 0.2, "triangle", 0.06));
  },
  success() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, i * 0.09, 0.4, "sine", 0.11),
    );
  },
};

export type SoundName = keyof typeof sfx;
