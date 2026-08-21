import { getSessionContent } from "../../lib/sessionContent";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

function sessionMatchesSearch(sess, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    sess.title, sess.summary, sess.approach,
    ...(sess.body || []).flatMap((b) => [b.text, b.name, b.howTo, b.effect, b.more, ...(b.items || [])].filter(Boolean)),
  ].join(" ").toLowerCase();
  return haystack.includes(q);
}

// پیشنهادِ جلسه بر اساسِ کلیدواژه، فقط در میانِ جلساتِ بازشده‌یِ خودِ کاربر (سمتِ سرور، بدونِ افشایِ محتوایِ دیگر)
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`session-suggest:${ip}`, 60, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
    const { unlockedSessions, keywords } = req.body;
    if (!Array.isArray(unlockedSessions) || !Array.isArray(keywords)) {
      return res.status(400).json({ error: "اطلاعاتِ ناقص" });
    }

    const results = [];
    for (const keyword of keywords) {
      for (const sid of unlockedSessions) {
        const parts = sid.split("-");
        const num = Number(parts[parts.length - 1]);
        const pkgKey = parts.slice(0, -1).join("-");
        let sess;
        try { sess = getSessionContent(pkgKey, num, null, "excellent"); } catch (e) { continue; }
        if (sessionMatchesSearch(sess, keyword.keyword) && !results.find((r) => r.sid === sid)) {
          results.push({ sid, title: sess.title, reason: keyword.reason });
          break;
        }
      }
    }

    res.status(200).json({ ok: true, suggestions: results });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "content", "خطایِ سرور در session-suggest.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
