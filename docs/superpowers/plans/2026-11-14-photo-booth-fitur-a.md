# Photo Booth "my dipaaa" — Fitur A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Verifikasi adalah manual (dev server + `npm run build`) karena proyek belum punya test suite; tiap tugas wajib dicek `npm run dev` sebelum commit.

**Goal:** Menambahkan GIF strip bergerak, filter photobooth, frame kawaii baru, teks acara, tombol Bagikan (Foto & GIF), haptic+suara, dan animasi hasil — di atas versi awal my dipaaa (6f82388).

**Architecture:** Semua render strip tetap lewat satu fungsi `drawStrip` (lib/strip.ts) — GIF hanya memanggilnya berkali-kali pada resolusi kecil; foto tetap data URL base64; state diangkat ke `PhotoBoothApp` (props-driven ke anak); filter tetap di-bake ke pixel data (bukan `ctx.filter`); logika baru masuk `lib/`, bukan `PhotoBoothApp`.

**Tech Stack:** Next.js 15, React 19, Tailwind v4, canvas API, Web Audio API, `gifenc` (baru, GIF utama), Web Share API, `navigator.vibrate`.

**Spec:** `F:\02_Karir_Portofolio\Portofolio\photo booth\docs\superpowers\specs\2026-11-14-photo-booth-fitur-a-design.md`

## Global Constraints

- Semua render strip lewat `drawStrip` (lib/strip.ts:217) — jangan duplikasi drawing logic.
- Filter di-bake ke pixel data (bukan `ctx.filter`) untuk Safari.
- Data URL, bukan object URL — preview/export harus identik.
- State diangkat ke `PhotoBoothApp`; anak props-driven ("dumb").
- Tailwind v4 + custom classes di globals.css; palet kawaii (`ink`, `inksoft`, `petal`, `rose`, `bubble`, `blush`); font `font-display`/`font-hand`; ikon lucide-react; UI campuran Inggris-kawaii.
- `.npmrc` = `legacy-peer-deps=true` — dependency baru perlu cek kompatibilitas manual; GIF wajib jalur utama (bukan WebM/mp4).
- GIF hanya untuk alur kamera; alur upload galeri menyembunyikan/mematikan opsi GIF.
- Memori: batasi resolusi/jumlah frame GIF (maks ~24 frame kecil).
- Animasi hormati `prefers-reduced-motion` (globals.css sudah punya bloknya ±baris 245).
- Jangan ubah arsitektur/desain/branching di luar tugas; jangan commit kecuali per tugas yang selesai.
- Verifikasi manual wajib tiap tugas: `npm run dev` lalu dicek di ponsel/browser; `npm run build` exit 0 sebelum commit besar.

## Review Focus

1. **GIF setelah upload galeri** — tombol/ opsi GIF harus tidak muncul/tidak aktif bila sumber foto dari upload (bukan jepretan). Test: upload 3 gambar → tidak ada kontrol GIF di StudioStage. (Task 7)
2. **Grain/light-leak merusak filter lama** — perluasan `applyFilterToData` untuk koordinat (x,y) tidak boleh mengubah hasil 5 filter yang ada. Test: buka dev, preview tiap filter sebelum/sesudah — tampilan filter lama harus identik. (Task 3)
3. **GIF ke WA/IG gagal kirim** — hanya GIF beneran yang masuk WA/IG; WebM/mp4 tidak. Test: unduh GIF di ponsel, kirim ke WA/IG — file terkirim sebagai animasi, bukan dokumen. (Task 7)
4. **GIF terlalu besar/lambat di ponsel** — ukuran file GIF bisa puluhan MB. Test: jepret 3 pose, GIF ≤ target wajar (mis. < 15 MB di 240–360px), sesi tidak macet. (Task 7)
5. **Web Share API tidak didukung** — `navigator.share` tanpa `navigator.canShare({files})` (desktop Firefox/Safari lama). Test: klik Bagikan di browser tanpa share-target → fallback ke unduh, tanpa error/console nada. (Task 6)

