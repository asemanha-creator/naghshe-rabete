import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code لازم است" });
    const raw = await redis.get(`couple:${code.toUpperCase().trim()}`);
    if (!raw) return res.status(404).json({ error: "یافت نشد" });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    res.status(200).json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
