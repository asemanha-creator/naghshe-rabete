import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = Redis.fromEnv();
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // ۳۰ روز

// ساختِ یک توکنِ نشستِ امن برایِ یک ایمیلِ تاییدشده (بعد از ورود/ثبت‌نامِ موفق)
export async function createSession(email) {
  const token = crypto.randomBytes(32).toString("hex");
  const emailKey = email.toLowerCase().trim();
  await redis.set(`session:${token}`, emailKey, { ex: SESSION_TTL_SECONDS });
  return token;
}

// بررسیِ یک توکن — اگر معتبر بود، ایمیلِ واقعیِ صاحبش را برمی‌گرداند؛ وگرنه null
export async function verifySession(token) {
  if (!token) return null;
  const email = await redis.get(`session:${token}`);
  return email || null;
}

// حذفِ نشست (خروج)
export async function destroySession(token) {
  if (!token) return;
  await redis.del(`session:${token}`);
}

// نشستِ مخصوصِ ادمین — از همان مکانیزمِ بالا استفاده می‌کند، با یک شناسه‌ی داخلیِ خاص
export async function createAdminSession() {
  return createSession("__admin__");
}
export async function verifyAdminToken(token) {
  const email = await verifySession(token);
  return email === "__admin__";
}
