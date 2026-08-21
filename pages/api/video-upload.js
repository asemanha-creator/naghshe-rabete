import { handleUpload } from "@vercel/blob/client";
import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "../../lib/auth";
import { logEvent, LOG_LEVELS } from "../../lib/logger";

const redis = Redis.fromEnv();

// آپلودِ ویدیویِ هر جلسه — مستقیم از مرورگر به فضایِ Blob (تنها راهِ رسمی برایِ فایل‌هایِ بزرگ‌تر از ۴.۵ مگابایت،
// چون محدودیتِ حجمِ Vercel یک محدودیتِ سختِ زیرساختی است و قابلِ‌دورزدن از سمتِ سرور نیست)
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
          allowedContentTypes: ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
          addRandomSuffix: true,
          storeId: process.env.AUDIO_STORE_ID,
          tokenPayload: JSON.stringify({ sessionId: payload.sessionId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { sessionId } = JSON.parse(tokenPayload);
        await redis.set(`session_video:${sessionId}`, blob.url);
        await logEvent(LOG_LEVELS.INFO, "admin", "ویدیویِ جلسه آپلود شد (webhook)", { sessionId, url: blob.url });
      },
    });
    res.status(200).json(jsonResponse);
  } catch (e) {
    console.error("video-upload error:", e);
    await logEvent(LOG_LEVELS.ERROR, "admin", "خطا در آپلودِ ویدیو", { error: e.message, stack: e.stack });
    res.status(400).json({ error: e.message || "خطایِ آپلود" });
  }
}
