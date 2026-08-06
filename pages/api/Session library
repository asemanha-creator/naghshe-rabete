import { Redis } from "@upstash/redis";
import { getSessionContent } from "../../lib/sessionContent";

const redis = Redis.fromEnv();
const ADMIN_PASS = "AGHILI-PANEL";

const TREATMENT_PACKAGES_SESSIONS = { moderate: 20, advanced: 8, betrayed: 30, unfaithful: 30 };

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
    if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
    const { pkgKey, weakestDomain, searchQuery, email, adminPass } = req.query;
    const total = TREATMENT_PACKAGES_SESSIONS[pkgKey];
    if (!total) return res.status(400).json({ error: "بسته‌یِ نامعتبر" });

    const isAdmin = adminPass === ADMIN_PASS;
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
      const unlocked = isAdmin || unlockedSessions.includes(sid);
      const item = { num, title: sess.title, approach: sess.approach, unlocked };
      if (num === 1 && !unlocked) {
        item.freePreview = (sess.body || []).filter((b) => b.type === "h" || b.type === "p").slice(0, 2);
      }
      results.push(item);
    }

    res.status(200).json({ ok: true, sessions: results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
