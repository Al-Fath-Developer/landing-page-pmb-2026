/**
 * @file    src/components/EventPhoto.tsx
 * @brief   Reusable Neo-Brutalist event photo block; renders a real image when src is provided,
 *          otherwise falls back to the editorial placeholder waiting for event media
 * @author  ray
 * @created 2026-08-07
 * @todo    - Support loading indicators for remote source URLs
 */

import Image from "next/image";
import { HelpCircle } from "lucide-react";

interface EventPhotoProps {
  label: string;
  src?: string;
  alt?: string;
  aspectRatioClass?: string;
  rotationClass?: string;
  borderClass?: string;
  shadowClass?: string;
}

export default function EventPhoto({
  label,
  src,
  alt,
  aspectRatioClass = "aspect-[16/9]",
  rotationClass = "rotate-0",
  borderClass = "border-[3px] border-black",
  shadowClass = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
}: EventPhotoProps) {
  // Real photo variant: render the provided asset with a small label chip
  if (src) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-white p-2 dark:bg-[#1e1e1e] transition-transform duration-300 hover:rotate-0 ${borderClass} ${shadowClass} ${rotationClass}`}
      >
        <div className={`relative w-full ${aspectRatioClass} overflow-hidden border-[2px] border-black bg-zinc-200 dark:bg-[#2c2c2c]`}>
          <Image
            src={src}
            alt={alt ?? label}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover select-none"
            draggable={false}
            loading="lazy"
          />
          <span className="pointer-events-none absolute bottom-2 left-2 z-10 border-[2px] border-black bg-white px-2 py-0.5 font-heading text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:bg-[#1a1a1a] dark:text-white">
            {label}
          </span>
        </div>
      </div>
    );
  }

  // Placeholder variant: waiting for official event media
  return (
    <div
      className={`relative w-full overflow-hidden bg-white p-2 dark:bg-[#1e1e1e] transition-transform duration-300 hover:rotate-0 ${borderClass} ${shadowClass} ${rotationClass}`}
    >
      <div className={`relative w-full ${aspectRatioClass} bg-zinc-200 border-[2px] border-black flex flex-col items-center justify-center text-center p-4 dark:bg-[#2c2c2c]`}>
        <div className="size-10 border-[2.5px] border-black bg-[#ffea79] flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          <HelpCircle className="size-5" />
        </div>
        <span className="font-heading text-xs uppercase tracking-wider text-black dark:text-white">
          {label}
        </span>
        <span className="mt-1 font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
          [ WAITING FOR EVENT MEDIA ]
        </span>
      </div>
    </div>
  );
}
