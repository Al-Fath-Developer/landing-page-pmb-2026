/**
 * @file    src/lib/publicDonors.ts
 * @brief   Server-side utility for querying public appreciation board details from public_donations database table
 * @author  ray
 * @created 2026-08-07
 * @todo    - Coordinate pagination offsets for large public boards
 */

import { getSupabaseServer } from "@/lib/supabaseServer";
import { DonorRecord } from "@/types/donation";

interface DBPublicDonor {
  id: string;
  display_name: string;
  amount: number;
  message: string | null;
  paid_at: string;
}

/**
 * Retrieve public donors list from Supabase projection table
 * @param limit maximum donor items
 */
export async function getPublicDonors(limit = 6): Promise<DonorRecord[]> {
  try {
    const supabase = getSupabaseServer();
    const { data: donorsData, error } = await supabase
      .from("public_donations")
      .select("id, display_name, amount, message, paid_at")
      .order("paid_at", { ascending: false })
      .limit(limit);

    if (error || !donorsData) {
      console.error("Failed to query public donors list from database:", error);
      return [];
    }

    const typedDonors = donorsData as DBPublicDonor[];
    return typedDonors.map((d) => ({
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
  } catch (err) {
    console.error("Unexpected error in getPublicDonors:", err);
    return [];
  }
}

/**
 * Helper to format absolute timestamps relatively
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
