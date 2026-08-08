/**
 * @file    src/components/DonorCard.tsx
 * @brief   Single donor appreciation card reused across the homepage board and donation page carousel
 * @author  ray
 * @created 2026-08-08
 * @todo    - Support optional avatar placeholders for named donors
 */

"use client";

import { Sparkles } from "lucide-react";
import { DonorRecord } from "@/types/donation";

interface DonorCardProps {
  donor: DonorRecord;
}

export default function DonorCard({ donor }: DonorCardProps) {
  return (
    <div className="border-[3px] border-black bg-white p-4 shadow-shadow dark:bg-[#1e1e1e] flex flex-col justify-between text-black dark:text-white">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b-[2px] border-black/10 pb-2 mb-2 dark:border-white/10">
          <span className="font-heading text-sm text-black dark:text-white truncate">
            {donor.name}
          </span>
          <span className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400 shrink-0">
            {donor.date}
          </span>
        </div>

        {/* Message */}
        {donor.message ? (
          <p className="font-mono text-xs italic leading-relaxed text-zinc-700 dark:text-zinc-300">
            &ldquo;{donor.message}&rdquo;
          </p>
        ) : (
          <p className="font-mono text-xs italic text-zinc-400">
            Tidak menuliskan pesan.
          </p>
        )}
      </div>

      {/* Bottom info */}
      <div className="mt-3 flex items-center justify-end gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
        <span className="inline-flex items-center gap-0.5 border border-black bg-emerald-400 px-1.5 py-0.5 font-mono text-[9px] font-bold text-black uppercase">
          {donor.amountText}
        </span>
      </div>
    </div>
  );
}
