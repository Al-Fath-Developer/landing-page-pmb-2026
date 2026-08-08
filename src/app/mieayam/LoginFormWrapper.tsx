/**
 * @file    src/app/mieayam/LoginFormWrapper.tsx
 * @brief   Client-side wrapper to refresh Next.js App Router state upon successful login
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/mieayam/LoginForm";

export default function LoginFormWrapper() {
  const router = useRouter();
  
  const handleLoginSuccess = () => {
    // Refresh Server Component to retrieve updated session cookie
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ffea79] dark:bg-zinc-950 p-4">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}
