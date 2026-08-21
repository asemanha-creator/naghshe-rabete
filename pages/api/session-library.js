import { Redis } from "@upstash/redis";
import { getSessionContent } from "../../lib/sessionContent";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();
import { verifyAdminToken } from "../../lib/auth";

const TREATMENT_PACKAGES_SESSIONS = { moderate: 20, advanced: 8, betrayed: 30, unfaithful: 30, distrust: 10, anger: 10 };

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

// فهرستِ جلساتِ یک بسته — فقط عنوان/رویکرد/پیش‌نمایشِ کوچک را می‌فرستد؛ هرگز متنِ کامل را
export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`session-library:${ip}`, 120, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });
    if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
    const { pkgKey, weakestDomain, searchQuery, email, adminToken } = req.query;
    const total = TREATMENT_PACKAGES_SESSIONS[pkgKey];
    if (!total) return res.status(400).json({ error: "بسته‌یِ نامعتبر" });

    const isAdmin = await verifyAdminToken(adminToken);
    let unlockedSessions = [];
    if (email) {
      const raw = (await redis.get(`unlocked:${email.toLowerCase().trim()}`)) || [];
      unlockedSessions = typeof raw === "string" ? JSON.parse(raw) : raw;
    }

    const results = [];
    for (let num = 1; num <= total; num++) {
      const sess = getSessionContent(pkgKey, num, weakestDomain || null, "excellent");
      if (searchQuery && !sessionMatchesSearch(sess, searchQuery)) continue;
      const sid = `${pkgKey}-${num}`;
      const unlocked = num === 1 || pkgKey === "distrust" || pkgKey === "anger" ? true : (isAdmin || unlockedSessions.includes(sid));
      const item = { num, title: sess.title, approach: sess.approach, unlocked };
      results.push(item);
    }

    res.status(200).json({ ok: true, sessions: results });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "content", "خطایِ سرور در session-library.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
