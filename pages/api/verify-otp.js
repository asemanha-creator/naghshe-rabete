import { Redis } from "@upstash/redis";
import { createSession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();

function isValidIranianMobile(v) {
  return typeof v === "string" && /^09\d{9}$/.test(v.trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { phone: rawPhone, code, name } = req.body;
    if (!isValidIranianMobile(rawPhone)) {
      return res.status(400).json({ error: "شماره‌موبایل نامعتبر است" });
    }
    const phone = rawPhone.trim();

    const ip = getClientIp(req);
    // حداکثر ۱۰ تلاشِ واردکردنِ کد در هر ۱۰ دقیقه — جلوگیری از حدس‌زدنِ خودکارِ کدِ ۶رقمی
    const rl = await checkRateLimit(`verify-otp:${ip}`, 10, 600);
    if (!rl.allowed) {
      await logEvent(LOG_LEVELS.WARN, "auth", "محدودیتِ نرخ فعال شد — تلاشِ بیش‌ازحد برایِ کدِ تایید", { ip, phone });
      return res.status(429).json({ error: "تعدادِ تلاش‌هایتان زیاد بوده — چند دقیقه صبر کنید" });
    }

    if (!code || String(code).trim().length !== 6) {
      return res.status(400).json({ error: "کد باید ۶ رقم باشد" });
    }

    const storedOtp = await redis.get(`otp:${phone}`);
    if (!storedOtp) {
      return res.status(400).json({ error: "کد منقضی شده — دوباره درخواست دهید" });
    }
    if (String(storedOtp) !== String(code).trim()) {
      await logEvent(LOG_LEVELS.WARN, "auth", "کدِ تاییدِ اشتباه وارد شد", { phone });
      return res.status(401).json({ error: "کد اشتباه است" });
    }

    // کد درست بود — پاکش می‌کنیم تا دوباره قابلِ‌استفاده نباشد
    await redis.del(`otp:${phone}`);

    // پیداکردن یا ساختنِ حسابِ کاربر — شماره‌موبایل، شناسه‌ی یکتایِ کاربر است
    const userKey = `user:${phone}`;
    const rawUser = await redis.get(userKey);
    let user;
    if (rawUser) {
      user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
    } else {
      user = { phone, name: name || "", createdAt: Date.now() };
      await redis.set(userKey, JSON.stringify(user));
      await redis.sadd("user:index", phone);
      await logEvent(LOG_LEVELS.INFO, "auth", "حسابِ جدید با شماره‌موبایل ساخته شد", { phone });
    }

    const token = await createSession(phone);
    await redis.set(`last_active:${phone}`, Date.now());
    await logEvent(LOG_LEVELS.INFO, "auth", "ورودِ موفق با پیامک", { phone });

    res.status(200).json({ ok: true, phone, name: user.name || "", token, isNewUser: !rawUser });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "auth", "خطایِ سرور در verify-otp.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
