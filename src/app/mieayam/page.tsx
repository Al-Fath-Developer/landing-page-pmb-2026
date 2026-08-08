/**
 * @file    src/app/mieayam/page.tsx
 * @brief   Server-side entry point for /mieayam route returning login form or donation monitoring dashboard
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { getSession } from "@/lib/mieayam/auth";
import LoginFormWrapper from "./LoginFormWrapper";
import DashboardWrapper from "./DashboardWrapper";

export const dynamic = "force-dynamic";

export default async function MieayamPage() {
  const session = await getSession();

  if (!session) {
    return <LoginFormWrapper />;
  }

  return <DashboardWrapper username={session.username} />;
}
