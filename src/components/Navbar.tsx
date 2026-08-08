/**
 * @file    src/components/Navbar.tsx
 * @brief   Responsive and scroll-resizable navigation bar component with Neo-Brutalist styling
 * @author  ray
 * @created 2026-08-07
 * @todo    - Support smooth transition for sticky shadow displacement
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Gallery", href: "/gallery" },
  ];

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        isScrolled
          ? "border-b-[4px] border-black bg-background py-2 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:bg-[#121212]"
          : "border-b-[4px] border-transparent bg-transparent py-5 shadow-none"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Logo / Branding */}
        <Link href="/" className="group flex items-center gap-3">
          <div
            className={`relative border-[2.5px] border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
              isScrolled ? "size-8" : "size-10"
            }`}
          >
            <Image
              src="/logo-pmb.png"
              alt="PMB I-FEST Logo"
              fill
              sizes="40px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div
            className={`border-[3px] border-black bg-accent-blue px-3 py-1 font-heading uppercase tracking-tight text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group-hover:translate-x-px group-hover:translate-y-px group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
              isScrolled ? "text-sm" : "text-base"
            }`}
          >
            PMB I-FEST 2026
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-heading text-xs uppercase tracking-wider transition-colors hover:text-accent-blue dark:hover:text-accent-blue ${
                  isActive
                    ? "underline decoration-[3px] decoration-accent-orange underline-offset-4"
                    : "text-black dark:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <Link href="/donation">
            <Button
              variant="outline"
              className="border-[3px] border-black bg-accent-orange font-heading text-xs uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-orange/95 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
            >
              DONASI <Heart className="ml-1.5 size-3.5 fill-current text-white" />
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu/CTA Group */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/donation" className="mr-1">
            <Button
              variant="outline"
              size="sm"
              className="border-[2px] border-black bg-accent-orange font-heading text-[10px] uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-orange/95 active:translate-x-px active:translate-y-px"
            >
              DONASI
            </Button>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex size-9 items-center justify-center border-[2.5px] border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 dark:bg-[#222] dark:text-white"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full border-b-[4px] border-black bg-white p-6 shadow-[0_8px_0_0_rgba(0,0,0,1)] md:hidden dark:bg-[#121212]">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`border-[3px] border-black p-3 font-heading text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    isActive
                      ? "bg-accent-blue text-white"
                      : "bg-white text-black hover:bg-zinc-100 dark:bg-[#222] dark:text-white dark:hover:bg-zinc-800"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link href="/donation" onClick={() => setIsOpen(false)} className="w-full">
              <Button
                variant="outline"
                className="w-full border-[3px] border-black bg-accent-orange py-6 font-heading text-xs uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                DONASI <Heart className="ml-1.5 size-4 fill-current text-white" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