---

### Task 1: Haptic + suara rana diperkaya

**Files:**
- Modify: `lib/sound.ts` (fungsi `shutter`, tambah `\nexport function vibrate(pattern?)`)
- Modify: `components/PhotoBoothApp.tsx:160` (titik `play("shutter")`) dan call site `play()` lainnya

**Interfaces:**
- Consumes: `play(name, arg?)` di PhotoBoothApp; `sfx.shutter()`
- Produces: `vibrate(pattern?: number | number[]): void` di lib/sound.ts (no-op bila `navigator.vibrate` tidak ada atau sound dimatikan via ref — gerbang lewat state `soundOn`/`hapticsOn`)

- [ ] **Step 1**: Tambahkan `export function vibrate(...)` di lib/sound.ts — no-op bila `typeof navigator === "undefined"` atau `navigator.vibrate` tidak ada; panggil `navigator.vibrate(pattern ?? 30)` (default 30ms).
- [ ] **Step 2**: Perkaya `sfx.shutter()` — lapisi noise burst lebih keras + 190Hz square (jaga nama & signature).
- [ ] **Step 3**: Di PhotoBoothApp, saat `play("shutter")` (±baris 162) dan saat countdown tick (±baris 150), panggil `vibrate()` paralel (hanya bila `soundOn` true).
- [ ] **Step 4**: Verifikasi — `npm run dev`, jepret di HP: terasa getar + suara rana lebih "penuh"; di desktop tanpa vibrate API tidak error. `npm run build` exit 0.
- [ ] **Step 5**: Commit — `git add -A; git commit -m "feat: richer shutter sfx and haptic feedback"`

### Task 2: Animasi kemunculan strip

**Files:**
- Modify: `app/globals.css` (keyframes `stripIn`, class `.anim-strip-in`)
- Modify: `components/StudioStage.tsx` (~baris 112–155, wrapper `<StripCanvas>`)

**Interfaces:**
- Consumes: blok `globals.css` `prefers-reduced-motion` yang ada (±baris 245)
- Produces: kelas `.anim-strip-in` yang menjalankan keyframes stripIn satu kali saat mount

- [ ] **Step 1**: Tambah keyframes `stripIn` (dari `opacity:0; transform: translateY(18px) scale(.92) rotate(-1.5deg)` ke normal, ease-out .45s) dan kelas `.anim-strip-in`.
- [ ] **Step 2**: Di globals.css `prefers-reduced-motion` block, tambahkan `.anim-strip-in { animation: none; }`.
- [ ] **Step 3**: Di StudioStage, bungkus `<StripCanvas>` dengan div class `anim-strip-in` dengan `key` berubah saat strip selesai jepret (mis. `photos.length` atau state `justLanded`), sehingga animasi muncul tepat sekali saat masuk studio.
- [ ] **Step 4**: Verifikasi — jepret → strip animasi masuk halus; toggle OS reduced-motion → tanpa animasi; `npm run build` exit 0.
- [ ] **Step 5**: Commit — `git commit -m "feat: animate strip reveal on studio stage"`

### Task 3: Filter photobooth baru (sepia / grain / light leak)

**Files:**
- Modify: `lib/types.ts` (union `FilterId`)
- Modify: `lib/filters.ts` (`FILTER_PRESETS` baris ~10, `applyFilterToData` baris ~33–94, `renderFilteredShot` baris ~96)

**Interfaces:**
- Consumes: `renderFilteredShot(raw, filterId)` → data URL (pola yang ada)
- Produces: `FilterId` bertambah `"sepia" | "grain" | "lightleak"`; signature `applyFilterToData` diperluas dengan koordinat — pertahankan perilaku pixel-op untuk 5 filter lama; grain & light leak dikerjakan sebagai tahap spasial (loop 2D) setelah tahap point-op `putImageData`, atau fungsi `applySpatialFilter(ctx, w, h, mode)` bila lebih bersih (boleh builder memilih; wajib preview↔export identik karena keduanya lewat `renderFilteredShot`)

