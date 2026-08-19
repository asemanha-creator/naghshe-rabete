import { createAdminSession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

// رمزِ ادمین، حالا فقط سمتِ سرور (متغیرِ محیطی) — هرگز به کلاینت فرستاده نمی‌شود
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AGHILI-PANEL";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const ip = getClientIp(req);
    // حداکثر ۵ تلاشِ ورودِ ادمین در هر ۱۰ دقیقه — این حساس‌ترین نقطه‌ی اپ است
    const rl = await checkRateLimit(`admin-login:${ip}`, 5, 600);
    if (!rl.allowed) {
      await logEvent(LOG_LEVELS.CRITICAL, "admin", "محدودیتِ نرخ فعال شد — تلاشِ مشکوک برایِ ورودِ ادمین", { ip });
      return res.status(429).json({ error: "تعدادِ تلاش‌هایتان زیاد بوده — چند دقیقه صبر کنید" });
    }

    const { password } = req.body;
    if (!password || password !== ADMIN_PASSWORD) {
      await logEvent(LOG_LEVELS.WARN, "admin", "تلاشِ ناموفقِ ورودِ ادمین", { ip });
      return res.status(403).json({ error: "رمز نامعتبر است" });
    }
    const token = await createAdminSession();
    await logEvent(LOG_LEVELS.INFO, "admin", "ورودِ موفقِ ادمین", { ip });
    res.status(200).json({ ok: true, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
