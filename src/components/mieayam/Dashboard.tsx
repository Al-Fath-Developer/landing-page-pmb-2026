/**
 * @file    src/components/mieayam/Dashboard.tsx
 * @brief   Client-side operational reporting dashboard component for panitia/bendahara donations tracking
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  LogOut, Calendar, Search, FileDown, RefreshCw, 
  ChevronLeft, ChevronRight, Eye, X, Check, Image as ImageIcon, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWibDate, formatWibDateTime } from "@/lib/mieayam/timezone";

// Interface definitions
interface KPIStats {
  totalDonation: number;
  totalTransactions: number;
  averageDonation: number;
  todayDonation: number;
  todayTransactions: number;
}

interface DailySummaryItem {
  date: string;
  transactionCount: number;
  totalAmount: number;
}

interface TransactionItem {
  id: string;
  orderId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  paymentMethod: string;
  message: string;
  paidAt: string;
  hasProof: boolean;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface TransactionDetail {
  id: string;
  orderId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  message: string;
  showPublicName: boolean;
  showPublicMessage: boolean;
  status: string;
  paymentMethod: string;
  midtransTransactionId: string;
  proofStoragePath: string | null;
  proofSignedUrl: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string;
}

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

export default function Dashboard({ username, onLogout }: DashboardProps) {
  // Helpers to get today's WIB date in YYYY-MM-DD
  const getTodayWibString = () => {
    const d = new Date();
    // Shift by timezone offset to represent WIB safely
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    return formatter.format(d);
  };

  const todayStr = getTodayWibString();

  const getWibDateWithOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    return formatter.format(d);
  };

  const yesterdayStr = getWibDateWithOffset(1);
  const sevenDaysAgoStr = getWibDateWithOffset(6);
  const thirtyDaysAgoStr = getWibDateWithOffset(29);

  // Primary filtering states
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Main metrics states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState<KPIStats>({
    totalDonation: 0,
    totalTransactions: 0,
    averageDonation: 0,
    todayDonation: 0,
    todayTransactions: 0,
  });
  const [dailySummary, setDailySummary] = useState<DailySummaryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  });

  // Modal detailed view states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<TransactionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Logout handler
  const handleLogoutClick = async () => {
    try {
      const response = await fetch("/api/mieayam/auth/logout", { method: "POST" });
      if (response.ok) {
        onLogout();
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  };

  // Primary data fetcher
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        start: startDate,
        end: endDate,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) {
        query.set("search", search);
      }

      const response = await fetch(`/api/mieayam/donations?${query.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setKpis(data.kpis);
        setDailySummary(data.dailySummary);
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Gagal memuat laporan donasi.");
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, search, page]);

  // Fetch detail for modal
  const fetchTransactionDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError("");
    setDetailData(null);
    try {
      const response = await fetch(`/api/mieayam/donations/${id}`);
      const data = await response.json();
      if (response.ok) {
        setDetailData(data);
      } else {
        setDetailError(data.message || "Gagal memuat detail transaksi.");
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
      setDetailError("Terjadi kesalahan koneksi server.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Fetch when dashboard filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch detail if dynamic modal ID opens
  useEffect(() => {
    if (selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTransactionDetail(selectedId);
    }
  }, [selectedId, fetchTransactionDetail]);

  // Formatting currency helper (IDR)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Apply quick date ranges
  const applyDateRange = (daysOffset: number | string) => {
    setPage(1);
    if (daysOffset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (daysOffset === "yesterday") {
      setStartDate(yesterdayStr);
      setEndDate(yesterdayStr);
    } else if (daysOffset === 7) {
      setStartDate(sevenDaysAgoStr);
      setEndDate(todayStr);
    } else if (daysOffset === 30) {
      setStartDate(thirtyDaysAgoStr);
      setEndDate(todayStr);
    }
  };

  // Click handler on date aggregate drill down
  const handleDateClick = (dateStr: string) => {
    setPage(1);
    setStartDate(dateStr);
    setEndDate(dateStr);
  };

  // Search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-[#ffea79] text-black pb-12 dark:bg-zinc-950 dark:text-white">
      
      {/* 1. Header Toolbar */}
      <header className="border-b-[4px] border-black bg-white py-3 px-4 sm:py-4 sm:px-6 sticky top-0 z-10 flex items-center justify-between shadow-sm dark:bg-zinc-900 dark:border-white">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-accent-blue border-[3px] border-black p-1 sm:p-1.5 font-bold text-white text-[10px] sm:text-xs uppercase shadow-sm shrink-0 dark:border-white">
            {username}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black uppercase tracking-tight leading-none text-black dark:text-white truncate">
              Dashboard Donasi
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-accent-orange uppercase tracking-wider mt-0.5 truncate">
              Cemangat Cemungut
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right">
          </div>
          <Button
            onClick={handleLogoutClick}
            variant="destructive"
            className="border-[3px] border-black font-black uppercase text-xs h-8 sm:h-9 px-2 sm:px-3 bg-red-100 hover:bg-red-200 text-destructive dark:border-white dark:bg-red-950/40 cursor-pointer flex items-center gap-1"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* 2. Error message banner */}
        {error && (
          <div className="border-[3px] border-black bg-accent-pink/10 p-4 text-sm font-bold text-destructive flex items-center gap-3 dark:border-white dark:bg-red-950/20">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Filter Bar Control */}
        <section className="border-[3px] border-black bg-white p-5 shadow-shadow dark:bg-zinc-900 dark:border-white">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
            Filter Data Donasi
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
            {/* Pickers */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                  Mulai Tanggal (WIB)
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setPage(1); setStartDate(e.target.value); }}
                    className="pl-9 pr-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white rounded-md text-black focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-white"
                  />
                </div>
              </div>

              <div className="hidden sm:block text-xs font-black text-zinc-400">s/d</div>

              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1 dark:text-white">
                  Akhir Tanggal (WIB)
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setPage(1); setEndDate(e.target.value); }}
                    className="pl-9 pr-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white rounded-md text-black focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-white"
                  />
                </div>
              </div>

              {/* Quick Range Shortcuts */}
              <div className="flex flex-wrap gap-1.5 mt-4 sm:mt-0 sm:ml-2">
                <button
                  onClick={() => applyDateRange("today")}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase border-[2px] border-black cursor-pointer rounded-md transition-all ${
                    startDate === todayStr && endDate === todayStr
                      ? "bg-accent-orange text-black font-black"
                      : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => applyDateRange("yesterday")}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase border-[2px] border-black cursor-pointer rounded-md transition-all ${
                    startDate === yesterdayStr && endDate === yesterdayStr
                      ? "bg-accent-orange text-black font-black"
                      : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  Kemarin
                </button>
                <button
                  onClick={() => applyDateRange(7)}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase border-[2px] border-black cursor-pointer rounded-md transition-all ${
                    startDate === sevenDaysAgoStr && endDate === todayStr
                      ? "bg-accent-orange text-black font-black"
                      : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => applyDateRange(30)}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase border-[2px] border-black cursor-pointer rounded-md transition-all ${
                    startDate === thirtyDaysAgoStr && endDate === todayStr
                      ? "bg-accent-orange text-black font-black"
                      : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  30 Hari
                </button>
              </div>
            </div>

            {/* Actions (Search + Export) */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-end">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari Order ID / Nama..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white rounded-md text-black focus:outline-none min-w-[120px] sm:min-w-[200px] w-full dark:bg-zinc-800 dark:text-white dark:border-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="border-[2px] border-black font-black uppercase text-xs h-8 px-3 bg-zinc-100 hover:bg-zinc-200 text-black dark:border-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white cursor-pointer"
                >
                  Cari
                </Button>
              </form>

              <a
                href={`/api/mieayam/export?start=${startDate}&end=${endDate}`}
                download
                className="border-[2px] border-black bg-[#107c41] hover:bg-[#0e6c38] text-white py-1.5 px-3 font-black uppercase text-xs rounded-md shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-[1px]"
              >
                <FileDown size={14} />
                <span>Unduh Excel</span>
              </a>
            </div>
          </div>
        </section>

        {/* 4. KPI summary grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Card 4: Today stats */}
          <div className="border-[3px] border-black bg-white p-5 shadow-shadow relative overflow-hidden dark:bg-zinc-900 dark:border-white">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Donasi Hari Ini</p>
            <p className="text-2xl font-black mt-2 tracking-tight text-accent-orange">
              {loading ? "..." : formatCurrency(kpis.todayDonation)}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold mt-1">
              {loading ? "..." : `${kpis.todayTransactions} transaksi sukses`} pada {formatWibDate(todayStr)}
            </p>
          </div>

          {/* Card 1: Total range collected */}
          <div className="border-[3px] border-black bg-white p-5 shadow-shadow relative overflow-hidden dark:bg-zinc-900 dark:border-white">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Donasi</p>
            <p className="text-2xl font-black mt-2 tracking-tight">
              {loading ? "..." : formatCurrency(kpis.totalDonation)}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold mt-1">
              Dari {formatWibDate(startDate)} s/d {formatWibDate(endDate)}
            </p>
          </div>

          {/* Card 2: Transaction count */}
          <div className="border-[3px] border-black bg-white p-5 shadow-shadow relative overflow-hidden dark:bg-zinc-900 dark:border-white">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Jumlah Transaksi</p>
            <p className="text-2xl font-black mt-2 tracking-tight">
              {loading ? "..." : `${kpis.totalTransactions} Transaksi`}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold mt-1">
              Total pembayaran sukses
            </p>
          </div>

          {/* Card 3: Average amount */}
          <div className="border-[3px] border-black bg-white p-5 shadow-shadow relative overflow-hidden dark:bg-zinc-900 dark:border-white">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rata-Rata Donasi</p>
            <p className="text-2xl font-black mt-2 tracking-tight">
              {loading ? "..." : formatCurrency(kpis.averageDonation)}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold mt-1">
              Per transaksi paid
            </p>
          </div>

        </section>

        {/* 5. Main Layout Split (Summary vs Transactions Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Daily Aggregate Summaries (Span 4 cols) */}
          <section className="lg:col-span-4 border-[3px] border-black bg-white shadow-shadow overflow-hidden dark:bg-zinc-900 dark:border-white">
            <div className="border-b-[3px] border-black p-4 bg-zinc-50 dark:bg-zinc-800 dark:border-white">
              <h3 className="font-black text-sm uppercase tracking-wider">Rekap Laporan Harian</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Urutan Tanggal Terbaru</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto w-full">
              {loading && dailySummary.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold text-zinc-500">
                  <RefreshCw className="animate-spin inline mr-2" size={16} />
                  <span>Memuat...</span>
                </div>
              ) : dailySummary.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold text-zinc-500">
                  Belum ada rekap donasi.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-[2px] border-black font-black uppercase text-[10px] bg-zinc-100/50 text-zinc-500 dark:border-white dark:bg-zinc-800/50">
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4 text-center">Transaksi</th>
                      <th className="py-2.5 px-4 text-right">Total Donasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {dailySummary.map((item) => (
                      <tr 
                        key={item.date} 
                        onClick={() => handleDateClick(item.date)}
                        className={`hover:bg-accent-orange/5 cursor-pointer transition-colors ${
                          startDate === item.date && endDate === item.date 
                            ? "bg-accent-orange/10 font-bold" 
                            : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-black">
                          {formatWibDate(item.date)}
                          {item.date === todayStr && (
                            <span className="ml-1.5 bg-accent-orange text-black font-black text-[9px] px-1 rounded-sm uppercase tracking-wide">
                              Hari Ini
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-zinc-600 dark:text-zinc-400">
                          {item.transactionCount}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Detailed Transaction Table (Span 8 cols) */}
          <section className="lg:col-span-8 border-[3px] border-black bg-white shadow-shadow overflow-hidden dark:bg-zinc-900 dark:border-white">
            <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center justify-between dark:bg-zinc-800 dark:border-white">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Detail Transaksi Sukses (Paid)</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">
                  Menampilkan {pagination.totalItems} catatan matching
                </p>
              </div>

              {search && (
                <button
                  onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  className="bg-zinc-100 hover:bg-zinc-200 border-[2px] border-black py-1 px-2.5 font-bold uppercase text-[9px] flex items-center gap-1 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white cursor-pointer"
                >
                  <X size={10} />
                  <span>Clear Search</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto w-full">
              {loading ? (
                <div className="p-16 text-center text-sm font-bold text-zinc-500">
                  <RefreshCw className="animate-spin inline mr-2" size={16} />
                  <span>Memuat transaksi...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-16 text-center text-sm font-bold text-zinc-500 space-y-2">
                  <p>Tidak ada transaksi paid ditemukan.</p>
                  <p className="text-xs text-zinc-400 font-medium">Pastikan status pembayaran sudah status paid.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b-[2px] border-black font-black uppercase text-[10px] bg-zinc-100/50 text-zinc-500 dark:border-white dark:bg-zinc-800/50">
                      <th className="py-3 px-4">Tanggal (WIB)</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Donatur</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4 text-center">Metode</th>
                      <th className="py-3 px-4 text-center">Bukti</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {transactions.map((t) => (
                      <tr 
                        key={t.id} 
                        className="hover:bg-zinc-50 transition-colors cursor-pointer dark:hover:bg-zinc-800/50"
                        onClick={() => setSelectedId(t.id)}
                      >
                        <td className="py-3 px-4 font-bold text-zinc-500">
                          {formatWibDateTime(t.paidAt)}
                        </td>
                        <td className="py-3 px-4 font-black tracking-tight">{t.orderId}</td>
                        <td className="py-3 px-4 font-bold">
                          <div>{t.donorName}</div>
                          <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{t.donorEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-600">{formatCurrency(t.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border-[1.5px] border-black ${
                            t.paymentMethod === "manual" 
                              ? "bg-accent-blue/10 text-accent-blue" 
                              : "bg-accent-green/10 text-emerald-600"
                          } dark:border-white`}>
                            {t.paymentMethod === "midtrans_qris" ? "QRIS" : t.paymentMethod === "manual" ? "MANUAL" : t.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {t.hasProof ? (
                            <button 
                              onClick={() => setSelectedId(t.id)}
                              className="text-accent-orange font-bold hover:underline flex items-center justify-center gap-1 w-full"
                            >
                              <ImageIcon size={14} />
                              <span>Lihat</span>
                            </button>
                          ) : (
                            <span className="text-zinc-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedId(t.id)}
                            className="bg-zinc-100 hover:bg-zinc-200 border-[2px] border-black font-black uppercase text-[10px] px-2 py-1 flex items-center justify-center mx-auto dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white cursor-pointer"
                          >
                            <Eye size={12} className="mr-1" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && pagination.totalPages > 1 && (
              <div className="border-t-[2px] border-black p-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 dark:border-white">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="border-[2px] border-black bg-white hover:bg-zinc-100 text-black h-8 px-2.5 disabled:opacity-50 cursor-pointer dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white"
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </Button>
                  <Button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    className="border-[2px] border-black bg-white hover:bg-zinc-100 text-black h-8 px-2.5 disabled:opacity-50 cursor-pointer dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* 6. Transaction Detail Modal overlay */}
      {selectedId && (
        <div className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-3xl border-[4px] border-black bg-white shadow-shadow-large overflow-hidden flex flex-col max-h-[90vh] dark:bg-zinc-900 dark:border-white animate-notif-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center justify-between dark:bg-zinc-800 dark:border-white">
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">Detail Transaksi Donasi</h4>
                <p className="text-[10px] font-bold text-accent-orange uppercase mt-0.5">PMB I-FEST 2026</p>
              </div>
              <button 
                onClick={() => { setSelectedId(null); setDetailData(null); }}
                className="border-[2px] border-black p-1 hover:bg-zinc-100 bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              {detailLoading ? (
                <div className="py-20 text-center text-sm font-bold text-zinc-500">
                  <RefreshCw className="animate-spin inline mr-2" size={16} />
                  <span>Mengambil data transaksi detail...</span>
                </div>
              ) : detailError ? (
                <div className="border-[3px] border-black bg-accent-pink/10 p-4 text-sm font-bold text-destructive flex items-center gap-3 dark:border-white dark:bg-red-950/20">
                  <AlertCircle size={18} />
                  <span>{detailError}</span>
                </div>
              ) : detailData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left: Metadata Details */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b-[2px] border-zinc-100 pb-1.5 dark:border-zinc-800">
                      Rincian Audit
                    </h5>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="font-bold text-zinc-500 uppercase">Order ID</span>
                      <span className="col-span-2 font-black tracking-tight break-all">{detailData.orderId}</span>
                      
                      <span className="font-bold text-zinc-500 uppercase">Donatur</span>
                      <span className="col-span-2 font-bold break-words">{detailData.donorName}</span>
                      
                      <span className="font-bold text-zinc-500 uppercase">Email</span>
                      <span className="col-span-2 font-medium break-all">{detailData.donorEmail}</span>
                      
                      <span className="font-bold text-zinc-500 uppercase">Nominal</span>
                      <span className="col-span-2 font-black text-emerald-600 text-sm">
                        {formatCurrency(detailData.amount)}
                      </span>
                      
                      <span className="font-bold text-zinc-500 uppercase">Metode</span>
                      <span className="col-span-2">
                        <span className="inline-block text-[10px] font-black uppercase px-2 border-[1.5px] border-black bg-zinc-50 dark:border-white dark:bg-zinc-800">
                          {detailData.paymentMethod === "midtrans_qris" ? "QRIS" : detailData.paymentMethod === "manual" ? "Manual Transfer" : detailData.paymentMethod}
                        </span>
                      </span>

                      <span className="font-bold text-zinc-500 uppercase">Status</span>
                      <span className="col-span-2 flex items-center gap-1 font-bold text-emerald-600">
                        <Check size={14} />
                        <span>SUKSES (Paid)</span>
                      </span>

                      {detailData.midtransTransactionId && detailData.midtransTransactionId !== "-" && (
                        <>
                          <span className="font-bold text-zinc-500 uppercase">Midtrans ID</span>
                          <span className="col-span-2 font-mono text-[10px] font-medium tracking-tight break-all">
                            {detailData.midtransTransactionId}
                          </span>
                        </>
                      )}
                      
                      <span className="font-bold text-zinc-500 uppercase">Dibuat</span>
                      <span className="col-span-2 font-medium text-zinc-500">
                        {formatWibDateTime(detailData.createdAt)}
                      </span>
                      
                      <span className="font-bold text-zinc-500 uppercase">Dibayar (WIB)</span>
                      <span className="col-span-2 font-bold text-zinc-700 dark:text-zinc-300">
                        {formatWibDateTime(detailData.paidAt)}
                      </span>
                    </div>

                    {/* Donor custom message block */}
                    {detailData.message && (
                      <div className="mt-4 border-[2px] border-black bg-zinc-50/50 p-3 rounded-lg dark:border-white dark:bg-zinc-800/30">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                          Pesan Donatur
                        </p>
                        <p className="text-xs font-bold italic text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          &quot;{detailData.message}&quot;
                        </p>
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                            detailData.showPublicName ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20" : "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/20"
                          }`}>
                            Nama Publik: {detailData.showPublicName ? "Ya" : "Anonim"}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                            detailData.showPublicMessage ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20" : "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/20"
                          }`}>
                            Pesan Publik: {detailData.showPublicMessage ? "Ya" : "Sembunyi"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Payment Proof */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b-[2px] border-zinc-100 pb-1.5 dark:border-zinc-800">
                      Bukti Pembayaran / Transfer
                    </h5>

                    {detailData.proofSignedUrl ? (
                      <div className="border-[3px] border-black bg-zinc-100 p-2 text-center rounded-lg relative overflow-hidden dark:border-white dark:bg-zinc-800">
                        <div className="relative aspect-[4/5] w-full max-w-xs mx-auto border border-zinc-300 bg-white overflow-hidden rounded-md flex items-center justify-center">
                          <img 
                            src={detailData.proofSignedUrl} 
                            alt="Bukti Transfer"
                            className="object-contain max-h-full max-w-full"
                          />
                        </div>
                        <div className="mt-2 flex justify-center">
                          <a 
                            href={detailData.proofSignedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-black hover:bg-zinc-800 text-white font-black uppercase text-[10px] px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer dark:bg-white dark:text-black"
                          >
                            <ImageIcon size={12} />
                            <span>Buka Ukuran Penuh</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="border-[3px] border-dashed border-zinc-300 p-12 text-center rounded-lg text-zinc-400 dark:border-zinc-800 flex flex-col items-center justify-center gap-2">
                        <ImageIcon size={32} className="text-zinc-300" />
                        <p className="text-xs font-bold">Bukti transfer tidak tersedia.</p>
                        <p className="text-[10px] text-zinc-400 leading-normal max-w-[200px]">
                          Transaksi melalui Midtrans QRIS otomatis diverifikasi tanpa upload bukti manual.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="border-t-[3px] border-black p-4 bg-zinc-50 flex justify-end dark:bg-zinc-800 dark:border-white">
              <Button
                onClick={() => { setSelectedId(null); setDetailData(null); }}
                className="border-[2px] border-black bg-black text-white hover:bg-zinc-800 font-black uppercase text-xs h-9 px-4 dark:bg-white dark:text-black cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
