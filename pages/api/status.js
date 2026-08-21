import { Redis } from "@upstash/redis";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { verifyAdminToken } from "../../lib/auth";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`status:${ip}`, 80, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    const { email } = req.method === "GET" ? req.query : req.body;
    if (!email) return res.status(400).json({ error: "ایمیل لازم است" });
    const key = `unlocked:${email.toLowerCase().trim()}`;

    if (req.method === "GET") {
      const list = (await redis.get(key)) || [];
      const unlocked = typeof list === "string" ? JSON.parse(list) : list;
      return res.status(200).json({ unlocked: unlocked || [] });
    }

    if (req.method === "POST") {
      const { sessionId, adminToken } = req.body;
      if (!(await verifyAdminToken(adminToken))) {
        await logEvent(LOG_LEVELS.WARN, "admin", "تلاشِ ناموفقِ بازکردنِ دستیِ جلسه", { email });
        return res.status(403).json({ error: "رمز نامعتبر است" });
      }
      const raw = (await redis.get(key)) || [];
      const current = typeof raw === "string" ? JSON.parse(raw) : raw || [];
      if (!current.includes(sessionId)) current.push(sessionId);
      await redis.set(key, JSON.stringify(current));
      await logEvent(LOG_LEVELS.INFO, "admin", "بازکردنِ دستیِ جلسه توسطِ ادمین", { email, sessionId });
      return res.status(200).json({ ok: true, unlocked: current });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در status.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
