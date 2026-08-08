# PMB I-FEST 2026 — Homepage Copywriting

## Status
- Current implementation + Proposed final copy
- Scope: `/` (Beranda)
- Purpose: Source of truth untuk copywriting homepage — panduan untuk tahap implementasi berikutnya

> Dokumen ini adalah *single review document* dan *implementation reference*.
> Bagian "Current" diambil dari repository aktual; bagian "Proposed final copy" adalah hasil brainstorming & finalisasi copywriting PMB I-FEST 2026 yang disepakati.
> Setiap section ditandai status: `KEEP` / `UPDATED` / `NEW` / `FLEXIBLE`.

---

## Brand & Copywriting Direction

- **Event**: PMB I-FEST 2026 (gunakan `I-FEST`, bukan `I-Fest`)
- **Target utama**: mahasiswa baru muslim
- **Secondary audience**: mahasiswa umum, alumni, komunitas, sponsor, partner, masyarakat
- **Tone**: inviting, warm, inclusive, aspirational, professional
- **Hindari**: bahasa terlalu birokratis, copy terlalu eksklusif, "hard-selling dakwah", repetisi berlebihan frasa `mahasiswa baru muslim`
- **Core message / tagline**: `Tumbuh Bersama, Mengukir Karya`
- **Narrative flow**:
  ```
  PERJALANAN
    ↓
  MAKNA & FILOSOFI
    ↓
  KOMUNITAS
    ↓
  DONASI
    ↓
  FINAL CTA
  ```
- **Makna narrative**:
  1. PERJALANAN — perjalanan mahasiswa baru muslim dari masa adaptasi hingga I-FEST.
  2. MAKNA & FILOSOFI — nilai dan identitas yang dibawa PMB I-FEST.
  3. KOMUNITAS — perjalanan tidak berhenti setelah PMB selesai.
  4. DONASI — siapa pun dapat ikut mengambil bagian dalam perjalanan tersebut.
  5. FINAL CTA — kesempatan kontribusi lebih luas: donasi, sponsorship, partnership, kolaborasi.

---

## 1. HERO

### Eyebrow
(tidak ada eyebrow terpisah; langsung heading)

### Heading
`PMB I-FEST 2026`
`Tumbuh Bersama, Mengukir Karya` (di dalam kotak aksen oranye, miring -1deg)

### Description
(tidak ada deskripsi paragraf di hero; murni headline + CTA)

### CTA
- `IKUT DONASI` (ikon Heart, tautan `/donation`)
- `JELAJAHI PERJALANAN` (ikon ArrowRight, tautan anchor `#about`)

### Supporting Copy
(tidak ada supporting copy terpisah)

### Visual
- Mascot overlay: `/ARJUNA.webp`, `/SRIKANDI.webp` (kiri & kanan bawah, z-index tinggi)
- Collage background (6 bingkai): foto asli `next/image` dari `public/gallery/` — sudah diimplementasikan
- Asset collage: `/gallery/pra-event/pra-event-01.webp`, `/gallery/ifest/ifest-01.webp`, `/gallery/syiar-pelayanan/syiar-pelayanan-01.webp`, `/gallery/gsbj/gsbj-01.webp`, `/gallery/ifest/ifest-02.webp`, `/gallery/student-fair/student-fair-01.webp`

### Copywriting Notes
- Kuat: headline singkat, jelas, tagline sudah jadi identitas kampanye.

### Status
`KEEP`

---

## 2. MARQUEE (Infinite text band)

### Eyebrow
(tidak ada)

### Heading
(tidak ada)

### Description
(items marquee)

`PMB I-FEST 2026` • `TUMBUH BERSAMA` • `MENGUKIR KARYA` • `HARMONI NUSANTARA` • `LDK AL-FATH`

### CTA
(tidak ada)

### Supporting Copy
(tidak ada)

### Copywriting Notes
- Konsisten dengan tagline utama.

### Status
`KEEP`

---

## 3. TENTANG / APAKAH ITU (id="about")

### Eyebrow
`TENTANG EVENT`

### Heading
`Apa Itu` / `PMB I-FEST 2026`

> Catatan: kapitalisasi sudah dinormalisasi `I-Fest` → `I-FEST` (implementasi sebelumnya).

