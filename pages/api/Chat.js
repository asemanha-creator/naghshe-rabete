// جایگزین کنید: کلیدِ API واقعیِ خودتان را در Vercel، در Environment Variables، با نامِ ANTHROPIC_API_KEY قرار دهید
const ANTHROPIC_API_KEY_ENV = "ANTHROPIC_API_KEY";

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

  return `تو یک دستیارِ توضیح‌دهنده در اپِ «کجای راهم؟» هستی — ابزارِ سنجشِ روان‌شناختیِ دکتر مجتبی عقیلی برایِ ارزیابیِ تعهد و پایبندیِ زناشویی.

نقشِ تو دقیقاً و فقط این است: به کاربر کمک کنی نتیجه‌ی خودش را عمیق‌تر و بهتر بفهمد.

نمره‌های این کاربر (${mode === "couple" ? "بخشی از یک نتیجه‌ی مشترکِ زوجی" : "پاسخِ فردیِ مستقل"}):
${scoreLines}
امتیازِ کلی: ${overall} از ۱۰۰

قوانینِ مهم:
۱. فقط درباره‌ی همین نتیجه، معنایِ حیطه‌ها، و راهکارهایِ عملیِ مرتبط صحبت کن.
۲. اگر کاربر سوالی خارج از این محدوده پرسید (مثلاً موضوعاتِ کاملاً بی‌ربط، یا درخواستِ مشاوره‌ی حقوقی/پزشکیِ عمومی)، مودبانه بگو که تخصصت فقط توضیحِ همین نتیجه است و او را به تماس با دفترِ دکتر عقیلی (شماره: ۰۹۰۱۵۰۹۱۳۴۶) ارجاع بده.
۳. هرگز خودت را روان‌شناس یا جایگزینِ درمانگر معرفی نکن؛ همیشه روشن کن این ابزار یک غربالگری است، نه تشخیصِ بالینی.
۴. اگر کاربر نشانه‌هایی از پریشانیِ شدید یا افکارِ آسیب‌به‌خود نشان داد، فوراً و با مهربانی او را به تماسِ فوری با دفتر یا اورژانسِ روان‌پزشکی ارجاع بده.
۵. پاسخ‌هایت کوتاه، گرم، و به زبانِ فارسیِ روان باشد — نه رسمیِ خشک.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const apiKey = process.env[ANTHROPIC_API_KEY_ENV];
    if (!apiKey) {
      return res.status(503).json({
        error: "چت‌بات هنوز فعال نشده — کلیدِ API در تنظیماتِ سایت قرار نگرفته است.",
      });
    }

    const { messages, scores, overall, mode } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: "messages لازم است" });
    }

    const systemPrompt = buildSystemPrompt(scores, overall, mode);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(502).json({ error: data?.error?.message || "خطا در ارتباط با هوشِ مصنوعی" });
    }

    const textBlock = (data.content || []).find((b) => b.type === "text");
    res.status(200).json({ reply: textBlock ? textBlock.text : "" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
