/**
 * @file    src/app/api/mieayam/donations/route.ts
 * @brief   Server-side API route for fetching KPIs, daily summaries, and paginated transactions for the dashboard
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/mieayam/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getWibDateRangeBoundaries, toWibDateString } from "@/lib/mieayam/timezone";

export async function GET(request: NextRequest) {
  try {
    // 1. Session verification
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start"); // WIB Date (e.g. "2026-08-08")
    const endParam = searchParams.get("end");     // WIB Date (e.g. "2026-08-08")
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize")) || 20));

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Parameter start dan end tanggal wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // 3. Convert range dates from WIB to UTC boundaries
    const range = getWibDateRangeBoundaries(startParam, endParam);

    // 4. Calculate today's date in WIB
    const todayWibStr = toWibDateString(new Date());
    const todayRange = getWibDateRangeBoundaries(todayWibStr, todayWibStr);

    // 5. Query KPI & Daily Summary aggregates (only selected fields to save memory)
    const { data: aggRows, error: aggError } = await supabase
      .from("donations")
      .select("amount, paid_at")
      .eq("status", "paid")
      .gte("paid_at", range.startUtc)
      .lt("paid_at", range.endUtc);

    if (aggError || !aggRows) {
      console.error("Aggregation query failed:", aggError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal memproses query database." },
        { status: 500 }
      );
    }

    // 6. Query "Today" aggregates (for the today KPI metric)
    let todayAmount = 0;
    let todayCount = 0;

    // Fast check: if today is within the selected range, we can extract today's stats from the already loaded array
    const isTodayInRange = todayWibStr >= startParam && todayWibStr <= endParam;
    if (isTodayInRange) {
      const todayRows = aggRows.filter(row => toWibDateString(row.paid_at) === todayWibStr);
      todayAmount = todayRows.reduce((sum, row) => sum + row.amount, 0);
      todayCount = todayRows.length;
    } else {
      // Query database for today's transactions specifically
      const { data: todayRows, error: todayError } = await supabase
        .from("donations")
        .select("amount")
        .eq("status", "paid")
        .gte("paid_at", todayRange.startUtc)
        .lt("paid_at", todayRange.endUtc);

      if (!todayError && todayRows) {
        todayAmount = todayRows.reduce((sum, row) => sum + row.amount, 0);
        todayCount = todayRows.length;
      }
    }

    // 7. Calculate range summaries
    const totalDonation = aggRows.reduce((sum, row) => sum + row.amount, 0);
    const totalTransactions = aggRows.length;
    const averageDonation = totalTransactions > 0 ? Math.round(totalDonation / totalTransactions) : 0;

    // 8. Generate Daily summary map
    const dailyMap: Record<string, { transactionCount: number; totalAmount: number }> = {};
    
    // Initialize dates in the selected range with 0 values to show empty days
    const startObj = new Date(`${startParam}T00:00:00+07:00`);
    const endObj = new Date(`${endParam}T00:00:00+07:00`);
    const runDate = new Date(startObj);
    while (runDate <= endObj) {
      const dStr = toWibDateString(runDate);
      dailyMap[dStr] = { transactionCount: 0, totalAmount: 0 };
      runDate.setDate(runDate.getDate() + 1);
    }

    // Accumulate actual transaction metrics
    aggRows.forEach(row => {
      const wibDate = toWibDateString(row.paid_at);
      if (dailyMap[wibDate]) {
        dailyMap[wibDate].transactionCount += 1;
        dailyMap[wibDate].totalAmount += row.amount;
      } else {
        // Fallback for timezone boundary edge cases
        dailyMap[wibDate] = { transactionCount: 1, totalAmount: row.amount };
      }
    });

    const dailySummaryList = Object.entries(dailyMap).map(([date, stats]) => ({
      date,
      transactionCount: stats.transactionCount,
      totalAmount: stats.totalAmount,
    })).sort((a, b) => b.date.localeCompare(a.date)); // Descending order (newest first)

    // 9. Query paginated transaction list
    // Only fetch fields required for table display. Include search terms if present.
    let listQuery = supabase
      .from("donations")
      .select(
        "id, order_id, donor_name, donor_email, amount, payment_method, message, paid_at, proof_storage_path",
        { count: "exact" }
      )
      .eq("status", "paid")
      .gte("paid_at", range.startUtc)
      .lt("paid_at", range.endUtc);

    if (search) {
      listQuery = listQuery.or(`order_id.ilike.%${search}%,donor_name.ilike.%${search}%`);
    }

    const fromOffset = (page - 1) * pageSize;
    const toOffset = page * pageSize - 1;

    const { data: transactions, count: totalMatched, error: listError } = await listQuery
      .order("paid_at", { ascending: false })
      .range(fromOffset, toOffset);

    if (listError || !transactions) {
      console.error("Transactions list query failed:", listError);
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Gagal memproses query database." },
        { status: 500 }
      );
    }

    // 10. Return aggregates and paginated results
    return NextResponse.json({
      kpis: {
        totalDonation,
        totalTransactions,
        averageDonation,
        todayDonation: todayAmount,
        todayTransactions: todayCount,
      },
      dailySummary: dailySummaryList,
      transactions: transactions.map(t => ({
        id: t.id,
        orderId: t.order_id,
        donorName: t.donor_name,
        donorEmail: t.donor_email || "-",
        amount: t.amount,
        paymentMethod: t.payment_method,
        message: t.message || "",
        paidAt: t.paid_at,
        hasProof: !!t.proof_storage_path,
      })),
      pagination: {
        page,
        pageSize,
        totalItems: totalMatched || 0,
        totalPages: Math.ceil((totalMatched || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/mieayam/donations route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
