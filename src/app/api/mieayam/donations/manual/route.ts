/**
 * @file    src/app/api/mieayam/donations/manual/route.ts
 * @brief   Server-side API route for bulk inserting manual paid donations from the /mieayam dashboard
 * @author  opencode
 * @created 2026-08-20
 * @todo    None
 *
 * This route is dashboard-only and session-protected. It never touches the public
 * manual donation flow (/api/donations/manual), the Midtrans webhook, or QRIS flow.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/mieayam/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import {
  dashboardManualDonationSchema,
  MANUAL_DONATION_CONSTANTS,
  MAX_MANUAL_TRANSACTIONS,
} from "@/lib/validation/dashboardManualDonation";

interface PreparedTransaction {
  orderId: string;
  donorName: string;
  donorEmail: string | null;
  amount: number;
  paidAt: string;
  date: string;
  file: File | null;
}

/**
 * Generate an order id consistent with the existing manual flow: M-IFEST26-<unix>-<rand>.
 */
function generateOrderId(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `M-IFEST26-${timestamp}-${randomChars}`;
}

/**
 * Resolve the storage file extension based on the uploaded file's MIME type/name.
 */
function resolveExtension(file: File): string {
  if (
    file.type === "image/jpeg" ||
    file.name.endsWith(".jpg") ||
    file.name.endsWith(".jpeg")
  ) {
    return "jpg";
  }
  if (file.type === "image/png" || file.name.endsWith(".png")) {
    return "png";
  }
  return "webp";
}

/**
 * Build an ISO UTC timestamp from a WIB calendar date ("YYYY-MM-DD") using the
 * current WIB wall-clock time as the time component. Asia/Jakarta is fixed UTC+7.
 */
function buildPaidAtUtc(dateStr: string): string {
  const offsetMs = 7 * 60 * 60 * 1000;
  const wibNow = new Date(Date.now() + offsetMs);
  const hh = String(wibNow.getUTCHours()).padStart(2, "0");
  const mm = String(wibNow.getUTCMinutes()).padStart(2, "0");
  const ss = String(wibNow.getUTCSeconds()).padStart(2, "0");
  return new Date(`${dateStr}T${hh}:${mm}:${ss}+07:00`).toISOString();
}

/**
 * Best-effort removal of uploaded proof files from the private bucket.
 */
