import { Redis } from "@upstash/redis";
import crypto from "crypto";
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
    const rl = await checkRateLimit(`reset-password:${ip}`, 10, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "اطلاعاتِ نامعتبر (رمز حداقل ۶ کاراکتر)" });
    }
    const email = await redis.get(`reset_token:${resetToken}`);
    if (!email) return res.status(400).json({ error: "لینک نامعتبر یا منقضی‌شده است — دوباره درخواست بدهید" });

    const key = `user:${email}`;
    const raw = await redis.get(key);
    if (!raw) return res.status(404).json({ error: "حساب پیدا نشد" });
    const user = typeof raw === "string" ? JSON.parse(raw) : raw;

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(newPassword, salt);
    user.salt = salt;
    user.passwordHash = passwordHash;
    await redis.set(key, JSON.stringify(user));
    await redis.del(`reset_token:${resetToken}`);

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "auth", "خطایِ سرور در reset-password.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
