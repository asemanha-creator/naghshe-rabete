import { Redis } from "@upstash/redis";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`get:${ip}`, 80, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code لازم است" });
    const raw = await redis.get(`couple:${code.toUpperCase().trim()}`);
    if (!raw) return res.status(404).json({ error: "یافت نشد" });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    res.status(200).json({ ok: true, data });
  } catch (e) {
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در get.js", { error: e.message });
    res.status(500).json({ ok: false, error: e.message });
  }
}
