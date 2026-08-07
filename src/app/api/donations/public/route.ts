/**
 * @file    src/app/api/donations/public/route.ts
 * @brief   Server-side API route for returning safe public stats and appreciation wall gratitude logs
 * @author  ray
 * @created 2026-08-07
 * @todo    - Wire route options to respect HTTP caching headers for low-traffic static loads
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    // Step 1: Query aggregate stats for verified PAID donations
    // Using supabaseServer privileged client to safely execute aggregates
    const supabase = getSupabaseServer();
    const { data: statsData, error: statsError } = await supabase
      .from("donations")
      .select("amount")
      .eq("status", "paid");

    if (statsError || !statsData) {
      console.error("GET_PUBLIC_STATS_FAILED:", statsError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal mengambil data statistik." },
        { status: 500 }
      );
    }

    const totalCollected = statsData.reduce((sum, row) => sum + row.amount, 0);
    const donorCount = statsData.length;
    const target = 28000000;
    const progressPercentage = target > 0
      ? Math.min(Math.round((totalCollected / target) * 100), 100)
      : 0;

    // Step 2: Query public donations gratitude board list
    // public_donations table contains only the safe public projection populated via trigger
    const { data: donorsData, error: donorsError } = await supabase
      .from("public_donations")
      .select("id, display_name, amount, message, paid_at")
      .order("paid_at", { ascending: false })
      .limit(50); // limit to latest 50 for page performance

    if (donorsError || !donorsData) {
      console.error("GET_PUBLIC_DONORS_FAILED:", donorsError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal mengambil data apresiasi donatur." },
        { status: 500 }
      );
    }

    // Step 3: Format numbers and project safe payload
    const formattedDonors = donorsData.map((d) => ({
      id: d.id,
      name: d.display_name,
      message: d.message || undefined,
      amountText: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(d.amount),
      date: formatRelativeTime(d.paid_at),
    }));

    return NextResponse.json({
      stats: {
        target,
        totalCollected,
        donorCount,
        progressPercentage,
      },
      donors: formattedDonors,
    });
  } catch (error) {
    console.error("Unexpected error in public route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}

/**
 * Format timestamp relative to current execution time for localized display
 * @param dateStr ISO date string
 */
function formatRelativeTime(dateStr: string): string {
  try {
    const past = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMs = now - past;
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHrs < 24) return `${diffHrs} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  } catch {
    return "Baru saja";
  }
}
