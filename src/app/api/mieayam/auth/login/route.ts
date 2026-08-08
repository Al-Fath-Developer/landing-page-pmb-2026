/**
 * @file    src/app/api/mieayam/auth/login/route.ts
 * @brief   Server-side API route for validating environment-configured admin credentials and setting cookie session
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/mieayam/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const envUsername = process.env.MIEAYAM_USERNAME;
    const envPassword = process.env.MIEAYAM_PASSWORD;

    if (!envUsername || !envPassword) {
      console.error("Missing MIEAYAM_USERNAME or MIEAYAM_PASSWORD environment variable configuration.");
      return NextResponse.json(
        { error: "INTERNAL_SERVER_ERROR", message: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    // Direct comparison as per user requirements for simple internal system
    if (username === envUsername && password === envPassword) {
      await setSessionCookie(username);
      return NextResponse.json({ success: true, message: "Login berhasil." }, { status: 200 });
    }

    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Username atau password salah." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Unexpected failure in POST /api/mieayam/auth/login route handler:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan server internal." },
      { status: 500 }
    );
  }
}
