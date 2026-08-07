/**
 * @file    src/components/DonorLeaderboard.tsx
 * @brief   Render public wall/leaderboard showing names and messages of successful donors
 * @author  ray
 * @created 2026-08-07
 * @todo    - Fetch real-time donor list from Supabase database in later phase
 */

"use client";

import { Heart, Sparkles } from "lucide-react";

export interface DonorRecord {
  id: string;
  name: string;
  message?: string;
  amountText: string;
  date: string;
}

interface DonorLeaderboardProps {
  donors: DonorRecord[];
}

export default function DonorLeaderboard({ donors }: DonorLeaderboardProps) {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 border-b-[3px] border-black pb-3 dark:border-zinc-700">
        <Heart className="size-5 text-red-500 fill-current" />
        <h3 className="font-heading text-lg tracking-tight uppercase text-black dark:text-white">
          PAPAN APRESIASI DONATUR
        </h3>
      </div>

      {/* Grid of appreciation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {donors.map((donor) => (
          <div
            key={donor.id}
            className="border-[3px] border-black bg-white p-4 shadow-shadow dark:bg-[#1e1e1e] flex flex-col justify-between text-black dark:text-white"
          >
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
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                {donor.amountText}
              </span>
              <span className="inline-flex items-center gap-0.5 border border-black bg-[#ffea79] px-1.5 py-0.5 font-mono text-[9px] font-bold text-black uppercase">
                <Sparkles className="size-2 text-black fill-current" /> APRESIASI
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <p className="font-mono text-[9px] text-center text-zinc-500 dark:text-zinc-400 leading-normal mt-4">
        * Donatur dapat memilih untuk menyembunyikan nominal atau nama (Anonymous) pada formulir donasi.
      </p>
    </div>
  );
}
