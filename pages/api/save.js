import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const payload = req.body;
    if (!payload?.code) return res.status(400).json({ error: "code لازم است" });
    await redis.set(`couple:${payload.code}`, JSON.stringify(payload));
    await redis.sadd("couple:index", payload.code);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
