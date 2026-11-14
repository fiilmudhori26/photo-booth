# my dipaaa — Photo Booth

A kawaii web photo booth: pick a frame, snap three poses, decorate your strip, and download or share it — right from your phone.

Live: <https://photo-booth-six-xi.vercel.app>

## Fitur

- 3-pose capture with countdown, flash, mirror & camera switch
- **Animated GIF strip** — boomerang of your three poses, encoded in `lib/gif.ts` (camera shoots only)
- **Photo Booth filters**: Soft Normal, Classic Mono, Vintage Warm, Pastel Bloom, Punchy Pop, Sepia Nostalgia, Film Grain, Light Leak
- **15 Kawaii frames** + 5 pattern overlays, frame margin slider, strip caption & optional event text
- Stickers (emoji + date), drag to reposition
- **Share** via Web Share API (WhatsApp/Instagram) with automatic download fallback — for both PNG strips and GIF strips
- Haptic feedback + synthesised shutter SFX (Web Audio API, no audio assets)
- Exports at 2x (1440 px) — caption, date and event text burned into the strip

## Stack

Next.js 15 · React 19 · Tailwind v4 · Canvas API · GIF encoding with [`gifenc`](https://www.npmjs.com/package/gifenc)

## Develop

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build   # must exit 0
```

No automated tests yet — features are verified manually via `npm run dev` on a phone.
