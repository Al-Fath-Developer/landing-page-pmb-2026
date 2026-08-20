/**
 * @file    src/components/mieayam/ManualDonationModal.tsx
 * @brief   Client-side Neo-Brutalist modal for bulk manual donation entry by bendahara
 * @author  opencode
 * @created 2026-08-20
 * @todo    None
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_TRANSACTIONS = 50;

interface ManualDonationModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (result: { count: number; totalAmount: number }) => void;
}

interface TxForm {
  key: string;
  donorName: string;
  donorEmail: string;
  date: string;
  amountInput: string;
  file: File | null;
  previewUrl: string | null;
  errors: Record<string, string>;
}

let txCounter = 0;
const nextKey = () => `tx-${Date.now()}-${txCounter++}`;

const getTodayWib = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const freshTx = (): TxForm => ({
  key: nextKey(),
  donorName: "",
  donorEmail: "",
  date: getTodayWib(),
  amountInput: "",
  file: null,
  previewUrl: null,
  errors: {},
});

const formatRupiahInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const parseAmount = (formatted: string) => {
  const digits = formatted.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : NaN;
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export default function ManualDonationModal({
  open,
  onClose,
  onSaved,
}: ManualDonationModalProps) {
  const [transactions, setTransactions] = useState<TxForm[]>(() => [freshTx()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Lock page scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const updateTx = (key: string, patch: Partial<TxForm>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.key === key ? { ...tx, ...patch } : tx))
    );
  };

  const handleAmountChange = (key: string, raw: string) => {
    updateTx(key, { amountInput: formatRupiahInput(raw) });
  };

  const handleFileChange = (key: string, file: File | null) => {
    const current = transactions.find((tx) => tx.key === key);
    if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
    const previewUrl =
      file && ALLOWED_TYPES.includes(file.type)
        ? URL.createObjectURL(file)
        : null;
    updateTx(key, { file, previewUrl, errors: { ...current?.errors, file: "" } });
  };

  const addTransaction = () => {
    if (transactions.length >= MAX_TRANSACTIONS) return;
    setTransactions((prev) => [...prev, freshTx()]);
  };

  const removeTransaction = (key: string) => {
    setTransactions((prev) => {
      const removed = prev.find((tx) => tx.key === key);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      if (prev.length <= 1) return prev;
      return prev.filter((tx) => tx.key !== key);
    });
  };

  const validateTransaction = (tx: TxForm): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!tx.date) errors.date = "Tanggal wajib diisi.";

    const amount = parseAmount(tx.amountInput);
    if (Number.isNaN(amount)) {
      errors.amount = "Nominal wajib diisi.";
    } else if (amount < 1000) {
      errors.amount = "Nominal minimal Rp1.000.";
    } else if (amount > 10000000) {
      errors.amount = "Nominal maksimal Rp10.000.000.";
    }

    if (tx.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tx.donorEmail)) {
      errors.email = "Format email tidak valid.";
    }

    if (tx.file) {
      if (!ALLOWED_TYPES.includes(tx.file.type)) {
        errors.file = "Format bukti harus JPG, PNG, atau WebP.";
      } else if (tx.file.size > MAX_FILE_SIZE) {
        errors.file = "Ukuran bukti maksimal 5MB.";
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    let hasError = false;
    const nextTransactions = transactions.map((tx) => {
      const errors = validateTransaction(tx);
      if (Object.keys(errors).length > 0) hasError = true;
      return { ...tx, errors };
    });
    setTransactions(nextTransactions);

    if (hasError) {
      setError("Periksa kembali data transaksi yang ditandai merah.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      const meta = transactions.map((tx) => ({
        donorName: tx.donorName,
        donorEmail: tx.donorEmail,
        date: tx.date,
        amount: parseAmount(tx.amountInput),
        hasProof: !!tx.file,
      }));
      formData.append("meta", JSON.stringify(meta));
      transactions.forEach((tx, i) => {
        if (tx.file) formData.append(`proof_${i}`, tx.file);
      });

      const response = await fetch("/api/mieayam/donations/manual", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal menyimpan donasi manual.");
        return;
      }

      transactions.forEach((tx) => {
        if (tx.previewUrl) URL.revokeObjectURL(tx.previewUrl);
      });
      onSaved({ count: data.count, totalAmount: data.totalAmount });
    } catch (err) {
      console.error("Manual donation submit error:", err);
      setError("Terjadi kesalahan koneksi server. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    const hasDirty = transactions.some(
      (tx) => tx.donorName || tx.donorEmail || tx.amountInput || tx.file
    );
    if (
      hasDirty &&
      !window.confirm("Data yang belum disimpan akan hilang. Lanjutkan menutup?")
    ) {
      return;
    }
    transactions.forEach((tx) => {
      if (tx.previewUrl) URL.revokeObjectURL(tx.previewUrl);
    });
    onClose();
  };

  const summary = useMemo(() => {
    const total = transactions.reduce((sum, tx) => {
      const amount = parseAmount(tx.amountInput);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
    return { count: transactions.length, total };
  }, [transactions]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-3xl border-[4px] border-black bg-white shadow-shadow-large overflow-hidden flex flex-col max-h-[90vh] dark:bg-zinc-900 dark:border-white animate-notif-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center justify-between dark:bg-zinc-800 dark:border-white">
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider">
              Input Donasi Manual
            </h4>
            <p className="text-[10px] font-bold text-accent-orange uppercase mt-0.5">
              PMB I-FEST 2026
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="border-[2px] border-black p-1 hover:bg-zinc-100 bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white cursor-pointer disabled:opacity-50"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="border-[3px] border-black bg-accent-blue/5 p-3 text-xs font-bold text-zinc-600 dark:border-white dark:bg-blue-950/20 dark:text-zinc-300">
            Masukkan transaksi donasi yang diterima secara manual. Nama dan bukti
            transfer opsional; jika nama dikosongkan akan tersimpan sebagai
            &quot;Donatur Anonim&quot;.
          </div>

          {error && (
            <div className="border-[3px] border-black bg-accent-pink/10 p-3 text-sm font-bold text-destructive flex items-center gap-2 dark:border-white dark:bg-red-950/20">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {transactions.map((tx, index) => (
            <div
              key={tx.key}
              className={`border-[2px] border-black bg-zinc-50/60 p-4 rounded-lg space-y-3 dark:bg-zinc-800/40 dark:border-white ${
                Object.keys(tx.errors).length > 0 ? "border-destructive" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs uppercase tracking-widest text-zinc-500">
                  Transaksi #{index + 1}
                </h5>
                <button
                  onClick={() => removeTransaction(tx.key)}
                  disabled={transactions.length <= 1 || submitting}
                  className="border-[2px] border-black p-1.5 bg-white hover:bg-red-50 text-destructive dark:bg-zinc-800 dark:hover:bg-red-950/30 dark:border-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={`Hapus transaksi ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                  Nama <span className="text-zinc-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={tx.donorName}
                  disabled={submitting}
                  onChange={(e) =>
                    updateTx(tx.key, { donorName: e.target.value, errors: { ...tx.errors, donorName: "" } })
                  }
                  placeholder="Kosongkan untuk Donatur Anonim"
                  className="w-full px-3 py-2 text-sm font-medium border-[3px] border-black rounded-lg focus:outline-none focus:ring-3 focus:ring-ring/50 placeholder-zinc-400 bg-white text-black dark:bg-zinc-800 dark:text-white dark:border-white"
                />
                {tx.errors.donorName && (
                  <p className="mt-1 text-[10px] font-bold text-destructive">{tx.errors.donorName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                  Email <span className="text-zinc-400">(opsional)</span>
                </label>
                <input
                  type="email"
                  value={tx.donorEmail}
                  disabled={submitting}
                  onChange={(e) =>
                    updateTx(tx.key, { donorEmail: e.target.value, errors: { ...tx.errors, email: "" } })
                  }
                  placeholder="email@contoh.com"
                  className="w-full px-3 py-2 text-sm font-medium border-[3px] border-black rounded-lg focus:outline-none focus:ring-3 focus:ring-ring/50 placeholder-zinc-400 bg-white text-black dark:bg-zinc-800 dark:text-white dark:border-white"
                />
                {tx.errors.email && (
                  <p className="mt-1 text-[10px] font-bold text-destructive">{tx.errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tanggal */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                    Tanggal <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={tx.date}
                    disabled={submitting}
                    onChange={(e) =>
                      updateTx(tx.key, { date: e.target.value, errors: { ...tx.errors, date: "" } })
                    }
                    className="w-full px-3 py-2 text-sm font-medium border-[3px] border-black rounded-lg focus:outline-none focus:ring-3 focus:ring-ring/50 bg-white text-black dark:bg-zinc-800 dark:text-white dark:border-white"
                  />
                  {tx.errors.date && (
                    <p className="mt-1 text-[10px] font-bold text-destructive">{tx.errors.date}</p>
                  )}
                </div>

                {/* Nominal */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                    Nominal <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-black text-sm">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tx.amountInput}
                      disabled={submitting}
                      onChange={(e) => handleAmountChange(tx.key, e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 text-sm font-bold border-[3px] border-black rounded-lg focus:outline-none focus:ring-3 focus:ring-ring/50 placeholder-zinc-400 bg-white text-black dark:bg-zinc-800 dark:text-white dark:border-white"
                    />
                  </div>
                  {tx.errors.amount && (
                    <p className="mt-1 text-[10px] font-bold text-destructive">{tx.errors.amount}</p>
                  )}
                </div>
              </div>

              {/* Bukti Transfer */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                  Bukti Transfer <span className="text-zinc-400">(opsional)</span>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-[3px] border-black rounded-lg p-3 bg-white cursor-pointer hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white">
                  <span className="flex items-center gap-2 text-xs font-black uppercase text-accent-blue">
                    <Upload size={14} />
                    <span>Pilih File</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={submitting}
                    onChange={(e) =>
                      handleFileChange(tx.key, e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                  {tx.file && tx.previewUrl ? (
                    <span className="flex items-center gap-2">
                      <img
                        src={tx.previewUrl}
                        alt="Pratinjau bukti"
                        className="h-10 w-10 object-cover border-[2px] border-black rounded-sm"
                      />
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 break-all">
                        {tx.file.name}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/20">
                        <Check size={10} /> Terpilih
                      </span>
                    </span>
                  ) : tx.file ? (
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 break-all">
                      {tx.file.name}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-zinc-400">
                      JPG, PNG, atau WebP (maks 5MB)
                    </span>
                  )}
                </label>
                {tx.errors.file && (
                  <p className="mt-1 text-[10px] font-bold text-destructive">{tx.errors.file}</p>
                )}
              </div>
            </div>
          ))}

          {/* Add transaction */}
          <button
            onClick={addTransaction}
            disabled={submitting || transactions.length >= MAX_TRANSACTIONS}
            className="w-full border-[2px] border-dashed border-black bg-zinc-50 hover:bg-zinc-100 text-black dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white dark:text-white font-black uppercase text-xs py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t-[3px] border-black p-4 bg-zinc-50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between dark:bg-zinc-800 dark:border-white">
          <div className="text-xs font-black uppercase tracking-wider">
            <span className="text-accent-orange">{summary.count} Transaksi</span>
            <span className="mx-1.5 text-zinc-300">|</span>
            <span className="text-emerald-600">
              Total {formatCurrency(summary.total)}
            </span>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleClose}
              disabled={submitting}
              variant="outline"
              className="border-[2px] border-black font-black uppercase text-xs h-9 px-4 dark:border-white cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="border-[3px] border-black bg-main hover:bg-main/80 text-black font-black uppercase text-xs h-9 px-4 shadow-shadow cursor-pointer active:translate-y-[1px] transition-transform dark:border-white flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Semua Donasi</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}