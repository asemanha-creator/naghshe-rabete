import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";

const redis = Redis.fromEnv();

// ابزارِ یک‌باره‌ی اصلاح — اگر کدهایِ «unlocked:...» با ایمیلِ حروف‌بزرگ ذخیره شده باشند،
// آن‌ها را با نسخه‌ی حروفِ‌کوچک ادغام می‌کند تا با سیستمِ جدید سازگار شوند
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
    if (!(await verifyAdminToken(req.body.adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });

    let cursor = 0;
    let fixedCount = 0;
    const fixedEmails = [];

    do {
      const result = await redis.scan(cursor, { match: "unlocked:*", count: 100 });
      cursor = result[0];
      const keys = result[1];

      for (const key of keys) {
        const email = key.replace("unlocked:", "");
        const normalizedEmail = email.toLowerCase().trim();
        if (email === normalizedEmail) continue; // از قبل درست است

        const normalizedKey = `unlocked:${normalizedEmail}`;
        const rawOld = await redis.get(key);
        const rawNew = await redis.get(normalizedKey);
        const oldList = typeof rawOld === "string" ? JSON.parse(rawOld) : (rawOld || []);
        const newList = typeof rawNew === "string" ? JSON.parse(rawNew) : (rawNew || []);
        const merged = [...new Set([...oldList, ...newList])];

        await redis.set(normalizedKey, JSON.stringify(merged));
        await redis.del(key);
        fixedCount++;
        fixedEmails.push(email);
      }
    } while (cursor !== 0 && cursor !== "0");

    await logEvent(LOG_LEVELS.INFO, "system", "اصلاحِ ایمیل‌هایِ حروف‌بزرگ در unlocked انجام شد", { fixedCount, fixedEmails });
    res.status(200).json({ ok: true, fixedCount, fixedEmails });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "system", "خطا در اصلاحِ ایمیل‌ها", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
