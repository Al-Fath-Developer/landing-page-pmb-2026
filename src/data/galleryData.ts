/**
 * @file    src/data/galleryData.ts
 * @brief   Grouped static gallery dataset for the PMB I-FEST 2026 documentation page
 * @author  ray
 * @created 2026-08-08
 */

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
}

export interface GalleryActivity {
  id: string;
  title: string;
  date: string;
  description: string;
  photos: GalleryItem[];
}

export const galleryActivities: GalleryActivity[] = [
  {
    id: "gsbj",
    title: "Gerakan Subuh Berjamaah",
    date: "2026",
    description: "Pembekalan rohani dan kebersamaan ibadah subuh mahasiswa baru muslim.",
    photos: [
      { id: "gsbj-01", src: "/gallery/gsbj/gsbj-01.webp", alt: "Ibadah subuh jamaah bersama mahasiswa baru muslim" },
      { id: "gsbj-02", src: "/gallery/gsbj/gsbj-02.webp", alt: "Kajian subuh rohani pasca sholat berjamaah" },
      { id: "gsbj-03", src: "/gallery/gsbj/gsbj-03.webp", alt: "Penyampaian materi nilai spiritualitas dakwah" },
      { id: "gsbj-04", src: "/gallery/gsbj/gsbj-04.webp", alt: "Antusiasme mahasiswa baru menyimak arahan panitia" },
      { id: "gsbj-05", src: "/gallery/gsbj/gsbj-05.webp", alt: "Kebersamaan dan foto bersama setelah subuh berjamaah" },
    ],
  },
  {
    id: "syiar-pelayanan",
    title: "Syiar Pelayanan",
    date: "2026",
    description: "Pelayanan informasi dan syiar nilai-nilai keislaman bagi civitas akademika.",
    photos: [
      { id: "syiar-01", src: "/gallery/syiar-pelayanan/syiar-pelayanan-01.webp", alt: "Briefing panitia pelayanan informasi PMB" },
      { id: "syiar-02", src: "/gallery/syiar-pelayanan/syiar-pelayanan-02.webp", alt: "Penyambutan ramah panitia syiar pelayanan LDK Al-Fath" },
      { id: "syiar-03", src: "/gallery/syiar-pelayanan/syiar-pelayanan-03.webp", alt: "Pemberian arahan kepada peserta PMB" },
      { id: "syiar-04", src: "/gallery/syiar-pelayanan/syiar-pelayanan-04.webp", alt: "Pelayanan meja bantuan dan registrasi informasi" },
      { id: "syiar-05", src: "/gallery/syiar-pelayanan/syiar-pelayanan-05.webp", alt: "Interaksi edukatif panitia bersama mahasiswa baru" },
      { id: "syiar-06", src: "/gallery/syiar-pelayanan/syiar-pelayanan-06.webp", alt: "Suasana syiar pelayanan di pelataran masjid kampus" },
    ],
  },
  {
    id: "ifest",
    title: "Islamic Festival (I-FEST)",
    date: "2026",
    description: "Puncak perayaan penyambutan mahasiswa baru dengan festival seni dan dakwah kreatif.",
    photos: [
      { id: "ifest-01", src: "/gallery/ifest/ifest-01.webp", alt: "Kemeriahan pembukaan acara puncak Islamic Festival" },
      { id: "ifest-02", src: "/gallery/ifest/ifest-02.webp", alt: "Penampilan panggung kreativitas seni mahasiswa muslim" },
      { id: "ifest-03", src: "/gallery/ifest/ifest-03.webp", alt: "Kajian akbar puncak I-FEST bersama pemateri" },
      { id: "ifest-04", src: "/gallery/ifest/ifest-04.webp", alt: "Dokumentasi interaksi hangat peserta festival" },
      { id: "ifest-05", src: "/gallery/ifest/ifest-05.webp", alt: "Sesi foto bersama seluruh panitia dan pengisi acara" },
    ],
  },
  {
    id: "pra-event",
    title: "Pra-Event PMB",
    date: "2026",
    description: "Rangkaian persiapan dan pra-acara penyambutan mahasiswa baru muslim.",
    photos: [
      { id: "pra-01", src: "/gallery/pra-event/pra-event-01.webp", alt: "Rapat koordinasi divisi media dan acara pra-event" },
      { id: "pra-02", src: "/gallery/pra-event/pra-event-02.webp", alt: "Pemasangan atribut dekoratif menyambut PMB" },
      { id: "pra-03", src: "/gallery/pra-event/pra-event-03.webp", alt: "Briefing perdana bersama seluruh volunteer" },
      { id: "pra-04", src: "/gallery/pra-event/pra-event-04.webp", alt: "Pengondisian lokasi ruang utama masjid kampus" },
      { id: "pra-05", src: "/gallery/pra-event/pra-event-05.webp", alt: "Gladi resih alur masuk peserta welcoming day" },
      { id: "pra-06", src: "/gallery/pra-event/pra-event-06.webp", alt: "Sesi evaluasi teknis lapangan pra-event" },
      { id: "pra-07", src: "/gallery/pra-event/pra-event-07.webp", alt: "Foto kesiapan panitia sebelum acara penyambutan dimulai" },
    ],
  },
  {
    id: "mobilisasi-sholat",
    title: "Mobilisasi Sholat",
    date: "2026",
    description: "Pengondisian dan pendampingan ibadah sholat jamaah selama rangkaian PMB.",
    photos: [
      { id: "mobilisasi-01", src: "/gallery/mobilisasi-sholat/mobilisasi-sholat-01.webp", alt: "Pengondisian shaf jamaah sholat dzuhur" },
      { id: "mobilisasi-02", src: "/gallery/mobilisasi-sholat/mobilisasi-sholat-02.webp", alt: "Pemanduan arah tempat wudhu bagi peserta PMB" },
      { id: "mobilisasi-03", src: "/gallery/mobilisasi-sholat/mobilisasi-sholat-03.webp", alt: "Ketertiban barisan shaf jamaah pria" },
      { id: "mobilisasi-04", src: "/gallery/mobilisasi-sholat/mobilisasi-sholat-04.webp", alt: "Ketertiban barisan shaf jamaah wanita" },
      { id: "mobilisasi-05", src: "/gallery/mobilisasi-sholat/mobilisasi-sholat-05.webp", alt: "Suasana khusyuk jamaah masjid kampus Telkom" },
    ],
  },
  {
    id: "student-fair",
    title: "Student Fair",
    date: "2026",
    description: "Pengenalan organisasi dan lembaga dakwah kampus LDK Al-Fath kepada mahasiswa baru.",
    photos: [
      { id: "student-01", src: "/gallery/student-fair/student-fair-01.webp", alt: "Persiapan dekorasi booth pameran LDK Al-Fath" },
      { id: "student-02", src: "/gallery/student-fair/student-fair-02.webp", alt: "Pemberian brosur pendaftaran kaderisasi baru" },
      { id: "student-03", src: "/gallery/student-fair/student-fair-03.webp", alt: "Penjelasan program kerja LDK kepada pengunjung" },
      { id: "student-04", src: "/gallery/student-fair/student-fair-04.webp", alt: "Kunjungan interaktif mahasiswa baru ke booth" },
      { id: "student-05", src: "/gallery/student-fair/student-fair-05.webp", alt: "Sesi tanya jawab seputar mentorship keislaman" },
      { id: "student-06", src: "/gallery/student-fair/student-fair-06.webp", alt: "Foto bersama pengurus LDK Al-Fath di booth pameran" },
      { id: "student-07", src: "/gallery/student-fair/student-fair-07.webp", alt: "Keseruan suasana stan pameran mahasiswa muslim" },
    ],
  },
];
