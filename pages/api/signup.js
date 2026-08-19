import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { createSession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const ip = getClientIp(req);
    // حداکثر ۵ ثبت‌نام در هر ساعت، به‌ازایِ هر IP — جلوگیری از ساختِ انبوهِ حساب
    const rl = await checkRateLimit(`signup:${ip}`, 5, 3600);
    if (!rl.allowed) {
      await logEvent(LOG_LEVELS.WARN, "auth", "محدودیتِ نرخ فعال شد — ثبت‌نامِ بیش‌ازحد", { ip });
      return res.status(429).json({ error: "تعدادِ ثبت‌نام‌هایتان زیاد بوده — بعداً امتحان کنید" });
    }

    const { email: rawEmail, password, name } = req.body;
    if (!rawEmail || !password || password.length < 6) {
      return res.status(400).json({ error: "ایمیل یا رمزِعبور نامعتبر است (رمز حداقل ۶ کاراکتر)" });
    }
    const email = rawEmail.toLowerCase().trim(); // نکته‌ی حیاتی: همه‌جایِ اپ، ایمیل باید یکدست (حروفِ کوچک) ذخیره شود
    const key = `user:${email}`;
    const existing = await redis.get(key);
    if (existing) return res.status(409).json({ error: "این ایمیل قبلاً ثبت‌نام کرده است" });

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    await redis.set(key, JSON.stringify({ email, name: name || "", salt, passwordHash, createdAt: Date.now() }));
    await redis.sadd("user:index", email);
    const token = await createSession(email);
    res.status(200).json({ ok: true, email, name: name || "", token });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "auth", "خطایِ سرور در signup.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
