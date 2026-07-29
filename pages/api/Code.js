// این یک ابزارِ عیب‌یابیِ موقت است — بعد از پیداکردنِ نامِ درستِ مدل، می‌توانید این فایل را حذف کنید
export default async function handler(req, res) {
  try {
    const apiKey = process.env.GAPGPT_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "GAPGPT_API_KEY هنوز در Vercel تنظیم نشده" });
    }
    const r = await fetch("https://api.gapgpt.app/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "unknown error" });
  }
}
