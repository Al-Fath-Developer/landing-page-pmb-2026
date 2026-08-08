/**
 * @file    src/app/layout.tsx
 * @brief   Root layout for PMB I-FEST 2026 loading global styles and brand typography
 * @author  ray
 * @created 2026-08-07
 * @todo    - Optimize font subsets loading parameters
 */

import type { Metadata } from "next";
import { Archivo_Black, Lexend_Mega } from "next/font/google";
import DonationNotification from "@/components/DonationNotification";
import "./globals.css";

const archivoFont = Archivo_Black({
  weight: "400",
  variable: "--font-archivo",
  subsets: ["latin"],
});

const lexendFont = Lexend_Mega({
  weight: "variable",
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pmbtelyu.vercel.app"),
  title: {
    default: "PMB I-FEST 2026 — Telkom University",
    template: "%s | PMB I-FEST 2026",
  },
  description: "Dukung dan kenali perjalanan PMB I-FEST 2026.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "PMB I-FEST 2026 — Telkom University",
    description: "Dukung dan kenali perjalanan PMB I-FEST 2026.",
    siteName: "PMB I-FEST 2026",
    images: [
      {
        url: "/banner.png",
        width: 920,
        height: 353,
        alt: "PMB I-FEST 2026 — Telkom University",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PMB I-FEST 2026 — Telkom University",
    description: "Dukung dan kenali perjalanan PMB I-FEST 2026.",
    images: ["/banner.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivoFont.variable} ${lexendFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <DonationNotification />
      </body>
    </html>
  );
}
