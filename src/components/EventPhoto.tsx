/**
 * @file    src/components/EventPhoto.tsx
 * @brief   Reusable Neo-Brutalist event photo placeholder with customizable aspect ratio, borders, and label
 * @author  ray
 * @created 2026-08-07
 * @todo    - Support loading indicators for remote source URLs
 */

import { HelpCircle } from "lucide-react";

interface EventPhotoProps {
  label: string;
  aspectRatioClass?: string;
  rotationClass?: string;
  borderClass?: string;
  shadowClass?: string;
}

export default function EventPhoto({
  label,
  aspectRatioClass = "aspect-[16/9]",
  rotationClass = "rotate-0",
  borderClass = "border-[3px] border-black",
  shadowClass = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
}: EventPhotoProps) {
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
