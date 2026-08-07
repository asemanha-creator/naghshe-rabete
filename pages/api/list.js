import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  try {
    const codes = await redis.smembers("couple:index");
    const rows = [];
    for (const c of codes) {
      const raw = await redis.get(`couple:${c}`);
      if (raw) rows.push(typeof raw === "string" ? JSON.parse(raw) : raw);
    }
    res.status(200).json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
