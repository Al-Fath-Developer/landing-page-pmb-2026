/**
 * @file    src/components/DonationNotification.tsx
 * @brief   Render real-time floating Neo-Brutalist notifications of webhook-verified PAID donations
 * @author  ray
 * @created 2026-08-07
 * @todo    - Wire to Supabase Realtime channel for live production events
 */

"use client";

import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";

interface PublicDonation {
  id: string;
  name: string;
  amount: number;
  message?: string;
}

const mockLiveDonations: PublicDonation[] = [
  { id: "1", name: "Rizky A.", amount: 50000, message: "Semoga berkah untuk semua!" },
  { id: "2", name: "Donatur Anonim", amount: 100000 },
  { id: "3", name: "Siti Sarah", amount: 25000, message: "Terus semangat berkreasi!" },
  { id: "4", name: "Donatur Anonim", amount: 150000, message: "Tumbuh Bersama, Mengukir Karya!" }
];

export default function DonationNotification() {
  const [activeDonation, setActiveDonation] = useState<PublicDonation | null>(null);

  useEffect(() => {
    // Show a mock donation alert every 12 seconds
    const triggerNotification = (index: number) => {
      setActiveDonation(mockLiveDonations[index]);

      // Hide after 5 seconds
      const hideTimeout = setTimeout(() => {
        setActiveDonation(null);
      }, 5000);

      return hideTimeout;
    };

    let currentIndex = 0;
    
    // Initial delay before first trigger
    const initialTimeout = setTimeout(() => {
      const hide = triggerNotification(currentIndex);
      
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % mockLiveDonations.length;
        triggerNotification(currentIndex);
      }, 15000);

      return () => {
        clearTimeout(hide);
        clearInterval(interval);
      };
    }, 4000);

    return () => clearTimeout(initialTimeout);
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!activeDonation) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-[calc(100vw-32px)] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce dark:bg-[#1e1e1e] dark:text-white">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center border-[2px] border-black bg-accent-orange text-white">
          <Heart className="size-5 fill-current text-white animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-heading text-xs uppercase tracking-tight truncate">
              {activeDonation.name}
            </span>
            <span className="inline-flex items-center gap-0.5 border border-black bg-accent-blue px-1.5 py-0.2 font-mono text-[8px] font-bold text-white uppercase shrink-0">
              <Sparkles className="size-2 text-yellow-300 fill-current" /> BARU
            </span>
          </div>
          <p className="mt-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Mendonasikan {formatRupiah(activeDonation.amount)}
          </p>
          {activeDonation.message && (
            <p className="mt-1 font-mono text-[10px] leading-normal text-zinc-500 dark:text-zinc-400 italic">
              &ldquo;{activeDonation.message}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
