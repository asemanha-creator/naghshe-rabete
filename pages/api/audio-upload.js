import { handleUpload } from "@vercel/blob/client";
import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";

const redis = Redis.fromEnv();

// آپلودِ فایلِ صوتیِ هر جلسه — فقط ادمین، مستقیم به Vercel Blob (بدونِ عبور از سرور، برایِ فایل‌هایِ بزرگ)
export default async function handler(req, res) {
  try {
    const body = req.body;
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        if (!(await verifyAdminToken(payload.adminToken))) {
          throw new Error("دسترسی غیرمجاز");
        }
        return {
          allowedContentTypes: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/x-m4a"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ sessionId: payload.sessionId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { sessionId } = JSON.parse(tokenPayload);
        await redis.set(`session_audio:${sessionId}`, blob.url);
      },
    });
    res.status(200).json(jsonResponse);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || "خطایِ آپلود" });
  }
}
