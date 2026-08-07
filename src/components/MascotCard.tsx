/**
 * @file    src/components/MascotCard.tsx
 * @brief   Render decorative Arjuna and Srikandi mascot profiles with Neo-Brutalist styling
 * @author  ray
 * @created 2026-08-07
 * @todo    - Replace PNG fallback visuals with interactive micro-animations
 */

import Image from "next/image";
import { MascotInfo } from "@/data/eventData";

interface MascotCardProps {
  mascot: MascotInfo;
  colorClass?: string;
  rotationClass?: string;
}

export default function MascotCard({
  mascot,
  colorClass = "bg-accent-blue",
  rotationClass = "rotate-1",
}: MascotCardProps) {
  return (
    <div
      className={`relative border-[4px] border-black bg-white p-6 shadow-shadow-large dark:bg-[#1e1e1e] flex flex-col items-center ${rotationClass} transition-transform hover:rotate-0 duration-300`}
    >
      {/* Decorative Mascot Background Sticker */}
      <div className={`w-full h-56 border-[3px] border-black ${colorClass} relative overflow-hidden flex items-center justify-center`}>
        {/* Retro dots overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#000_10%,_transparent_10%)] bg-[size:12px_12px]" />
        
        {/* Mascot PNG visual */}
        <div className="relative size-48 z-10 filter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
          <Image
            src={mascot.imagePath}
            alt={mascot.name}
            fill
            sizes="192px"
            className="object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Brand visual tags inside image */}
        <div className="absolute bottom-2 left-2 border-[2px] border-black bg-white px-2 py-0.5 font-mono text-[9px] font-bold text-black uppercase tracking-wider">
          {mascot.name.toUpperCase()} ACCENT
        </div>
      </div>

      {/* Mascot Details */}
      <div className="mt-6 text-center w-full">
        <h3 className="font-heading text-xl border-b-[3px] border-black pb-2 tracking-tight text-black dark:text-white dark:border-zinc-700">
          Karakter: {mascot.name}
        </h3>
        <p className="mt-4 text-xs font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
          {mascot.philosophy}
        </p>
      </div>
    </div>
  );
}
