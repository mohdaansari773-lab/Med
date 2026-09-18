import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type RateVerdict =
  { allowed: true; scope: "user" | "anonymous" } | { allowed: false; message: string };

/** Identify the caller without weakening auth: a valid bearer token upgrades the quota. */
async function identifyCaller(): Promise<{ key: string; scope: "user" | "anonymous" }> {
  const request = getRequest();
  const auth = request?.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (token && token.split(".").length === 3) {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (url && key) {
      try {
        const client = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data } = await client.auth.getClaims(token);
        const sub = data?.claims?.sub;
        if (sub) return { key: `user:${sub}`, scope: "user" };
      } catch {
        // fall through to anonymous bucketing
      }
    }
  }

  const fwd = request?.headers.get("x-forwarded-for") ?? "";
  const ip =
    fwd.split(",")[0]?.trim() ||
    request?.headers.get("cf-connecting-ip") ||
    request?.headers.get("x-real-ip") ||
    "unknown";
  return { key: `anon:${ip}`, scope: "anonymous" };
}

const LIMITS = {
  user: { limit: 40, windowSeconds: 3600, minIntervalMs: 1500 },
  anonymous: { limit: 10, windowSeconds: 3600, minIntervalMs: 4000 },
} as const;

/** Server-side rate limit backed by a private table; never reachable from the browser. */
export async function checkAiRateLimit(): Promise<RateVerdict> {
  const { key, scope } = await identifyCaller();
  const cfg = LIMITS[scope];

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("consume_ai_rate_limit", {
      _key: key,
      _limit: cfg.limit,
      _window_seconds: cfg.windowSeconds,
      _min_interval_ms: cfg.minIntervalMs,
    });
    if (error) {
      console.error("[ai-rate-limit]", error.message);
      return { allowed: true, scope };
    }
    const result = data as { allowed?: boolean; reason?: string } | null;
    if (result?.allowed) return { allowed: true, scope };

    if (result?.reason === "too_fast") {
      return {
        allowed: false,
        message: "That was quick — please wait a moment before asking again.",
      };
    }
    return {
      allowed: false,
      message:
        scope === "anonymous"
          ? "You have reached the hourly limit for explanations. Sign in for a higher limit, or try again later."
          : "You have reached the hourly limit for explanations. Please try again later.",
    };
  } catch (e) {
    console.error("[ai-rate-limit]", e);
    return { allowed: true, scope };
  }
}
