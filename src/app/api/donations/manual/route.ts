/**
 * @file    src/app/api/donations/manual/route.ts
 * @brief   Server-side API route for processing V2 manual donations and uploading proof of transfer
 * @author  ray
 * @created 2026-08-08
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { manualDonationSchema } from "@/lib/validation/manualDonation";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const donorName = (formData.get("donorName") as string) || "";
    const donorEmail = (formData.get("donorEmail") as string) || "";
    const amountVal = formData.get("amount") ? Number(formData.get("amount")) : undefined;
    const message = (formData.get("message") as string) || "";
    const isAnonymous = formData.get("isAnonymous") === "true";
    const file = formData.get("proof") as File | null;

    // Step 1: Validate text fields using Zod
    const validation = manualDonationSchema.safeParse({
      donorName,
      donorEmail,
      amount: amountVal,
      message,
      isAnonymous,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input parameters.";
      return NextResponse.json(
        { error: "BAD_REQUEST", message: firstError },
        { status: 400 }
      );
    }

    // Step 2: Validate payment proof file
    if (!file) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Bukti transfer wajib diunggah." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Ukuran bukti transfer maksimal adalah 5MB." },
        { status: 400 }
      );
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Format berkas bukti transfer harus berupa JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    // Step 3: Generate order ID and define file path details
    const timestamp = Math.floor(Date.now() / 1000);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `M-IFEST26-${timestamp}-${randomChars}`;

    let ext = "webp";
    if (file.type === "image/jpeg" || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) {
      ext = "jpg";
    } else if (file.type === "image/png" || file.name.endsWith(".png")) {
      ext = "png";
    }

    const uuid = crypto.randomUUID();
    const filePath = `2026/08/${orderId}/${uuid}.${ext}`;
    const fileBuffer = await file.arrayBuffer();

    // Step 4: Setup Supabase server privileged client
    const supabase = getSupabaseServer();

    // Step 5: Upload proof image to Supabase Storage (Private Bucket)
    const { error: uploadError } = await supabase.storage
      .from("donation-proofs")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`[${orderId}] SUPABASE_UPLOAD_FAILED:`, uploadError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal mengunggah bukti transfer ke server." },
        { status: 500 }
      );
    }

    // Step 6: Insert manual donation record into Supabase PostgreSQL donations table
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { data: dbData, error: dbError } = await supabase
      .from("donations")
      .insert({
        order_id: orderId,
        donor_name: donorName,
        donor_email: donorEmail || null,
        amount: amountVal,
        message: message || null,
        show_public_name: !isAnonymous,
        show_public_message: true,
        status: "submitted",
        payment_method: "manual",
        proof_storage_path: filePath,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (dbError || !dbData) {
      console.error(`[${orderId}] DB_INSERT_FAILED:`, dbError);
      // Storage Cleanup Strategy: remove orphaned file
      await supabase.storage.from("donation-proofs").remove([filePath]);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal menyimpan data donasi di server." },
        { status: 500 }
      );
    }

    console.log(`[${orderId}] CREATE_MANUAL_DONATION_SUCCESS: Amount: ${amountVal}`);

    // Step 7: Return successful response to client
    return NextResponse.json(
      {
        success: true,
        orderId,
        amount: amountVal,
        donorName: isAnonymous ? "Hamba Allah" : donorName,
        donorEmail: donorEmail || undefined,
        message: message || undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/donations/manual endpoint handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