- [ ] **Step 1**: Tambah `"sepia" | "grain" | "lightleak"` ke union `FilterId` di types.ts dan `FILTER_PRESETS` di filters.ts (id, label kawaii, contoh warna swatch).
- [ ] **Step 2**: Implementasi `sepia` — konversi matriks sepia standar di tahap point-op (pola serupa `vintage`).
- [ ] **Step 3**: Implementasi `grain` — tahap spasial: noise acak (builder boleh acak atau pseudo-deterministic) di-skala luminance, ditimpa ke seluruh gambar dengan alpha rendah; **tidak boleh** merusak filter point-op lama.
- [ ] **Step 4**: Implementasi `lightleak` — tahap spasial: radial gradient terang (oranye/pink) dari pojok atas, add/overlay ke gambar, alpha sedang; gambar akhir tetap natural pada area foto.
- [ ] **Step 5**: Verifikasi — dev: kelima filter lama tampil identik seperti sebelumnya; 3 filter baru konsisten di preview DAN di unduh (jalankan unduh untuk tiap filter); `npm run build` exit 0.
- [ ] **Step 6**: Commit — `git commit -m "feat: sepia, film grain and light leak filters"`

### Task 4: Frame kawaii baru

**Files:**
- Modify: `lib/types.ts` (union `FrameId`)
- Modify: `lib/frames.ts` (`FRAMES`, `PATTERNS` tetap atau tambah 1–2 pola)
- Modify: `components/StudioStage.tsx` (UI picker otomatis dari `FRAMES.map` — tidak perlu ubah struktur)

**Interfaces:**
- Consumes: `FrameTheme` (`bg`, `bg2`, `ink`, `inkSoft`, `patternInk`, `photoBack`, `swatch`)
- Produces: 4–6 entri baru di `FRAMES` (mis. Floral Blush, Retro Film, Korean Cream, Bubblegum, Matcha Garden, Milktea Royale) dengan `FrameId` unik

- [ ] **Step 1**: Tambah union `FrameId` di types.ts dan 4–6 entri baru di `FRAMES` — tema kawaii (gradient 2 warna + `ink` kontras kuat untuk footer; `photoBack` putih/netral); pilih pola dari `PATTERNS` yang ada atau tambah 1 pola baru (mis. `sparkle`).
- [ ] **Step 2**: Pastikan setiap frame baru kontras footer ≥ 4.5:1 vs `ink` (pola AA).
- [ ] **Step 3**: Verifikasi — dev: grid swatch di tab Frame menampilkan semua frame baru; strip dirender benar pada semua 4–6 frame; unduh per frame; `npm run build` exit 0.
- [ ] **Step 4**: Commit — `git commit -m "feat: new kawaii frames (floral, retro, korean, bubblegum)"`

### Task 5: Teks acara bebas di strip

**Files:**
- Modify: `lib/strip.ts` (`drawStrip` — footer layout, terima `eventText?: string`)
- Modify: `lib/export.ts` (`StrictRenderOptions`/signature `renderStripToDataUrl` — teruskan `eventText`)
- Modify: `components/PhotoBoothApp.tsx` (state `eventText`, operasi `slice(0,22)`)
- Modify: `components/StudioStage.tsx` (input teks di tab Frame/caption, pola sama dengan caption ±baris 323)
- Modify: `components/StripCanvas.tsx` (oper `eventText` ke `drawStrip` preview)

**Interfaces:**
- Consumes: pola caption (`caption` state, `slice(0,22)`, digambar `drawStrip` baris ~273)
- Produces: opsi `eventText` (default "" — kosong = footer seperti sekarang) mengalir: PhotoBoothApp → StudioStage/StripCanvas & export; digambar kecil di bawah dateText bila non-kosong

