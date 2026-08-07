/**
 * @file    src/app/page.tsx
 * @brief   Main homepage for PMB I-FEST 2026 rendering the centered collage hero, event journey, and campaign statistics
 * @author  ray
 * @created 2026-08-07
 * @todo    - Coordinate with event media division to obtain high-resolution collage photographs
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Send, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import DonationStats from "@/components/DonationStats";
import MascotCard from "@/components/MascotCard";
import DonationNotification from "@/components/DonationNotification";
import EventPhoto from "@/components/EventPhoto";
import DonorLeaderboard from "@/components/DonorLeaderboard";
import { eventData } from "@/data/eventData";
import { getCampaignStats } from "@/lib/donationStats";
import { getPublicDonors } from "@/lib/publicDonors";

export default async function Home() {
  // Fetch dynamic database campaign stats and public donors on server-side render
  const stats = await getCampaignStats();
  const donors = await getPublicDonors(6);

  const marqueeItems = [
    "PMB I-FEST 2026",
    "TUMBUH BERSAMA",
    "MENGUKIR KARYA",
    "HARMONI NUSANTARA",
    "LDK AL-FATH",
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-black selection:bg-main selection:text-black dark:bg-[#121212] dark:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section: Centered Poster Collage */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center border-b-[4px] border-black bg-accent-pink/5 overflow-hidden py-16 px-4">
        
        {/* z-0: Background Photo Collage */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {/* Photos spread editorially across the canvas */}
          {/* Collage Item 1: Top Left */}
          <div className="absolute top-[12%] left-[4%] w-32 h-24 sm:w-44 sm:h-32 border-[3px] border-black bg-white p-1.5 shadow-shadow rotate-[-4deg] opacity-60 hidden md:block">
            <div className="relative w-full h-full bg-zinc-200 border border-black flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold uppercase">
              [ FOTO PMB — PLACEHOLDER ]
            </div>
          </div>

          {/* Collage Item 2: Top Right */}
          <div className="absolute top-[10%] right-[6%] w-36 h-28 sm:w-48 sm:h-36 border-[3px] border-black bg-white p-1.5 shadow-shadow rotate-[3deg] opacity-60 hidden md:block">
            <div className="relative w-full h-full bg-zinc-200 border border-black flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold uppercase">
              [ FOTO I-FEST — PLACEHOLDER ]
            </div>
          </div>

          {/* Collage Item 3: Center Left */}
          <div className="absolute top-[48%] left-[2%] w-36 h-28 sm:w-44 sm:h-32 border-[3px] border-black bg-white p-1.5 shadow-shadow rotate-[6deg] opacity-50 hidden lg:block">
            <div className="relative w-full h-full bg-zinc-200 border border-black flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold uppercase">
              [ FOTO KEGIATAN — PLACEHOLDER ]
            </div>
          </div>

          {/* Collage Item 4: Center Right */}
          <div className="absolute top-[52%] right-[2%] w-32 h-24 sm:w-40 sm:h-28 border-[3px] border-black bg-white p-1.5 shadow-shadow rotate-[-6deg] opacity-50 hidden lg:block">
            <div className="relative w-full h-full bg-zinc-200 border border-black flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold uppercase">
              [ FOTO PMB — PLACEHOLDER ]
            </div>
          </div>

          {/* Collage Item 5: Bottom Left */}
          <div className="absolute bottom-[10%] left-[6%] w-36 h-28 sm:w-48 sm:h-36 border-[3px] border-black bg-white p-1.5 shadow-shadow rotate-[-3deg] opacity-65 hidden md:block">
            <div className="relative w-full h-full bg-zinc-200 border border-black flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold uppercase">
              [ FOTO I-FEST — PLACEHOLDER ]
            </div>
          </div>

          {/* Collage Item 6: Bottom Right */}
          <div className="absolute bottom-[8%] right-[8%] w-32 h-24 sm:w-44 sm:h-32 border-[3px] border-black bg-white p-1.5 shadow-shadow rotate-[5deg] opacity-65 hidden md:block">
            <div className="relative w-full h-full bg-zinc-200 border border-black flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold uppercase">
              [ FOTO KEGIATAN — PLACEHOLDER ]
            </div>
          </div>
        </div>

        {/* z-10: Color Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#faf8f5]/85 via-[#faf8f5]/90 to-[#faf8f5]/96 pointer-events-none dark:from-[#121212]/85 dark:via-[#121212]/90 dark:to-[#121212]/96" />

        {/* z-20: Retro halftone background pattern */}
        <div className="absolute inset-0 z-20 opacity-5 bg-[radial-gradient(circle,_#000_10%,_transparent_10%)] bg-[size:16px_16px] pointer-events-none" />

        {/* z-30: Centered Content */}
        <div className="relative z-30 max-w-4xl w-full text-center flex flex-col items-center gap-6">

          {/* Giant Display Headline */}
          <h1 className="font-heading text-4xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tighter uppercase text-black dark:text-white mt-2 select-none">
            PMB I-FEST 2026<br />
            <span className="bg-accent-orange text-white px-4 py-1 border-[4px] border-black inline-block transform rotate-[-1deg] shadow-shadow-large mt-3" style={{ fontSize: "4.5rem" }}>
              Tumbuh Bersama, Mengukir Karya
            </span>
          </h1>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row w-full justify-center">
            <Link href="/donation" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 border-[4px] border-black bg-accent-orange px-8 py-4 font-heading text-sm uppercase tracking-wider text-white shadow-shadow hover:bg-accent-orange/95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] cursor-pointer">
                DONASI SEKARANG <Heart className="size-4 fill-current text-white animate-pulse" />
              </button>
            </Link>
            <a href="#about" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 border-[4px] border-black bg-white px-8 py-4 font-heading text-sm uppercase tracking-wider text-black shadow-shadow hover:bg-zinc-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] dark:bg-[#222] dark:text-white dark:hover:bg-zinc-800 cursor-pointer">
                JELAJAHI PERJALANAN <ArrowRight className="size-4" />
              </button>
            </a>
          </div>
        </div>

        {/* z-40 / z-999: Overlapping Mascots */}
        {/* Arjuna: Bottom Left Overlay */}
        <div className="absolute bottom-[-20px] left-[1%] lg:left-[4%] z-[99] w-24 sm:w-44 md:w-56 h-auto filter drop-shadow-[5px_5px_0px_rgba(0,0,0,0.8)] pointer-events-none select-none">
          <Image
            src="/ARJUNA.png"
            alt="Arjuna Mascot"
            width={240}
            height={320}
            sizes="(max-width: 768px) 96px, (max-width: 1024px) 176px, 240px"
            className="object-contain"
            draggable={false}
            priority
          />
        </div>

        {/* Srikandi: Bottom Right Overlay */}
        <div className="absolute bottom-[-20px] right-[1%] lg:right-[4%] z-[99] w-24 sm:w-44 md:w-56 h-auto filter drop-shadow-[5px_5px_0px_rgba(0,0,0,0.8)] pointer-events-none select-none">
          <Image
            src="/SRIKANDI.png"
            alt="Srikandi Mascot"
            width={240}
            height={320}
            sizes="(max-width: 768px) 96px, (max-width: 1024px) 176px, 240px"
            className="object-contain"
            draggable={false}
            priority
          />
        </div>
      </section>

      {/* Infinite Marquee text band */}
      <Marquee items={marqueeItems} bgClass="bg-black" textClass="text-accent-orange" />

      {/* Section: Apa Itu PMB I-Fest 2026 */}
      <section id="about" className="py-24 px-6 sm:px-8 md:px-12 bg-white dark:bg-[#1a1a1a]">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Header / Number Badge */}
            <div className="lg:col-span-4 flex flex-col items-start gap-4">
              <div className="border-[3px] border-black bg-accent-blue px-3 py-1 font-heading text-xs uppercase tracking-wider text-white shadow-shadow">
                TENTANG EVENT
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl leading-none tracking-tighter uppercase">
                Apa Itu <br />
                PMB I-Fest 2026
              </h2>
              <div className="w-20 h-[4px] bg-black dark:bg-white" />
            </div>

            {/* Core copy */}
            <div className="lg:col-span-8 space-y-6">
              <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                Penyambutan Mahasiswa Baru (PMB) adalah serangkaian kegiatan yang bertujuan untuk menyambut mahasiswa baru muslim di Universitas Telkom. Pada PMB 2026, Masjid Syamsul Ulum Family akan berperan aktif dalam menyambut mahasiswa baru. Keterlibatan ini didasari kesempatan untuk bersilaturahmi dengan mahasiswa baru muslim, memperkenalkan organisasi kemahasiswaan Islam di Universitas Telkom, serta{" "}
                <span className="bg-[#ffea79] text-black px-1.5 py-0.5 border-[2px] border-black font-bold inline-block rotate-[-0.5deg]">
                  membantu mereka dalam beradaptasi dengan lingkungan perkuliahan sambil tetap mengamalkan nilai-nilai Islam.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section: Perjalanan PMB & I-FEST */}
      <section id="journey" className="py-24 px-6 sm:px-8 md:px-12 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl border-b-[4px] border-black pb-6 mb-16 dark:border-zinc-700">
          <div className="mb-3 inline-flex items-center gap-1 border-[2.5px] border-black bg-accent-blue px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            LINI MASA PROGRAM
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl tracking-tighter uppercase leading-none">
            PERJALANAN PMB & I-FEST
          </h2>
          <p className="mt-4 font-sans text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Setiap langkah membawa cerita. Dari mengenal ruang baru hingga merayakan perjalanan bersama dalam menyambut masa depan mahasiswa baru muslim di Universitas Telkom.
          </p>
        </div>

        {/* Timeline Grid (Alternating Editorial Columns) */}
        <div className="grid gap-20 mt-12">
          
          {/* Step 1 */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-heading text-4xl text-white border-[3px] border-black px-3 py-0.5 bg-accent-blue shadow-shadow">
                  01
                </span>
                <h3 className="font-heading text-lg sm:text-xl tracking-tight">
                  {eventData.timeline[0].title}
                  {eventData.timeline[0].subtitle && (
                    <span className="block text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                      {eventData.timeline[0].subtitle}
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
                {eventData.timeline[0].description}
              </p>
              <div className="font-mono text-[9px] font-bold text-zinc-400 uppercase">
                JADWAL: {eventData.timeline[0].date}
              </div>
            </div>
            <div className="lg:col-span-6 flex justify-center">
              <EventPhoto
                label="FOTO QOMARUL 'ULUM"
                rotationClass="rotate-[-1deg]"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-heading text-4xl text-white border-[3px] border-black px-3 py-0.5 bg-accent-pink shadow-shadow">
                  02
                </span>
                <h3 className="font-heading text-lg sm:text-xl tracking-tight">
                  {eventData.timeline[1].title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
                {eventData.timeline[1].description}
              </p>
              <div className="font-mono text-[9px] font-bold text-zinc-400 uppercase">
                JADWAL: {eventData.timeline[1].date}
              </div>
            </div>
            <div className="lg:col-span-6 lg:order-1 flex justify-center">
              <EventPhoto
                label="FOTO SYIAR PELAYANAN"
                rotationClass="rotate-[1.5deg]"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-heading text-4xl text-white border-[3px] border-black px-3 py-0.5 bg-[#ffea79] text-black shadow-shadow">
                  03
                </span>
                <h3 className="font-heading text-lg sm:text-xl tracking-tight">
                  {eventData.timeline[2].title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
                {eventData.timeline[2].description}
              </p>
              <div className="font-mono text-[9px] font-bold text-zinc-400 uppercase">
                JADWAL: {eventData.timeline[2].date}
              </div>
            </div>
            <div className="lg:col-span-6 flex justify-center">
              <EventPhoto
                label="FOTO BINA ROHANI"
                rotationClass="rotate-[-1.5deg]"
              />
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-heading text-4xl text-white border-[3px] border-black px-3 py-0.5 bg-accent-blue shadow-shadow">
                  04
                </span>
                <h3 className="font-heading text-lg sm:text-xl tracking-tight">
                  {eventData.timeline[3].title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
                {eventData.timeline[3].description}
              </p>
              <div className="font-mono text-[9px] font-bold text-zinc-400 uppercase">
                JADWAL: {eventData.timeline[3].date}
              </div>
            </div>
            <div className="lg:col-span-6 lg:order-1 flex justify-center">
              <EventPhoto
                label="FOTO STUDENT FAIR"
                rotationClass="rotate-[1deg]"
              />
            </div>
          </div>

          {/* Step 5: Culmination I-FEST (Received strongest visual treatment) */}
          <div className="grid gap-8 lg:grid-cols-12 items-center border-[4px] border-black bg-[#f2fff6] p-6 sm:p-8 shadow-shadow-large dark:bg-[#0d2a17]">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1 border-[2px] border-black bg-accent-orange px-2.5 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                PUNCAK PERJALANAN
              </div>
              <div className="flex items-center gap-3">
                <span className="font-heading text-5xl text-accent-green border-[3px] border-black px-4 py-1 bg-white shadow-shadow dark:bg-[#1e1e1e] dark:text-accent-green">
                  05
                </span>
                <h3 className="font-heading text-2xl tracking-tight">
                  {eventData.timeline[4].title}
                  {eventData.timeline[4].subtitle && (
                    <span className="block text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                      {eventData.timeline[4].subtitle}
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
                {eventData.timeline[4].description}
              </p>
              <div className="font-mono text-[9px] font-bold text-zinc-400 uppercase">
                JADWAL: {eventData.timeline[4].date}
              </div>
            </div>
            <div className="lg:col-span-6 flex justify-center">
              <EventPhoto
                label="FOTO PUNCAK ACARA: I-FEST"
                rotationClass="rotate-[-1deg]"
                borderClass="border-[4px] border-black"
                shadowClass="shadow-shadow-large"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Philosophy Section: Harmoni Nusantara + Arjuna & Srikandi */}
      <section id="philosophy" className="border-t-[4px] border-black bg-accent-pink/5 py-24 px-6 sm:px-8 md:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="mb-3 inline-flex items-center gap-1.5 border-[2.5px] border-black bg-[#ffea79] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-shadow">
              MAKNA & FILOSOFI
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-tighter uppercase leading-none">
              HARMONI NUSANTARA
            </h2>
            <p className="mt-4 text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
              Harmoni menggambarkan keseimbangan kehidupan akademik, interaksi sosial, dan kematangan spiritual. Nusantara menjadi ruang inklusif bagi keberagaman latar belakang budaya mahasiswa untuk tumbuh dan berjalan bersama.
            </p>
          </div>

          {/* Mascots Display Grid (Editorial Bento Box Composition) */}
          <div className="grid gap-8 mt-12 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Arjuna */}
            <MascotCard
              mascot={eventData.mascots.arjuna}
              colorClass="bg-accent-blue"
              rotationClass="rotate-[-1.5deg]"
            />
            {/* Srikandi */}
            <MascotCard
              mascot={eventData.mascots.srikandi}
              colorClass="bg-accent-pink"
              rotationClass="rotate-[1.5deg]"
            />
          </div>
        </div>
      </section>

      {/* Homepage Donation Section (Full Width, Campaign Oriented) */}
      <section className="border-t-[4px] border-black bg-[#ffea79] py-24 px-6 sm:px-8 md:px-12 dark:bg-[#1a1b02] dark:text-white">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-3 inline-flex items-center gap-1.5 border-[2.5px] border-black bg-accent-orange px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              PENGGALANGAN DANA KAMPANYE
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-tighter uppercase text-black dark:text-white">
              IKUT BERTUMBUH BERSAMA
            </h2>
            <p className="mt-4 text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
              Kontribusikan sebagian rezeki Anda untuk mendukung langkah awal mahasiswa baru muslim dalam program PMB I-FEST 2026. Setiap kontribusi Anda bermakna besar bagi kelancaran operasional dakwah kampus Telkom University!
            </p>
          </div>

          {/* Full-width stats layout */}
          <div className="w-full mt-8">
            <DonationStats
              totalDonated={stats.totalCollected}
              targetAmount={stats.target}
              donorCount={stats.donorCount}
              showLinkToDonation={true}
            />
          </div>

          {/* Donor Appreciation Board on Homepage */}
          {donors.length > 0 && (
            <div className="mt-16 pt-12 border-t-[3px] border-black/15 dark:border-white/10">
              <DonorLeaderboard donors={donors} />
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t-[4px] border-black bg-white py-24 px-6 text-center dark:bg-[#121212] dark:text-white relative overflow-hidden">
        {/* Retro dots overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_#000_10%,_transparent_10%)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-2xl flex flex-col items-center gap-6">
          <div className="border-[3px] border-black bg-accent-pink p-3 animate-pulse shadow-shadow text-white">
            <Send className="size-8" />
          </div>
          
          <h2 className="font-heading text-2xl sm:text-4xl tracking-tighter uppercase leading-[1.1]">
            Tumbuh bersama.<br />
            Mengukir karya.<br />
            Menjadi bagian dari cerita.
          </h2>
          
          <p className="max-w-lg text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Kontribusikan sebagian rezeki Anda untuk mendanai fasilitas, sarana prasarana, serta kelancaran operasional PMB I-FEST 2026.
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row justify-center w-full sm:w-auto">
            <Link href="/donation" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 border-[4px] border-black bg-accent-orange px-8 py-4 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:bg-accent-orange/95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] cursor-pointer">
                DONASI SEKARANG →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating alert notifications stream */}
      <DonationNotification />

      {/* Footer */}
      <Footer />
    </div>
  );
}