### Description
`Penyambutan Mahasiswa Baru (PMB) adalah serangkaian kegiatan yang bertujuan untuk menyambut mahasiswa baru muslim di Universitas Telkom. Pada PMB 2026, Masjid Syamsul Ulum Family akan berperan aktif dalam menyambut mahasiswa baru. Keterlibatan ini didasari kesempatan untuk bersilaturahmi dengan mahasiswa baru muslim, memperkenalkan organisasi kemahasiswaan Islam di Universitas Telkom, serta membantu mereka dalam beradaptasi dengan lingkungan perkuliahan sambil tetap mengamalkan nilai-nilai Islam.`

### CTA
(tidak ada)

### Supporting Copy
`membantu mereka dalam beradaptasi dengan lingkungan perkuliahan sambil tetap mengamalkan nilai-nilai Islam.` (highlight di dalam kotak kuning)

### Visual
- Tidak ada gambar; section tipografis.

### Copywriting Notes
- Copy sudah baik, naratif, dan relevan.
- Normalisasi kapitalisasi sudah diterapkan.

### Status
`KEEP`

---

## 4. PERJALANAN PMB & I-FEST (id="journey") — Timeline 5 langkah

### Eyebrow
`LINI MASA PROGRAM`

### Heading
`PERJALANAN PMB & I-FEST`

### Description (intro — UPDATED)
**Current:** `Setiap langkah membawa cerita. Dari mengenal ruang baru hingga merayakan perjalanan bersama dalam menyambut masa depan mahasiswa baru muslim di Universitas Telkom.`

**Proposed final copy:** `Setiap langkah adalah bagian dari perjalanan. Dari mengenal lingkungan baru, menemukan ruang untuk bertumbuh, hingga merayakan awal perjalanan sebagai mahasiswa di Telkom University.`

### CTA
(tidak ada per step; CTA gallery di bawah)

### Supporting Copy
- Badge step 05: `PUNCAK PERJALANAN`

### Step 01 — PRA-EVENT

- **Title**: `PRA-EVENT`
- **Subtitle**: `Qomarul 'Ulum` (jangan diubah)
- **Body (UPDATED)**:
  `Memulai perjalanan dengan membangun ruang aman bagi mahasiswa baru muslim untuk saling mengenal, berbagi, dan bertumbuh. Melalui sholat berjamaah, Ngabers, Coffee Break with Kating, serta Bukber dan Kajian Senin-Kamis, TULT dihidupkan sebagai ruang kebersamaan dan pusat dakwah sebelum perjalanan berlanjut ke MSU.`
- **Jadwal**: `JADWAL: Juli - Agustus 2026`
- **Visual**: `/gallery/pra-event/pra-event-01.webp` (label `FOTO QOMARUL 'ULUM`)
- **Catatan**: detail kegiatan tetap dalam 1 paragraf; jangan gunakan bullet list pada body copy utama.

### Step 02 — SYIAR PELAYANAN

- **Title**: `SYIAR PELAYANAN`
- **Subtitle**: (tidak ada)
- **Body (UPDATED)**:
  `Hadir di awal langkah mahasiswa baru untuk membantu proses check-in asrama, mengenalkan lingkungan kampus, menjawab kebutuhan informasi, sekaligus memperkenalkan rangkaian perjalanan PMB I-FEST. Sebuah bentuk pelayanan sederhana untuk memastikan setiap langkah pertama terasa lebih mudah.`
- **Jadwal**: `JADWAL: Agustus 2026`
- **Visual**: `/gallery/syiar-pelayanan/syiar-pelayanan-01.webp` (label `FOTO SYIAR PELAYANAN`)
- **Catatan**: program masih dalam tahap cooking — copy harus fleksibel apabila teknis kegiatan berubah; jangan mengunci detail di luar informasi yang tersedia.

### Step 03 — BINA ROHANI

- **Title**: `BINA ROHANI`
- **Subtitle**: (tidak ada)
- **Body (UPDATED — placeholder diganti)**:
  `Menumbuhkan kebiasaan baik melalui pengalaman beribadah bersama. Bina Rohani hadir melalui mobilisasi Sholat Dzuhur bersama PKKMB Universitas serta Gerakan Sholat Subuh Berjamaah menjelang PKKMB, mengajak mahasiswa baru muslim untuk menjadikan ibadah sebagai bagian dari perjalanan mereka di lingkungan kampus.`
