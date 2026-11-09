# Photo Booth — Domain Glossary

Terms used by the photo booth app. No implementation details here.

## Photo Booth
A web app that lets a user strike three poses, decorate the resulting strip, and download it as a framed photo strip.

## Step
One stage of the photo booth flow: `select` → `capture` → `edit` → `export`. Each step owns its own UI state and logic.

## Orchestrator
The component that manages navigation between steps and state that is genuinely shared across steps (captured photos, chosen template, session date). It does not own step-local state.

## CaptureStep
The module that handles the camera, countdown, flash, and photo-capture sequence. Owns `useCamera` locally.

## EditStep
The module that handles filters, stickers, caption, date, format, and download. Renders the editing bottom sheet as a thin UI layer.

## ExportStep
The module that handles download options (PNG/JPG), QR placeholder, and "Start New Session".

## date-stamp
Pure date-formatting functions (`formatStamp`, `fileStamp`) — no DOM dependency. Lives in `lib/date-stamp.ts`.

## download
Browser file-download helper (`downloadDataUrl`) — DOM only. Lives in `lib/download.ts`.

## template-export
Renders a photo booth template to a data URL (`renderTemplateToDataUrl`). Lives in `lib/template-export.ts`.

## strip-export
Renders a photo strip to a data URL (`renderStripToDataUrl`). Lives in `lib/strip-export.ts`.

## export.ts
Barrel re-export for backward compatibility — re-exports everything from the four focused modules above.

## SelectStep
The module that handles template selection and the "Continue to Camera" action.

## EditController (EditStep)
The module that owns all editing state (filter, caption, stickers, format, template) and orchestrates editing sub-components. It is the local state owner for the `edit` step, keeping `PhotoBoothApp` free of editing details.

## FilterPanel
Sub-component that renders filter presets and handles filter switching. Receives only `filterId`, `onFilter`, and `processing`.

## StickerPanel
Sub-component that renders the sticker picker and selected-sticker controls. Receives only sticker-related props.

## CaptionEditor
Sub-component that renders caption input, date display, format toggle, and download button. Receives only adjustment-related props.

## FormatToggle
Sub-component that toggles export format between PNG and JPG. Receives only `format` and `onFormat`.

## RetakePanel
Sub-component that renders the "Retake All Photos" button. Receives only `photos`, `onRetake`, and `processing`.

## EditorBottomSheet (shell)
A thin bottom-sheet wrapper that provides open/close animation and backdrop. It receives `children` and no longer acts as a prop-drilling pass-through.

## Seam
The narrow interface between two steps: props and callbacks passed through the orchestrator. Steps do not talk to each other directly.

## Locality
State and logic live close to where they are used. Example: `useCamera` lives inside `CaptureStep`, not in the orchestrator.

## Template
A framed layout for exporting photos (boarding-pass, vintage-movie, modern-graphic, air-mail, theater-ticket). Each template render lives in its own module under `lib/templates/*.render.ts`; slot geometry lives in `lib/templates/slots.ts`; `lib/templates-render.ts` is the index that assembles `TEMPLATE_LIST`.

## TemplateCoreOptions
The narrow interface every template renderer receives: only `photos`, `caption`, and `dateText`. Lives in `lib/templates.ts`.

## TemplateExtraOptions
Template-specific extras only some templates read (e.g. `toText` for Air Mail). Kept separate so the core interface stays small.

## Test Coverage
Core logic is covered by Jest tests in `__tests__/`:
- `date-stamp.test.ts` — `formatStamp`, `fileStamp`
- `strip-geometry.test.ts` — `photoBox`, `stripHeight`, `photoSlot`, `hitTestSticker`
- `filters.test.ts` — `applyFilterToData`, `FILTER_PRESETS`

## Shot / Pose
A single camera frame captured during the capture step. Three shots make one strip.
