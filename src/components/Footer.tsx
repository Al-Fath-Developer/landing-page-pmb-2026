/**
 * @file    src/components/Footer.tsx
 * @brief   Brutalist footer component rendering organizer logos and social networks details
 * @author  ray
 * @created 2026-08-07
 * @todo    - Link social accounts to officially approved student organization channels
 */

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { eventData } from "@/data/eventData";

export default function Footer() {
  return (
    <footer className="w-full border-t-[4px] border-black bg-white py-12 px-6 dark:bg-[#121212] dark:text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {/* Branding Column */}
        <div className="flex flex-col items-start gap-4">
          <div className="border-[3px] border-black bg-accent-blue px-4 py-2 font-heading text-lg uppercase tracking-tight text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            PMB I-FEST 2026
          </div>
          
          {/* Institutional Logos Collage Row */}
          <div className="flex flex-wrap items-center gap-3 mt-1 bg-zinc-50 border-[2px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-[#1e1e1e]">
            <div className="relative h-8 w-8">
              <Image
                src="/logo-pmb.png"
                alt="PMB Logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div className="relative h-8 w-12">
              <Image
                src="/AL-FATH.png"
                alt="Al-Fath Logo"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div className="relative h-8 w-16">
              <Image
                src="/Telkom University.png"
                alt="Tel-U Logo"
                fill
                sizes="64px"
                className="object-contain dark:invert"
              />
            </div>
            <div className="relative h-8 w-8">
              <Image
                src="/DKMSU.png"
                alt="DKMSU Logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
          </div>

          <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {eventData.university} • {eventData.organizer}
          </p>
          <p className="text-xs font-sans leading-relaxed text-zinc-600 dark:text-zinc-400">
            Membangun generasi muda muslim Telkom University yang tangguh, cerdas, berkarakter mulia, dan berjiwa kepemimpinan dalam kebersamaan harmoni.
          </p>
        </div>

        {/* Links Column */}
        <div className="flex flex-col gap-3">
          <h4 className="border-b-[2px] border-black pb-1 font-heading text-xs uppercase tracking-wider dark:border-zinc-700">
            Tautan Cepat
          </h4>
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-wide text-zinc-600 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              Beranda
            </Link>
            <Link
              href="/#journey"
              className="font-mono text-[10px] uppercase tracking-wide text-zinc-600 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              Perjalanan PMB & I-FEST
            </Link>
            <Link
              href="/#philosophy"
              className="font-mono text-[10px] uppercase tracking-wide text-zinc-600 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              Karakter & Filosofi
            </Link>
            <Link
              href="/donation"
              className="font-mono text-[10px] uppercase tracking-wide text-zinc-600 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              Halaman Donasi
            </Link>
            <Link
              href="/gallery"
              className="font-mono text-[10px] uppercase tracking-wide text-zinc-600 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              Gallery
            </Link>
          </nav>
        </div>

        {/* Contact/Social Column */}
        <div className="flex flex-col gap-4">
          <h4 className="border-b-[2px] border-black pb-1 font-heading text-xs uppercase tracking-wider dark:border-zinc-700">
            Hubungi Kami
          </h4>
          <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-black dark:text-white" />
              <span className="font-mono text-[10px]">ldk.syamsululum@telkomuniversity.ac.id</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="font-mono text-[10px]">@pmbifest_telyu</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="https://www.instagram.com/pmbifest_telyu/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center border-[3px] border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-blue hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:bg-[#222] dark:text-white dark:hover:text-black dark:hover:bg-accent-blue"
              aria-label="Instagram PMB I-FEST"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center border-[3px] border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-blue hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:bg-[#222] dark:text-white dark:hover:text-black dark:hover:bg-accent-blue"
              aria-label="GitHub Repository"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t-[3px] border-black pt-6 text-center text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        © {new Date().getFullYear()} LDK Al-Fath • PMB I-FEST 2026. Made with ❤️ for Tel-U Muslim Community.
      </div>
    </footer>
  );
}
