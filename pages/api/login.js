import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { createSession } from "../../lib/auth";

const redis = Redis.fromEnv();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "ایمیل و رمزِعبور لازم است" });
    const key = `user:${email.toLowerCase().trim()}`;
    const raw = await redis.get(key);
    if (!raw) return res.status(404).json({ error: "حسابی با این ایمیل پیدا نشد" });
    const user = typeof raw === "string" ? JSON.parse(raw) : raw;
    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) return res.status(401).json({ error: "رمزِعبور اشتباه است" });
    const token = await createSession(user.email);
    res.status(200).json({ ok: true, email: user.email, name: user.name, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
