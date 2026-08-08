/**
 * @file    src/app/layout.tsx
 * @brief   Root layout for PMB I-FEST 2026 loading global styles and brand typography
 * @author  ray
 * @created 2026-08-07
 * @todo    - Optimize font subsets loading parameters
 */

import type { Metadata } from "next";
import { Archivo_Black, Lexend_Mega } from "next/font/google";
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
  metadataBase: new URL("https://landing-page-pmb-2026.vercel.app"),
  title: {
    default: "PMB I-FEST 2026",
    template: "%s | PMB I-FEST 2026",
  },
  description: "Website resmi PMB I-FEST 2026 — Penyambutan Mahasiswa Baru Muslim Telkom University.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "PMB I-FEST 2026",
    title: "PMB I-FEST 2026",
    description: "Website resmi PMB I-FEST 2026 — Penyambutan Mahasiswa Baru Muslim Telkom University.",
    url: "https://landing-page-pmb-2026.vercel.app",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "PMB I-FEST 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PMB I-FEST 2026",
    description: "Website resmi PMB I-FEST 2026 — Penyambutan Mahasiswa Baru Muslim Telkom University.",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivoFont.variable} ${lexendFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
