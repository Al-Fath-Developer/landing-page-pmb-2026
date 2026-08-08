/**
 * @file    src/app/api/mieayam/donations/[id]/route.ts
 * @brief   Server-side API route for fetching individual paid donation details and generating secure short-lived proof transfer signed URLs
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/mieayam/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    // 1. Session verification
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "ID transaksi tidak valid." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // 2. Fetch specific donation details
    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (dbError) {
      console.error(`[${id}] Fetch donation detail failed:`, dbError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal memproses query database." },
        { status: 500 }
      );
    }

    if (!donation) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Confirm status = paid (security scope constraint)
    if (donation.status !== "paid") {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Hanya detail transaksi sukses (paid) yang dapat diakses." },
        { status: 403 }
      );
    }

    // 4. Generate secure short-lived signed URL for payment proof if available
    let proofSignedUrl: string | null = null;
    if (donation.proof_storage_path) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from("donation-proofs")
        .createSignedUrl(donation.proof_storage_path, 300); // 5 minutes expiration (300 seconds)

      if (signedError || !signedData) {
        console.error(`[${id}] Generate signed URL failed for path ${donation.proof_storage_path}:`, signedError);
      } else {
        proofSignedUrl = signedData.signedUrl;
      }
    }

    // 5. Return safe payload to client
    return NextResponse.json({
      id: donation.id,
      orderId: donation.order_id,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email || "-",
      amount: donation.amount,
      message: donation.message || "",
      showPublicName: donation.show_public_name,
      showPublicMessage: donation.show_public_message,
      status: donation.status,
      paymentMethod: donation.payment_method,
      midtransTransactionId: donation.midtrans_transaction_id || "-",
      proofStoragePath: donation.proof_storage_path || null,
      proofSignedUrl,
      createdAt: donation.created_at,
      updatedAt: donation.updated_at,
      paidAt: donation.paid_at,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/mieayam/donations/[id] route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
