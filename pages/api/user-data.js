import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();
const ALLOWED_KEYS = [
  "distrust_assessments", "distrust_thoughts", "my_guidebook", "positive_memories",
  "personal_ritual", "personal_ritual_log", "custom_crisis_card", "personal_roadmap",
  "streak", "streak_surprise_given", "emotion_wheel_log", "awareness_bingo",
];

export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`user-data:${ip}`, 200, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });

    if (req.method === "POST") {
      const { token, key, value } = req.body;
      if (!ALLOWED_KEYS.includes(key)) return res.status(400).json({ error: "کلیدِ نامعتبر" });
      const email = await verifySession(token);
      if (!email) return res.status(401).json({ error: "نشستِ نامعتبر — لطفاً دوباره وارد شوید" });
      await redis.set(`user_data:${email}:${key}`, JSON.stringify(value));
      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      const { token, key } = req.query;
      if (!ALLOWED_KEYS.includes(key)) return res.status(400).json({ error: "کلیدِ نامعتبر" });
      const email = await verifySession(token);
      if (!email) return res.status(401).json({ error: "نشستِ نامعتبر" });
      const raw = await redis.get(`user_data:${email}:${key}`);
      const value = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
      return res.status(200).json({ ok: true, value });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطا در user-data.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
