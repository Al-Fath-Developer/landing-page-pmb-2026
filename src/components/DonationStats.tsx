/**
 * @file    src/components/DonationStats.tsx
 * @brief   Render donation campaign statistics (collected, target, progress bar)
 * @author  ray
 * @created 2026-08-07
 * @todo    - Add counting transition animation for stats values
 */

"use client";

import { useMemo } from "react";
import { Heart, Target, Users, ArrowUpRight } from "lucide-react";

interface DonationStatsProps {
  totalDonated: number;
  targetAmount: number;
  donorCount: number;
  showLinkToDonation?: boolean;
}

export default function DonationStats({
  totalDonated,
  targetAmount,
  donorCount,
  showLinkToDonation = false,
}: DonationStatsProps) {
  // Format numbers to Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const progressPercent = useMemo(() => {
    if (targetAmount <= 0) return 0;
    const pct = (totalDonated / targetAmount) * 100;
    return Math.min(pct, 100);
  }, [totalDonated, targetAmount]);

  const rawProgressPercent = useMemo(() => {
    if (targetAmount <= 0) return "0";
    const pct = (totalDonated / targetAmount) * 100;
    if (pct > 0 && pct < 1) {
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(pct);
    }
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(Math.min(pct, 100));
  }, [totalDonated, targetAmount]);

  return (
    <div className="border-[4px] border-black bg-white p-6 sm:p-8 shadow-shadow-large dark:bg-[#1e1e1e]">
      {/* Target & Total Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Total Terkumpul */}
        <div className="border-[3px] border-black bg-accent-blue p-4 text-white shadow-shadow">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider opacity-90">
            <Heart className="size-4 fill-current text-red-500" />
            TERKUMPUL
          </div>
          <div className="mt-1 font-heading text-lg sm:text-xl lg:text-2xl tracking-tight">
            {formatRupiah(totalDonated)}
          </div>
        </div>

        {/* Target Pendanaan */}
        <div className="border-[3px] border-black bg-white p-4 text-black shadow-shadow dark:bg-[#2e2e2e] dark:text-white">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider opacity-85">
            <Target className="size-4 text-black dark:text-white" />
            TARGET KAMPANYE
          </div>
          <div className="mt-1 font-heading text-lg sm:text-xl lg:text-2xl tracking-tight">
            {formatRupiah(targetAmount)}
          </div>
        </div>

        {/* Jumlah Donatur */}
        <div className="border-[3px] border-black bg-white p-4 text-black shadow-shadow dark:bg-[#2e2e2e] dark:text-white">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider opacity-85">
            <Users className="size-4 text-black dark:text-white" />
            JUMLAH DONATUR
          </div>
          <div className="mt-1 font-heading text-lg sm:text-xl lg:text-2xl tracking-tight">
            {donorCount} <span className="font-mono text-[10px] font-normal">ORANG</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Area */}
      <div className="mt-8">
        <div className="flex items-center justify-between font-heading text-xs uppercase tracking-wide">
          <span>Progres Penggalangan Dana</span>
          <span className="bg-black text-white px-2.5 py-0.5 text-xs font-mono dark:bg-white dark:text-black">
            {rawProgressPercent}%
          </span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="mt-2 h-8 w-full border-[3px] border-black bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-[#222]">
          <div
            className="h-full border-r-[3px] border-black bg-accent-green transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Campaign Summary & Optional Action */}
      {showLinkToDonation && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t-[3px] border-black pt-6 sm:flex-row dark:border-zinc-700">
          <p className="font-mono text-[9px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            * Data di atas adalah data visual kampanye PMB I-FEST 2026.
          </p>
          <a
            href="/donation"
            className="group flex items-center gap-1 border-[3px] border-black bg-accent-orange px-4 py-2 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:bg-accent-orange/95 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            DONASI SEKARANG <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      )}
    </div>
  );
}
