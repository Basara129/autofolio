// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Buat fungsi penjamin tunggal (Singleton Factory)
function getSupabaseClient() {
  // Jika sudah ada instans di memori global browser/server, pakai yang itu saja
  if (globalThis.supabaseInstance) {
    return globalThis.supabaseInstance;
  }

  // Jika belum ada, baru buat instans pertama kali
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // Simpan ke memori global
  globalThis.supabaseInstance = client;
  return client;
}

// Ekspor fungsi instans tunggalnya
export const supabase = getSupabaseClient();
