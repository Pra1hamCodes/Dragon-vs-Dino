import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger.js";

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_KEY = process.env["SUPABASE_SERVICE_KEY"];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  logger.warn(
    "SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Supabase features will be unavailable."
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables."
    );
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  logger.info("Supabase client initialized");
  return supabaseInstance;
}
