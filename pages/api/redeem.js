import { Redis } from "@upstash/redis";
import { verifySession, verifyAdminToken, verifyTherapistToken } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
import { isNonEmptyString } from "../../lib/validate";

const redis = Redis.fromEnv();
const PACKAGE_SESSION_COUNTS = { moderate: 20, advanced: 8, betrayed: 30, unfaithful: 30, distrust: 10, anger: 10 };

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

    // ---------- ساختِ کد (ادمینِ اصلی، یا هر درمانگرِ واردشده برایِ خودش) ----------
    // نکته: sessionId می‌تواند یک جلسه‌ی خاص («moderate-3») یا کلِ یک بسته («PKG:moderate») باشد — برایِ هدیه‌دادنِ کاملِ بسته
    if (action === "generate") {
      const { sessionId, adminToken, therapistToken } = req.body;
      const isAdmin = await verifyAdminToken(adminToken);
      const therapistIdFromToken = therapistToken ? await verifyTherapistToken(therapistToken) : null;
      if (!isAdmin && !therapistIdFromToken) return res.status(403).json({ error: "رمز نامعتبر است" });
      if (!sessionId) return res.status(400).json({ error: "sessionId لازم است" });
      const code = randomCode();
      // اگر درمانگر خودش وارد شده، کد خودکار به همان درمانگر متصل می‌شود
      await redis.set(`code:${code}`, JSON.stringify({ sessionId, used: false, createdAt: Date.now(), therapistId: therapistIdFromToken || null }));
      return res.status(200).json({ ok: true, code });
    }

    // ---------- استفاده از کد (کاربر — حالا با نشستِ تاییدشده، نه ایمیلِ خام) ----------
    if (action === "redeem") {
      const ip = getClientIp(req);
      // حداکثر ۱۰ تلاش در ۱۰ دقیقه — جلوگیری از حدس‌زدنِ خودکارِ کدهایِ فعال‌سازی
      const rl = await checkRateLimit(`redeem:${ip}`, 10, 600);
      if (!rl.allowed) {
        await logEvent(LOG_LEVELS.WARN, "payment", "محدودیتِ نرخ فعال شد — تلاشِ بیش‌ازحد برایِ کدِ فعال‌سازی", { ip });
        return res.status(429).json({ error: "تعدادِ تلاش‌هایتان زیاد بوده — چند دقیقه صبر کنید" });
      }

      const { code, token } = req.body;
      if (!isNonEmptyString(code, 20) || !isNonEmptyString(token, 200)) {
        return res.status(400).json({ error: "کد لازم است — لطفاً وارد حساب شوید" });
      }
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

      let unlockedSessionIds = [];
      if (data.sessionId.startsWith("PKG:")) {
        const pkgKey = data.sessionId.replace("PKG:", "");
        const total = PACKAGE_SESSION_COUNTS[pkgKey];
        if (!total) return res.status(400).json({ error: "بستهٔ نامعتبر در این کد" });
        unlockedSessionIds = Array.from({ length: total }, (_, i) => `${pkgKey}-${i + 1}`);
      } else {
        unlockedSessionIds = [data.sessionId];
      }
      unlockedSessionIds.forEach((sid) => { if (!current.includes(sid)) current.push(sid); });
      await redis.set(uKey, JSON.stringify(current));

      data.used = true;
      data.usedBy = email;
      data.usedAt = Date.now();
      await redis.set(key, JSON.stringify(data));

      if (data.therapistId) {
        // اگر این مراجع قبلاً به درمانگرِ دیگری متصل بوده، آن را خاموش جایگزین نکن — فقط لاگ کن تا بعداً بررسی شود
        const existingTherapist = await redis.get(`patient_therapist:${email}`);
        if (existingTherapist && existingTherapist !== data.therapistId) {
          await logEvent(LOG_LEVELS.WARN, "admin", "تلاش برایِ تغییرِ درمانگرِ یک مراجعِ موجود — نادیده گرفته شد", { email, existingTherapist, attemptedTherapistId: data.therapistId });
        } else {
          await redis.set(`patient_therapist:${email}`, data.therapistId);
        }
        const salesKey = `therapist_sales:${data.therapistId}`;
        const rawSales = (await redis.get(salesKey)) || [];
        const sales = typeof rawSales === "string" ? JSON.parse(rawSales) : rawSales;
        sales.push({ email, sessionId: data.sessionId, ts: Date.now() });
        await redis.set(salesKey, JSON.stringify(sales));
      }

      return res.status(200).json({ ok: true, sessionId: data.sessionId, unlockedCount: unlockedSessionIds.length });
    }

    return res.status(400).json({ error: "action نامعتبر است" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "payment", "خطایِ سرور در redeem.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
