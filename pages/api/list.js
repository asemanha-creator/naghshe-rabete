import { Redis } from "@upstash/redis";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`list:${ip}`, 80, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    const codes = await redis.smembers("couple:index");
    const rows = [];
    for (const c of codes) {
      const raw = await redis.get(`couple:${c}`);
      if (raw) rows.push(typeof raw === "string" ? JSON.parse(raw) : raw);
    }
    res.status(200).json({ ok: true, rows });
  } catch (e) {
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در list.js", { error: e.message });
    res.status(500).json({ ok: false, error: e.message });
  }
}
