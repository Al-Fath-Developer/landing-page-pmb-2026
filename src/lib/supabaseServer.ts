/**
 * @file    src/lib/supabaseServer.ts
 * @brief   Dynamically instantiate a privileged, server-only Supabase client using Service Role credentials
 * @author  ray
 * @created 2026-08-07
 * @todo    - Enable strict TypeScript type generation for the client instances
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Retrieve a privileged Supabase client for backend database operations
 */
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY configuration."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
