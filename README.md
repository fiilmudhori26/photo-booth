# Photo Booth

A web photo booth: strike three poses, decorate the resulting strip, and download it as a framed photo strip. Built as a Next.js app with a focus on clean, deep-module architecture (see `GLOSSARY.md`).

> Live demo: <https://photo-booth-six-xi.vercel.app>

## Features

- **4-step flow** — `select` → `capture` → `edit` → `export`, each owning its own UI state.
- **Templates** — 5 framed layouts: boarding-pass, vintage-movie, modern-graphic, air-mail, theater-ticket.
- **Capture** — webcam capture, countdown, flash, 3-shot strip.
- **Editing** — filter presets, stickers, caption, date stamp, PNG/JPG format toggle, retake.
- **Export** — render strip/template to a downloadable data URL (PNG or JPG).
- **Mobile-first**, professional UI redesign (Nov 2026).

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Jest + Testing Library (unit tests for pure logic: `date-stamp`, `strip-geometry`, `filters`)
- Canvas API for strip/template rendering

## Project Structure

```
app/            # Next.js routes + layout
components/     # UI + step modules (SelectStep, CaptureStep, EditStep, ExportStep)
lib/
  templates/    # one renderer per template (slots.ts + *.render.ts)
  date-stamp.ts # pure date formatting (formatStamp, fileStamp)
  download.ts   # browser download helper
  strip-export.ts / template-export.ts
__tests__/      # Jest unit tests
GLOSSARY.md     # domain glossary & architecture notes
```

## Local Development

```bash
npm install
npm run dev     # http://localhost:3000
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm test` | Run Jest unit tests |
| `npm run test:coverage` | Coverage report |

## Deploy

Deployed on Vercel: <https://photo-booth-six-xi.vercel.app>

## Author

fiilmudhori26 — <https://github.com/fiilmudhori26>
