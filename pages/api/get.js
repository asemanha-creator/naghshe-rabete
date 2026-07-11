تimport { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "missing code" });
    const raw = await kv.get(`couple:${String(code).toUpperCase()}`);
    if (!raw) return res.status(404).json({ error: "not found" });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    res.status(200).json({ data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