- **Jadwal**: `JADWAL: Agustus 2026`
- **Visual**: `/gallery/gsbj/gsbj-01.webp` (label `FOTO BINA ROHANI`) — reuse terdekat; tidak ada folder bina-rohani khusus
- **Catatan**: DUA kegiatan utama yang dipertahankan: (1) Mobilisasi Sholat Dzuhur, (2) Gerakan Sholat Subuh Berjamaah. Jangan tambahkan kegiatan lain yang belum diberikan. Jangan gunakan placeholder `[ DESKRIPSI BINA ROHANI — MENUNGGU COPY RESMI ]`.

### Step 04 — STUDENT FAIR

- **Title**: `STUDENT FAIR`
- **Subtitle**: (tidak ada)
- **Body (UPDATED)**:
  `Mengenal lebih dekat ruang untuk berkontribusi dan berkembang di Telkom University. Student Fair menjadi kesempatan bagi mahasiswa baru untuk menemukan komunitas, mengenal Al-Fath, serta melihat berbagai ruang yang dapat menjadi tempat mereka menyalurkan minat, bakat, dan semangat berorganisasi.`
- **Jadwal**: `JADWAL: Agustus 2026`
- **Visual**: `/gallery/student-fair/student-fair-01.webp` (label `FOTO STUDENT FAIR`)
- **Catatan**: jangan mengunci copy pada konsep booth/photo corner karena masih bisa direvisi; jangan menyebut detail teknis yang belum final.

### Step 05 — I-FEST (Puncak, panel hijau terpisah)

- **Badge**: `PUNCAK PERJALANAN`
- **Title**: `I-FEST`
- **Subtitle**: `Islamic Festival`
- **Body (UPDATED)**:
  `Menutup rangkaian PMB dengan sebuah ruang untuk berhenti sejenak, menemukan perspektif baru, dan memulai perjalanan perkuliahan dengan semangat yang lebih berarti. Melalui Talkshow Alumni, Talkshow Wajihah, dan tayangan drama inspiratif, I-FEST mengajak mahasiswa baru untuk menemukan inspirasi, mengenal lebih banyak ruang untuk bertumbuh, dan menyadari bahwa mereka tidak berjalan sendirian.`
- **Jadwal**: `JADWAL: September 2026`
- **Visual**: `/gallery/ifest/ifest-01.webp` (label `FOTO PUNCAK ACARA: I-FEST`)
- **Catatan**: I-FEST diposisikan sebagai titik transisi (bukan sekadar acara penutup); tekankan inspirasi, perspektif, kebersamaan, awal perjalanan baru. Jangan klaim detail yang belum final.

### Gallery CTA
`JELAJAHI GALLERY DOKUMENTASI →` (tautan `/gallery`)

### Copywriting Notes
- Struktur naratif 01→05 (dari adaptasi sampai I-FEST sebagai titik transisi) sudah menjadi satu cerita utuh.
- Visual seluruh 5 langkah sudah memakai foto asli dari `public/gallery/` (implementasi sebelumnya).

### Status
`UPDATED` (copy per step) + visual selesai

---

## 5. MAKNA & FILOSOFI (id="philosophy")

### Eyebrow
`MAKNA & FILOSOFI`

### Heading
`HARMONI NUSANTARA`

### Description
`Harmoni menggambarkan keseimbangan kehidupan akademik, interaksi sosial, dan kematangan spiritual. Nusantara menjadi ruang inklusif bagi keberagaman latar belakang mahasiswa untuk tumbuh dan berjalan bersama.`

> Catatan konsistensi: kata `budaya` dihilangkan dari kalimat penutup agar selaras dengan direction brand ("keberagaman latar belakang mahasiswa").

### Mascot Cards (Arjuna & Srikandi) — KEEP
- `Karakter: Arjuna` — `Merepresentasikan ketangguhan dalam belajar, sikap ramah dalam berinteraksi, keterbukaan menghadapi hal baru, dan keberanian melangkah menghadapi tantangan.`
- `Karakter: Srikandi` — `Merepresentasikan ketulusan, rasa empati yang mendalam, sifat meneduhkan, serta menghadirkan rasa aman dan kenyamanan dalam perjalanan bersama.`
- Tag visual: `ARJUNA ACCENT`, `SRIKANDI ACCENT`

### CTA
(tidak ada)

### Supporting Copy
(tidak ada)

### Visual
- `/ARJUNA.webp`, `/SRIKANDI.webp` dalam kartu bento. Section sudah lengkap secara visual.

### Copywriting Notes
- Copy filosofi Arjuna & Srikandi dipertahankan tanpa rewriting.

### Status
`KEEP` (description: normalisasi istilah; mascot: KEEP)

---

