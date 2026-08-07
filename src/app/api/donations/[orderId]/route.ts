/**
 * @file    src/app/api/donations/[orderId]/route.ts
 * @brief   Server-side API route for querying safe donation payment status information
 * @author  ray
 * @created 2026-08-07
 * @todo    - Enable caching headers for expired and paid terminal states
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { DonationStatus } from "@/types/donation";

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(request: Request, props: RouteParams) {
  const { orderId } = await props.params;

  if (!orderId) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Order ID tidak valid." },
      { status: 400 }
    );
  }

  try {
    // Fetch row from Supabase Server client (privileged role)
    const supabase = getSupabaseServer();
    const { data: donation, error } = await supabase
      .from("donations")
      .select("order_id, status, expires_at, paid_at")
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) {
      console.error(`[${orderId}] GET_STATUS_DB_QUERY_FAILED:`, error);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal memproses query database." },
        { status: 500 }
      );
    }

    if (!donation) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Data donasi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Return safe data projection
    return NextResponse.json({
      orderId: donation.order_id,
      status: donation.status as DonationStatus,
      expiresAt: donation.expires_at,
      paidAt: donation.paid_at || null,
    });
  } catch (error) {
    console.error(`Unexpected failure in GET /api/donations/[orderId] for ${orderId}:`, error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
