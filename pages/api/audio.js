import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();

// بازیابی/حذفِ آدرسِ صوتیِ هر جلسه
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`audio:${ip}`, 80, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    if (req.method === "GET") {
      const sessionId = req.query.sessionId;
      if (!sessionId) return res.status(400).json({ error: "sessionId لازم است" });
      const url = await redis.get(`session_audio:${sessionId}`);
      return res.status(200).json({ ok: true, url: url || null });
    }
    if (req.method === "POST") {
      const { sessionId, url, adminToken } = req.body;
      if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });
      if (!sessionId || !url) return res.status(400).json({ error: "اطلاعاتِ ناقص" });
      await redis.set(`session_audio:${sessionId}`, url);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "DELETE") {
      const { sessionId, adminToken } = req.body;
      if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });
      if (!sessionId) return res.status(400).json({ error: "sessionId لازم است" });
      await redis.del(`session_audio:${sessionId}`);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در audio.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
