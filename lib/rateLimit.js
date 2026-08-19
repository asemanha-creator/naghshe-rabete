import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * محدودکردنِ تعدادِ درخواست — جلوگیری از حدس‌زدنِ رمز یا حملاتِ سنگین
 * @param {string} key - شناسه‌ی یکتا (مثلاً "login:1.2.3.4" یا "login:email@x.com")
 * @param {number} maxRequests - حداکثر تعدادِ مجاز در بازه
 * @param {number} windowSeconds - طولِ بازه‌ی زمانی به ثانیه
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export async function checkRateLimit(key, maxRequests, windowSeconds) {
  const redisKey = `ratelimit:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count) };
  } catch (e) {
    // اگر خودِ Redis خطا داد، اجازه بده درخواست رد شود (بهتر از قطع‌شدنِ کاملِ سرویس)
    console.error("checkRateLimit failed, allowing request:", e);
    return { allowed: true, remaining: maxRequests };
  }
}

// استخراجِ IP از درخواست — Vercel این هدر را خودکار می‌فرستد
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return (forwarded ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress) || "unknown";
}
