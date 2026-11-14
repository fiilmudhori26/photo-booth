# Photo Booth "my dipaaa" — Fitur A (Poles Cepat)

Tanggal: 2026-11-14
Status: menunggu approval pengguna
Kode dasar: versi awal my dipaaa (commit 6f82388, di-restore ke main pada 3582192). Belum ada test sama sekali — verifikasi visual manual wajib tiap fitur.

## Intent & Why

Photo booth dibagikan ke **publik di internet, dipakai lewat ponsel**, gratis, tanpa pembayaran. Tujuannya terasa seperti **photobooth sungguhan**, bukan sekadar editor foto. Tahap **A** adalah poles cepat kaya hasil, tanpa merombak arsitektur; tahap **B** (mode kiosk ponsel / pengalaman acara, sesi otomatis, dsb.) dan **C** (acara berbranding, galeri host) menyusul setelah A.

## Goals

- Publik di ponsel, gratis, terasa "profesional & lengkap".
- Perubahan fitur (rencana):
  1. **GIF strip bergerak penuh** — strip lengkap (frame, pattern, caption/tanggal/teks acara, sticker) di-render boomerang menyatu dengan hasil akhir; "Bagikan/Unduh" strip menghasilkan file animasi. Rekam **kontinu di sekitar momen shutter** per pose; Grab per pose 6–8 frame kecil; filter di-bake per pose.
  2. **Format wajib GIF beneran** (bukan WebM-only) — supaya masuk WA/IG; gunakan `gifenc` (atau gif.js) sebagai jalur utama; MediaRecorder/WebM hanya sebagai eksperimen, tidak menggantikan GIF. Tombol "Bagikan" berlaku untuk **keduanya**: Foto dan GIF, masing-masing dengan fallback unduh bila `navigator.share` tidak mendukung.
  3. GIF **hanya untuk alur kamera**; setelah upload dari galeri, opsi GIF disembunyikan/nonaktif.
  4. **Filter ala booth** — sepia, hitam-putih (`bw` sudah ada), film grain, light leak (grain/light-leak butuh akses (x,y), bukan point-operation).
  5. **Tambah frame** — 4–6 frame baru bertema kawaii/floral/retro; frame gradient-only cukup 1 entri di `lib/frames.ts`.
  6. **Teks tanggal/acara di strip** — sudah ada `dateText` (`14 NOV 2026`) dan caption; tambah input teks acara opsional (mengikuti pola caption, max ~22 char, dirender di footer oleh `drawStrip`).
  7. **Bagikan & simpan** — tombol "Bagikan" pakai Web Share API (`navigator.share({files})`) dengan fallback unduh; helper dataURL→Blob perlu ditulis.
  8. **Suara & haptic** — suara rana sudah ada (`sfx.shutter`), tinggal diperkaya; tambah `navigator.vibrate?.()` pada titik shutter/tick (guard ada).
  9. **Animasi kemunculan strip** — keyframes baru (mis. `stripIn`) pada wrapper preview di StudioStage; hormati `prefers-reduced-motion` (sudah ada bloknya di globals.css).

## Non-goals (tahap A)

- Tidak ada pembayaran/checkout.
- Tidak ada mode kiosk/acara/host (itu B & C).
- Tidak ada redesign UI (itu sudah ada di commit c7a3e8f, ditinggalkan atas pilihan pengguna).
- Tidak menambah test suite baru (proyek belum punya test; verifikasi manual + `npm run build`/dev).

## Constraints

- Semua render strip lewat `drawStrip` (lib/strip.ts) — jangan duplikasi.
- Filter di-bake ke pixel data (bukan `ctx.filter`) untuk Safari.
- Data URL, bukan object URL (preview/export konsisten).
- State diangkat ke `PhotoBoothApp`; anak props-driven.
- Tailwind v4 + custom globals.css, palet kawaii (`petal`, `rose`, dst.), font `font-display`/`font-hand`, ikon lucide-react, UI campuran Inggris-kawaii, komentar Inggris.
- `.npmrc` = `legacy-peer-deps=true` — dependency baru perlu cek kompatibilitas manual.
- Memori: GIF akan menambah beban; batasi resolusi/jumlah frame.
- `PhotoBoothApp` adalah god-component (~590 baris) — logika baru masuk `lib/`, bukan state tambahan di sana sebanyak mungkin.
- Verifikasi: tidak ada test — tiap fitur harus dicek visual di `npm run dev`.

## Approaches

1. **Poles bertahap (dipilih pengguna, tahap A)** — item-item di atas, masing-masing bisa dikirim & dicek terpisah. Trade-off: GIF adalah satu-satunya yang butuh dependency baru (`gifenc`); lainnya murni kode ada.
2. **Langsung B/C (kiosk & acara)** — ditolak: terlalu besar sebelum fondasi publik ini solid.
3. **Redesign dulu** — ditolak: pengguna memilih versi awal; fitur masuk di atasnya.

## Keputusan bagian yang sudah diputuskan pengguna

- Publik, ponsel, gratis. Urutan: A → B → C.
- Versi basis: awal my dipaaa (6f82388).

## Yang diserahkan ke builder

- Jumlah/pose frame grab yang efektif untuk boomerang (6–8/pose, resolusi kecil) dan detail timing kontinu di sekitar shutter. Rekomendasi: rekam kontinu mulai ~200–300ms sebelum shutter sampai ~400ms setelahnya.
- Pilihan pengaturan `gifenc` (palet/warna/dither) dan ukuran file GIF yang wajar di ponsel. Builder boleh memilih parameter dengan alasan; GIF wajib jadi jalur utama.
- Detail frame baru (4–6 entri `FRAMES`) diputuskan builder, bertema kawaii.
- Apakah grain memakai noise deterministik atau acak — builder putuskan, asalkan hasil konsisten preview↔export.
- Apakah sticker/teks acara dibekukan di semua frame GIF atau hanya frame statis — builder putuskan, sebaiknya konsisten di semua frame.

## Sukses

Pengguna membuka situs di ponsel, memilih frame, jepret 3 pose (GIF boomerang terekam), muncul animasi hasil, bisa pilih **Foto atau GIF**, bagikan langsung ke WA/IG keduanya, unduh strip ber-teks tanggal/acara — semua mulus tanpa bantuan.
