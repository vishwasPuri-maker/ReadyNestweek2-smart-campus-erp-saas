import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash limiter. If Redis isn't configured (local dev), limiting is a no-op so the
// app still runs — production MUST set the Upstash env vars.
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// 5 requests / 60s per key — for auth + other sensitive endpoints.
export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "rl:auth",
      analytics: false,
    })
  : null;

/** Returns true if the request is allowed. No-op (allows) when Redis is unconfigured. */
export async function rateLimitOk(
  limiter: Ratelimit | null,
  key: string,
): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit(key);
  return success;
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}
