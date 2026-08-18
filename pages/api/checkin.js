import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";

const redis = Redis.fromEnv();

// ثبت و بازیابیِ چک‌این‌هایِ دوره‌ای — حالا با تاییدِ نشست
export default async function handler(req, res) {
  try {
    const token = req.method === "GET" ? req.query.token : req.body?.token;
    const email = await verifySession(token);
    if (!email) return res.status(401).json({ error: "نشستِ نامعتبر — لطفاً دوباره وارد شوید" });

    if (req.method === "GET") {
      const rawLog = (await redis.get(`checkin_log:${email}`)) || [];
      const log = typeof rawLog === "string" ? JSON.parse(rawLog) : rawLog;
      const intervalDays = await redis.get(`checkin_interval:${email}`);
      return res.status(200).json({ ok: true, log, intervalDays: intervalDays || null });
    }

    if (req.method === "POST") {
      const { answers, intervalDays } = req.body;
      if (intervalDays) {
        await redis.set(`checkin_interval:${email}`, Number(intervalDays));
      }
      if (answers) {
        const rawLog = (await redis.get(`checkin_log:${email}`)) || [];
        const log = typeof rawLog === "string" ? JSON.parse(rawLog) : rawLog;
        log.push({ answers, ts: Date.now() });
        await redis.set(`checkin_log:${email}`, JSON.stringify(log));
        await redis.sadd("checkin_log:users_index", email);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در checkin.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
