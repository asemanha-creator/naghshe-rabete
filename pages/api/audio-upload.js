import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";

const redis = Redis.fromEnv();

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

// آپلودِ فایلِ صوتیِ هر جلسه — از طریقِ خودِ سرور (ساده و مطمئن‌تر، مثلِ بک‌آپ‌ها)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const { sessionId, adminToken, fileBase64, fileName, contentType } = req.body;
    if (!(await verifyAdminToken(adminToken))) return res.status(403).json({ error: "دسترسی غیرمجاز" });
    if (!sessionId || !fileBase64 || !fileName) return res.status(400).json({ error: "اطلاعاتِ ناقص" });

    const buffer = Buffer.from(fileBase64, "base64");
    const blob = await put(`audio/${sessionId}-${Date.now()}-${fileName}`, buffer, {
      access: "public",
      contentType: contentType || "audio/mp4",
    });

    await redis.set(`session_audio:${sessionId}`, blob.url);

    res.status(200).json({ ok: true, url: blob.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "خطایِ آپلود" });
  }
}
