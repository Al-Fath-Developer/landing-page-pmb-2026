/**
 * @file    src/components/LiveDonorBoard.tsx
 * @brief   Client-side donor appreciation board that fetches live public donations on mount (top 6)
 * @author  ray
 * @created 2026-08-08
 * @todo    - Support realtime refresh via Supabase channel to avoid full re-fetch
 */

"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import DonorCard from "@/components/DonorCard";
import { DonorRecord } from "@/types/donation";

const HOMEPAGE_DONOR_LIMIT = 6;

interface PublicDonorsResponse {
  donors: DonorRecord[];
}

export default function LiveDonorBoard() {
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    const loadDonors = async () => {
      try {
        const response = await fetch(`/api/donations/public?limit=${HOMEPAGE_DONOR_LIMIT}`);
        if (!response.ok) throw new Error(`Unexpected status ${response.status}`);

        const data: PublicDonorsResponse = await response.json();
        if (!isMounted) return;

        setDonors(data.donors?.slice(0, HOMEPAGE_DONOR_LIMIT) ?? []);
        setStatus("ready");
      } catch (err) {
        console.error("Failed to fetch live donor board:", err);
        if (isMounted) setStatus("error");
      }
    };

    loadDonors();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 border-b-[3px] border-black pb-3 dark:border-zinc-700">
        <Heart className="size-5 text-red-500 fill-current" />
        <h3 className="font-heading text-lg tracking-tight uppercase text-black dark:text-white">
          PAPAN APRESIASI DONATUR
        </h3>
      </div>

      {status === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Memuat donatur">
          {Array.from({ length: HOMEPAGE_DONOR_LIMIT }).map((_, i) => (
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

      {status === "ready" && donors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {donors.map((donor) => (
            <DonorCard key={donor.id} donor={donor} />
          ))}
        </div>
      )}

      {status === "ready" && donors.length === 0 && (
        <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400">
          Belum ada donasi yang tercatat. Jadilah yang pertama!
        </p>
      )}

      {status === "error" && (
        <p className="font-sans text-xs text-red-500 dark:text-red-400">
          Gagal memuat papan apresiasi donatur. Silakan muat ulang halaman.
        </p>
      )}

      <p className="font-mono text-[9px] text-center text-zinc-500 dark:text-zinc-400 leading-normal mt-4">
        * Donatur dapat memilih untuk menyembunyikan nominal atau nama (Anonymous) pada formulir donasi.
      </p>
    </div>
  );
}