- [ ] **Step 1**: Tambah `eventText?: string` ke options `drawStrip` dan footer: digambar di bawah `dateText` dengan font `HAND_FONT` ukuran ±19px warna `inkSoft`; bila kosong, footer layout identik dengan sebelumnya.
- [ ] **Step 2**: Teruskan `eventText` di `renderStripToDataUrl` dan pipeline preview (PhotoBoothApp state → StripCanvas props → drawStrip).
- [ ] **Step 3**: UI — input teks "Event (optional)" di tab Frame di samping caption, `maxLength=22`, placeholder `Mis. "Rani & Andre — 2026"`; simpan `eventText` state (slice(0,22)).
- [ ] **Step 4**: Verifikasi — isi event → preview & unduh menampilkan teks di footer; kosongkan → seperti sebelumnya; teks panjang (22 char) tidak overflow lebar 720px; `npm run build` exit 0.
- [ ] **Step 5**: Commit — `git commit -m "feat: optional event text on strip footer"`

### Task 6: Tombol Bagikan (Web Share API) + helper dataURL→Blob

**Files:**
- Create: `lib/share.ts` (`dataUrlToBlob(dataUrl): Blob`, `shareImage(dataUrl, {title, text}): Promise<"shared"|"downloaded">`)
- Modify: `components/StudioStage.tsx` (~baris 161–184, tombol Bagikan di samping Download)
- Modify: `components/PhotoBoothApp.tsx` (handler `handleShare(format)` bila state ada di sana)

**Interfaces:**
- Consumes: `renderStripToDataUrl` output (PNG/JPG data URL)
- Produces: `shareImage(dataUrl, {title, text})` — bila `navigator.canShare?.({files})` benar, share file; bila tidak/gagal, fallback ke `downloadDataUrl`; mengembalikan "shared" | "downloaded" untuk toast/notice UI

- [ ] **Step 1**: `lib/share.ts`: `dataUrlToBlob` — split header `;base64,`, `atob`, `Uint8Array`, `Blob([bytes], {type: mime})`; `shareImage` — buat `File` (nama `my-dipaaa-${fileStamp(...)}.png|jpg`), `navigator.share({files:[f], title, text})`; jika `!navigator.canShare` atau share tolak (NotAllowedError), panggil `downloadDataUrl` dan return "downloaded".
- [ ] **Step 2**: Tombol "Bagikan" di StudioStage (ikon Share2 lucide) di samping Download, disabled bila belum ada foto; saat ditekan, render strip (format PNG) lalu `shareImage`; tampilkan "Saved"/"Shared" notice bila ada pola notice di sana.
- [ ] **Step 3**: Verifikasi di ponsel asli: klik Bagikan → muncul native share sheet; pilih WA → strip terkirim. Desktop (no canShare) → strip terunduh, tanpa error. `npm run build` exit 0.
- [ ] **Step 4**: Commit — `git commit -m "feat: share strip via Web Share API with download fallback"`

### Task 7: GIF strip bergerak (fitur terbesar)

**Files:**
- Create: `lib/gif.ts` (`encodeGif(opts): Promise<string/*dataUrl*/>`, `GifOptions`)
- Create: `lib/record-gif.ts` atau gabung di `lib/gif.ts` (grab frame kecil saat runSequence)
- Create: `lib/strip-gif.ts` bila perlu (reuse `drawStrip` dengan opsi kecil) — boleh digabung ke gif.ts
- Modify: `components/PhotoBoothApp.tsx` (state `gifFrames`/`gifBusy`, titik jepret di runSequence)
- Modify: `components/StudioStage.tsx` (tombol Foto / GIF di samping Download & Bagikan, hanya muncul/aktif untuk alur kamera)
- Modify: `package.json` (`gifenc` dependency) + `.npmrc` sudah ada (`legacy-peer-deps=true` — aman)

