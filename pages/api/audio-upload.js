import { handleUpload } from "@vercel/blob/client";
import { verifyAdminToken } from "../../lib/auth";

// آپلودِ فایلِ صوتیِ هر جلسه — فقط ادمین، مستقیم به Vercel Blob (بدونِ عبور از سرور، برایِ فایل‌هایِ بزرگ)
// نکته: ذخیره‌ی آدرسِ نهایی در Redis، جداگانه و مستقیم توسطِ کلاینت انجام می‌شود (نه از طریقِ onUploadCompleted) — قابلِ‌اعتمادتر رویِ شبکه‌هایِ موبایل
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
          allowedContentTypes: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/x-m4a", "audio/aac", "video/mp4", "application/octet-stream"],
          addRandomSuffix: true,
        };
      },
    });
    res.status(200).json(jsonResponse);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || "خطایِ آپلود" });
  }
}
