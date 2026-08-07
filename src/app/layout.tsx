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
  title: "PMB I-FEST 2026 - Telkom University",
  description: "Penyambutan Mahasiswa Baru Islamic Festival 2026 Telkom University. Tumbuh Bersama, Mengukir Karya.",
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
