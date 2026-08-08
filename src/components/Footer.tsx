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
              <span className="font-mono text-[10px]">alfathfiftelu@gmail.com</span>
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
              href="Follow this link to join my WhatsApp group: https://chat.whatsapp.com/FkPRb3HTu6QA8uKIeEmAf8?s=sw&p=a&mlu=4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center border-[3px] border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-blue hover:text-white active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:bg-[#222] dark:text-white dark:hover:text-black dark:hover:bg-accent-blue"
              aria-label="WhatsApp PMB I-FEST"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.472 14.382c-.022-.01-.15-.075-.177-.085-.027-.01-.045-.015-.064.015-.019.03-.075.094-.093.115-.017.02-.036.02-.064.01-.027-.01-.115-.043-.22-.136-.081-.072-.136-.162-.152-.19-.017-.03-.002-.045.013-.06.014-.014.03-.035.045-.053.015-.018.02-.03.03-.05.01-.02.005-.038-.002-.053-.007-.015-.064-.153-.087-.21-.023-.056-.048-.048-.065-.049-.017-.001-.037-.001-.057-.001-.02 0-.053.007-.08.038-.028.03-.107.105-.107.255s.11.294.125.314c.015.02.217.33.527.465.074.032.132.05.177.065.075.024.14.02.193.012.058-.008.177-.072.202-.142.025-.07.025-.13.017-.142-.008-.012-.03-.02-.058-.032m-5.466 7.39c-1.393 0-2.756-.372-3.957-1.077l-.284-.168-2.943.771.785-2.87-.184-.294c-.774-1.23-1.185-2.656-1.185-4.124 0-4.321 3.518-7.839 7.84-7.839 4.321 0 7.838 3.518 7.838 7.84 0 4.322-3.517 7.839-7.838 7.839m0-16.79c-4.95 0-8.98 4.03-8.98 8.98 0 1.579.41 3.12 1.192 4.482l-1.266 4.628 4.735-1.242c1.312.716 2.784 1.094 4.318 1.094 4.95 0 8.98-4.03 8.98-8.98s-4.03-8.98-8.98-8.98" />
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
