import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();

// اتصالِ ایمیلِ همسر — حالا با تاییدِ نشست، و بدونِ اجازه‌ی حدس‌زدنِ ایمیلِ دلخواه برایِ دیدنِ داده‌ی دیگران
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`partner-link:${ip}`, 20, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    const token = req.method === "GET" ? req.query.token : req.body?.token;
    const email = await verifySession(token);
    if (!email) return res.status(401).json({ error: "نشستِ نامعتبر — لطفاً دوباره وارد شوید" });

    if (req.method === "POST") {
      const { partnerEmail } = req.body;
      if (!partnerEmail) return res.status(400).json({ error: "اطلاعاتِ ناقص" });
      await redis.set(`partner_link:${email}`, partnerEmail.toLowerCase().trim());
      return res.status(200).json({ ok: true });
    }
    if (req.method === "GET") {
      // فقط اجازه‌ی دیدنِ همان همسری که خودِ کاربر قبلاً وصل کرده — نه هر ایمیلِ دلخواه
      const pkgKey = req.query.pkgKey || "";
      const partnerEmail = await redis.get(`partner_link:${email}`);
      if (!partnerEmail) return res.status(404).json({ error: "هنوز ایمیلِ همسر وصل نشده" });
      const raw = (await redis.get(`unlocked:${partnerEmail}`)) || [];
      const unlocked = typeof raw === "string" ? JSON.parse(raw) : raw;
      const filtered = pkgKey ? unlocked.filter((sid) => sid.startsWith(`${pkgKey}-`)) : unlocked;
      return res.status(200).json({ ok: true, unlockedCount: filtered.length, unlocked: filtered });
    }
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در partner-link.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
