import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code لازم است" });
    const raw = await redis.get(`couple:${code}`);
    if (!raw) return res.status(404).json({ error: "not found" });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    res.status(200).json({ data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
