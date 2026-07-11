import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const payload = req.body;
    if (!payload || !payload.code) return res.status(400).json({ error: "missing code" });
    await kv.set(`couple:${payload.code}`, JSON.stringify(payload));
    await kv.sadd("couple:index", payload.code);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
