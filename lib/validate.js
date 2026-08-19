// اعتبارسنجیِ سبکِ ساختارِ داده — بدونِ نیازِ کتابخانه‌ی خارجی
// هدف: جلوگیری از ذخیره‌شدنِ داده‌یِ ناقص/بدشکل در Redis، پیش از اینکه به مشکلِ بزرگ‌تر تبدیل شود

export function isNonEmptyString(v, maxLen = 5000) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= maxLen;
}

export function isValidEmail(v) {
  return isNonEmptyString(v, 200) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNumberInRange(v, min, max) {
  const n = Number(v);
  return !Number.isNaN(n) && n >= min && n <= max;
}

export function isOneOf(v, allowedValues) {
  return allowedValues.includes(v);
}

export function isValidSessionId(v) {
  // فرمتِ مجاز: pkgKey-num  مثلاً moderate-5
  return isNonEmptyString(v, 50) && /^(moderate|advanced|betrayed|unfaithful)-\d{1,2}$/.test(v);
}

/**
 * بررسیِ یک شیء در برابرِ یک قاعده‌یِ ساده
 * @param {object} data - داده‌ای که باید بررسی شود
 * @param {object} rules - نگاشتِ نامِ فیلد به تابعِ اعتبارسنجی، مثلاً { email: isValidEmail }
 * @returns {string|null} - پیامِ خطا، یا null اگر همه‌چیز درست بود
 */
export function validate(data, rules) {
  for (const [field, checkFn] of Object.entries(rules)) {
    if (!checkFn(data[field])) {
      return `مقدارِ نامعتبر برایِ «${field}»`;
    }
  }
  return null;
}
