/**
 * @file    src/components/gallery/GalleryGrid.tsx
 * @brief   Client-side Neo-Brutalist gallery grid that groups photos by activity and supports a global lightbox
 * @author  ray
 * @created 2026-08-08
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { GalleryActivity } from "@/data/galleryData";

interface GalleryGridProps {
  activities: GalleryActivity[];
}

export default function GalleryGrid({ activities }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Flatten all photos for seamless global navigation inside lightbox
  const flattenedPhotos = useMemo(() => {
    return activities.flatMap((activity) =>
      activity.photos.map((photo) => ({
        ...photo,
        activityTitle: activity.title,
        activityDate: activity.date,
      }))
    );
  }, [activities]);

  const activePhoto = useMemo(
    () => (activeIndex !== null ? flattenedPhotos[activeIndex] : null),
    [activeIndex, flattenedPhotos]
  );

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((prev) => {
        if (prev === null) return prev;
        return (prev + direction + flattenedPhotos.length) % flattenedPhotos.length;
      });
    },
    [flattenedPhotos.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        navigate(-1);
      } else if (e.key === "ArrowRight") {
        navigate(1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, closeLightbox, navigate]);

  return (
    <div className="space-y-16">
      {activities.map((activity) => (
        <div key={activity.id} className="space-y-6">
          {/* Activity Section Header */}
          <div className="border-l-[6px] border-black pl-4 dark:border-white/80">
            <h3 className="font-heading text-xl uppercase tracking-tight text-black dark:text-white mt-1">
              {activity.title}
            </h3>
            <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
              {activity.description}
            </p>
          </div>

          {/* Grid for this activity */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {activity.photos.map((photo) => {
              // Find the global index of this photo in flattenedPhotos
              const globalIndex = flattenedPhotos.findIndex((p) => p.id === photo.id);
              
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActiveIndex(globalIndex)}
                  aria-label={`Buka foto: ${photo.alt}`}
                  className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden border-[3px] border-black bg-white p-2 text-left shadow-shadow transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-shadow-large focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange dark:bg-[#1e1e1e]"
                >
                  <div className="relative w-full h-full overflow-hidden border border-black/10 dark:border-white/10">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      draggable={false}
                      loading="lazy"
                    />
                    {/* Category Label Overlay */}
                    <span className="pointer-events-none absolute bottom-2 left-2 z-10 border-[2px] border-black bg-accent-blue px-2 py-0.5 font-heading text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:bg-[#1a1a1a] dark:text-white">
                      {activity.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Global Lightbox viewer */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={closeLightbox}
        >
          <div
            className="relative flex w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Tutup galeri"
              className="absolute -top-3 -right-3 z-10 flex size-12 items-center justify-center border-[3px] border-black bg-accent-orange text-white shadow-shadow transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <X className="size-6" />
            </button>

            {/* Current photo */}
            <div className="w-full border-[3px] border-black bg-white p-2 shadow-shadow-large dark:bg-[#1e1e1e]">
              <div className="relative aspect-[4/3] w-full overflow-hidden border-[2px] border-black bg-zinc-200 dark:bg-[#2c2c2c]">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-contain"
                  draggable={false}
                  priority
                />
              </div>
            </div>

            {/* Caption & Nav controls */}
            <div className="mt-4 flex w-full items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Foto sebelumnya"
                className="flex size-12 shrink-0 items-center justify-center border-[3px] border-black bg-white text-black shadow-shadow transition-transform hover:-translate-x-0.5 cursor-pointer dark:bg-[#222] dark:text-white"
              >
                <ChevronLeft className="size-6" />
              </button>

              <div className="min-w-0 flex-1 border-[3px] border-black bg-white px-4 py-2 text-center shadow-shadow dark:bg-[#222] dark:text-white">
                <p className="truncate font-heading text-xs uppercase tracking-wider">
                  {activePhoto.activityTitle}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {activeIndex! + 1} / {flattenedPhotos.length} • {activePhoto.activityDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(1)}
                aria-label="Foto berikutnya"
                className="flex size-12 shrink-0 items-center justify-center border-[3px] border-black bg-white text-black shadow-shadow transition-transform hover:translate-x-0.5 cursor-pointer dark:bg-[#222] dark:text-white"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
