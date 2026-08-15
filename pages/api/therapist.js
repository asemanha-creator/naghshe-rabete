import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
    const { action } = req.body;

    // ادمین: ساختِ درمانگرِ جدید
    if (action === "create") {
      const { adminToken, therapistId, name, password, sharePercent } = req.body;
      if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "رمز نامعتبر است" });
      if (!therapistId || !name || !password) return res.status(400).json({ error: "اطلاعاتِ ناقص" });
      const id = therapistId.toLowerCase().trim();
      const exists = await redis.get(`therapist:${id}`);
      if (exists) return res.status(409).json({ error: "این کد قبلاً ثبت شده" });
      await redis.set(`therapist:${id}`, JSON.stringify({ id, name, password, sharePercent: sharePercent || 70, createdAt: Date.now() }));
      await redis.sadd("therapists:index", id);
      return res.status(200).json({ ok: true, id });
    }

    // درمانگر: ورود
    if (action === "login") {
      const { therapistId, password } = req.body;
      const raw = await redis.get(`therapist:${(therapistId || "").toLowerCase().trim()}`);
      if (!raw) return res.status(404).json({ error: "کد یافت نشد" });
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data.password !== password) return res.status(403).json({ error: "رمز اشتباه است" });
      return res.status(200).json({ ok: true, id: data.id, name: data.name, sharePercent: data.sharePercent });
    }

    // درمانگر یا ادمین: داشبورد فروش
    if (action === "dashboard") {
      const { therapistId, adminToken } = req.body;
      if (!(await verifyAdminToken(adminToken))) {
        // درمانگر فقط با ورودِ قبلی (therapistId معتبر) مجاز است — بررسیِ سبک
        const t = await redis.get(`therapist:${therapistId}`);
        if (!t) return res.status(403).json({ error: "دسترسی غیرمجاز" });
      }
      const rawSales = (await redis.get(`therapist_sales:${therapistId}`)) || [];
      const sales = typeof rawSales === "string" ? JSON.parse(rawSales) : rawSales;
      const rawT = await redis.get(`therapist:${therapistId}`);
      const t = typeof rawT === "string" ? JSON.parse(rawT) : rawT;
      const share = t?.sharePercent ?? 70;
      return res.status(200).json({ ok: true, sales, count: sales.length, therapistShare: share });
    }

    // ادمین: فهرستِ همه‌ی درمانگران + جمعِ فروش
    if (action === "listAll") {
      const { adminToken } = req.body;
      if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });
      const ids = await redis.smembers("therapists:index");
      const list = [];
      for (const id of ids) {
        const raw = await redis.get(`therapist:${id}`);
        const t = typeof raw === "string" ? JSON.parse(raw) : raw;
        const rawSales = (await redis.get(`therapist_sales:${id}`)) || [];
        const sales = typeof rawSales === "string" ? JSON.parse(rawSales) : rawSales;
        list.push({ id, name: t?.name, sharePercent: t?.sharePercent, salesCount: sales.length });
      }
      return res.status(200).json({ ok: true, therapists: list });
    }

    return res.status(400).json({ error: "action نامعتبر" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
