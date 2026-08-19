import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
import { isNumberInRange, isValidSessionId, isOneOf } from "../../lib/validate";

const redis = Redis.fromEnv();

// ثبتِ خلقِ قبل/بعدِ هر جلسه — حالا با تاییدِ نشست، نه ایمیلِ خام
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`mood-log:${ip}`, 60, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
    const { token, sessionKey, phase, value } = req.body;
    if (!isValidSessionId(sessionKey)) return res.status(400).json({ error: "sessionKey نامعتبر است" });
    if (!isOneOf(phase, ["before", "after"])) return res.status(400).json({ error: "phase نامعتبر است" });
    if (!isNumberInRange(value, 1, 10)) return res.status(400).json({ error: "مقدارِ خلق باید بینِ ۱ تا ۱۰ باشد" });

    const email = await verifySession(token);
    if (!email) return res.status(401).json({ error: "نشستِ نامعتبر — لطفاً دوباره وارد شوید" });

    const key = `mood_log:${email}`;
    const raw = (await redis.get(key)) || [];
    const list = typeof raw === "string" ? JSON.parse(raw) : raw;
    list.push({ sessionKey, phase, value: Number(value), ts: Date.now() });
    await redis.set(key, JSON.stringify(list));
    await redis.sadd("mood_log:users_index", email);
    await redis.set(`last_active:${email}`, Date.now());

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "userdata", "خطایِ سرور در mood-log.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
