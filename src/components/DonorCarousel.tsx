/**
 * @file    src/components/DonorCarousel.tsx
 * @brief   Paginated carousel of donor appreciation cards showing N donors per slide with swipe + button controls
 * @author  ray
 * @created 2026-08-08
 * @todo    - Add keyboard arrow navigation support
 */

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import DonorCard from "@/components/DonorCard";
import { DonorRecord } from "@/types/donation";

const DONORS_PER_SLIDE = 6;

interface DonorCarouselProps {
  donors: DonorRecord[];
  isLoading?: boolean;
}

function chunkDonors(donors: DonorRecord[], size: number): DonorRecord[][] {
  const slides: DonorRecord[][] = [];
  for (let i = 0; i < donors.length; i += size) {
    slides.push(donors.slice(i, i + size));
  }
  return slides;
}

export default function DonorCarousel({ donors, isLoading = false }: DonorCarouselProps) {
  const slides = useMemo(() => chunkDonors(donors, DONORS_PER_SLIDE), [donors]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Derive a safe index: never exceed the current number of slides (handles shrinking lists)
  const currentSlide = slides.length > 0 ? Math.min(activeSlide, slides.length - 1) : 0;

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      const clamped = Math.min(Math.max(index, 0), slides.length - 1);
      setActiveSlide(clamped);
    },
    [slides.length]
  );

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Touch swipe support (horizontal)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 50;
    if (deltaX > SWIPE_THRESHOLD) {
      nextSlide();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const hasMultipleSlides = slides.length > 1;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-2 border-b-[3px] border-black pb-3 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-red-500 fill-current" />
          <h3 className="font-heading text-lg tracking-tight uppercase text-black dark:text-white">
            PAPAN APRESIASI DONATUR
          </h3>
        </div>

        {/* Slide counter + controls */}
        {hasMultipleSlides && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400">
              {currentSlide + 1}/{slides.length}
            </span>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide sebelumnya"
              className="flex size-8 items-center justify-center border-[2px] border-black bg-white text-black shadow-shadow transition-colors hover:bg-black hover:text-white dark:bg-[#1e1e1e] dark:text-white cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Slide berikutnya"
              className="flex size-8 items-center justify-center border-[2px] border-black bg-white text-black shadow-shadow transition-colors hover:bg-black hover:text-white dark:bg-[#1e1e1e] dark:text-white cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Memuat donatur">
          {Array.from({ length: DONORS_PER_SLIDE }).map((_, i) => (
            <div
              key={i}
              className="border-[3px] border-black bg-white p-4 shadow-shadow dark:bg-[#1e1e1e] animate-pulse"
            >
              <div className="h-3 w-2/5 rounded bg-zinc-200 dark:bg-zinc-700 mb-2" />
              <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 mb-3" />
              <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && slides.length === 0 && (
        <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400">
          Belum ada donasi yang tercatat. Jadilah yang pertama!
        </p>
      )}

      {/* Active slide */}
      {!isLoading && slides.length > 0 && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="overflow-visible"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {slides[currentSlide]?.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
          </div>
        </div>
      )}

      {/* Slide dots */}
      {hasMultipleSlides && (
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Ke slide ${index + 1}`}
              aria-current={index === currentSlide}
              className={`size-2.5 border-2 border-black transition-colors cursor-pointer ${
                index === currentSlide ? "bg-black dark:bg-white" : "bg-white dark:bg-[#1e1e1e]"
              }`}
            />
          ))}
        </div>
      )}

      <p className="font-mono text-[9px] text-center text-zinc-500 dark:text-zinc-400 leading-normal mt-4">
        * Donatur dapat memilih untuk menyembunyikan nominal atau nama (Anonymous) pada formulir donasi.
      </p>
    </div>
  );
}
