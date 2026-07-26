import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { code, ...rest } = req.body;
    if (!code) return res.status(400).json({ ok: false, error: "code لازم است" });
    const payload = { code, ...rest };
    await redis.set(`couple:${code}`, JSON.stringify(payload));
    // نگه‌داری فهرستِ کدها برایِ بازیابیِ سریع در پنلِ آموزشی
    await redis.sadd("couple:index", code);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message || "unknown error" });
  }
}
