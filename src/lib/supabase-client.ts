import { createBrowserClient } from "@supabase/ssr";

// Fallbacks pour le développement sans .env.local configuré
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
