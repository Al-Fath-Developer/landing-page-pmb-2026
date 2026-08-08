/**
 * @file    src/lib/validation/manualDonation.ts
 * @brief   Server-side validation schema for V2 manual donations
 * @author  ray
 * @created 2026-08-08
 */

import { z } from "zod";

export const manualDonationSchema = z.object({
  donorName: z
    .string()
    .trim()
    .min(1, "Nama donatur harus diisi.")
    .max(100, "Nama donatur maksimal 100 karakter."),
  donorEmail: z
    .string()
    .trim()
    .max(255, "Email maksimal 255 karakter.")
    .email("Format email tidak valid.")
    .or(z.literal(""))
    .optional(),
  amount: z
    .number({ message: "Nominal donasi harus diisi." })
    .int("Nominal donasi harus berupa angka bulat.")
    .min(1000, "Jumlah donasi minimal adalah Rp1.000.")
    .max(10000000, "Jumlah donasi maksimal adalah Rp10.000.000."),
  message: z
    .string()
    .trim()
    .max(150, "Pesan / doa maksimal 150 karakter.")
    .optional(),
  isAnonymous: z
    .boolean({ message: "Status anonimitas harus diisi." })
    .default(false),
});
