/**
 * @file    src/components/mieayam/LoginForm.tsx
 * @brief   Client-side React component rendering the Neobrutalist Login form for the internal dashboard
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

"use client";

import { useState } from "react";
import { Lock, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mieayam/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.message || "Username atau password salah.");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Gagal menghubungi server. Hubungi panitia IT.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border-[4px] border-black bg-white p-8 shadow-shadow-large dark:bg-zinc-900 dark:border-white">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black text-black uppercase tracking-tight dark:text-white">
          Hai, Welcome Back!
        </h1>
        <p className="mt-1 font-bold text-accent-orange text-sm uppercase tracking-wide">
          PMB I-FEST 2026
        </p>
      </div>

      {error && (
        <div className="mb-6 border-[3px] border-black bg-accent-pink/10 p-3 text-sm font-bold text-destructive flex items-center gap-2 dark:border-white dark:bg-red-950/20">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-ping shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 dark:text-white">
            Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
              <User size={16} />
            </span>
            <input
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full pl-10 pr-3 py-2 text-sm font-medium border-[3px] border-black rounded-lg focus:outline-none focus:ring-3 focus:ring-ring/50 placeholder-zinc-400 bg-white text-black dark:bg-zinc-800 dark:text-white dark:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 dark:text-white">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full pl-10 pr-3 py-2 text-sm font-medium border-[3px] border-black rounded-lg focus:outline-none focus:ring-3 focus:ring-ring/50 placeholder-zinc-400 bg-white text-black dark:bg-zinc-800 dark:text-white dark:border-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full border-[3px] border-black bg-main hover:bg-main/80 text-black py-5 font-black uppercase text-sm tracking-wider flex justify-center items-center gap-2 shadow-shadow cursor-pointer active:translate-y-[2px] transition-transform dark:border-white"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <span>Masuk Dashboard</span>
          )}
        </Button>
      </form>
    </div>
  );
}
