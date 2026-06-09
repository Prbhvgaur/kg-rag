import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export async function assertSupabaseReachable(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase auth is not configured.");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("Supabase auth service is unavailable.");
    }
  } catch {
    throw new Error(`Supabase project is not reachable: ${new URL(supabaseUrl).host}`);
  } finally {
    window.clearTimeout(timeout);
  }
}
