import { Redis } from "@upstash/redis";
import { logEvent, LOG_LEVELS } from "../../lib/logger";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

const redis = Redis.fromEnv();
const GAME_TTL_SECONDS = 60 * 60 * 24 * 3; // ۳ روز اعتبار

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export default async function handler(req, res) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`couple-game:${ip}`, 40, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "تعدادِ درخواست‌هایتان زیاد بوده — کمی صبر کنید" });

    if (req.method === "POST") {
      const { action } = req.body;

      if (action === "create") {
        const code = randomCode();
        const game = { code, answersA: null, answersB: null, createdAt: Date.now() };
        await redis.set(`couple_game:${code}`, JSON.stringify(game), { ex: GAME_TTL_SECONDS });
        await logEvent(LOG_LEVELS.INFO, "content", "بازیِ زوجی ایجاد شد", { code });
        return res.status(200).json({ ok: true, code });
      }

      if (action === "submit") {
        const { code, role, answers } = req.body;
        if (!code || !["a", "b"].includes(role) || !Array.isArray(answers)) {
          return res.status(400).json({ error: "اطلاعاتِ ناقص" });
        }
        const raw = await redis.get(`couple_game:${code}`);
        if (!raw) return res.status(404).json({ error: "کد پیدا نشد یا منقضی شده" });
        const game = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (role === "a") game.answersA = answers;
        else game.answersB = answers;
        await redis.set(`couple_game:${code}`, JSON.stringify(game), { ex: GAME_TTL_SECONDS });
        return res.status(200).json({ ok: true, bothDone: !!(game.answersA && game.answersB) });
      }

      return res.status(400).json({ error: "action نامعتبر" });
    }

    if (req.method === "GET") {
      const { code } = req.query;
      if (!code) return res.status(400).json({ error: "کد لازم است" });
      const raw = await redis.get(`couple_game:${code}`);
      if (!raw) return res.status(404).json({ error: "کد پیدا نشد یا منقضی شده" });
      const game = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json({
        ok: true,
        hasA: !!game.answersA,
        hasB: !!game.answersB,
        answersA: game.answersA,
        answersB: game.answersB,
      });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "content", "خطایِ سرور در couple-game.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
