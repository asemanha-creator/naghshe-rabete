import { logEvent, LOG_LEVELS } from "../../lib/logger";
// تنظیماتِ سرویس‌دهنده: به‌جایِ آدرسِ رسمیِ Anthropic، از پروکسیِ ایرانیِ GapGPT استفاده می‌کنیم
// کلید و نامِ مدل را در Vercel، بخشِ Environment Variables، قرار دهید:
//   GAPGPT_API_KEY = توکنی که از GapGPT گرفتید
//   GAPGPT_MODEL   = نامِ دقیقِ مدل (مثلاً از پنلِ GapGPT کپی کنید — اگر خالی بماند، پیش‌فرض امتحان می‌شود)
const GAPGPT_BASE_URL = "https://api.gapgpt.app/v1/chat/completions";
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

const DOMAIN_LABELS = {
  emotional: "فاصله‌ی هیجانی",
  exposure: "محرک‌های بیرونی",
  conflict: "الگویِ تعارض",
  boundaries: "شفافیت و مرزها",
  vulnerability: "آسیب‌پذیریِ زمینه‌ای",
  sexual: "رضایتِ جنسی",
};

function buildSystemPrompt(scores, overall, mode, appContext) {
  const hasScores = scores && Object.keys(scores).length > 0;

  let scoreSection = "";
  if (hasScores) {
    const scoreLines = Object.entries(scores)
      .map(([key, val]) => `- ${DOMAIN_LABELS[key] || key}: ${val} از ۱۰۰`)
      .join("\n");
    const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
    const weakestLabel = weakest ? (DOMAIN_LABELS[weakest[0]] || weakest[0]) : null;
    scoreSection = `\nنمره‌هایِ این کاربر (${mode === "couple" ? "بخشی از یک نتیجه‌ی مشترکِ زوجی" : "پاسخِ فردیِ مستقل"}):\n${scoreLines}\nامتیازِ کلی: ${overall} از ۱۰۰\n${weakestLabel ? `ضعیف‌ترین حیطه: ${weakestLabel}` : ""}\n`;
  }

  return `تو دستیارِ همراهِ اپِ «گُدار» هستی — اپِ روان‌شناختیِ دکتر مجتبی عقیلی برایِ سلامتِ رابطه و خانواده.

نقشِ تو: به کاربر در **هر بخشی از اپ** که هست کمک کنی — چه دربارهٔ نتیجه‌ی یک آزمون سوال دارد، چه دربارهٔ یک تکنیک/جلسه، چه فقط نیازِ یک گفت‌وگویِ حمایتیِ کوتاه دارد.

وضعیتِ فعلیِ کاربر در اپ: ${appContext || "نامشخص"}
${scoreSection}
قوانینِ مهم:
۱. کمک‌کننده، گرم، و عملی باش — نه فقط توضیح‌دهنده‌ی خشک.
۲. اگر سوال دربارهٔ محتوایِ روان‌شناختیِ اپ (تکنیک‌ها، جلسات، نتیجه‌ی آزمون‌ها) است، مستقیم و مفید پاسخ بده.
۳. هرگز خودت را روان‌شناس یا جایگزینِ درمانگر معرفی نکن؛ همیشه روشن کن این ابزار مکمل است، نه جایگزینِ درمانِ حرفه‌ای.
۴. اگر کاربر نشانه‌هایی از پریشانیِ شدید یا افکارِ آسیب‌به‌خود نشان داد، فوراً و با مهربانی او را به اورژانسِ اجتماعی (شماره‌ی ۱۲۳) یا تماسِ فوری با دفترِ دکتر عقیلی (${"۰۹۰۱۵۰۹۱۳۴۶"}) ارجاع بده.
۵. اگر سوال کاملاً خارج از حوزه‌ی روان‌شناسیِ رابطه/خانواده بود (مثلاً سوالِ فنی/غیرمرتبط)، مودبانه بگو تخصصت همین حوزه است.
۶. پاسخ‌هایت کوتاه (حداکثر چند جمله)، گرم، و به زبانِ فارسیِ روان باشد — نه رسمیِ خشک.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const apiKey = process.env.GAPGPT_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "چت‌بات هنوز فعال نشده — کلیدِ GAPGPT_API_KEY در تنظیماتِ سایت قرار نگرفته است.",
      });
    }
    const model = process.env.GAPGPT_MODEL || DEFAULT_MODEL;

    const { messages, scores, overall, mode, appContext } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages لازم است" });
    }
    const effectiveMessages = messages.length
      ? messages
      : [{ role: "user", content: "(شروعِ گفت‌وگو — یک سلامِ کوتاه و گرم بده و بپرس چطور می‌توانی کمک کنی)" }];

    const systemPrompt = buildSystemPrompt(scores, overall, mode, appContext);

    const r = await fetch(GAPGPT_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          ...effectiveMessages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(502).json({
        error: data?.error?.message || `خطا در ارتباط با GapGPT (مدل «${model}» را در پنلِ خودتان بررسی کنید)`,
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    await logEvent(LOG_LEVELS.ERROR, "content", "خطایِ سرور در chat.js", { error: e.message });
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