async function removeUploads(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  paths: { orderId: string; path: string }[]
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage
    .from("donation-proofs")
    .remove(paths.map((p) => p.path));
  if (error) {
    console.error("BULK_MANUAL_CLEANUP_STORAGE_FAILED:", error);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Session verification (dashboard auth is mandatory)
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServer();

    // 2. Parse multipart payload: `meta` JSON + optional `proof_<index>` files
    const formData = await request.formData();
    const metaRaw = formData.get("meta");
    if (typeof metaRaw !== "string" || metaRaw.length === 0) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Data transaksi tidak ditemukan." },
        { status: 400 }
      );
    }

    let meta: unknown;
    try {
      meta = JSON.parse(metaRaw);
    } catch {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Format data transaksi tidak valid." },
        { status: 400 }
      );
    }

    if (!Array.isArray(meta) || meta.length === 0) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Minimal satu transaksi harus diisi." },
        { status: 400 }
      );
    }

    if (meta.length > MAX_MANUAL_TRANSACTIONS) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: `Maksimal ${MAX_MANUAL_TRANSACTIONS} transaksi per penyimpanan.`,
        },
        { status: 400 }
      );
    }

    // 3. Validate every transaction and its optional proof file
    const prepared: PreparedTransaction[] = [];
    for (let i = 0; i < meta.length; i++) {
      const parsed = dashboardManualDonationSchema.safeParse(meta[i]);
      if (!parsed.success) {
        const message =
          parsed.error.issues[0]?.message || "Data transaksi tidak valid.";
        return NextResponse.json(
          { error: "BAD_REQUEST", message: `Transaksi #${i + 1}: ${message}` },
          { status: 400 }
        );
      }

      const tx = parsed.data;
      let file: File | null = null;

      if (tx.hasProof) {
        const uploaded = formData.get(`proof_${i}`);
        if (!(uploaded instanceof File) || uploaded.size === 0) {
          return NextResponse.json(
            {
              error: "BAD_REQUEST",
              message: `Transaksi #${i + 1}: file bukti transfer tidak ditemukan.`,
            },
            { status: 400 }
          );
        }
        if (!MANUAL_DONATION_CONSTANTS.ALLOWED_MIME_TYPES.includes(uploaded.type)) {
          return NextResponse.json(
            {
              error: "BAD_REQUEST",
              message: `Transaksi #${i + 1}: format bukti harus JPG, PNG, atau WebP.`,
            },
            { status: 400 }
          );
        }
        if (uploaded.size > MANUAL_DONATION_CONSTANTS.MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: "BAD_REQUEST",
              message: `Transaksi #${i + 1}: ukuran bukti transfer maksimal 5MB.`,
            },
            { status: 400 }
          );
        }
        file = uploaded;
      }

      const donorName = tx.donorName === "" ? MANUAL_DONATION_CONSTANTS.ANONYMOUS_NAME : tx.donorName;
      const donorEmail = tx.donorEmail || null;

      prepared.push({
        orderId: generateOrderId(),
        donorName,
        donorEmail,
        amount: tx.amount,
        paidAt: buildPaidAtUtc(tx.date),
        date: tx.date,
        file,
      });
    }

    // 4. Upload all proof files first (track paths for rollback)
    const uploadedPaths: { orderId: string; path: string }[] = [];
    for (const tx of prepared) {
      if (!tx.file) continue;

      const ext = resolveExtension(tx.file);
      const [year, month] = tx.date.split("-");
      const path = `${year}/${month}/${tx.orderId}/${crypto.randomUUID()}.${ext}`;
      const buffer = await tx.file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("donation-proofs")
        .upload(path, buffer, {
          contentType: tx.file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(`[${tx.orderId}] BULK_MANUAL_UPLOAD_FAILED:`, uploadError);
        await removeUploads(supabase, uploadedPaths);
        return NextResponse.json(
          {
            error: "INTERNAL_SERVER_ERROR",
            message: "Gagal mengunggah bukti transfer ke server.",
          },
          { status: 500 }
        );
      }

      uploadedPaths.push({ orderId: tx.orderId, path });
    }

    const pathByOrder = new Map(uploadedPaths.map((u) => [u.orderId, u.path]));
    const orderIds = prepared.map((tx) => tx.orderId);

    // 5. Insert all rows as pending (single batch). The existing AFTER UPDATE
    // trigger (pending -> paid) creates the public_donations projection per row.
    const rows = prepared.map((tx) => ({
      order_id: tx.orderId,
      donor_name: tx.donorName,
      donor_email: tx.donorEmail,
      amount: tx.amount,
      message: null,
      show_public_name: tx.donorName !== MANUAL_DONATION_CONSTANTS.ANONYMOUS_NAME,
      show_public_message: false,
      status: MANUAL_DONATION_CONSTANTS.STATUS_PENDING,
      payment_method: MANUAL_DONATION_CONSTANTS.PAYMENT_METHOD,
      proof_storage_path: pathByOrder.get(tx.orderId) ?? null,
      expires_at: tx.paidAt,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("donations")
      .insert(rows)
      .select("id, order_id");

    if (insertError || !inserted) {
      console.error("BULK_MANUAL_INSERT_FAILED:", insertError);
      await removeUploads(supabase, uploadedPaths);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal menyimpan data donasi di server." },
        { status: 500 }
      );
    }

    // 6. Transition each row pending -> paid (per-row because paid_at differs).
    const paidIds: string[] = [];
    for (const tx of prepared) {
      const { error: updateError } = await supabase
        .from("donations")
        .update({ status: MANUAL_DONATION_CONSTANTS.STATUS_PAID, paid_at: tx.paidAt })
        .eq("order_id", tx.orderId)
        .eq("status", MANUAL_DONATION_CONSTANTS.STATUS_PENDING);

      if (updateError) {
        console.error(`[${tx.orderId}] BULK_MANUAL_UPDATE_FAILED:`, updateError);
        // Rollback: remove public projection rows for already-paid rows, delete
        // all inserted donation rows, and remove all uploaded proof files.
        if (paidIds.length > 0) {
          await supabase.from("public_donations").delete().in("id", paidIds);
        }
        await supabase.from("donations").delete().in("order_id", orderIds);
        await removeUploads(supabase, uploadedPaths);
        return NextResponse.json(
          { error: "INTERNAL_SERVER_ERROR", message: "Gagal menyimpan data donasi di server." },
          { status: 500 }
        );
      }

      const row = inserted.find((r) => r.order_id === tx.orderId);
      if (row) paidIds.push(row.id);
    }

    const totalAmount = prepared.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(
      `[BULK_MANUAL] CREATE_MANUAL_DONATIONS_SUCCESS: Count: ${prepared.length}, Total: ${totalAmount}`
    );

    // 7. Return successful result
    return NextResponse.json(
      {
        success: true,
        count: prepared.length,
        totalAmount,
        orderIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/mieayam/donations/manual route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}