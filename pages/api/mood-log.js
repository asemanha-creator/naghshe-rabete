import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";

const redis = Redis.fromEnv();

// ثبتِ خلقِ قبل/بعدِ هر جلسه — حالا با تاییدِ نشست، نه ایمیلِ خام
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
    const { token, sessionKey, phase, value } = req.body;
    if (!sessionKey || !phase) return res.status(400).json({ error: "اطلاعاتِ ناقص" });

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
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
