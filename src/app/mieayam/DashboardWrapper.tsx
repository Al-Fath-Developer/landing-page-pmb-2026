/**
 * @file    src/app/mieayam/DashboardWrapper.tsx
 * @brief   Client-side wrapper to refresh Next.js App Router state upon successful logout
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

"use client";

import { useRouter } from "next/navigation";
import Dashboard from "@/components/mieayam/Dashboard";

interface DashboardWrapperProps {
  username: string;
}

export default function DashboardWrapper({ username }: DashboardWrapperProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Refresh Server Component to reflect deleted session cookie state
    router.refresh();
  };

  return <Dashboard username={username} onLogout={handleLogout} />;
}
