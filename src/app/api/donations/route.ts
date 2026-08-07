/**
 * @file    src/app/api/donations/route.ts
 * @brief   Server-side API route for validating client requests, storing pending orders, and charging Midtrans QRIS
 * @author  ray
 * @created 2026-08-07
 * @todo    - Incorporate standard rate-limiting metadata checks inside the validation pipeline
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { chargeQRIS } from "@/lib/midtrans";
import { donationCreateSchema } from "@/lib/validation/donation";
import { DonationCreateInput } from "@/types/donation";

function generateOrderId(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IFEST26-${timestamp}-${randomChars}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Step 1: Input Validation
    const validationResult = donationCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Invalid payload parameters.";
      return NextResponse.json(
        { error: "BAD_REQUEST", message: firstError },
        { status: 400 }
      );
    }

    const input = validationResult.data as DonationCreateInput;
    const orderId = generateOrderId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes expiration window

    // Step 2: Persist pending transaction row in Database (Audit trail)
    const supabase = getSupabaseServer();
    const { data: dbData, error: dbError } = await supabase
      .from("donations")
      .insert({
        order_id: orderId,
        donor_name: input.donorName,
        donor_email: input.donorEmail || null,
        amount: input.amount,
        message: input.message || null,
        show_public_name: input.showPublicName,
        show_public_message: input.showPublicMessage,
        status: "pending",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (dbError || !dbData) {
      console.error(`[${orderId}] DB_INSERT_FAILED:`, dbError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal menyimpan data donasi di server." },
        { status: 500 }
      );
    }

    console.log(`[${orderId}] CREATE_DONATION_REQUEST: Amount: ${input.amount}`);

    // Step 3: Initiate Core API QRIS charge call to Midtrans
    try {
      const chargeResponse = await chargeQRIS(orderId, input.amount);

      // Find the QR generation action block
      const qrAction = chargeResponse.actions.find((action) => action.name === "generate-qr-code");
      if (!qrAction) {
        throw new Error("Missing generate-qr-code action in Midtrans QRIS charge response.");
      }

      const qrisUrl = qrAction.url;
      const qrisString = qrAction.qr_string || "";

      // Step 4: Update row with generated QRIS metadata
      const { error: updateError } = await supabase
        .from("donations")
        .update({
          midtrans_transaction_id: chargeResponse.transaction_id,
          qris_url: qrisUrl,
          qris_string: qrisString,
        })
        .eq("id", dbData.id);

      if (updateError) {
        console.error(`[${orderId}] DB_METADATA_UPDATE_FAILED:`, updateError);
      }

      console.log(`[${orderId}] MIDTRANS_CHARGE_SUCCESS: TransactionId: ${chargeResponse.transaction_id}`);

      // Step 5: Return safe payload to client
      return NextResponse.json(
        {
          orderId,
          amount: input.amount,
          qrisUrl,
          qrisString,
          expiresAt,
        },
        { status: 201 }
      );
    } catch (paymentError) {
      console.error(`[${orderId}] MIDTRANS_API_CHARGE_FAILED:`, paymentError);

      // Step 6: Mark row as failed on upstream network partitions to maintain audit records
      await supabase
        .from("donations")
        .update({ status: "failed" })
        .eq("id", dbData.id);

      return NextResponse.json(
        {
          error: "BAD_GATEWAY",
          message: "Gagal terhubung dengan gerbang pembayaran Midtrans. Silakan coba kembali.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Unexpected failure in POST /api/donations route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
