/**
 * @file    src/app/api/mieayam/auth/logout/route.ts
 * @brief   Server-side API route for destroying the admin cookie session (logout)
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { NextResponse } from "next/server";
import { destroySessionCookie } from "@/lib/mieayam/auth";

export async function POST() {
  try {
    await destroySessionCookie();
    return NextResponse.json({ success: true, message: "Logout berhasil." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected failure in POST /api/mieayam/auth/logout route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
