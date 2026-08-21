import { Redis } from "@upstash/redis";
import { getSessionContent } from "../../lib/sessionContent";
import { logEvent, LOG_LEVELS } from "../../lib/logger";

const redis = Redis.fromEnv();
import { verifyAdminToken } from "../../lib/auth";

// متنِ کاملِ یک جلسه — فقط بعد از تاییدِ سرورِ اینکه کاربر آن را خریده (یا ادمین است)
export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
    const { pkgKey, num, weakestDomain, level, email, adminToken, streakBonus } = req.query;
    if (!pkgKey || !num) return res.status(400).json({ error: "اطلاعاتِ ناقص" });

    const isAdmin = await verifyAdminToken(adminToken);
    // بستهٔ «بی‌اعتمادی» کاملاً رایگان است — همه‌ی جلساتش بدونِ نیازِ خرید باز است
    // سوپرایزِ ۱۵روزِ پیاپی: جلسه‌ی دومِ هر بسته، به‌عنوانِ پاداشِ وفاداری، رایگان می‌شود
    let unlocked = isAdmin || Number(num) === 1 || pkgKey === "distrust" || pkgKey === "anger" || (streakBonus === "1" && Number(num) === 2);
    if (!unlocked && email) {
      const raw = (await redis.get(`unlocked:${email.toLowerCase().trim()}`)) || [];
      const list = typeof raw === "string" ? JSON.parse(raw) : raw;
      unlocked = list.includes(`${pkgKey}-${num}`);
    }

    const sess = getSessionContent(pkgKey, Number(num), weakestDomain || null, level || "excellent");
    // اتصالِ لینکِ واقعیِ صوت/ویدیویی که ادمین آپلود کرده (اگر باشد)
    const sessionKey = `${pkgKey}-${num}`;
    try {
      const [realAudio, realVideo] = await Promise.all([
        redis.get(`session_audio:${sessionKey}`),
        redis.get(`session_video:${sessionKey}`),
      ]);
      if (realAudio) sess.audioUrl = realAudio;
      if (realVideo) sess.videoUrl = realVideo;
    } catch (e) { console.error("media lookup failed (non-critical):", e); }

    if (!unlocked) {
      // بدونِ دسترسی، فقط پیش‌نمایشِ کوچک برمی‌گردد، نه متنِ کامل
      return res.status(200).json({
        ok: true, unlocked: false,
        session: {
          title: sess.title, approach: sess.approach,
          body: (sess.body || []).filter((b) => b.type === "h" || b.type === "p").slice(0, 2),
        },
      });
    }

    res.status(200).json({ ok: true, unlocked: true, session: sess });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "content", "خطایِ سرور در session-full.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