## 6. KOMUNITAS (Komunitas WA)

Hubungan naratif: **"Perjalanan tidak berhenti setelah PMB selesai."**

### Eyebrow
`KOMUNITAS WA` (dengan ikon WhatsApp)

### Heading (UPDATED)
`TETAP BERTUMBUH, BAHKAN SETELAH PMB SELESAI`

### Description (UPDATED)
`Perjalanan tidak berhenti setelah rangkaian PMB selesai. Temukan teman sefrekuensi, salurkan minatmu, dan terus bertumbuh bersama mahasiswa muslim Telkom University dalam ruang yang terbuka untuk berbagai ketertarikan.`

### Bento kategori (UPDATED — kini dengan deskripsi)
- `ART` — `Berkarya dan mengekspresikan ide.`
- `GAMING` — `Bermain, berkompetisi, dan membangun koneksi.`
- `PROGRAMMING` — `Belajar, membuat, dan berkembang bersama.`
- `SPORT` — `Bergerak, berkompetisi, dan menjaga kebersamaan.`

### CTA
- `GABUNG KOMUNITAS SEKARANG →` (WhatsApp group yang sudah ada)
- `FOLLOW INSTAGRAM PMB I-FEST →` (UPDATED wording) → `https://www.instagram.com/pmbifest_telyu/`

> Penting: Instagram CTA wajib mengarah ke akun resmi `https://www.instagram.com/pmbifest_telyu/`. WhatsApp tetap memakai group komunitas yang sudah ada. Jangan mengubah URL dokumentasi tanpa instruksi baru.

### Supporting Copy
(tidak ada)

### Visual
- Mascot overlay `/ARJUNA.webp`, `/SRIKANDI.webp` di kiri/kanan bawah; ikon lucide di bento.

### Copywriting Notes
- Section ini sekarang berdiri sebagai kelanjutan dari I-FEST, bukan sekadar daftar komunitas.

### Status
`UPDATED`

---

## 7. DONASI HOMEPAGE (Penggalangan Dana)

### Eyebrow
`PENGGALANGAN DANA KAMPANYE`

### Heading (UPDATED)
`IKUT MENJADI BAGIAN DARI PERJALANAN`

### Description (UPDATED)
`Setiap perjalanan membutuhkan banyak tangan yang ikut mengambil bagian. Dukung penyambutan mahasiswa baru muslim melalui PMB I-FEST 2026 dan bantu menghadirkan ruang untuk belajar, bertumbuh, dan membangun kebersamaan di awal kehidupan perkuliahan.`

### CTA
- `DONASI SEKARANG` (ikon ArrowUpRight, tautan `/donation`)

### Supporting Copy (NEW)
`Setiap kontribusi, sekecil apa pun, menjadi bagian dari perjalanan yang lebih besar.`

### Statistik (DonationStats) — pertahankan existing
- `TERKUMPUL` (nominal)
- `TARGET KAMPANYE` (nominal)
- `JUMLAH DONATUR` + `ORANG`
- `Progres Penggalangan Dana` + `%`
- Footnote: `* Data di atas adalah data visual kampanye PMB I-FEST 2026.`

### Donor Leaderboard — pertahankan existing
- `PAPAN APRESIASI DONATUR`
- Empty message: `Tidak menuliskan pesan.`
- Badge: `APRESIASI`
- Footnote: `* Donatur dapat memilih untuk menyembunyikan nominal atau nama (Anonymous) pada formulir donasi.`

### Copywriting Notes
- Tone ajakan, tidak memaksa, tidak terlalu transaksional; tetap jelas bahwa kontribusi digunakan untuk mendukung PMB I-FEST 2026.

### Status
`UPDATED`

---

## 8. FINAL CTA

Cakupan kontribusi paling luas: donatur, sponsor, partner, komunitas, alumni, individu.

### Eyebrow (NEW)
`SATU PERJALANAN, BANYAK CARA UNTUK BERKONTRIBUSI`

### Heading (UPDATED)
`DUKUNG PERJALANAN PMB & I-FEST`

### Description (UPDATED)
`Tumbuh bersama. Mengukir karya. Menjadi bagian dari cerita. Ada banyak cara untuk ikut mengambil bagian dalam perjalanan PMB I-FEST 2026—mulai dari memberikan dukungan melalui donasi hingga membuka peluang kolaborasi, sponsorship, dan kemitraan bersama.`

