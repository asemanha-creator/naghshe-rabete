import { createAdminSession } from "../../lib/auth";

// رمزِ ادمین، حالا فقط سمتِ سرور (متغیرِ محیطی) — هرگز به کلاینت فرستاده نمی‌شود
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AGHILI-PANEL";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { password } = req.body;
    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "رمز نامعتبر است" });
    }
    const token = await createAdminSession();
    res.status(200).json({ ok: true, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
