import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
  try {
    const codes = (await kv.smembers("couple:index")) || [];
    const rows = [];
    for (const code of codes) {
      const raw = await kv.get(`couple:${code}`);
      if (raw) {
        try {
          rows.push(typeof raw === "string" ? JSON.parse(raw) : raw);
        } catch (e) {}
      }
    }
    res.status(200).json({ rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
