import { verifyAdminToken } from "../../lib/auth";
import { getLogs } from "../../lib/logger";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
    if (!(await verifyAdminToken(req.query.adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });

    const category = req.query.category || "critical";
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const logs = await getLogs(category, limit);

    res.status(200).json({ ok: true, logs, category });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
