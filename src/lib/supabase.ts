/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (import.meta.env.DEV && (!SUPABASE_URL || SUPABASE_ANON_KEY === "PASTE_YOUR_ANON_KEY_HERE")) {
  console.warn(
    "⚠️  Supabase тохируулаагүй байна.\n" +
    "   .env файлд VITE_SUPABASE_ANON_KEY-г Supabase Dashboard → Settings → API-аас хуулж тав."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Supabase User → дэлгүүрийн Session */
export function supabaseUserToSession(user: {
  id: string;
  phone?: string | null;
  user_metadata?: Record<string, string>;
  app_metadata?: { provider?: string };
}): import("../store").Session {
  const provider = user.app_metadata?.provider;
  return {
    id: user.id,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.phone ||
      "Хэрэглэгч",
    phone: user.phone ?? "",
    provider:
      provider === "google"
        ? "google"
        : provider === "facebook"
        ? "facebook"
        : "phone",
  };
}
