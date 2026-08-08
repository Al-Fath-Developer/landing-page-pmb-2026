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
import Image from "next/image";
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, Clock, Download, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DonationStats from "@/components/DonationStats";
import DonorCarousel from "@/components/DonorCarousel";
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
}

interface DonorRecord {
  id: string;
  name: string;
  message?: string;
  amountText: string;
  date: string;
}

export default function DonationPage() {
  const donationMode = process.env.NEXT_PUBLIC_DONATION_MODE || "manual";

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [manualOrderId, setManualOrderId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);

  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Bank Jago (PT Bank Artos Indonesia Tbk)";
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "107885714465";
  const bankHolder = process.env.NEXT_PUBLIC_BANK_HOLDER || "Venanda Angelyca Sherly Melati";

  // Cleanup proof image preview URL to prevent leaks
  useEffect(() => {
    return () => {
      if (proofPreview) {
        URL.revokeObjectURL(proofPreview);
      }
    };
  }, [proofPreview]);

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
  const [donorsLoading, setDonorsLoading] = useState(true);

  // Form input states
  const [formInput, setFormInput] = useState<DonationFormInput>({
    amount: 50000,
    donorName: "",
    donorEmail: "",
    message: "",
    isAnonymous: false,
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
    setDonorsLoading(true);
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
    } finally {
      setDonorsLoading(false);
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

  const handleDownloadQris = async () => {
    if (!paymentSession) return;
    try {
      const response = await fetch(paymentSession.qrisUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `qris-pmb-ifest-2026-${paymentSession.orderId}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QRIS download failed:", err);
      window.open(paymentSession.qrisUrl, "_blank");
    }
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
      if (name === "isAnonymous") {
        setFormInput((prev) => ({
          ...prev,
          isAnonymous: checked,
          donorName: checked ? "Hamba Allah" : "",
        }));
        return;
      }
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

    if (donationMode === "manual") {
      if (!proofFile) {
        newErrors.proof = "Bukti transfer wajib diunggah.";
      } else {
        if (proofFile.size > 5 * 1024 * 1024) {
          newErrors.proof = "Ukuran berkas bukti transfer maksimal adalah 5MB.";
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(proofFile.type)) {
          newErrors.proof = "Format berkas harus berupa JPG, PNG, atau WebP.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShareWebsite = async () => {
    const shareData = {
      title: "PMB I-FEST 2026",
      text: "Dukung dan kenali perjalanan PMB I-FEST 2026.",
      url: window.location.origin,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setShareFeedback("LINK BERHASIL DISALIN");
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setDonationState("submitting");

    if (donationMode === "manual") {
      try {
        const formData = new FormData();
        formData.append("donorName", formInput.donorName);
        formData.append("donorEmail", formInput.donorEmail);
        formData.append("amount", formInput.amount.toString());
        formData.append("message", formInput.message);
        formData.append("isAnonymous", formInput.isAnonymous ? "true" : "false");
        if (proofFile) {
          formData.append("proof", proofFile);
        }

        const response = await fetch("/api/donations/manual", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json();
          setErrors({ amount: errData.message || "Gagal mengirim data donasi manual." });
          setDonationState("idle");
          return;
        }

        const data = await response.json();
        setManualOrderId(data.orderId);
        setDonationState("success");
      } catch (err) {
        console.error("Manual donation submission failed:", err);
        setErrors({ amount: "Terjadi kesalahan jaringan atau koneksi server." });
        setDonationState("idle");
      }
      return;
    }

    try {
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
          showPublicName: !formInput.isAnonymous,
          showPublicMessage: true,
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
      <main className="mx-auto max-w-4xl py-12 px-6 sm:px-8 relative">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" /> Kembali ke Beranda
          </Link>
        </div>

        {/* Retro dots overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_#000_10%,_transparent_10%)] bg-[size:16px_16px] pointer-events-none" />
        

        {/* Header Image */}
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[300px] border-[4px] border-black shadow-shadow-large mb-6 overflow-hidden bg-zinc-200">
          <Image
            src="/header_donation.webp"
            alt="Header Donasi PMB I-FEST 2026"
            fill
            priority
            className="object-cover select-none"
            draggable={false}
          />
        </div>

        {/* Campaign Info Header */}
        <div className="border-[4px] border-black bg-accent-blue p-6 sm:p-8 text-white shadow-shadow-large mb-10 dark:bg-[#0f2a3a]">
          <div className="inline-flex items-center gap-1 border-[2.5px] border-black bg-[#ffea79] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-shadow">
            KAMPANYE SOSIAL & DAKWAH
          </div>
          {/* Image */}
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[300px] border-[4px] border-black shadow-shadow-large mb-6 overflow-hidden bg-zinc-200">
          <Image
            src="/banner.png"
            alt="Header Donasi PMB I-FEST 2026"
            fill
            priority
            className="object-cover select-none"
            draggable={false}
          />
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
            donationMode === "manual" ? (
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Form */}
                <form onSubmit={handleDonationSubmit} className="lg:col-span-7 space-y-6">
                  <h2 className="border-b-[3px] border-black pb-2 font-heading text-lg uppercase tracking-tight dark:border-zinc-700">
                    ISI FORMULIR DONASI
                  </h2>

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

                  {/* Anonymous Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isAnonymous"
                          name="isAnonymous"
                          checked={formInput.isAnonymous}
                          onChange={handleInputChange}
                          className="size-4 border-[2px] border-black checked:bg-accent-orange cursor-pointer"
                        />
                        <label htmlFor="isAnonymous" className="font-heading text-[10px] sm:text-xs uppercase tracking-wide cursor-pointer select-none">
                          Sembunyikan nama saya (Hamba Allah)
                        </label>
                      </div>

{/* Amount Selection */}
                  <div className="space-y-3">
                    {/* Custom Amount Field */}
                    <div className="relative mt-5">
                      <label className="block font-heading text-xs uppercase tracking-wide">
                        Masukkan Nominal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customAmountStr}
                        onChange={handleCustomAmountChange}
                        onFocus={() => {
                          setActivePreset(null);
                          if (customAmountStr === "") {
                            setFormInput((prev) => ({ ...prev, amount: 0 }));
                          }
                        }}
                        placeholder="Masukkan jumlah donasi..."
                        className="w-full border-[3px] border-black bg-white py-3 pl-3 pr-4 font-mono text-xs shadow-shadow transition-all duration-200 focus:outline-none focus:bg-zinc-50 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:bg-[#2c2c2c] dark:text-white dark:focus:bg-zinc-800"
                      />
                    </div>
                    {errors.amount && (
                      <p className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400">{errors.amount}</p>
                    )}
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

                  {/* Proof of Transfer File Upload */}
                  <div className="space-y-2">
                    <label className="block font-heading text-xs uppercase tracking-wide">
                      Upload Bukti Transfer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative border-[3px] border-black p-4 bg-zinc-50 dark:bg-[#2c2c2c] shadow-shadow flex flex-col items-center justify-center text-center">
                      <input
                        type="file"
                        id="proof"
                        name="proof"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0] || null;
                          setProofFile(selectedFile);
                          if (errors.proof) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.proof;
                              return next;
                            });
                          }
                          if (selectedFile) {
                            const previewUrl = URL.createObjectURL(selectedFile);
                            setProofPreview(previewUrl);
                          } else {
                            setProofPreview(null);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {proofPreview ? (
                        <div className="space-y-2 relative z-20">
                          <div className="relative size-32 border-[2px] border-black mx-auto overflow-hidden bg-white">
                            <img
                              src={proofPreview}
                              alt="Preview Bukti Transfer"
                              className="size-full object-contain"
                            />
                          </div>
                          <p className="font-mono text-[9px] font-bold text-zinc-500 uppercase">
                            {proofFile?.name} ({Math.round((proofFile?.size || 0) / 1024)} KB)
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofFile(null);
                              setProofPreview(null);
                            }}
                            className="font-mono text-[9px] uppercase text-red-600 underline font-bold cursor-pointer"
                          >
                            Hapus File
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 py-4">
                          <p className="font-heading text-xs uppercase">Pilih Berkas Bukti Transfer</p>
                          <p className="font-mono text-[9px] text-zinc-500 uppercase">JPG, PNG, atau WebP (Maks 5MB)</p>
                        </div>
                      )}
                    </div>
                    {errors.proof && (
                      <p className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400">{errors.proof}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t-[3px] border-black dark:border-zinc-700">
                    <Button
                      type="submit"
                      disabled={donationState !== "idle"}
                      className="w-full border-[4px] border-black bg-accent-orange py-6 font-heading text-sm uppercase tracking-wider text-white shadow-shadow hover:bg-accent-orange/95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0)]"
                    >
                      {donationState !== "idle" ? "MENGIRIM..." : `KIRIM DONASI • ${formatRupiah(formInput.amount)}`}
                    </Button>
                  </div>
                </form>

                {/* Right Column: Instructions */}
                <div className="lg:col-span-5 space-y-6 lg:border-l-[3px] lg:border-black lg:pl-8 dark:border-zinc-700">
                  <h2 className="border-b-[3px] border-black pb-2 font-heading text-lg uppercase tracking-tight dark:border-zinc-700">
                    INFORMASI PEMBAYARAN
                  </h2>
                  
                  {/* QRIS Box */}
                  <div className="border-[3px] border-black bg-white p-4 shadow-shadow text-center flex flex-col items-center dark:bg-[#1a1a1a]">
                    <div className="relative size-64 bg-zinc-100 flex items-center justify-center dark:bg-[#2c2c2c]">
                      <Image
                        src="/qr.jpeg"
                        alt="PMB I-FEST 2026 QRIS"
                        fill
                        sizes="512px"
                        className="object-contain p-2 select-none"
                        draggable={false}
                      />
                    </div>
                    <div className="mt-3 w-full">
                      <a
                        href="/qr.jpeg"
                        download="qr-pmb-ifest-2026.jpeg"
                        className="w-full inline-flex items-center justify-center gap-2 border-[3px] border-black bg-[#ffea79] py-2.5 px-4 font-heading text-xs uppercase tracking-wider text-black shadow-shadow hover:bg-[#ffea79]/90 active:translate-x-px active:translate-y-px cursor-pointer"
                      >
                        <Download className="size-4" />
                        DOWNLOAD QRIS
                      </a>
                    </div>
                  </div>

                  {/* Bank Transfer Box */}
                  <div className="border-[3px] border-black bg-zinc-50 p-4 shadow-shadow dark:bg-[#252525] space-y-3">
                    <h3 className="font-heading text-xs uppercase tracking-wider border-b border-black/10 dark:border-white/10 pb-1">
                      TRANSFER BANK
                    </h3>
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 uppercase text-[9px] block">BANK</span>
                        <span className="font-bold text-black dark:text-white uppercase">{bankName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase text-[9px] block">NO. REKENING</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black dark:text-white">{bankAccount}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(bankAccount);
                              alert("Nomor rekening berhasil disalin!");
                            }}
                            className="text-[9px] uppercase underline text-accent-orange font-bold cursor-pointer"
                          >
                            Salin
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase text-[9px] block">ATAS NAMA</span>
                        <span className="font-bold text-black dark:text-white uppercase">{bankHolder}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
                  <div className="relative mt-5">
                    <label className="block font-heading text-xs uppercase tracking-wide">
                      Nominal Lainnya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customAmountStr}
                      onChange={handleCustomAmountChange}
                      onFocus={() => {
                        setActivePreset(null);
                        if (customAmountStr === "") {
                          setFormInput((prev) => ({ ...prev, amount: 0 }));
                        }
                      }}
                      placeholder="Masukkan jumlah donasi..."
                      className="w-full border-[3px] border-black bg-white py-3 pl-3 pr-4 font-mono text-xs shadow-shadow transition-all duration-200 focus:outline-none focus:bg-zinc-50 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:bg-[#2c2c2c] dark:text-white dark:focus:bg-zinc-800"
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
                    {/* Anonymous Checkbox */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        name="isAnonymous"
                        checked={formInput.isAnonymous}
                        onChange={handleInputChange}
                        className="size-4 border-[2px] border-black checked:bg-accent-orange cursor-pointer"
                      />
                      <label htmlFor="isAnonymous" className="font-heading text-[10px] sm:text-xs uppercase tracking-wide cursor-pointer select-none">
                        Sembunyikan nama saya (Hamba Allah)
                      </label>
                    </div>
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
            )
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
                    <div className="relative size-64 bg-zinc-100 border-[2px] border-black flex items-center justify-center">
                      {/* Actual Midtrans QRIS Image render */}
                      <img
                        src={paymentSession.qrisUrl}
                        alt="QRIS Payment Code"
                        className="size-full object-contain p-2 select-none"
                        draggable={false}
                      />
                      
                      <div className="absolute inset-0 m-auto flex size-12 items-center justify-center border-[2px] border-black bg-accent-blue font-heading text-xs text-white select-none">
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
                  <button
                    type="button"
                    onClick={handleDownloadQris}
                    className="mt-4 inline-flex items-center gap-2 border-[3px] border-black bg-accent-orange py-3 px-6 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:bg-accent-orange/95 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
                  >
                    <Download className="size-4" />
                    Download QRIS
                  </button>
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
                  {donationMode === "manual" ? "DONASI BERHASIL DIKIRIM!" : "DONASI BERHASIL DITERIMA!"}
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
                  {donationMode === "manual" && manualOrderId && (
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">ID Referensi:</span>{" "}
                      <span className="font-mono text-xs font-bold text-black dark:text-white">{manualOrderId}</span>
                    </div>
                  )}
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
                {donationMode === "manual"
                  ? "Data donasi dan bukti pembayaran Anda telah berhasil dikirim. Terima kasih atas kontribusi Anda."
                  : "Terima kasih atas kontribusi Anda. Dukungan berharga ini akan segera disalurkan penuh demi mensukseskan kegiatan dakwah penyambutan mahasiswa baru muslim."}
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
                    });
                    setProofFile(null);
                    if (proofPreview) {
                      URL.revokeObjectURL(proofPreview);
                      setProofPreview(null);
                    }
                    setManualOrderId(null);
                    setCustomAmountStr("");
                    setActivePreset(50000);
                    setDonationState("idle");
                  }}
                  className="border-[3px] border-black bg-accent-orange py-3 px-6 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-px cursor-pointer"
                >
                  KIRIM DONASI BARU
                </button>
                <button
                  type="button"
                  onClick={handleShareWebsite}
                  className="border-[3px] border-black bg-accent-blue py-3 px-6 font-heading text-xs uppercase tracking-wider text-white shadow-shadow hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-px cursor-pointer"
                >
                  {shareFeedback || "BAGIKAN WEBSITE"}
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

        {/* Petunjuk Pembayaran Section (Separate Collapsible Container below the form) */}
        {donationMode === "manual" && donationState === "idle" && (
          <div className="border-[4px] border-black bg-white shadow-shadow-large mt-8 dark:bg-[#1a2b3a] dark:text-white overflow-hidden transition-all duration-300">
            {/* Header / Trigger */}
            <button
              type="button"
              onClick={() => setIsInstructionsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between p-6 font-heading text-sm uppercase tracking-wider cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
            >
              <span>PETUNJUK PEMBAYARAN</span>
              {isInstructionsExpanded ? (
                <ChevronUp className="size-5 text-black dark:text-white stroke-[2.5]" />
              ) : (
                <ChevronDown className="size-5 text-black dark:text-white stroke-[2.5]" />
              )}
            </button>
            
            {/* Collapsible Content */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isInstructionsExpanded
                  ? "max-h-[500px] border-t-[3px] border-black dark:border-zinc-700 p-6 sm:p-8 opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              } overflow-hidden`}
            >
              <ol className="list-decimal list-inside font-sans text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 space-y-2">
                <li>Pindai QRIS atau transfer ke rekening di atas.</li>
                <li>Masukkan nominal donasi yang sesuai.</li>
                <li>Simpan bukti transaksi pembayaran Anda.</li>
                <li>Unggah bukti transfer pada form di sebelah kiri.</li>
                <li>Klik &ldquo;KIRIM DONASI&rdquo; untuk menyelesaikan.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Dynamic donor gratitude wall at the bottom of the donation page */}
        <div className="mt-16 pt-12 border-t-[3px] border-black/15 dark:border-white/10">
          <DonorCarousel donors={donors} isLoading={donorsLoading} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
