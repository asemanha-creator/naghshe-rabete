import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();

// درخواستِ نوبت — برایِ لحظاتی که کاربر (یا خودِ اپ) تشخیص می‌دهد نیازِ کمکِ حرفه‌ایِ مستقیم هست
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`request-appointment:${ip}`, 10, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });

    const { token, context, note } = req.body;
    const identity = await verifySession(token);
    if (!identity) return res.status(401).json({ error: "لطفاً ابتدا وارد حساب شوید" });

    const request = { identity, context: context || "نامشخص", note: note || "", ts: Date.now(), status: "pending" };
    const rawList = (await redis.get("appointment_requests:list")) || [];
    const list = typeof rawList === "string" ? JSON.parse(rawList) : rawList;
    list.unshift(request);
    await redis.set("appointment_requests:list", JSON.stringify(list.slice(0, 1000)));

    // اطلاع‌رسانیِ ایمیلی به دکتر عقیلی (اگر Resend و ایمیلِ ادمین تنظیم شده باشند)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "گدار <onboarding@resend.dev>",
            to: process.env.ADMIN_NOTIFICATION_EMAIL,
            subject: "درخواستِ نوبتِ جدید در اپِ گدار",
            html: `<p>یک کاربر (${identity}) درخواستِ نوبت داد.</p><p>زمینه: ${context || "-"}</p><p>یادداشت: ${note || "-"}</p>`,
          }),
        });
      } catch (emailErr) { console.error("appointment email failed (non-critical):", emailErr); }
    }

    await logEvent(LOG_LEVELS.INFO, "content", "درخواستِ نوبتِ جدید ثبت شد", { identity, context });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "content", "خطا در ثبتِ درخواستِ نوبت", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
