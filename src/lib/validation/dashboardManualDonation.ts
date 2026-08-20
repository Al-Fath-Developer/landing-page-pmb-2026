/**
 * @file    src/lib/validation/dashboardManualDonation.ts
 * @brief   Server-side validation schema for dashboard manual donation entries (bendahara)
 * @author  opencode
 * @created 2026-08-20
 * @todo    None
 */

import { z } from "zod";

/**
 * Maximum number of transactions allowed per manual bulk insert request.
 * Guards against excessive memory usage and abuse.
 */
export const MAX_MANUAL_TRANSACTIONS = 50;

/**
 * Validates that a string is a real calendar date in "YYYY-MM-DD" format
 * (e.g. rejects 2026-02-30).
 */
export function isValidWibDateString(dateStr: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Per-transaction schema for dashboard manual donation entries.
 *
 * Only the raw client-supplied fields are validated here:
 * - donorName  : optional, trimmed, max 100 chars (empty -> "Donatur Anonim")
 * - donorEmail : optional, max 255 chars, must be a valid email when filled
 * - date       : required WIB calendar date "YYYY-MM-DD" (source of paid_at)
 * - amount     : required integer within the donations table constraint
 * - hasProof   : whether a proof file is attached at `proof_<index>`
 */
export const dashboardManualDonationSchema = z.object({
  donorName: z
    .string()
    .trim()
    .max(100, "Nama donatur maksimal 100 karakter.")
    .default(""),
  donorEmail: z
    .string()
    .trim()
    .max(255, "Email maksimal 255 karakter.")
    .email("Format email tidak valid.")
    .or(z.literal(""))
    .optional(),
  date: z
    .string({ message: "Tanggal wajib diisi." })
    .refine(isValidWibDateString, "Format tanggal tidak valid (YYYY-MM-DD)."),
  amount: z
    .number({ message: "Nominal wajib diisi." })
    .int("Nominal harus berupa angka bulat.")
    .min(1000, "Nominal minimal Rp1.000.")
    .max(10000000, "Nominal maksimal Rp10.000.000."),
  hasProof: z.boolean().default(false),
});

export const ALLOWED_MIME_TYPES: string[] = ["image/jpeg", "image/png", "image/webp"];

/**
 * Server-set business rules for every manual donation row.
 */
export const MANUAL_DONATION_CONSTANTS = {
  ANONYMOUS_NAME: "Donatur Anonim",
  PAYMENT_METHOD: "manual",
  STATUS_PAID: "paid",
  STATUS_PENDING: "pending",
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES,
} as const;