### CTA
- `IKUT DONASI →` (tautan `/donation`)
- `HUBUNGI CP (SPONSORSHIP) →` (tautan WhatsApp `wa.me/6281313853065`)

### Supporting Copy
(tidak ada)

### Visual
- Ikon `Send` (pink, animate-pulse).

### Copywriting Notes
- Open invitation untuk semua pihak; bukan hanya calon donatur.

### Status
`UPDATED`

---

## 9. FOOTER

### Branding
`PMB I-FEST 2026` • `Telkom University • LDK Al-Fath`

### Description
`Membangun generasi muda muslim Telkom University yang tangguh, cerdas, berkarakter mulia, dan berjiwa kepemimpinan dalam kebersamaan harmoni.`

### Tautan Cepat
`Beranda` • `Perjalanan PMB & I-FEST` • `Karakter & Filosofi` • `Halaman Donasi` • `Gallery`

### Hubungi Kami
`alfathfiftelu@gmail.com` • Instagram `@pmbifest_telyu` • WhatsApp group

### Copyright
`© {tahun} LDK Al-Fath • PMB I-FEST 2026. Made with ❤️ for Tel-U Muslim Community.`

### Visual
- Logo: `/logo-pmb.png`, `/AL-FATH.png`, `/Telkom University.png`, `/DKMSU.png`

### Copywriting Notes
- Tidak dilakukan rewriting; dipertahankan untuk konsistensi brand.

### Status
`KEEP`

---

## 10. NAVBAR

### Branding
`PMB I-FEST 2026` (kotak aksen biru) + logo `/logo-pmb.png`

### Links
`Beranda` • `Gallery` • `DONASI` (CTA oranye)

### Copywriting Notes
- KEEP.

### Status
`KEEP`

---

## Visual Asset Gaps

| Section | Kebutuhan Visual | Asset Tersedia | Status |
|---|---|---|---|
| Hero Collage (6 bingkai) | Foto kegiatan | `public/gallery/` (gsbj, syiar-pelayanan, ifest, pra-event, student-fair) | ✅ Terpakai — reuse |
| Step 01 Pra-Event | Foto pra-event | `public/gallery/pra-event/pra-event-01.webp` | ✅ Terpakai |
| Step 02 Syiar Pelayanan | Foto syiar | `public/gallery/syiar-pelayanan/syiar-pelayanan-01.webp` | ✅ Terpakai |
| Step 03 Bina Rohani | Foto pembinaan rohani | Tidak ada folder khusus; reuse `public/gallery/gsbj/gsbj-01.webp` | ⚠️ Reuse terdekat |
| Step 04 Student Fair | Foto student fair | `public/gallery/student-fair/student-fair-01.webp` | ✅ Terpakai |
| Step 05 I-FEST | Foto puncak | `public/gallery/ifest/ifest-01.webp` | ✅ Terpakai |
| Filosofi | Mascot | `/ARJUNA.webp`, `/SRIKANDI.webp` | ✅ Lengkap |
| Komunitas | Foto (opsional) | Tidak wajib; bento icon + mascot cukup | — |

---

## Change Log

### Homepage Copywriting Refinement
- Reworked Journey narrative (intro baru + copy per langkah 01–05).
- Replaced placeholder Bina Rohani copy dengan copy resmi (Mobilisasi Sholat Dzuhur + Gerakan Sholat Subuh Berjamaah).
- Reframed I-FEST as the transition point of the journey (bukan sekadar acara penutup).
- Reframed Community as continuation after PMB (`TETAP BERTUMBUH, BAHKAN SETELAH PMB SELESAI`).
- Added per-category description untuk bento komunitas (ART, GAMING, PROGRAMMING, SPORT).
- Reframed donation section as an invitation to contribute (`IKUT MENJADI BAGIAN DARI PERJALANAN`).
- Expanded final CTA toward sponsorship, partnership, and collaboration (`SATU PERJALANAN, BANYAK CARA UNTUK BERKONTRIBUSI`).
- Standardized `I-FEST` capitalization (heading "Apa Itu" + seluruh dokumen).
- Fixed Instagram CTA documentation (wording `FOLLOW INSTAGRAM PMB I-FEST →` + URL `https://www.instagram.com/pmbifest_telyu/`).
- Normalized Filosofi description (dihilangkan kata `budaya` untuk konsistensi istilah).
- KEEP: hero headline/tagline, marquee, navbar, filosofi Arjuna & Srikandi, footer, CTA gallery, CTA donasi yang sudah sesuai.
