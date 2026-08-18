import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { createSession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";

const redis = Redis.fromEnv();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "ایمیل و رمزِعبور لازم است" });
    const key = `user:${email.toLowerCase().trim()}`;
    const raw = await redis.get(key);
    if (!raw) {
      await logEvent(LOG_LEVELS.WARN, "auth", "تلاشِ ورود با ایمیلِ ثبت‌نشده", { email });
      return res.status(404).json({ error: "حسابی با این ایمیل پیدا نشد" });
    }
    const user = typeof raw === "string" ? JSON.parse(raw) : raw;
    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      await logEvent(LOG_LEVELS.WARN, "auth", "تلاشِ ورود با رمزِ اشتباه", { email });
      return res.status(401).json({ error: "رمزِعبور اشتباه است" });
    }
    // نکته‌ی حیاتی: حتی اگر حسابِ قدیمی ایمیلش را با حروفِ بزرگ ذخیره کرده باشد، همیشه نسخه‌ی یکدست (کوچک) را در نشست بگذاریم
    const normalizedEmail = (user.email || email).toLowerCase().trim();
    const token = await createSession(normalizedEmail);
    await logEvent(LOG_LEVELS.INFO, "auth", "ورودِ موفق", { email: normalizedEmail });
    res.status(200).json({ ok: true, email: normalizedEmail, name: user.name, token });
  } catch (e) {
    await logEvent(LOG_LEVELS.ERROR, "auth", "خطایِ سرور در ورود", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
