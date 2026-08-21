import { Redis } from "@upstash/redis";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`save:${ip}`, 40, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    const payload = req.body;
    if (!payload?.code) return res.status(400).json({ error: "code لازم است" });
    await redis.set(`couple:${payload.code}`, JSON.stringify(payload));
    await redis.sadd("couple:index", payload.code);
    res.status(200).json({ ok: true });
  } catch (e) {
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در save.js", { error: e.message });
    res.status(500).json({ ok: false, error: e.message });
  }
}
