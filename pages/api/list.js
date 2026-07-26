import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const codes = await redis.smembers("couple:index");
    const rows = [];
    for (const code of codes || []) {
      try {
        const raw = await redis.get(`couple:${code}`);
        if (!raw) continue;
        const d = typeof raw === "string" ? JSON.parse(raw) : raw;
        rows.push(d);
      } catch (e) {}
    }
    res.status(200).json({ rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ rows: [], error: e.message || "unknown error" });
  }
}
