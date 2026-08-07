/**
 * @file    src/app/donation/page.tsx
 * @brief   Interactive donation page integrated with Supabase queries, Midtrans QRIS charge creation, and payment status polling
 * @author  ray
 * @created 2026-08-07
 * @todo    - Wire up Supabase Realtime subscriptions to bypass polling mechanisms
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, Clock, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonationStats from "@/components/DonationStats";
import DonorLeaderboard from "@/components/DonorLeaderboard";
import { Button } from "@/components/ui/button";
import { eventData } from "@/data/eventData";
import { DonationResponse, DonationStatusResponse } from "@/types/donation";

type DonationState = "idle" | "submitting" | "pending" | "success" | "failed" | "expired";

interface DonationFormInput {
  amount: number;
  donorName: string;
  donorEmail: string;
  message: string;
  isAnonymous: boolean;
  showPublic: boolean;
}

interface DonorRecord {
  id: string;
  name: string;
  message?: string;
  amountText: string;
  date: string;
}

export default function DonationPage() {
  // Campaign stats (synced from API)
  const [stats, setStats] = useState({
    totalDonated: 0,
    donorCount: 0,
    targetAmount: eventData.campaignStats.targetAmount,
  });

  const [donationState, setDonationState] = useState<DonationState>("idle");
  const [customAmountStr, setCustomAmountStr] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(50000); // Default preset: 50k
  const [donors, setDonors] = useState<DonorRecord[]>([]);

  // Form input states
  const [formInput, setFormInput] = useState<DonationFormInput>({
    amount: 50000,
    donorName: "",
    donorEmail: "",
    message: "",
    isAnonymous: false,
    showPublic: false, // Default is privacy-conscious
  });

  // Client-side validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Payment session state
  const [paymentSession, setPaymentSession] = useState<DonationResponse | null>(null);

  // Timer for QRIS expiration
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes default

  const presetAmounts = [10000, 25000, 50000, 100000, 250000];

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial campaign data (stats + public donors board) on mount
  const fetchPublicCampaignData = async () => {
    try {
      const response = await fetch("/api/donations/public");
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setStats({
            totalDonated: data.stats.totalCollected,
            donorCount: data.stats.donorCount,
            targetAmount: data.stats.target,
          });
        }
        if (data.donors) {
          setDonors(data.donors);
        }
      }
    } catch (err) {
      console.error("Failed to fetch initial public campaign stats:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPublicCampaignData();
    };
    loadData();
  }, []);

  // Expiration timer logic
  useEffect(() => {
    if (donationState !== "pending") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setDonationState("expired");
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [donationState]);

  // Clean up polling interval on unmount or status change
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll status endpoint to check payment settlement
  const startPaymentPolling = (orderId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/donations/${orderId}`);
        if (!response.ok) return;

        const data: DonationStatusResponse = await response.json();
        if (data.status === "paid") {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          
          // Re-fetch public stats and donor board list to update the screen values
          await fetchPublicCampaignData();
          setDonationState("success");
        } else if (data.status === "expired") {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setDonationState("expired");
        } else if (data.status === "failed") {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setDonationState("failed");
        }
      } catch (err) {
        console.error(`Polling status error for order ID ${orderId}:`, err);
      }
    }, 4000); // Poll status every 4 seconds
  };

  // Format countdown string
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmountStr(val);
    setActivePreset(null);
    const amountVal = val ? parseInt(val, 10) : 0;
    setFormInput((prev) => ({ ...prev, amount: amountVal }));
  };

  const handlePresetSelect = (preset: number) => {
    setActivePreset(preset);
    setFormInput((prev) => ({ ...prev, amount: preset }));
    setCustomAmountStr("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormInput((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormInput((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formInput.amount < 1000) {
      newErrors.amount = "Jumlah donasi minimal adalah Rp1.000";
    }

    if (!formInput.donorName.trim()) {
      newErrors.donorName = "Nama donatur harus diisi";
    }

    if (formInput.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formInput.donorEmail)) {
      newErrors.donorEmail = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setDonationState("submitting");

    try {
      // Map form fields to API contract definitions
      const showPublicName = !formInput.isAnonymous && formInput.showPublic;
      const showPublicMessage = !formInput.isAnonymous && formInput.showPublic;

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorName: formInput.donorName,
          donorEmail: formInput.donorEmail || undefined,
          amount: formInput.amount,
          message: formInput.message || undefined,
          showPublicName,
          showPublicMessage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setErrors({ amount: errData.message || "Gagal membuat transaksi donasi." });
        setDonationState("idle");
        return;
      }

      const session: DonationResponse = await response.json();
      setPaymentSession(session);
      
      // Calculate remaining countdown seconds
      const secondsLeft = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(secondsLeft);
      
      setDonationState("pending");

      // Start status verification polling
      startPaymentPolling(session.orderId);
    } catch (err) {
      console.error("Donation creation failed:", err);
      setErrors({ amount: "Terjadi kesalahan jaringan atau koneksi server." });
      setDonationState("idle");
    }
  };

  // Format currency for display
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#ffea79] text-black selection:bg-main selection:text-black dark:bg-[#1a1b02] dark:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-4xl py-12 px-6 sm:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" /> Kembali ke Beranda
          </Link>
        </div>

        {/* Campaign Info Header */}
        <div className="border-[4px] border-black bg-accent-blue p-6 sm:p-8 text-white shadow-shadow-large mb-10 dark:bg-[#0f2a3a]">
          <div className="inline-flex items-center gap-1 border-[2.5px] border-black bg-[#ffea79] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-shadow">
            KAMPANYE SOSIAL & DAKWAH
          </div>
          <h1 className="mt-4 font-heading text-2xl sm:text-4xl uppercase tracking-tight leading-none">
            DONASI PMB I-FEST 2026
          </h1>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-100 dark:text-zinc-200 font-sans">
            Dukung penyelenggaraan Penyambutan Mahasiswa Baru Islamic Festival 2026 di Telkom University. Seluruh donasi yang terkumpul akan dialokasikan penuh untuk keperluan operasional acara, pembiayaan sarana dakwah, konsumsi peserta, penyediaan e-sertifikat, serta cinderamata welcoming day.
          </p>
        </div>

        {/* Live Stats Visualizer */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xs uppercase tracking-wider">
              PROGRES DANA TERKUMPUL
            </h2>
            <span className="inline-flex items-center gap-1 bg-accent-orange border-[2.5px] border-black px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
              LIVE PREVIEW
            </span>
          </div>
          <DonationStats
            totalDonated={stats.totalDonated}
            targetAmount={stats.targetAmount}
            donorCount={stats.donorCount}
            showLinkToDonation={false}
          />
        </div>

        {/* Donation Form and Interactive States Card */}
        <div className="border-[4px] border-black bg-white p-6 sm:p-8 shadow-shadow-large dark:bg-[#1e1e1e]">
          
          {/* IDLE state: Form fields input */}
          {donationState === "idle" && (
            <form onSubmit={handleDonationSubmit} className="space-y-6">
              <h2 className="border-b-[3px] border-black pb-2 font-heading text-lg uppercase tracking-tight dark:border-zinc-700">
                ISI FORMULIR DONASI
              </h2>

              {/* Amount Selection */}
              <div className="space-y-3">
                <label className="block font-heading text-xs uppercase tracking-wide">
                  Pilih Nominal Donasi <span className="text-red-500">*</span>
                </label>

                {/* Presets Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handlePresetSelect(amount)}
                      className={`border-[3px] border-black py-2.5 px-3 font-mono text-xs font-bold shadow-shadow active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                        activePreset === amount
                          ? "bg-accent-orange text-white"
                          : "bg-white text-black hover:bg-zinc-100 dark:bg-[#2c2c2c] dark:text-white dark:hover:bg-zinc-800"
                      }`}
                    >
                      {formatRupiah(amount).replace(",00", "")}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Field */}
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-heading text-xs text-zinc-500 dark:text-zinc-400">
                    NOMINAL LAINNYA: Rp
                  </span>
                  <input
                    type="text"
                    value={customAmountStr}
                    onChange={handleCustomAmountChange}
                    placeholder="Masukkan jumlah donasi..."
                    className="w-full border-[3px] border-black bg-white py-3 pl-36 pr-4 font-mono text-xs shadow-shadow focus:outline-none focus:bg-zinc-50 dark:bg-[#2c2c2c] dark:text-white dark:focus:bg-zinc-800"
                  />
                </div>
                {errors.amount && (
                  <p className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400">{errors.amount}</p>
                )}
              </div>

              {/* Donor Profile Details */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Donor Name */}
                <div className="space-y-2">
                  <label htmlFor="donorName" className="block font-heading text-xs uppercase tracking-wide">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    value={formInput.donorName}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama Anda..."
                    className="w-full border-[3px] border-black bg-white p-3 font-mono text-xs shadow-shadow focus:outline-none dark:bg-[#2c2c2c] dark:text-white"
                  />
                  {errors.donorName && (
                    <p className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400">{errors.donorName}</p>
                  )}
                </div>

                {/* Donor Email */}
                <div className="space-y-2">
                  <label htmlFor="donorEmail" className="block font-heading text-xs uppercase tracking-wide">
                    Email <span className="text-zinc-500 font-mono text-[9px]">(OPSIONAL)</span>
                  </label>
                  <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    value={formInput.donorEmail}
                    onChange={handleInputChange}
                    placeholder="nama@email.com..."
                    className="w-full border-[3px] border-black bg-white p-3 font-mono text-xs shadow-shadow focus:outline-none dark:bg-[#2c2c2c] dark:text-white"
                  />
                  {errors.donorEmail && (
                    <p className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400">{errors.donorEmail}</p>
                  )}
                </div>
              </div>

              {/* Message / Doa */}
              <div className="space-y-2">
                <label htmlFor="message" className="block font-heading text-xs uppercase tracking-wide">
                  Pesan / Doa <span className="text-zinc-500 font-mono text-[9px]">(OPSIONAL)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formInput.message}
                  onChange={handleInputChange}
                  placeholder="Tuliskan doa atau pesan dukungan Anda..."
                  maxLength={150}
                  className="w-full border-[3px] border-black bg-white p-3 font-mono text-xs shadow-shadow focus:outline-none dark:bg-[#2c2c2c] dark:text-white"
                />
              </div>

              {/* Consent Options */}
              <div className="space-y-3 bg-zinc-50 p-4 border-[2px] border-black dark:bg-[#252525]">
                {/* Anonymous Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formInput.isAnonymous}
                    onChange={handleInputChange}
                    className="size-5 border-[3px] border-black checked:bg-accent-orange cursor-pointer"
                  />
                  <label htmlFor="isAnonymous" className="font-heading text-xs uppercase tracking-wide cursor-pointer select-none">
                    Sembunyikan nama saya (Hamba Allah)
                  </label>
                </div>

                {/* Public Display Consent Checkbox */}
                <div className="flex items-center gap-3 border-t border-black/10 pt-2 dark:border-white/10">
                  <input
                    type="checkbox"
                    id="showPublic"
                    name="showPublic"
                    checked={formInput.showPublic}
                    onChange={handleInputChange}
                    className="size-5 border-[3px] border-black checked:bg-accent-orange cursor-pointer"
                  />
                  <label htmlFor="showPublic" className="font-heading text-[10px] sm:text-xs uppercase tracking-wide cursor-pointer select-none">
                    Tampilkan nama saya di Papan Apresiasi Donatur
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t-[3px] border-black dark:border-zinc-700">
                <Button
                  type="submit"
                  className="w-full border-[4px] border-black bg-accent-orange py-6 font-heading text-sm uppercase tracking-wider text-white shadow-shadow hover:bg-accent-orange/95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0)]"
                >
                  DONASI SEKARANG • {formatRupiah(formInput.amount)}
                </Button>
              </div>
            </form>
          )}

          {/* SUBMITTING state: Loading/Creating transaction */}
          {donationState === "submitting" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="size-16 animate-spin text-accent-orange stroke-[3]" />
              <h2 className="mt-6 font-heading text-xl uppercase tracking-tight">
                MEMPROSES PEMBAYARAN...
              </h2>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Menghubungkan ke Gateway Pembayaran QRIS Midtrans
              </p>
            </div>
          )}

          {/* PENDING state: QRIS details countdown */}
          {donationState === "pending" && paymentSession && (
            <div className="space-y-6">
              <h2 className="border-b-[3px] border-black pb-2 font-heading text-lg uppercase tracking-tight dark:border-zinc-700">
                LANJUTKAN PEMBAYARAN QRIS
              </h2>

              <div className="grid gap-8 lg:grid-cols-12">
                {/* QR Code Graphic Column */}
                <div className="lg:col-span-5 flex flex-col items-center text-center">
                  <div className="border-[3px] border-black bg-white p-4 shadow-shadow">
                    <div className="relative size-48 bg-zinc-100 border-[2px] border-black flex items-center justify-center">
                      {/* Actual Midtrans QRIS Image render */}
                      <img
                        src={paymentSession.qrisUrl}
                        alt="QRIS Payment Code"
                        className="size-full object-contain p-2 select-none"
                        draggable={false}
                      />
                      
                      <div className="absolute inset-0 m-auto flex size-10 items-center justify-center border-[2px] border-black bg-accent-blue font-heading text-[10px] text-white select-none">
                        QRIS
                      </div>
                    </div>
                    <div className="mt-3 bg-zinc-100 border-[2px] border-black py-1 px-3 font-mono text-[9px] font-bold text-black uppercase tracking-wider dark:text-black">
                      PMB I-FEST QRIS
                    </div>
                  </div>
                  <p className="mt-4 font-mono text-[9px] uppercase text-zinc-500 dark:text-zinc-400">
                    Pindai menggunakan aplikasi m-banking atau e-wallet (GoPay, OVO, ShopeePay, DANA, dll).
                  </p>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="border-[3px] border-black bg-accent-pink/10 p-4 text-black shadow-shadow dark:text-white">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      JUMLAH TAGIHAN
                    </div>
                    <div className="font-heading text-xl sm:text-2xl text-accent-orange tracking-tight">
                      {formatRupiah(paymentSession.amount)}
                    </div>
                    <div className="mt-2 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      ORDER ID: <span className="font-bold text-black dark:text-white">{paymentSession.orderId}</span>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="border-[3px] border-black bg-white p-4 shadow-shadow dark:bg-[#2a2a2a] flex items-center gap-3">
                    <Clock className="size-6 text-yellow-500 animate-pulse" />
                    <div>
                      <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        BATAS WAKTU PEMBAYARAN
                      </div>
                      <div className="font-heading text-base tracking-wider text-black dark:text-white">
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>

                  <div className="border-[3.5px] border-black bg-accent-blue/10 p-4 shadow-shadow dark:bg-[#2c2c2c] dark:text-white">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      MENUNGGU PEMBAYARAN...
                    </p>
                    <p className="mt-2 font-sans text-xs text-zinc-700 dark:text-zinc-400">
                      Halaman ini akan otomatis diperbarui setelah pembayaran Anda diverifikasi oleh sistem. Anda dapat menutup halaman ini, status donasi Anda akan tetap diproses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close / Cancel option */}
              <div className="pt-4 border-t-[3px] border-black text-center dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setDonationState("idle")}
                  className="font-mono text-xs uppercase tracking-wider underline text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                >
                  Kembali ke formulir donasi
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS state: Payment successful screen */}
          {donationState === "success" && (
            <div className="flex flex-col items-center text-center py-12 space-y-6">
              <div className="flex size-20 items-center justify-center rounded-full border-[4px] border-black bg-accent-green shadow-shadow text-black">
                <CheckCircle className="size-12" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading text-2xl uppercase tracking-tight">
                  DONASI BERHASIL DITERIMA!
                </h2>
                <div className="inline-flex items-center gap-1 border-[2px] border-black bg-accent-orange px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="size-3 text-white" /> JAZAKUMULLAH KHAIRAN
                </div>
              </div>

              <div className="border-[3px] border-black bg-zinc-50 p-6 shadow-shadow max-w-md w-full dark:bg-[#252525]">
                <div className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400 uppercase">JUMLAH DONASI</div>
                <div className="font-heading text-xl text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(formInput.amount)}
                </div>
                
                <div className="mt-4 pt-4 border-t-[2px] border-black/10 dark:border-white/10 text-left space-y-2 text-sm">
                  <div>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">Nama:</span>{" "}
                    <span className="font-heading text-sm">{formInput.isAnonymous ? "Hamba Allah (Anonymous)" : formInput.donorName}</span>
                  </div>
                  {formInput.donorEmail && (
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">Email:</span>{" "}
                      <span className="font-mono text-xs">{formInput.donorEmail}</span>
                    </div>
                  )}
                  {formInput.message && (
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">Doa/Pesan:</span>
                      <p className="mt-1 bg-white border-[2px] border-black p-3 font-mono text-xs italic dark:bg-[#1a1a1a]">
                        &ldquo;{formInput.message}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
                Terima kasih atas kontribusi Anda. Dukungan berharga ini akan segera disalurkan penuh demi mensukseskan kegiatan dakwah penyambutan mahasiswa baru muslim.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row w-full justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setFormInput({
                      amount: 50000,
                      donorName: "",
                      donorEmail: "",
                      message: "",
                      isAnonymous: false,
                      showPublic: false,
                    });
                    setCustomAmountStr("");
                    setActivePreset(50000);
                    setDonationState("idle");
                  }}
                  className="border-[3px] border-black bg-accent-orange py-3 px-6 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-px cursor-pointer"
                >
                  KIRIM DONASI BARU
                </button>
                <Link href="/" className="w-full sm:w-auto">
                  <button className="w-full border-[3px] border-black bg-white py-3 px-6 font-heading text-xs uppercase tracking-wider text-black shadow-shadow hover:bg-zinc-100 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-px dark:bg-[#222] dark:text-white dark:hover:bg-zinc-800 cursor-pointer">
                    KEMBALI KE BERANDA
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* FAILED state: Payment failed screen */}
          {donationState === "failed" && (
            <div className="flex flex-col items-center text-center py-12 space-y-6">
              <div className="flex size-20 items-center justify-center rounded-full border-[4px] border-black bg-accent-pink shadow-shadow text-white animate-bounce">
                <AlertTriangle className="size-12" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading text-2xl uppercase tracking-tight text-accent-pink">
                  PEMBAYARAN GAGAL
                </h2>
                <p className="max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
                  Transaksi Anda terdeteksi gagal atau dibatalkan oleh sistem pembayaran. Mohon coba kembali atau gunakan metode pemindaian QRIS yang benar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row w-full justify-center">
                <button
                  type="button"
                  onClick={() => setDonationState("idle")}
                  className="border-[3px] border-black bg-accent-orange py-3 px-6 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:bg-opacity-95 active:translate-x-px cursor-pointer"
                >
                  COBA LAGI / KEMBALI
                </button>
                <Link href="/" className="w-full sm:w-auto">
                  <button className="w-full border-[3px] border-black bg-white py-3 px-6 font-heading text-xs uppercase tracking-wider text-black shadow-shadow hover:bg-zinc-100 dark:bg-[#222] dark:text-white dark:hover:bg-zinc-800 cursor-pointer">
                    KEMBALI KE BERANDA
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* EXPIRED state: Payment timed out */}
          {donationState === "expired" && (
            <div className="flex flex-col items-center text-center py-12 space-y-6">
              <div className="flex size-20 items-center justify-center rounded-full border-[4px] border-black bg-yellow-400 shadow-shadow text-black">
                <Clock className="size-12" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading text-2xl uppercase tracking-tight text-yellow-600 dark:text-yellow-400">
                  PEMBAYARAN KADALUARSA
                </h2>
                <p className="max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
                  Batas waktu pembayaran transaksi QRIS Anda selama 15 menit telah habis. Silakan buat sesi transaksi pembayaran baru.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row w-full justify-center">
                <button
                  type="button"
                  onClick={() => setDonationState("idle")}
                  className="border-[3px] border-black bg-[#ffea79] py-3 px-6 font-heading text-xs uppercase tracking-wider text-black shadow-shadow hover:bg-main active:translate-x-px cursor-pointer"
                >
                  BUAT TRANSAKSI BARU
                </button>
                <Link href="/" className="w-full sm:w-auto">
                  <button className="w-full border-[3px] border-black bg-white py-3 px-6 font-heading text-xs uppercase tracking-wider text-black shadow-shadow hover:bg-zinc-100 dark:bg-[#222] dark:text-white dark:hover:bg-zinc-800 cursor-pointer">
                    KEMBALI KE BERANDA
                  </button>
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic donor gratitude wall at the bottom of the donation page */}
        <div className="mt-16 pt-12 border-t-[3px] border-black/15 dark:border-white/10">
          <DonorLeaderboard donors={donors} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
