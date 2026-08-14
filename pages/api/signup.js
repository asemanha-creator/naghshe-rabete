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
    const { email, password, name } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "ایمیل یا رمزِعبور نامعتبر است (رمز حداقل ۶ کاراکتر)" });
    }
    const key = `user:${email.toLowerCase().trim()}`;
    const existing = await redis.get(key);
    if (existing) return res.status(409).json({ error: "این ایمیل قبلاً ثبت‌نام کرده است" });

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    await redis.set(key, JSON.stringify({ email, name: name || "", salt, passwordHash, createdAt: Date.now() }));
    await redis.sadd("user:index", email.toLowerCase().trim());
    const token = await createSession(email);
    res.status(200).json({ ok: true, email, name: name || "", token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
