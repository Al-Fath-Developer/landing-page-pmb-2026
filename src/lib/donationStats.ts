/**
 * @file    src/lib/donationStats.ts
 * @brief   Server-side utility for querying aggregated campaign totals from Supabase database
 * @author  ray
 * @created 2026-08-07
 * @todo    - Enable database caching layer for statistics queries
 */

import { getSupabaseServer } from "@/lib/supabaseServer";

export interface PublicCampaignStats {
  target: number;
  totalCollected: number;
  donorCount: number;
  progressPercentage: number;
}

/**
 * Query database and calculate campaign totals
 */
export async function getCampaignStats(): Promise<PublicCampaignStats> {
  const target = 28000000;

  try {
    const supabase = getSupabaseServer();
    const { data: statsData, error } = await supabase
      .from("donations")
      .select("amount")
      .eq("status", "paid");

    if (error || !statsData) {
      console.error("Failed to query campaign stats from database:", error);
      return {
        target,
        totalCollected: 0,
        donorCount: 0,
        progressPercentage: 0,
      };
    }

    const typedStats = statsData as { amount: number }[];
    const totalCollected = typedStats.reduce((sum: number, row) => sum + row.amount, 0);
    const donorCount = typedStats.length;
    const progressPercentage = target > 0
      ? Math.min(Number(((totalCollected / target) * 100).toFixed(2)), 100)
      : 0;

    return {
      target,
      totalCollected,
      donorCount,
      progressPercentage,
    };
  } catch (err) {
    console.error("Unexpected error in getCampaignStats:", err);
    return {
      target,
      totalCollected: 0,
      donorCount: 0,
      progressPercentage: 0,
    };
  }
}
