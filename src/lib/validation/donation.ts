/**
 * @file    src/lib/validation/donation.ts
 * @brief   Input validation schema definitions using Zod for client-supplied donation payloads
 * @author  ray
 * @created 2026-08-07
 * @todo    - Add rules filtering profanity strings from donor messages
 */

import { z } from "zod";

export const donationCreateSchema = z.object({
  donorName: z
    .string()
    .trim()
    .min(1, "Nama donatur harus diisi.")
    .max(100, "Nama donatur maksimal 100 karakter."),
  donorEmail: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .or(z.literal(""))
    .optional(),
  amount: z
    .number({
      message: "Nominal donasi harus berupa angka.",
    })
    .int("Nominal donasi harus berupa bilangan bulat.")
    .min(1000, "Jumlah donasi minimal adalah Rp1.000.")
    .max(10000000, "Jumlah donasi maksimal adalah Rp10.000.000."),
  message: z
    .string()
    .trim()
    .max(150, "Pesan dukungan maksimal 150 karakter.")
    .optional()
    .default(""),
  showPublicName: z.boolean({
    message: "Konfirmasi persetujuan nama harus ditentukan.",
  }),
  showPublicMessage: z.boolean({
    message: "Konfirmasi persetujuan pesan harus ditentukan.",
  }),
});
