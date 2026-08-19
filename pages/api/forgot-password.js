import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();
const RESET_TTL_SECONDS = 60 * 60; // ۱ ساعت

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const ip = getClientIp(req);
    // حداکثر ۳ درخواستِ بازیابی در هر ۱۵ دقیقه — جلوگیری از سیل‌کردنِ ایمیلِ یک نفر
    const rl = await checkRateLimit(`forgot-password:${ip}`, 3, 900);
    if (!rl.allowed) {
      await logEvent(LOG_LEVELS.WARN, "auth", "محدودیتِ نرخ فعال شد — درخواستِ بازیابیِ رمزِ بیش‌ازحد", { ip });
      return res.status(429).json({ error: "چند دقیقه صبر کنید و دوباره امتحان کنید" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "ایمیل لازم است" });
    const emailKey = email.toLowerCase().trim();

    const raw = await redis.get(`user:${emailKey}`);
    // برایِ جلوگیری از فاش‌شدنِ اینکه چه ایمیلی ثبت‌نام کرده، همیشه پیامِ موفقیت برمی‌گردانیم
    if (!raw) return res.status(200).json({ ok: true });

    const resetToken = crypto.randomBytes(32).toString("hex");
    await redis.set(`reset_token:${resetToken}`, emailKey, { ex: RESET_TTL_SECONDS });

    const resetUrl = `https://naghshe-rabete-ashy.vercel.app/?resetToken=${resetToken}`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "کجای راهم؟ <onboarding@resend.dev>",
        to: [emailKey],
        subject: "بازیابیِ رمزِعبور — کجای راهم؟",
        html: `
          <div dir="rtl" style="font-family: Tahoma, sans-serif; padding: 20px;">
            <h2>بازیابیِ رمزِعبور</h2>
            <p>برایِ تنظیمِ رمزِعبورِ جدید، رویِ لینکِ زیر بزنید (تا ۱ ساعت معتبر است):</p>
            <p><a href="${resetUrl}" style="background:#17383D;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">تنظیمِ رمزِ جدید</a></p>
            <p style="color:#888;font-size:12px;">اگر این درخواست را شما نفرستاده‌اید، این پیام را نادیده بگیرید.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return res.status(500).json({ error: "خطا در ارسالِ ایمیل" });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "auth", "خطایِ سرور در forgot-password.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
