import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// سطوحِ لاگ — از کم‌اهمیت به بحرانی
export const LOG_LEVELS = { INFO: "INFO", WARN: "WARN", ERROR: "ERROR", CRITICAL: "CRITICAL" };

const MAX_LOGS_PER_CATEGORY = 500;

/**
 * ثبتِ یک رخدادِ ساختاریافته — هم در کنسولِ Vercel (لاگِ زنده)، هم در Redis (ماندگار)
 * @param {string} level - یکی از LOG_LEVELS
 * @param {string} category - دسته‌بندی، مثلاً "auth" | "payment" | "content" | "admin" | "system"
 * @param {string} message - توضیحِ کوتاهِ رخداد
 * @param {object} meta - اطلاعاتِ اضافی (ایمیل، مسیر، کدِ خطا، و...) — هرگز رمزِعبور یا توکن را اینجا نگذارید
 */
export async function logEvent(level, category, message, meta = {}) {
  const entry = {
    ts: Date.now(),
    level,
    category,
    message,
    meta: sanitizeMeta(meta),
  };

  // همیشه در کنسول هم چاپ کن — برایِ دیدنِ آنیِ آن در Vercel Logs
  const consoleMsg = `[${level}] [${category}] ${message}`;
  if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.CRITICAL) console.error(consoleMsg, meta);
  else if (level === LOG_LEVELS.WARN) console.warn(consoleMsg, meta);
  else console.log(consoleMsg, meta);

  // ذخیره‌ی ماندگار در Redis — جداگانه به‌ازایِ هر دسته، برایِ مرورِ بعدی
  try {
    const key = `logs:${category}`;
    const raw = (await redis.get(key)) || [];
    const list = typeof raw === "string" ? JSON.parse(raw) : raw;
    list.unshift(entry);
    await redis.set(key, JSON.stringify(list.slice(0, MAX_LOGS_PER_CATEGORY)));

    // رخدادهایِ بحرانی، جداگانه هم در یک فهرستِ سراسری ذخیره می‌شوند تا در پنلِ ادمین برجسته دیده شوند
    if (level === LOG_LEVELS.CRITICAL) {
      const rawCrit = (await redis.get("logs:critical")) || [];
      const critList = typeof rawCrit === "string" ? JSON.parse(rawCrit) : rawCrit;
      critList.unshift(entry);
      await redis.set("logs:critical", JSON.stringify(critList.slice(0, MAX_LOGS_PER_CATEGORY)));
    }
  } catch (e) {
    // اگر خودِ لاگ‌کردن هم خطا داد، فقط در کنسول ثبت کن — نباید کلِ درخواست را متوقف کند
    console.error("logEvent: failed to persist log", e);
  }
}

// حذفِ فیلدهایِ حساس از متادیتا، قبل از ذخیره — لایه‌ی محافظتی برایِ جلوگیریِ ثبتِ ناخواسته‌ی رمز/توکن
function sanitizeMeta(meta) {
  const clone = { ...meta };
  const sensitiveKeys = ["password", "passwordHash", "token", "adminToken", "adminPass", "salt"];
  sensitiveKeys.forEach((k) => {
    if (k in clone) clone[k] = "[حذف‌شده]";
  });
  return clone;
}

// خواندنِ لاگ‌هایِ یک دسته (برایِ پنلِ ادمین)
export async function getLogs(category, limit = 100) {
  const key = category === "critical" ? "logs:critical" : `logs:${category}`;
  const raw = (await redis.get(key)) || [];
  const list = typeof raw === "string" ? JSON.parse(raw) : raw;
  return list.slice(0, limit);
}