**Interfaces:**
- Consumes: `drawStrip` (lib/strip.ts), `renderFilteredShot` (lib/filters.ts), pola `CapturedShot` (types.ts — bila perlu extend `grabFrames?: string[]`)
- Produces: `encodeGif({frames, width, onProgress?}) → Promise<string>` — memanggil `drawStrip` per frame kecil (lebar 240–360px) dengan foto ber-pose boomerang (maju 0..n, mundur n-1..1), `putImageData` dari canvas ke `gifenc` (quality ±20, `"rgb565"`); `stripGifDataUrl` dipakai tombol GIF → unduh/share lewat `lib/share.ts`

- [ ] **Step 1**: Install `gifenc` (`npm install gifenc`) — pastikan build masih jalan.
- [ ] **Step 2**: `lib/gif.ts`: `encodeGif(opts: {frames: string[][] /* processed photos per gif-frame, atau raw grabs */, ...})`. Pendekatan konkret: **render ulang strip per gif-frame**: untuk pose i, frame j, gambar foto pose i penuh; seluruh strip digambar dengan slot foto pose i (tidak naik-turun kompleks) — boomerang per pose: 3 gif-frame per pose (shutter frame + sebelum/sesudah) dirapikan jadi pola 1-2-3-2-1 per pose. Builder boleh meningkatkan; yang wajib: `drawStrip` dipanggil pada resolusi kecil dan **strip lengkap** muncul (bukan sekadar grab mentah).
- [ ] **Step 3**: Rekam grab kontinu di sekitar shutter — di `runSequence`, saat sebelum `captureFrame` dan ~400ms sesudah, ambil grab kecil (mis. 96×72) via canvas video, simpan di `gifGrabs` (maks 24). Karena `drawStrip` butuh foto 1200×900 utuh (grab mentah hanya untuk fallback), pastikan pose utama tetap dari `captureFrame`.
- [ ] **Step 4**: Tombol "GIF" di StudioStage (ikon `Film` lucide) di samping Foto/Download — hanya render saat alur kamera (lacak `source === "camera"` atau absennya `uploadShots`); klik → encode → unduh/share GIF (pakai `lib/share.ts`, mime `image/gif`). Nonaktif + hint "GIF only after camera shoot" di alur upload.
- [ ] **Step 5**: Verifikasi di ponsel: jepret → GIF terunduh; kirim WA → teranimasi; GIF ≤ ~15MB; sesi tidak hang; upload galeri → tombol GIF tidak aktif; Foto tetap normal. `npm run build` exit 0.
- [ ] **Step 6**: Commit — `git commit -m "feat: animated GIF strip (boomerang, camera only)"`

### Task 8: Wiring akhir, fallback, & build final

**Files:**
- Modify: apa pun yang menyesuaikan dari Task 1–7 (barrel exports, imports)
- Modify: `README.md` (opsional: tambah GIF ke daftar fitur bila file itu masih relevan)

- [ ] **Step 1**: Audit menyeluruh: semua impor dari `lib/gif.ts`/`lib/share.ts`/`lib/filters.ts` benar; tidak ada import mati; `drawStrip` tunggal.
- [ ] **Step 2**: Jalankan `npm run build` — exit 0 (pastikan semua rute statis ter-prerender termasuk halaman utama).
- [ ] **Step 3**: Jalankan `npm run dev`, cek semua tahap: intro → camera → jepret (haptic+sfx) → studio (animasi+filter baru+frame baru+teks acara+Bagikan Foto/GIF) → unduh Foto/GIF.
- [ ] **Step 4**: Commit — `git commit -m "chore: final wiring and docs for fitur A"`

## Self-Review

Spec coverage: publik ponsel gratis ✓ (semua fitur bersifat klien); GIF bergerak penuh + GIF wajib + Bagikan keduanya + kamera saja ✓ (Task 7 + constraints); grain/light-leak/sepia/bw ✓ (Task 3); frame baru ✓ (Task 4); teks acara ✓ (Task 5); Bagikan Foto ✓ (Task 6); haptic+suara ✓ (Task 1); animasi ✓ (Task 2); A → B → C dicatat non-goal ✓ (spec). Verifikasi manual mengingat tidak ada test ✓. Tidak ada langkah tanpa verification; semua dependency constraint tercatat.
