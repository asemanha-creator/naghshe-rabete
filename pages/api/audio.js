import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";

const redis = Redis.fromEnv();

// بازیابی/حذفِ آدرسِ صوتیِ هر جلسه
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const sessionId = req.query.sessionId;
      if (!sessionId) return res.status(400).json({ error: "sessionId لازم است" });
      const url = await redis.get(`session_audio:${sessionId}`);
      return res.status(200).json({ ok: true, url: url || null });
    }
    if (req.method === "DELETE") {
      const { sessionId, adminToken } = req.body;
      if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });
      if (!sessionId) return res.status(400).json({ error: "sessionId لازم است" });
      await redis.del(`session_audio:${sessionId}`);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
