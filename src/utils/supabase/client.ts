import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/integrations/supabase/types";

function sanitizeSupabaseUrl(rawUrl?: unknown): string | null {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;
  let val = rawUrl.trim();
  const urlMatch = val.match(/https?:\/\/[^\s"',;]+/);
  if (urlMatch) {
    val = urlMatch[0];
  }
  try {
    const parsed = new URL(val);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin;
    }
  } catch {
    // invalid
  }
  return null;
}

function sanitizeSupabaseKey(rawKey?: unknown): string | null {
  if (typeof rawKey !== "string" || !rawKey.trim()) return null;
  let val = rawKey.trim();
  if (val.includes("=")) {
    val = val.split("=").pop()?.trim() || val;
  }
  if (val.startsWith("http://") || val.startsWith("https://")) {
    return null;
  }
  val = val.replace(/^['"]+|['";]+$/g, "").trim();
  return val.length > 5 ? val : null;
}

/**
 * Official Supabase Next.js browser client for Client Components and browser execution.
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * No API keys or secrets are hardcoded.
 */
export function createClient() {
  const rawUrlCandidate =
    (typeof process !== "undefined" && process.env?.["NEXT_PUBLIC_SUPABASE_URL"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["NEXT_PUBLIC_SUPABASE_URL"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_SUPABASE_URL"]) ||
    (typeof process !== "undefined" && process.env?.["SUPABASE_URL"]);

  const rawKeyCandidate =
    (typeof process !== "undefined" && process.env?.["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
    (typeof process !== "undefined" && process.env?.["SUPABASE_PUBLISHABLE_KEY"]);

  let validUrl = sanitizeSupabaseUrl(rawUrlCandidate);
  let validKey = sanitizeSupabaseKey(rawKeyCandidate);

  // If variables were swapped, recover gracefully
  if (!validUrl && sanitizeSupabaseUrl(rawKeyCandidate)) {
    validUrl = sanitizeSupabaseUrl(rawKeyCandidate);
    validKey = sanitizeSupabaseKey(rawUrlCandidate);
  }

  return createBrowserClient<Database>(
    validUrl || "https://placeholder.supabase.co",
    validKey || "placeholder-key"
  );
}
