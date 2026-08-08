/**
 * @file    src/app/gallery/page.tsx
 * @brief   Static event documentation gallery page with Neo-Brutalist styling and activity grouping
 * @author  ray
 * @created 2026-08-08
 */

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { galleryActivities } from "@/data/galleryData";

export const metadata: Metadata = {
  title: "Gallery Dokumentasi",
  description: "Dokumentasi perjalanan kegiatan PMB I-FEST 2026 dan berbagai kegiatan mahasiswa muslim Telkom University.",
};

export default function GalleryPage() {
  // Count total photos
  const totalPhotos = galleryActivities.reduce((sum, act) => sum + act.photos.length, 0);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-black selection:bg-main selection:text-black dark:bg-[#121212] dark:text-white">
      <Navbar />

      {/* Gallery Header */}
      <section className="border-b-[4px] border-black bg-accent-pink px-6 py-16 sm:px-8 md:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-1 border-[2.5px] border-black bg-accent-blue px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-shadow">
            ARSIP DOKUMENTASI
          </div>
          <h1 className="font-heading text-4xl uppercase leading-none tracking-tighter text-black sm:text-6xl dark:text-white">
            Gallery Dokumentasi
          </h1>
          <div className="mx-auto mt-4 h-[4px] w-24 bg-black dark:bg-white" />
          <p className="mx-auto mt-4 max-w-2xl font-sans text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300">
            Jejak kebersamaan penyambutan mahasiswa baru muslim Telkom University.
            Setiap foto menyimpan cerita kebersamaan yang mengiringi perjalanan PMB I-FEST 2026.
          </p>
        </div>
      </section>

      {/* Gallery Grouped Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
        <div className="mb-8 flex items-center justify-between border-b-[3px] border-black pb-4 dark:border-zinc-700">
          <h2 className="font-heading text-lg uppercase tracking-tight">
            Galeri Kegiatan
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {totalPhotos} Foto • {galleryActivities.length} Kategori
          </span>
        </div>

        <GalleryGrid activities={galleryActivities} />
      </section>

      <Footer />
    </div>
  );
}
