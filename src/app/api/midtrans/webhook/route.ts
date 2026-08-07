/**
 * @file    src/app/api/midtrans/webhook/route.ts
 * @brief   Server-side API route for processing Midtrans payment notifications with cryptographic signature checks
 * @author  ray
 * @created 2026-08-07
 * @todo    - Enable fallback status query call if webhook signatures fail under proxy configs
 */

import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { MidtransNotificationPayload, DonationStatus } from "@/types/donation";

function verifySignature(payload: MidtransNotificationPayload, serverKey: string): boolean {
  const { order_id, status_code, gross_amount, signature_key } = payload;
  
  const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const computedHash = createHash("sha512").update(rawString).digest("hex");

  // Constant-time comparison to prevent timing side-channel attacks
  try {
    return timingSafeEqual(
      Buffer.from(computedHash, "utf-8"),
      Buffer.from(signature_key, "utf-8")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MidtransNotificationPayload;
    
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
    } = payload;

    // Step 1: Payload sanity checks
    if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status) {
      console.warn("[WEBHOOK_REJECT] Missing required notification fields.");
      return NextResponse.json({ error: "BAD_REQUEST", message: "Missing fields." }, { status: 400 });
    }

    // Step 2: Signature key check
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!verifySignature(payload, serverKey)) {
      console.warn(`[${order_id}] WEBHOOK_SIGNATURE_MISMATCH. Raw:`, payload);
      return NextResponse.json({ error: "UNAUTHORIZED", message: "Invalid signature key hash." }, { status: 401 });
    }

    console.log(`[${order_id}] WEBHOOK_RECEIVED: Status: ${transaction_status}, Amount: ${gross_amount}`);

    // Step 3: Find corresponding donation in database
    const supabase = getSupabaseServer();
    const { data: donation, error: dbError } = await supabase
      .from("donations")
      .select("id, amount, status")
      .eq("order_id", order_id)
      .maybeSingle();

    if (dbError || !donation) {
      console.error(`[${order_id}] WEBHOOK_ORDER_NOT_FOUND:`, dbError);
      return NextResponse.json({ error: "NOT_FOUND", message: "Donation record not found." }, { status: 404 });
    }

    // Step 4: Validate gross amount matches stored amount (tampering protection)
    const expectedAmount = donation.amount;
    const notifiedAmount = Math.round(parseFloat(gross_amount));

    if (expectedAmount !== notifiedAmount) {
      console.warn(`[${order_id}] WEBHOOK_AMOUNT_MISMATCH: Stored: ${expectedAmount}, Received: ${notifiedAmount}`);
      return NextResponse.json({ error: "UNPROCESSABLE_ENTITY", message: "Gross amount mismatch." }, { status: 422 });
    }

    // Step 5: Handle Idempotency (paid is terminal)
    if (donation.status === "paid") {
      console.log(`[${order_id}] WEBHOOK_DUPLICATE: Payment already processed.`);
      return NextResponse.json({ message: "Notification handled (idempotent)." }, { status: 200 });
    }

    // Step 6: Map Midtrans status to internal application state
    let targetStatus: DonationStatus = "pending";
    let paidAt: string | null = null;

    if (transaction_status === "settlement" || transaction_status === "capture") {
      targetStatus = "paid";
      paidAt = payload.settlement_time || new Date().toISOString();
    } else if (transaction_status === "expire") {
      targetStatus = "expired";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "failure"
    ) {
      targetStatus = "failed";
    }

    // Step 7: Atomic status update
    if (targetStatus !== donation.status) {
      const updatePayload: Record<string, string | null> = {
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };

      if (targetStatus === "paid") {
        updatePayload.paid_at = paidAt;
        updatePayload.midtrans_transaction_id = transaction_id;
      }

      // Perform update verifying row state remains pending to avoid race updates
      const { data: updatedDonation, error: updateError } = await supabase
        .from("donations")
        .update(updatePayload)
        .eq("order_id", order_id)
        .eq("status", "pending")
        .select("status");

      if (updateError) {
        console.error(`[${order_id}] DB_TRANSITION_FAILED:`, updateError);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR", message: "Database update error." }, { status: 500 });
      }

      // Check if update was actually performed (rows updated)
      const didTransition = updatedDonation && updatedDonation.length > 0;
      if (didTransition) {
        console.log(`[${order_id}] WEBHOOK_STATE_TRANSITION: status from pending to ${targetStatus}`);
      } else {
        // Row was modified by another request concurrently
        console.log(`[${order_id}] WEBHOOK_CONCURRENT_RACE: State modification ignored.`);
      }
    }

    return NextResponse.json({ message: "Notification processed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in webhook route handler:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR", message: "Internal server error." }, { status: 500 });
  }
}
