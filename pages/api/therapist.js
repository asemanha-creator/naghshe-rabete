import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { verifyAdminToken, createTherapistSession, verifyTherapistToken } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
const redis = Redis.fromEnv();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
    const { action } = req.body;
    const ip = getClientIp(req);

    // ادمین: ساختِ درمانگرِ جدید — رمز حالا هش‌شده ذخیره می‌شود، نه متنِ خام
    if (action === "create") {
      const { adminToken, therapistId, name, password, sharePercent } = req.body;
      if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "رمز نامعتبر است" });
      if (!therapistId || !name || !password || password.length < 6) return res.status(400).json({ error: "اطلاعاتِ ناقص — رمز حداقل ۶ کاراکتر" });
      const id = therapistId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
      if (!id) return res.status(400).json({ error: "شناسه باید فقط حروفِ انگلیسی/عدد باشد" });
      const exists = await redis.get(`therapist:${id}`);
      if (exists) return res.status(409).json({ error: "این کد قبلاً ثبت شده" });
      const salt = crypto.randomBytes(16).toString("hex");
      const passwordHash = hashPassword(password, salt);
      await redis.set(`therapist:${id}`, JSON.stringify({ id, name, salt, passwordHash, sharePercent: sharePercent || 70, createdAt: Date.now() }));
      await redis.sadd("therapists:index", id);
      await logEvent(LOG_LEVELS.INFO, "admin", "حسابِ درمانگرِ جدید ساخته شد", { id, name });
      return res.status(200).json({ ok: true, id });
    }

    // درمانگر: ورود — حالا با محدودیتِ نرخ و توکنِ نشستِ واقعی (نه فقط دادن‌شناسه دوباره)
    if (action === "login") {
      const rl = await checkRateLimit(`therapist-login:${ip}`, 10, 600);
      if (!rl.allowed) {
        await logEvent(LOG_LEVELS.WARN, "auth", "محدودیتِ نرخ فعال شد — تلاشِ بیش‌ازحدِ ورودِ درمانگر", { ip });
        return res.status(429).json({ error: "تعدادِ تلاش‌هایتان زیاد بوده — چند دقیقه صبر کنید" });
      }
      const { therapistId, password } = req.body;
      const id = (therapistId || "").toLowerCase().trim();
      const raw = await redis.get(`therapist:${id}`);
      if (!raw) return res.status(404).json({ error: "کد یافت نشد" });
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      let passwordOk = false;
      if (data.passwordHash && data.salt) {
        // حساب‌هایِ جدید — رمزِ هش‌شده
        passwordOk = hashPassword(password, data.salt) === data.passwordHash;
      } else if (data.password) {
        // سازگاری با حساب‌هایِ خیلی‌قدیمی که هنوز رمزِ خام داشتند — بعدِ اولین ورود، خودکار هش می‌شوند
        passwordOk = data.password === password;
        if (passwordOk) {
          const salt = crypto.randomBytes(16).toString("hex");
          const passwordHash = hashPassword(password, salt);
          await redis.set(`therapist:${id}`, JSON.stringify({ ...data, salt, passwordHash, password: undefined }));
        }
      }
      if (!passwordOk) {
        await logEvent(LOG_LEVELS.WARN, "auth", "تلاشِ ناموفقِ ورودِ درمانگر", { id });
        return res.status(403).json({ error: "رمز اشتباه است" });
      }

      const token = await createTherapistSession(id);
      await logEvent(LOG_LEVELS.INFO, "auth", "ورودِ موفقِ درمانگر", { id });
      return res.status(200).json({ ok: true, token, id: data.id, name: data.name, sharePercent: data.sharePercent });
    }

    // درمانگر یا ادمین: داشبورد فروش — حالا نیازِ توکنِ واقعی دارد، نه فقط ادعایِ therapistId
    if (action === "dashboard") {
      const { therapistId, adminToken, therapistToken } = req.body;
      const isAdmin = await verifyAdminToken(adminToken);
      const verifiedTherapistId = therapistToken ? await verifyTherapistToken(therapistToken) : null;
      if (!isAdmin && (!verifiedTherapistId || verifiedTherapistId !== therapistId)) {
        return res.status(403).json({ error: "دسترسی غیرمجاز" });
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
    await logEvent(LOG_LEVELS.ERROR, "admin", "خطایِ سرور در therapist.js", { error: e.message });
    res.status(500).json({ error: e.message });
  }
}
