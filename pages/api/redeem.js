import { Redis } from "@upstash/redis";
import { verifySession } from "../../lib/auth";

const redis = Redis.fromEnv();
const ADMIN_PASS = "AGHILI-PANEL";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { action } = req.body;

    // ---------- ساختِ کد (فقط ادمین) ----------
    if (action === "generate") {
      const { sessionId, adminPass, therapistId } = req.body;
      if (adminPass !== ADMIN_PASS) return res.status(403).json({ error: "رمز نامعتبر است" });
      if (!sessionId) return res.status(400).json({ error: "sessionId لازم است" });
      const code = randomCode();
      await redis.set(`code:${code}`, JSON.stringify({ sessionId, used: false, createdAt: Date.now(), therapistId: therapistId || null }));
      return res.status(200).json({ ok: true, code });
    }

    // ---------- استفاده از کد (کاربر — حالا با نشستِ تاییدشده، نه ایمیلِ خام) ----------
    if (action === "redeem") {
      const { code, token } = req.body;
      if (!code || !token) return res.status(400).json({ error: "کد لازم است — لطفاً وارد حساب شوید" });
      const email = await verifySession(token);
      if (!email) return res.status(401).json({ error: "نشستِ نامعتبر — لطفاً دوباره وارد شوید" });

      const key = `code:${code.toUpperCase().trim()}`;
      const raw = await redis.get(key);
      if (!raw) return res.status(404).json({ error: "این کد معتبر نیست" });
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data.used) return res.status(409).json({ error: "این کد قبلاً استفاده شده است" });

      const uKey = `unlocked:${email}`;
      const rawU = (await redis.get(uKey)) || [];
      const current = typeof rawU === "string" ? JSON.parse(rawU) : rawU || [];
      if (!current.includes(data.sessionId)) current.push(data.sessionId);
      await redis.set(uKey, JSON.stringify(current));

      data.used = true;
      data.usedBy = email;
      data.usedAt = Date.now();
      await redis.set(key, JSON.stringify(data));

      if (data.therapistId) {
        await redis.set(`patient_therapist:${email}`, data.therapistId);
        const salesKey = `therapist_sales:${data.therapistId}`;
        const rawSales = (await redis.get(salesKey)) || [];
        const sales = typeof rawSales === "string" ? JSON.parse(rawSales) : rawSales;
        sales.push({ email, sessionId: data.sessionId, ts: Date.now() });
        await redis.set(salesKey, JSON.stringify(sales));
      }

      return res.status(200).json({ ok: true, sessionId: data.sessionId });
    }

    return res.status(400).json({ error: "action نامعتبر است" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
