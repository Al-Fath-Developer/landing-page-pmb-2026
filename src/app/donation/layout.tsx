/**
 * @file    src/app/donation/layout.tsx
 * @brief   Server-rendered layout wrapper for the donation route to provide metadata configuration
 * @author  ray
 * @created 2026-08-08
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donasi",
  description:
    "Dukung perjalanan PMB I-FEST 2026 dan penyambutan mahasiswa baru muslim Telkom University.",
  openGraph: {
    title: "Donasi | PMB I-FEST 2026",
    description:
      "Dukung perjalanan PMB I-FEST 2026 dan penyambutan mahasiswa baru muslim Telkom University.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "PMB I-FEST 2026",
      },
    ],
  },
};

export default function DonationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
