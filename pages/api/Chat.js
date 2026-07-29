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

function buildSystemPrompt(scores, overall, mode) {
  const scoreLines = Object.entries(scores || {})
    .map(([key, val]) => `- ${DOMAIN_LABELS[key] || key}: ${val} از ۱۰۰`)
    .join("\n");

  const weakest = Object.entries(scores || {}).sort((a, b) => a[1] - b[1])[0];
  const weakestLabel = weakest ? (DOMAIN_LABELS[weakest[0]] || weakest[0]) : null;

  return `تو یک دستیارِ توضیح‌دهنده در اپِ «کجای راهم؟» هستی — ابزارِ سنجشِ روان‌شناختیِ دکتر مجتبی عقیلی برایِ ارزیابیِ تعهد و پایبندیِ زناشویی.

نقشِ تو دقیقاً و فقط این است: به کاربر کمک کنی نتیجه‌ی خودش را عمیق‌تر و بهتر بفهمد.

نمره‌های این کاربر (${mode === "couple" ? "بخشی از یک نتیجه‌ی مشترکِ زوجی" : "پاسخِ فردیِ مستقل"}):
${scoreLines}
امتیازِ کلی: ${overall} از ۱۰۰
${weakestLabel ? `ضعیف‌ترین حیطه: ${weakestLabel}` : ""}

رفتارِ فعال (مهم): اگر این اولین پیامِ گفت‌وگوست (کاربر هنوز چیزی نپرسیده)، به‌جایِ منتظرماندن، خودت با یک **سوالِ کاوشیِ کوتاه و غیرِقضاوت‌گرانه** درباره‌ی همان ضعیف‌ترین حیطه شروع کن — مثلاً «می‌بینم نمره‌ی شما در حیطه‌ی [X] نسبت به بقیه پایین‌تر است؛ دوست دارید کمی درباره‌اش صحبت کنیم؟». این سوال فقط یک دعوتِ گرم است، نه اتهام یا نتیجه‌گیری.

قوانینِ مهم:
۱. فقط درباره‌ی همین نتیجه، معنایِ حیطه‌ها، و راهکارهایِ عملیِ مرتبط صحبت کن.
۲. اگر کاربر سوالی خارج از این محدوده پرسید، مودبانه بگو که تخصصت فقط توضیحِ همین نتیجه است و او را به تماس با دفترِ دکتر عقیلی (شماره: ۰۹۰۱۵۰۹۱۳۴۶) ارجاع بده.
۳. هرگز خودت را روان‌شناس یا جایگزینِ درمانگر معرفی نکن؛ همیشه روشن کن این ابزار یک غربالگری است، نه تشخیصِ بالینی.
۴. اگر کاربر نشانه‌هایی از پریشانیِ شدید یا افکارِ آسیب‌به‌خود نشان داد، فوراً و با مهربانی او را به تماسِ فوری با دفتر یا اورژانسِ روان‌پزشکی ارجاع بده.
۵. پاسخ‌هایت کوتاه، گرم، و به زبانِ فارسیِ روان باشد — نه رسمیِ خشک.`;
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

    const { messages, scores, overall, mode } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages لازم است" });
    }
    const effectiveMessages = messages.length
      ? messages
      : [{ role: "user", content: "(شروعِ گفت‌وگو — لطفاً طبقِ رفتارِ فعال، خودت با سوالِ کاوشی شروع کن)" }];

    const systemPrompt = buildSystemPrompt(scores, overall, mode);

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
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
