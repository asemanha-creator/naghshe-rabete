import { Redis } from "@upstash/redis";
import { logEvent, LOG_LEVELS } from "../../lib/logger";

const redis = Redis.fromEnv();
const INACTIVE_THRESHOLD_DAYS = 3; // بعدِ چند روزِ غیبت، یادآوری فرستاده شود

// این مسیر، هر روز توسطِ Vercel Cron فراخوانی می‌شود (مثلِ backup.js)
// برایِ هرکسی که بیش از N روز غایب بوده و امروز یادآوری نگرفته، یک پیامکِ کوتاه می‌فرستد
export default async function handler(req, res) {
  try {
    const isCron = req.headers["x-vercel-cron"] || req.headers["authorization"] === `Bearer ${process.env.CRON_SECRET}`;
    if (!isCron && req.query.manual !== "1") {
      return res.status(403).json({ error: "این مسیر فقط برایِ اجرایِ زمان‌بندی‌شده است" });
    }

    if (!process.env.KAVENEGAR_API_KEY) {
      return res.status(200).json({ ok: true, skipped: "کاوه‌نگار هنوز فعال نشده — یادآوری غیرفعال است" });
    }

    const phones = await redis.smembers("user:index");
    const today = new Date().toDateString();
    const now = Date.now();
    let sentCount = 0;

    for (const phone of phones) {
      try {
        const lastActive = await redis.get(`last_active:${phone}`);
        if (!lastActive) continue;
        const daysSince = (now - Number(lastActive)) / 86400000;
        if (daysSince < INACTIVE_THRESHOLD_DAYS) continue;

        const lastReminded = await redis.get(`last_reminded:${phone}`);
        if (lastReminded === today) continue;

        const smsUrl = `https://api.kavenegar.com/v1/${process.env.KAVENEGAR_API_KEY}/sms/send.json?receptor=${phone}&message=${encodeURIComponent("چند روزیه سر نزدی به «گدار» 🌊 یک نگاهِ کوتاه (فقط ۲ دقیقه) هم فرق می‌سازه.")}&sender=${process.env.KAVENEGAR_SENDER || ""}`;
        const smsRes = await fetch(smsUrl);
        const smsData = await smsRes.json();
        if (smsData?.return?.status === 200) {
          await redis.set(`last_reminded:${phone}`, today);
          sentCount++;
        }
      } catch (innerErr) {
        console.error("reminder failed for one user:", innerErr);
      }
    }

    await logEvent(LOG_LEVELS.INFO, "system", "یادآوریِ کاربرانِ غایب اجرا شد", { sentCount, totalChecked: phones.length });
    res.status(200).json({ ok: true, sentCount, totalChecked: phones.length });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "system", "خطا در ارسالِ یادآوری", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
