# my dipaaa — Photo Booth

Photo booth kawaii di web: pilih bingkai, jepret 3–6 pose, hias strip kamu, lalu unduh atau bagikan — langsung dari ponsel.

Live: <https://photo-booth-six-xi.vercel.app>

## Fitur

- Jepret 3–6 pose dengan hitung mundur, flash, cermin & ganti kamera
- **Strip GIF animasi** — boomerang dari pose-pose kamu, di-encode di `lib/gif.ts` (khusus jepret dari kamera)
- **Filter Photo Booth**: Soft Normal, Classic Mono, Vintage Warm, Pastel Bloom, Punchy Pop, Sepia Nostalgia, Film Grain, Light Leak
- **21 bingkai kawaii** + 8 overlay pola, slider margin bingkai, caption strip & teks acara opsional
- Stiker (emoji + tanggal), seret untuk memindahkan
- **Bagikan** lewat Web Share API (WhatsApp/Instagram) dengan fallback unduh otomatis — untuk strip PNG maupun strip GIF
- Umpan balik haptik + SFX shutter hasil sintesis (Web Audio API, tanpa aset audio)
- Hasil ekspor 2x (1440 px) — caption, tanggal, dan teks acara ikut tercetak di strip

## Stack

Next.js 15 · React 19 · Tailwind v4 · Canvas API · encoding GIF dengan [`gifenc`](https://www.npmjs.com/package/gifenc)

## Develop

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build   # harus exit 0
```

Belum ada pengujian otomatis — fitur diverifikasi manual lewat `npm run dev` di ponsel.
