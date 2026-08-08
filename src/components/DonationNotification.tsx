/**
 * @file    src/components/DonationNotification.tsx
 * @brief   Live Neo-Brutalist toast notification driven by Supabase Realtime INSERTs on public_donations
 * @author  ray
 * @created 2026-08-08
 * @todo    - none
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Sparkles, X } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";

interface LiveDonation {
  id: string;
  displayName: string;
  amount: number;
  message?: string | null;
}

const AUTO_DISMISS_MS = 6000;
const EXIT_ANIMATION_MS = 300;

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DonationNotification() {
  const [notification, setNotification] = useState<LiveDonation | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leavingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShownId = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    if (leavingTimer.current) {
      clearTimeout(leavingTimer.current);
      leavingTimer.current = null;
    }
  }, []);

  const hideNotification = useCallback(() => {
    if (!notification) return;
    setIsLeaving(true);
    leavingTimer.current = setTimeout(() => {
      setNotification(null);
      setIsLeaving(false);
    }, EXIT_ANIMATION_MS);
  }, [notification]);

  const showNotification = useCallback(
    (donation: LiveDonation) => {
      // Deduplicate re-emitted INSERTs for the same donation id
      if (donation.id === lastShownId.current) return;
      lastShownId.current = donation.id;

      clearTimers();
      setIsLeaving(false);
      setNotification(donation);
      dismissTimer.current = setTimeout(hideNotification, AUTO_DISMISS_MS);
    },
    [clearTimers, hideNotification]
  );

  useEffect(() => {
    const channel = supabaseClient
      .channel("public-donations-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_donations" },
        (payload) => {
          const row = payload.new as {
            id?: string;
            display_name?: string;
            amount?: number;
            message?: string | null;
          };

          if (!row || typeof row.id !== "string") return;

          const amount = Number(row.amount);
          if (!Number.isFinite(amount) || amount <= 0) return;

          showNotification({
            id: row.id,
            displayName: row.display_name || "Donatur Anonim",
            amount,
            message: row.message || null,
          });
        }
      )
      .subscribe();

    return () => {
      clearTimers();
      supabaseClient.removeChannel(channel);
    };
  }, [showNotification, clearTimers]);

  if (!notification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 z-[9999] max-w-sm border-[3px] border-black bg-white p-4 shadow-shadow sm:bottom-6 sm:left-auto sm:right-6 dark:bg-[#1e1e1e] dark:text-white ${
        isLeaving ? "animate-notif-out" : "animate-notif-in"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center border-[2px] border-black bg-accent-orange text-white">
          <Heart className="size-5 animate-pulse fill-current text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-heading text-[10px] uppercase tracking-tight text-zinc-500">
              Donasi Baru
            </span>
            <span className="inline-flex shrink-0 items-center gap-0.5 border border-black bg-accent-blue px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-white">
              <Sparkles className="size-2 fill-current text-yellow-300" /> BARU
            </span>
          </div>

          <p className="mt-1 truncate font-heading text-sm uppercase tracking-tight">
            {notification.displayName}
          </p>

          <p className="mt-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(notification.amount)}
          </p>

          {notification.message && (
            <p className="mt-1 line-clamp-2 font-mono text-[10px] italic leading-normal text-zinc-500 dark:text-zinc-400">
              &ldquo;{notification.message}&rdquo;
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label="Tutup notifikasi"
          onClick={hideNotification}
          className="flex size-11 shrink-0 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-black hover:text-white dark:bg-[#2e2e2e] dark:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
