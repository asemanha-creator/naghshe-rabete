import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
const ADMIN_PASS = "AGHILI-PANEL";
export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { type, message, contact, email } = req.body;
      if (!type || !message) return res.status(400).json({ error: "ناقص" });
      const item = { type, message, contact: contact || "", email: email || "", ts: Date.now() };
      const raw = (await redis.get("feedback:list")) || [];
      const list = typeof raw === "string" ? JSON.parse(raw) : raw;
      list.unshift(item);
      await redis.set("feedback:list", JSON.stringify(list.slice(0, 500)));
      return res.status(200).json({ ok: true });
    }
    if (req.method === "GET") {
      const { adminPass } = req.query;
      if (adminPass !== ADMIN_PASS) return res.status(403).json({ error: "دسترسی غیرمجاز" });
      const raw = (await redis.get("feedback:list")) || [];
      const list = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json({ ok: true, list });
    }
    res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
