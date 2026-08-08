/**
 * @file    src/app/api/mieayam/export/route.ts
 * @brief   Server-side API route for exporting donation summaries and detail ledgers to formatted Excel (.xlsx) files
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSession } from "@/lib/mieayam/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getWibDateRangeBoundaries, toWibDateString, formatWibDate, formatWibTime } from "@/lib/mieayam/timezone";

export async function GET(request: NextRequest) {
  try {
    // 1. Session verification
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start"); // WIB Date
    const endParam = searchParams.get("end");     // WIB Date

    if (!startParam || !endParam) {
      return new NextResponse("Missing start or end parameter", { status: 400 });
    }

    const supabase = getSupabaseServer();

    // 3. Convert WIB to UTC boundaries
    const range = getWibDateRangeBoundaries(startParam, endParam);

    // 4. Retrieve all PAID transactions in range (no pagination for export)
    const { data: transactions, error: dbError } = await supabase
      .from("donations")
      .select("*")
      .eq("status", "paid")
      .gte("paid_at", range.startUtc)
      .lt("paid_at", range.endUtc)
      .order("paid_at", { ascending: true }); // chronological order

    if (dbError || !transactions) {
      console.error("Export transactions query failed:", dbError);
      return new NextResponse("Database query failed", { status: 500 });
    }

    // 5. Generate Daily Summary data
    const dailyMap: Record<string, { count: number; total: number }> = {};
    
    // Initialize summary map with range dates
    const startObj = new Date(`${startParam}T00:00:00+07:00`);
    const endObj = new Date(`${endParam}T00:00:00+07:00`);
    const runDate = new Date(startObj);
    while (runDate <= endObj) {
      const dStr = toWibDateString(runDate);
      dailyMap[dStr] = { count: 0, total: 0 };
      runDate.setDate(runDate.getDate() + 1);
    }

    // Aggregate values
    transactions.forEach(row => {
      const wibDate = toWibDateString(row.paid_at);
      if (dailyMap[wibDate]) {
        dailyMap[wibDate].count += 1;
        dailyMap[wibDate].total += row.amount;
      } else {
        dailyMap[wibDate] = { count: 1, total: row.amount };
      }
    });

    const dailySummaryList = Object.entries(dailyMap).map(([date, stats]) => ({
      "Tanggal": formatWibDate(date),
      "Jumlah Transaksi": stats.count,
      "Total Donasi (Rp)": stats.total,
    })).sort((a, b) => b.Tanggal.localeCompare(a.Tanggal)); // Sort reverse chronological or custom

    // 6. Generate Transactions Detail Ledger data
    const detailList = transactions.map((t, index) => ({
      "No": index + 1,
      "Tanggal (WIB)": toWibDateString(t.paid_at),
      "Waktu (WIB)": formatWibTime(t.paid_at),
      "Order ID": t.order_id,
      "Nama Donatur": t.donor_name,
      "Email": t.donor_email || "-",
      "Nominal (Rp)": t.amount,
      "Metode Pembayaran": t.payment_method === "midtrans_qris" ? "QRIS" : t.payment_method === "manual" ? "Manual Transfer" : t.payment_method,
      "Pesan Dukungan": t.message || "",
      "Midtrans Transaction ID": t.midtrans_transaction_id || "-",
      "Created At (UTC)": t.created_at,
    }));

    // 7. Create SheetJS Workbook and append worksheets
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Daily Summary
    const wsSummary = XLSX.utils.json_to_sheet(dailySummaryList);
    // Auto-fit column widths
    wsSummary["!cols"] = [
      { wch: 18 }, // Tanggal
      { wch: 18 }, // Jumlah Transaksi
      { wch: 20 }, // Total Donasi
    ];
    XLSX.utils.book_append_sheet(workbook, wsSummary, "Ringkasan Harian");

    // Sheet 2: Transactions Detail Ledger
    const wsDetail = XLSX.utils.json_to_sheet(detailList);
    wsDetail["!cols"] = [
      { wch: 6 },  // No
      { wch: 15 }, // Tanggal
      { wch: 12 }, // Waktu
      { wch: 25 }, // Order ID
      { wch: 25 }, // Nama Donatur
      { wch: 25 }, // Email
      { wch: 18 }, // Nominal
      { wch: 20 }, // Metode Pembayaran
      { wch: 35 }, // Pesan Dukungan
      { wch: 30 }, // Midtrans Transaction ID
      { wch: 25 }, // Created At
    ];
    XLSX.utils.book_append_sheet(workbook, wsDetail, "Detail Transaksi");

    // 8. Write file to buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // 9. Formulate dynamic filename
    let filename = `laporan-donasi-${startParam}.xlsx`;
    if (startParam !== endParam) {
      filename = `laporan-donasi-${startParam}-sampai-${endParam}.xlsx`;
    }

    // 10. Return file as response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/mieayam/export route handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
