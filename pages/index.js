

import React, { useState, useEffect, useMemo } from "react";

// ---------- Branding ----------
const BRAND = {
  academy: "آکادمی روان‌شناختی دکتر مجتبی عقیلی",
  name: "دکتر مجتبی عقیلی",
  credential: "استاد دانشگاه، دانشیار روان‌شناسی سلامت، پژوهشگر ممتاز سه دوره‌ی دانشگاه",
  phone: "۰۹۰۱۵۰۹۱۳۴۶",
  instagram: "dr_mojtaba_aghili",
  city: "گرگان",
};
const ADMIN_PASS = "AGHILI-PANEL";
// لینکِ خریدِ بسته‌ی آموزشی/وبینار (برایِ سطحِ متوسط) — این را با لینکِ واقعیِ خودتان جایگزین کنید
const WEBINAR_PACKAGE_LINK = "https://zarinp.al/your-webinar-link";
// لینکِ رزروِ جلسه‌ی مشاوره (برایِ سطحِ پرخطر) — این را با لینکِ واقعیِ خودتان جایگزین کنید
const CONSULT_BOOKING_LINK = "https://zarinp.al/your-consult-link";

// ---------- Content ----------
const DOMAINS = [
  {
    key: "emotional",
    title: "فاصله‌ی هیجانی",
    short: "صمیمیت",
    items: [
      { t: "در روزهای شلوغ هم فرصتی برای گفتگوی صمیمانه با همسرم پیدا می‌کنم.", type: "p" },
      { t: "همسرم از نگرانی‌های روزمره‌ی من باخبر است.", type: "p" },
      { t: "حس می‌کنم در سخت‌ترین لحظات، همسرم کنار من است.", type: "p" },
      { t: "به‌راحتی احساسات عمیق خودم را با همسرم در میان می‌گذارم.", type: "p" },
      { t: "در هفته‌های اخیر احساس تنهایی در رابطه داشته‌ام.", type: "r" },
      { t: "ترجیح می‌دهم مشکلاتم را به‌جای همسرم با دیگران در میان بگذارم.", type: "r" },
      { t: "حتی در سکوت هم می‌توانم آرامش کنار همسرم را حس کنم.", type: "p" },
      { t: "احساس می‌کنم برای همسرم در اولویت هستم.", type: "p" },
      { t: "گاهی حس می‌کنم با همسرم غریبه شده‌ام.", type: "r" },
      { t: "زمان باکیفیتی که فقط برای دو نفرمان باشد، در هفته‌های اخیر کم داشته‌ایم.", type: "r" },
    ],
    action: {
      low: [
        "🎯 تمرین: هر روز ۱۰ دقیقه بدون گوشی فقط برای گفتگو با هم بگذارید.",
        "🎯 تمرین: هفته‌ای یک‌بار یک قرارِ کوتاهِ دونفره (حتی ۳۰ دقیقه) بدون موضوعِ کاری/فرزندان بگذارید.",
        "🗣️ گفتگو: قبل از خواب، یک جمله درباره‌ی حسِ امروزتان به هم بگویید.",
        "🗣️ گفتگو: به‌جای «چطور بود روزت؟» بپرسید «امروز چه چیزی بیشتر از همه ذهنت را مشغول کرد؟»",
        "🎯 تمرین: یک دفترچه‌ی مشترک بگذارید و هفته‌ای یک‌بار یک جمله‌ی قدردانی در آن بنویسید.",
        "🌱 تقویت: هر شب حداقل یک لحظه‌ی کوچکِ اتصال (نگاه، لمس، یک جمله‌ی محبت‌آمیز) داشته باشید.",
        "🧑‍⚕️ حرفه‌ای: اگر این فاصله بیش از چند هفته ادامه دارد، یک جلسه با زوج‌درمانگر را در نظر بگیرید.",
      ],
      mid: [
        "🗣️ گفتگو: این هفته یک سؤال عمیق‌تر از حد معمول از هم بپرسید (مثلاً «این روزها بیشترین نگرانی‌ات چیست؟»).",
        "🌱 تقویت: یک خاطره‌ی مشترکِ خوب را با هم مرور کنید.",
        "🎯 تمرین: هر شب حداقل یک «لحظه‌ی اتصال» (نگاه، لمس، یک جمله‌ی محبت‌آمیز) داشته باشید.",
        "🌱 تقویت: یک فعالیتِ تازه (نه روتین) را این ماه با هم تجربه کنید.",
        "🎯 تمرین: به‌جای منتظرِ فرصت‌ماندن، یک زمانِ ثابتِ هفتگی برای گفتگو تعیین کنید.",
      ],
      high: [
        "🌱 تقویت: همین ارتباط را با یک قدردانی کوچکِ روزانه تقویت کنید.",
        "🎯 تمرین: این الگو را آگاهانه در دوره‌های پرمشغله هم حفظ کنید.",
        "🗣️ گفتگو: تجربه‌ی خوبِ خودتان را (در صورتِ تمایل) با یک زوجِ دیگر که به آن نیاز دارد به اشتراک بگذارید.",
      ],
    },
  },
  {
    key: "exposure",
    title: "محرک‌های بیرونی",
    short: "مواجهه",
    items: [
      { t: "در طول هفته با فردی خارج از رابطه گفتگوهای احساسیِ نزدیک دارم.", type: "r" },
      { t: "در شبکه‌های اجتماعی با فردی غیر از همسرم صمیمیت خاصی دارم.", type: "r" },
      { t: "سفرها یا ساعات کاریِ من فرصت‌های زیادی برای معاشرت بدون حضور همسرم می‌سازد.", type: "r" },
      { t: "وقتی با فردی جذاب برخورد می‌کنم، این را با همسرم در میان می‌گذارم.", type: "p" },
      { t: "در جمع دوستان یا همکارانم، بی‌تعهدی و پایبندنبودن به رابطه امری عادی تلقی می‌شود.", type: "r" },
      { t: "در موقعیت‌هایی که ممکن است سوءتفاهم ایجاد کند، آگاهانه فاصله می‌گیرم.", type: "p" },
      { t: "با فردی خاص، تعامل مخفیانه‌ای (پیامکی یا حضوری) دارم که همسرم از آن بی‌خبر است.", type: "r" },
      { t: "پیش از هرگونه نزدیکیِ عاطفی با فرد دیگر، به فکر همسرم می‌افتم و خودم را کنترل می‌کنم.", type: "p" },
      { t: "محیط کار یا تحصیل من، موقعیت‌های وسوسه‌انگیزِ زیادی برایم ایجاد می‌کند.", type: "r" },
      { t: "همسرم را در جریانِ دوستی‌های تازه‌ام قرار می‌دهم.", type: "p" },
    ],
    action: {
      low: [
        "🗣️ گفتگو: درباره‌ی مرزهای مشخص با افراد بیرون از رابطه صریح گفتگو کنید.",
        "🚧 مرزگذاری: توافق کنید کدام نوع تعاملِ آنلاین با دیگران برایتان قابل‌قبول است.",
        "🎯 تمرین: اگر موقعیتِ پرخطری پیش آمد، همان روز آن را با هم در میان بگذارید.",
        "🚧 مرزگذاری: مکالمات یا حساب‌های مشکوک را به‌جای مخفی‌کردن، خودتان پیش‌قدم شوید و نشان دهید.",
        "🚧 مرزگذاری: یک «قرارداد شفافیتِ دیجیتال» ساده بنویسید: چه‌کسانی، چه نوع پیامی، چه ساعتی.",
        "🧑‍⚕️ حرفه‌ای: اگر حسِ کنترل‌ناپذیربودنِ این جذابیت‌ها دارید، کمکِ فردی از یک روان‌شناس بگیرید.",
      ],
      mid: [
        "🗣️ گفتگو: موقعیت‌های پرخطرِ هفته‌ی پیش رو را با هم مرور کنید.",
        "🚧 مرزگذاری: یک «قانونِ ساده» برای موقعیت‌های مبهم تعریف کنید (مثلاً معرفیِ همسر در جمع‌های جدید).",
        "🗣️ گفتگو: اگر سفر یا مأموریتِ کاری در پیش دارید، از قبل با هم درباره‌ی آن گفتگو کنید.",
        "🎯 تمرین: لیستِ کوچکی از «علائمِ هشدار» که برایتان مهم است تهیه کنید و با هم در میان بگذارید.",
      ],
      high: [
        "🌱 تقویت: این شفافیت را حفظ کنید و نقاط قوتتان را به هم یادآوری کنید.",
        "🎯 تمرین: این ارزشِ مشترک را آگاهانه در موقعیت‌های تازه (شغل جدید، سفر) هم حفظ کنید.",
      ],
    },
  },
  {
    key: "conflict",
    title: "الگوی تعارض و دلبستگی",
    short: "تعارض",
    items: [
      { t: "وقتی دعوا می‌کنیم، یکی از ما سکوت می‌کند و دیگری اصرار به حرف‌زدن دارد.", type: "r" },
      { t: "بعد از دعواهایمان، تا مدت‌ها فاصله و کینه بین من و همسرم باقی می‌ماند.", type: "r" },
      { t: "می‌توانیم بعد از تعارض، دوباره با آرامش با هم صحبت کنیم.", type: "p" },
      { t: "نگرانم که همسرم هر لحظه ممکن است از این رابطه بیرون بزند.", type: "r" },
      { t: "ترجیح می‌دهم به‌جای وابستگی، مستقل و بی‌نیاز از همسرم باشم.", type: "r" },
      { t: "در تعارض‌ها احساس می‌کنم واقعاً شنیده می‌شوم.", type: "p" },
      { t: "وقتی همسرم ناراحت است، معمولاً می‌توانم او را آرام کنم.", type: "p" },
      { t: "در دعواها به نقاط ضعف همسرم حمله می‌کنم.", type: "r" },
      { t: "نگرانم که وابستگیِ زیاد به همسرم، من را در برابر او آسیب‌پذیر کند.", type: "r" },
      { t: "بعد از یک تعارض، هردوی ما برای جبران تلاش می‌کنیم.", type: "p" },
    ],
    action: {
      low: [
        "🎯 تمرین: قانون «۲۰ دقیقه فاصله، سپس بازگشت» را در دعوای بعدی امتحان کنید.",
        "🗣️ گفتگو: در دعوا فقط از جمله‌های «من احساس می‌کنم...» استفاده کنید، نه «تو همیشه...».",
        "🎯 تمرین: بعد از هر دعوا، یک زمانِ کوتاه برای «جمع‌بندی و آشتی» بگذارید.",
        "🚧 مرزگذاری: یک کلمه‌ی رمزِ مشترک تعیین کنید که وقتی گفته شد، یعنی «باید مکث کنیم».",
        "🗣️ گفتگو: قبل از قضاوت، یک‌بار دیدگاهِ همسرتان را با صدای بلند برایش بازگو کنید تا مطمئن شوید فهمیده‌اید.",
        "🧑‍⚕️ حرفه‌ای: اگر این الگو تکرارشونده و آسیب‌زا است، حتماً به زوج‌درمانگر مراجعه کنید.",
      ],
      mid: [
        "🗣️ گفتگو: بعد از تعارض بعدی، یک جمله‌ی ترمیمی («با هم هستیم، حتی وسط دعوا») تمرین کنید.",
        "🗣️ گفتگو: قبل از قضاوت، یک‌بار دیدگاهِ همسرتان را با صدای بلند برایش بازگو کنید.",
        "🎯 تمرین: یک زمانِ آرام (نه وسطِ دعوا) برای گفتگو درباره‌ی «الگوی دعواهایمان» بگذارید.",
        "🌱 تقویت: به‌جای حل‌کردنِ فوری، گاهی فقط «شنیده‌شدن» را هدف بگذارید.",
      ],
      high: [
        "🌱 تقویت: توانایی بازگشتِ آرام بعد از تعارض را ارزشمند بدانید و حفظش کنید.",
        "🎯 تمرین: این مهارت را به دیگر حوزه‌های زندگی مشترک (مالی، فرزندپروری) هم تعمیم دهید.",
      ],
    },
  },
  {
    key: "boundaries",
    title: "شفافیت و مرزها",
    short: "شفافیت",
    items: [
      { t: "گوشی و پیام‌های من برای همسرم قابل‌دسترسی و بدون پنهان‌کاری است.", type: "p" },
      { t: "درباره‌ی وضعیت مالی‌مان با هم شفاف هستیم.", type: "p" },
      { t: "مواردی هست که عمداً از همسرم پنهان می‌کنم.", type: "r" },
      { t: "درباره‌ی مرزهای رابطه با جنس مخالف، توافق روشنی با همسرم دارم.", type: "p" },
      { t: "اگر همسرم پیام‌هایم را ببیند، خجالت می‌کشم یا معذب می‌شوم.", type: "r" },
      { t: "دوستی‌های نزدیکِ من را همسرم می‌شناسد.", type: "p" },
      { t: "رمزِ عبور وسایل شخصی‌ام را از همسرم مخفی نگه می‌دارم.", type: "r" },
      { t: "درباره‌ی تعاملم با دوستان قدیمی یا شریک‌های عاطفیِ پیشین، با همسرم شفافم.", type: "p" },
      { t: "اگر همسرم بی‌خبر وارد اتاق شود، دستپاچه می‌شوم.", type: "r" },
      { t: "قوانین مشترکی برای استفاده از شبکه‌های اجتماعی با هم توافق کرده‌ایم.", type: "p" },
    ],
    action: {
      low: [
        "🗣️ گفتگو: یک گفتگوی صریح درباره‌ی «چه چیزی برایمان پنهان‌کاری حساب می‌شود» داشته باشید.",
        "🚧 مرزگذاری: دسترسیِ متقابل به گوشی/پیام‌ها را به‌عنوانِ یک انتخابِ آگاهانه (نه کنترل) با هم تعریف کنید.",
        "🎯 تمرین: اگر چیزی پنهان کرده‌اید که باعثِ نگرانی می‌شود، به‌جای منتظرِ کشف‌شدن، خودتان مطرح کنید.",
        "🚧 مرزگذاری: یک «مرزِ مشترک» برای حساب‌های مالی و رمزهای عبور تعیین کنید.",
        "🚧 مرزگذاری: درباره‌ی دوستی‌های حساس (نه همه‌ی دوستی‌ها)، به‌طور مشخص با هم توافق کنید.",
        "🎯 تمرین: اگر شفافیت برایتان سخت است، ابتدا با یک قدمِ کوچک شروع کنید، نه همه‌چیز یک‌جا.",
      ],
      mid: [
        "🗣️ گفتگو: هفته‌ای یک‌بار درباره‌ی مرزهای رابطه با هم چک‌این کنید.",
        "🗣️ گفتگو: درباره‌ی دوستی‌های جدید، پیش از عمیق‌ترشدن، با هم صحبت کنید.",
        "🚧 مرزگذاری: یک لیستِ کوتاه از «مواردی که ترجیح می‌دهیم بدانیم» تهیه کنید.",
      ],
      high: [
        "🌱 تقویت: این شفافیت متقابل را با یک نشانه‌ی اعتماد، امروز جشن بگیرید.",
        "🌱 تقویت: این الگو می‌تواند سرمشقی برای زوج‌های دیگر اطرافتان هم باشد.",
      ],
    },
  },
  {
    key: "vulnerability",
    title: "سابقه و آسیب‌پذیری زمینه‌ای",
    short: "زمینه",
    items: [
      { t: "در گذشته (این رابطه یا رابطه‌ی قبلی) به تعهدم پایبند نمانده‌ام یا طرفِ مقابلم به تعهدش پایبند نمانده است.", type: "r" },
      { t: "در خانواده‌ی اصلی‌ام سابقه‌ی نقضِ تعهد و بی‌وفاییِ زناشویی وجود داشته است.", type: "r" },
      { t: "سابقه‌ی گرایش شدید به فضای مجازی یا محتوای نامتناسب (مثل محتوای جنسی آنلاین) داشته‌ام.", type: "r" },
      { t: "برای تنظیم هیجانات منفی‌ام به محرک‌های پرخطر (الکل، فضای مجازی، روابط جدید) پناه می‌برم.", type: "r" },
      { t: "به این رابطه و آینده‌ی مشترک‌مان امیدوارم.", type: "p" },
      { t: "وقتی احساس بی‌ارزشی می‌کنم، به تاییدگرفتن از افراد بیرون از رابطه تمایل پیدا می‌کنم.", type: "r" },
      { t: "وقتی احساسات منفی دارم، ترجیح می‌دهم آن‌ها را در خودم نگه دارم تا اینکه به همسرم بگویم.", type: "r" },
      { t: "زندگی مشترک‌مان را نسبت به بیشتر زوج‌های اطرافم موفق‌تر می‌دانم.", type: "p" },
      { t: "تجربه‌ی دوران کودکی‌ام (مثل طلاق والدین یا نقضِ تعهد در خانواده) هنوز روی نگاهم به تعهد اثر دارد.", type: "r" },
      { t: "برای حفظ این رابطه، حاضرم روی خودم کار کنم.", type: "p" },
    ],
    action: {
      low: [
        "🧑‍⚕️ حرفه‌ای: گفت‌وگوی فردی با یک متخصص درباره‌ی این حیطه می‌تواند کمک‌کننده باشد.",
        "🧑‍⚕️ حرفه‌ای: اگر سابقه‌ی نقضِ تعهد در رابطه وجود دارد، فرایندِ ترمیمِ اعتماد را با راهنماییِ یک متخصص پیش ببرید.",
        "🎯 تمرین: الگوهای خانوادگیِ گذشته را شناسایی کنید و آگاهانه تصمیم بگیرید کدام را نمی‌خواهید تکرار کنید.",
        "🚧 مرزگذاری: اگر به محرک‌های پرخطر (الکل، فضای مجازی) پناه می‌برید، یک جایگزینِ سالم (ورزش، گفتگو، مشاوره) پیدا کنید.",
        "🗣️ گفتگو: با همسرتان درباره‌ی «چه چیزی به شما حسِ ارزشمندی می‌دهد» گفتگو کنید.",
      ],
      mid: [
        "🎯 تمرین: برای تنظیم هیجانیِ سالم (ورزش، گفتگو) جایگزینِ محرک‌های پرخطر پیدا کنید.",
        "🗣️ گفتگو: اگر حسِ ناامنی یا نیاز به تاییدِ بیرونی زیاد است، این را با یک متخصص یا با همسرتان مطرح کنید.",
        "🌱 تقویت: یک هدفِ کوچکِ مشترک برای آینده تعیین کنید و رویش کار کنید.",
      ],
      high: [
        "🌱 تقویت: این امیدواری به رابطه را با برنامه‌ریزیِ یک هدف مشترک تقویت کنید.",
        "🗣️ گفتگو: تجربه‌ی مثبتِ خودتان را در صورتِ تمایل با یک زوجِ دیگر به اشتراک بگذارید.",
      ],
    },
  },
  {
    key: "sexual",
    title: "رضایت جنسی",
    short: "جنسی",
    items: [
      { t: "از کیفیتِ رابطه‌ی جنسی‌مان راضی‌ام.", type: "p" },
      { t: "میلِ جنسیِ من و همسرم معمولاً هم‌خوانی دارد.", type: "p" },
      { t: "موضوعِ نیازها و ترجیحاتِ جنسی‌مان را می‌توانیم با هم صادقانه مطرح کنیم.", type: "p" },
      { t: "در رابطه‌ی جنسی‌مان احساسِ کشش یا صمیمیتِ کافی نمی‌کنم.", type: "r" },
      { t: "به دلیلِ کمبودِ رضایتِ جنسی، گاهی افکارم به‌سمتِ گزینه‌های دیگر می‌رود.", type: "r" },
      { t: "خجالت یا شرم مانع از این می‌شود که نیازهای جنسی‌ام را با همسرم در میان بگذارم.", type: "r" },
      { t: "احساسِ جذابیتِ جسمیِ من نسبت به همسرم هنوز قوی است.", type: "p" },
      { t: "با وجودِ باورها یا محدودیت‌های فرهنگی/مذهبیِ خودمان، توانسته‌ایم درباره‌ی رابطه‌ی جنسی‌مان به تفاهمِ مشترک برسیم.", type: "p" },
      { t: "تجربه یا آموزشِ نادرستِ گذشته (پیش از ازدواج) هنوز روی احساسِ من نسبت به رابطه‌ی جنسی اثرِ منفی دارد.", type: "r" },
      { t: "اگر در رابطه‌ی جنسی‌مان مشکلی پیش بیاید، احتمالِ این‌که آن را سرکوب یا کتمان کنم، بیشتر از گفتنش به همسرم است.", type: "r" },
      { t: "یکی از ما معمولاً میلِ جنسیِ بیشتری نسبت به دیگری دارد، و این تفاوت گاهی باعثِ تنش می‌شود.", type: "r" },
    ],
    action: {
      low: [
        "🗣️ گفتگو: گفتگوی صریح و بدون قضاوت درباره‌ی نیازهای جنسی‌تان را با هم شروع کنید.",
        "🧑‍⚕️ حرفه‌ای: در صورت تداومِ این نارضایتی، مشاوره‌ی تخصصیِ زوجی/جنسی می‌تواند کمک‌کننده باشد.",
        "🗣️ گفتگو: به‌جای فرض‌کردنِ نیازِ همسر، مستقیم از او بپرسید.",
        "🎯 تمرین: یک زمانِ آرام (نه بعد از دعوا) برای این گفتگو انتخاب کنید.",
        "🧑‍⚕️ حرفه‌ای: اگر عاملِ جسمی/پزشکی مطرح است، مراجعه به متخصص را در نظر بگیرید.",
        "🚧 مرزگذاری: اگر شرم مانعِ گفتگو می‌شود، ابتدا با یک جمله‌ی کوچک شروع کنید، نه افشایِ کامل یک‌جا.",
        "🧑‍⚕️ حرفه‌ای: اگر باورهای فرهنگی/مذهبی باعثِ سرکوبِ این نیاز شده‌اند، گفتگو با یک مشاورِ آشنا به این حساسیت‌ها می‌تواند کمک کند.",
      ],
      mid: [
        "🗣️ گفتگو: این هفته یک‌بار درباره‌ی آنچه برایتان لذت‌بخش است، با هم گفتگو کنید.",
        "🗣️ گفتگو: به‌جای فرض‌کردنِ نیازِ همسر، مستقیم از او بپرسید.",
        "🚧 مرزگذاری: یک فضای امن (بدون قضاوت) برای ابرازِ نیازها ایجاد کنید.",
        "🎯 تمرین: دفعه‌ی بعد که مشکلی پیش آمد، به‌جایِ کتمان‌کردن، همان لحظه یا کمی بعد مطرحش کنید.",
      ],
      high: [
        "🌱 تقویت: این هم‌خوانی و صمیمیت را قدر بدانید و فضای امن برای بیانِ نیازها را حفظ کنید.",
        "🎯 تمرین: گفتگوی باز درباره‌ی این حیطه را به‌عنوان یک عادتِ سالم ادامه دهید.",
      ],
    },
  },
];

const SD_ITEMS = [
  "من هرگز حتی یک اشتباه کوچک هم در رابطه‌ام نداشته‌ام.",
  "همیشه در تمام لحظات با همسرم کاملاً صادق بوده‌ام، بدون هیچ استثنا.",
  "هیچ‌وقت حتی برای یک لحظه هم به فرد دیگری فکر نکرده‌ام.",
];

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode() {
  let c = "";
  for (let i = 0; i < 6; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}
function shuffle(arr, seed) {
  const a = arr.slice();
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h + 1;
}

function scoreDomain(answers, items) {
  const vals = items.map((it, i) => {
    const v = answers[i] ?? 3;
    return it.type === "r" ? 6 - v : v;
  });
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(((avg - 1) / 4) * 100);
}
function sdAverage(sdAnswers) {
  const vals = Object.values(sdAnswers || {});
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
function level(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}
const LEVEL_LABEL = { high: "متعهد و پایبند", mid: "تعهدِ متوسط", low: "تعهدِ پایین — در معرضِ خطر" };
const LEVEL_COLOR = { high: "#4C7A5E", mid: "#B9822F", low: "#A6432F" };

// ---------- Item-level critical flags (specific high-stakes items, independent of domain average) ----------
const CRITICAL_FLAGS = [
  { domain: "exposure", idx: 6, threshold: 3, label: "تعامل پنهانی که در جریان است", severity: "بالا",
    action: "همین امروز و به‌طور کامل، این ارتباط را برای همسرتان توضیح دهید — نه بخشی از آن. جمله‌ی پیشنهادی: «یه چیزی هست که باید بهت بگم، ترجیح می‌دم خودم بگم تا این‌که بعداً متوجه بشی.» ادامه‌ی پنهان‌کاری، حتی بدونِ نیتِ بد، خطر را چند برابر می‌کند." },
  { domain: "exposure", idx: 0, threshold: 4, label: "صمیمیتِ احساسیِ فعال با فردی بیرون از رابطه", severity: "بالا",
    action: "همین هفته با آن فرد فاصله‌ی مشخص بگذارید (کاهشِ پیام، حذفِ گفتگوهای خصوصی) و موضوع را با همسرتان در میان بگذارید. جمله‌ی پیشنهادی: «متوجه شدم دارم با یه نفر بیرون از رابطه‌مون بیش‌ازحد نزدیک می‌شم و می‌خوام این‌و با تو حل کنم، نه پنهون.»" },
  { domain: "vulnerability", idx: 0, threshold: 4, label: "سابقه‌ی شخصیِ نقضِ تعهد در این رابطه یا رابطه‌ی پیشین", severity: "بالا",
    action: "اگر این در همین رابطه رخ داده و هنوز به‌طور کامل حل نشده، فرایندِ افشا و ترمیمِ اعتماد را با یک زوج‌درمانگر پیش ببرید، نه به‌تنهایی و نه با تلاش برای فراموش‌کردن." },
  { domain: "vulnerability", idx: 1, threshold: 4, label: "سابقه‌ی خانوادگیِ نقضِ تعهد (انتقالِ بین‌نسلی)", severity: "متوسط",
    action: "یک برگه بردارید و بنویسید: «چه رفتاری از خانواده‌ام دیدم که نمی‌خوام تکرار کنم؟» این را با همسرتان هم در میان بگذارید تا آگاهانه از آن الگو فاصله بگیرید." },
  { domain: "vulnerability", idx: 5, threshold: 4, label: "گرایش به کسبِ تاییدِ بیرونی هنگامِ حسِ بی‌ارزشی", severity: "متوسط",
    action: "دفعه‌ی بعد که این حس آمد، به‌جای جست‌وجوی تاییدِ بیرونی، این را مستقیم به همسرتان بگویید: «امشب یه چیزی می‌خوام بشنوم؛ می‌تونی بگی چی درباره‌ام دوست داری؟»" },
  { domain: "boundaries", idx: 2, threshold: 4, label: "پنهان‌کاریِ عمدی و فعال", severity: "بالا",
    action: "همان موردِ پنهان‌شده را مشخص کنید و طیِ همین هفته، بدونِ اتهام به خودتان، مطرحش کنید: «یه چیزی هست که تا حالا نگفته بودم و می‌خوام روشنش کنم.»" },
  { domain: "conflict", idx: 3, threshold: 4, label: "اضطرابِ ترک‌شدن (نشانه‌ی دلبستگیِ اضطرابی)", severity: "متوسط",
    action: "به‌جای پرسیدنِ مکررِ «هنوز دوستم داری؟»، از همسرتان بخواهید یک نشانه‌ی ثابتِ روزانه تعریف کند (مثلاً یک پیامِ کوتاهِ صبحگاهی) که نیازی به پرسیدن نباشد." },
  { domain: "conflict", idx: 4, threshold: 4, label: "اجتناب از وابستگی (نشانه‌ی دلبستگیِ اجتنابی)", severity: "متوسط",
    action: "امروز یک نیازِ کوچک را مستقیم از همسرتان بخواهید (نه انجامش خودتان). جمله‌ی پیشنهادی: «می‌شه کمکم کنی با این موضوع؟» — این تمرینِ کوچکِ وابستگیِ سالم است." },
  { domain: "sexual", idx: 4, threshold: 3, label: "افکارِ معطوف به گزینه‌های دیگر به‌دلیلِ نارضایتیِ جنسی", severity: "بالا",
    action: "این افکار را به‌عنوانِ علامتِ «نیازِ ناگفته»، نه یک رازِ شرم‌آور، ببینید. همین هفته گفتگو را با این جمله شروع کنید: «می‌خوام درباره‌ی نیازهای جنسی‌مون راحت‌تر حرف بزنیم.»" },
  { domain: "emotional", idx: 8, threshold: 4, label: "حسِ غریبگی با همسر", severity: "متوسط",
    action: "امشب یک سؤالِ کاملاً شخصی (نه روزمره) بپرسید که سال‌هاست نپرسیده‌اید، مثلاً: «این روزها چه چیزی بیشتر از همه دلت می‌خواد کسی بفهمه؟»" },
];

function detectCriticalFlags(ans1, ans2) {
  const flags = [];
  CRITICAL_FLAGS.forEach((f) => {
    [{ p: 1, ans: ans1 }, { p: 2, ans: ans2 }].forEach(({ p, ans }) => {
      const v = (ans[f.domain] || {})[f.idx];
      if (v != null && v >= f.threshold) flags.push({ ...f, partner: p, value: v });
    });
  });
  return flags.sort((a, b) => (a.severity === "بالا" ? -1 : 1) - (b.severity === "بالا" ? -1 : 1));
}

// ---------- Named clinical risk patterns (combinations across domains, not single averages) ----------
const RISK_PATTERNS = [
  {
    id: "drift",
    title: "الگویِ فاصله‌گیریِ خزنده",
    domains: ["emotional", "exposure"],
    trigger: (a) => a.emotional < 55 && a.exposure < 60,
    mechanism:
      "افتِ صمیمیتِ روزمره همراه با مواجهه‌ی بالا با گزینه‌های بیرونی، دقیقاً الگوی رایجِ «رانده‌شدنِ تدریجی» است — نه یک تصمیمِ ناگهانی، بلکه فاصله‌ای که آرام‌آرام با چیزِ دیگری پر می‌شود.",
    actions: [
      "امشب بدون گوشی فقط ۱۵ دقیقه بنشینید و بپرسید: «این روزها بیشتر دلت برای چی از رابطه‌مون تنگ شده؟»",
      "لیستی از ۳ کارِ مشترکِ قدیمی که لذت‌بخش بود بنویسید و همین هفته یکی را دوباره تجربه کنید.",
      "مواجهه‌های بیرونیِ پرخطر (پیامِ فردِ خاص، حساب‌های مشکوک) را همین حالا کاهش دهید تا فضای خالی برای پرشدن با یکدیگر باز شود.",
      "یک قرارِ ثابتِ هفتگی (حتی ۳۰ دقیقه) بدون فرزندان/کار بگذارید و آن را مثلِ یک قرارِ کاری جدی بگیرید.",
    ],
  },
  {
    id: "conflict-avoidant",
    title: "الگویِ تعارض‌گریزی",
    domains: ["conflict", "emotional"],
    trigger: (a) => a.conflict < 55 && a.emotional >= 50,
    mechanism:
      "زوج‌هایی که از تعارضِ آشکار پرهیز می‌کنند، نارضایتی را زیرِ سطح نگه می‌دارند. این نوع از سرکوبِ خزنده، یکی از مسیرهای شناخته‌شده به‌سمتِ رابطه‌ی موازی است — دقیقاً چون از بیرون همه‌چیز «آرام» به‌نظر می‌رسد.",
    actions: [
      "این هفته حداقل یک نارضایتیِ کوچک را که معمولاً می‌بلعید، به زبان بیاورید.",
      "گفتگو را با این جمله شروع کنید: «می‌خوام یه چیزی رو بگم که شاید سخت باشه ولی برام مهمه.»",
      "بعد از گفتنِ نارضایتی، فوراً دنبالِ حل‌کردن نباشید؛ فقط بپرسید: «شنیدی چی گفتم؟» و منتظرِ بازگوییِ همسرتان بمانید.",
      "اگر این الگو بیش از چند ماه ادامه دارد، یک جلسه با زوج‌درمانگر برای شکستنِ این چرخه در نظر بگیرید.",
    ],
  },
  {
    id: "compensatory",
    title: "الگویِ جبرانِ نیازِ ناکام‌مانده",
    domains: ["sexual", "exposure"],
    trigger: (a) => a.sexual < 55 && a.exposure < 65,
    mechanism:
      "کمبودِ رضایتِ جنسی در کنارِ مواجهه‌ی بالا با گزینه‌های بیرونی، ریسکِ جبرانِ نیازِ ناکام‌مانده از مسیرِ رابطه‌ی موازی را بالا می‌برد.",
    actions: [
      "بدون تعارف بپرسید: «چیزی هست که دوست داشته باشی در رابطه‌ی جنسی‌مان فرق کند؟»",
      "یک شبِ ثابت در هفته را به این گفتگو یا صمیمیت اختصاص دهید، بدونِ فشار برای نتیجه‌ی فوری.",
      "اگر خودتان به گزینه‌های بیرونی فکر می‌کنید، این را به‌جای پنهان‌کردن، به‌عنوانِ علامتِ نیاز به همسرتان بگویید، نه به‌عنوانِ یک راز.",
      "اگر این کمبود ریشه‌ی جسمی/پزشکی دارد، مراجعه به متخصص را به تعویق نیندازید.",
    ],
  },
  {
    id: "validation-seeking",
    title: "الگویِ تاییدطلبیِ دلبستگی",
    domains: ["vulnerability"],
    trigger: (a) => a.vulnerability < 55,
    mechanism:
      "وقتی حسِ ارزشمندی از داخلِ رابطه تامین نمی‌شود، برخی افراد ناخودآگاه به‌سمتِ تاییدِ بیرونی کشیده می‌شوند. این مسیر معمولاً با قصدِ نقضِ تعهد شروع نمی‌شود، بلکه با یک خلأِ عاطفیِ حل‌نشده.",
    actions: [
      "هر روز یک نقطه‌قوتِ خودتان را — بدون منتظرِ تاییدِ کسی — برای خودتان بنویسید.",
      "از همسرتان بخواهید هفته‌ای یک‌بار، مشخصاً یک نقطه‌قوتِ شما را به زبان بیاورد.",
      "پیش از جست‌وجوی تاییدِ بیرونی، از خودتان بپرسید: «این نیاز را از همسرم خواسته‌ام یا نه؟»",
      "اگر این حسِ بی‌ارزشی ریشه‌دار و مزمن است، کارِ فردی با یک روان‌شناس می‌تواند بسیار موثرتر از هر راهکارِ رابطه‌ای باشد.",
    ],
  },
  {
    id: "boundary-erosion",
    title: "الگویِ فرسایشِ مرزها",
    domains: ["boundaries", "exposure"],
    trigger: (a) => a.boundaries < 55 && a.exposure < 65,
    mechanism:
      "ترکیبِ پنهان‌کاری و مواجهه‌ی بالا، همان مسیرِ کلاسیکِ «دیوارها و پنجره‌ها»ست: مرزها آرام‌آرام فرسوده می‌شوند تا جایی که یک رابطه‌ی نامناسب به‌طور طبیعی شکل می‌گیرد.",
    actions: [
      "همین هفته یک موردِ پنهان‌شده (هرچقدر کوچک) را روشن کنید تا روندِ فرسایش متوقف شود.",
      "دسترسیِ متقابل به گوشی/پیام‌ها را نه به‌عنوانِ بازجویی، بلکه به‌عنوانِ یک انتخابِ داوطلبانه‌ی مشترک پیشنهاد دهید.",
      "یک «قرارداد شفافیتِ دیجیتال» یک‌خطی بنویسید (چه‌کسانی، چه‌نوع پیامی، چه ساعتی) و هردو آن را بپذیرید.",
      "علائمِ هشدارِ خودتان را (مثلاً پاک‌کردنِ پیام‌ها، پنهان‌کردنِ گوشی) شناسایی و با هم نام‌گذاری کنید.",
    ],
  },
];

function detectPatterns(s1, s2) {
  const avg = {};
  DOMAINS.forEach((d) => { avg[d.key] = (s1[d.key] + s2[d.key]) / 2; });
  return RISK_PATTERNS.filter((p) => p.trigger(avg));
}

function allPerceptionGaps(s1, s2) {
  return DOMAINS.map((d) => ({
    domain: d,
    gap: Math.abs(s1[d.key] - s2[d.key]),
    higher: s1[d.key] > s2[d.key] ? 1 : 2,
  })).filter((g) => g.gap >= 15).sort((a, b) => b.gap - a.gap);
}

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const FONT = { fontFamily: "'Vazirmatn', Tahoma, sans-serif" };
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');`;

// ---------- Small UI atoms ----------
function LikertRow({ text, value, onChange }) {
  const opts = [1, 2, 3, 4, 5];
  const labels = ["کاملاً مخالفم", "مخالفم", "نظری ندارم", "موافقم", "کاملاً موافقم"];
  return (
    <div style={{ padding: "18px 0", borderBottom: "1px solid #DCEAF2" }}>
      <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.9, color: "#1F2D3D", fontWeight: 500 }}>{text}</p>
      <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            title={labels[o - 1]}
            style={{
              flex: 1,
              padding: "10px 4px",
              borderRadius: 10,
              border: value === o ? "2px solid #2B6777" : "1px solid #C9DEE8",
              background: value === o ? "#2B6777" : "#FFFFFF",
              color: value === o ? "#FFFFFF" : "#5A7080",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {o}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10.5, color: "#8CA3B0" }}>
        <span>{labels[0]}</span>
        <span>{labels[4]}</span>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "24px 20px", boxShadow: "0 4px 24px rgba(43,103,119,.08)", ...style }}>
      {children}
    </div>
  );
}

// ---------- Clearer radar chart with safety bands ----------
function RadarChart({ p1, p2, domains }) {
  const size = 360;
  const cx = size / 2, cy = size / 2 + 6, maxR = 122;
  const n = domains.length;
  const bands = [
    { from: 0, to: 0.25, color: "#F3D9D3" },
    { from: 0.25, to: 0.5, color: "#F5E7CC" },
    { from: 0.5, to: 0.75, color: "#EDF0CC" },
    { from: 0.75, to: 1, color: "#DDEBDD" },
  ];

  const ringPts = (r) => domains.map((_, j) => polar(cx, cy, maxR * r, (360 / n) * j));
  const ringPath = (r) => ringPts(r).map((p) => `${p.x},${p.y}`).join(" ");

  const pathFor = (scores) => {
    const pts = domains.map((d, i) => {
      const r = (scores[d.key] / 100) * maxR;
      return polar(cx, cy, r, (360 / n) * i);
    });
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  };
  const vertexPts = (scores) => domains.map((d, i) => ({ ...polar(cx, cy, (scores[d.key] / 100) * maxR, (360 / n) * i), val: scores[d.key] }));

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size + 10}`} width="100%" style={{ maxWidth: 400, display: "block", margin: "0 auto" }}>
        {bands.map((b, i) => (
          <polygon key={i} points={ringPath(b.to)} fill={b.color} stroke="none" />
        ))}
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <polygon key={i} points={ringPath(r)} fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
        ))}
        {domains.map((_, i) => {
          const p = polar(cx, cy, maxR, (360 / n) * i);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#FFFFFF" strokeWidth={1.5} />;
        })}

        <path d={pathFor(p1)} fill="#2B6777" fillOpacity={0.22} stroke="#2B6777" strokeWidth={3} />
        <path d={pathFor(p2)} fill="#E8975C" fillOpacity={0.22} stroke="#E8975C" strokeWidth={3} />

        {vertexPts(p1).map((p, i) => (
          <g key={"a" + i}>
            <circle cx={p.x} cy={p.y} r={10} fill="#2B6777" stroke="#fff" strokeWidth={1.5} />
            <text x={p.x} y={p.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="#fff">{p.val}</text>
          </g>
        ))}
        {vertexPts(p2).map((p, i) => (
          <g key={"b" + i}>
            <circle cx={p.x} cy={p.y} r={10} fill="#E8975C" stroke="#fff" strokeWidth={1.5} />
            <text x={p.x} y={p.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="#fff">{p.val}</text>
          </g>
        ))}

        {domains.map((d, i) => {
          const p = polar(cx, cy, maxR + 42, (360 / n) * i);
          const avg = Math.round((p1[d.key] + p2[d.key]) / 2);
          return (
            <g key={d.key}>
              <text x={p.x} y={p.y - 7} textAnchor="middle" dominantBaseline="middle" fontSize="12.5" fontWeight="700" fill="#2F4250">
                {d.short}
              </text>
              <text x={p.x} y={p.y + 9} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fontWeight="600" fill={LEVEL_COLOR[level(avg)]}>
                {avg}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", fontSize: 10.5, color: "#7C8D97", marginTop: 4 }}>
        <span><span style={{ display: "inline-block", width: 9, height: 9, background: "#F3D9D3", borderRadius: 2, marginInlineEnd: 3 }} />تعهدِ پایین</span>
        <span><span style={{ display: "inline-block", width: 9, height: 9, background: "#F5E7CC", borderRadius: 2, marginInlineEnd: 3 }} />تعهدِ متوسط رو‌به‌پایین</span>
        <span><span style={{ display: "inline-block", width: 9, height: 9, background: "#EDF0CC", borderRadius: 2, marginInlineEnd: 3 }} />تعهدِ متوسط رو‌به‌بالا</span>
        <span><span style={{ display: "inline-block", width: 9, height: 9, background: "#DDEBDD", borderRadius: 2, marginInlineEnd: 3 }} />متعهد و پایبند</span>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#8CA3B0", marginTop: 6 }}>
        هرچه نقطه به لبه‌ی بیرونی نزدیک‌تر باشد، تعهد و پایبندی در آن حیطه بیشتر است؛ نزدیکی به مرکز یعنی تعهدِ پایین‌تر و خطرِ بیشتر.
      </p>
    </div>
  );
}

// ---------- Unambiguous bar-chart readout (numbers on a 0-100 ruler) ----------
function DomainBarChart({ p1, p2, domains }) {
  return (
    <div style={{ padding: "4px 2px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "#B7C6CE", padding: "0 0 4px", marginRight: 40 }}>
        <span>۰</span><span>۲۵</span><span>۵۰</span><span>۷۵</span><span>۱۰۰</span>
      </div>
      {domains.map((d) => (
        <div key={d.key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1F2D3D", marginBottom: 5 }}>{d.title}</div>
          {[{ label: "نفر ۱", val: p1[d.key], color: "#2B6777" }, { label: "نفر ۲", val: p2[d.key], color: "#E8975C" }].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, color: row.color, width: 34, flexShrink: 0 }}>{row.label}</span>
              <div style={{ flex: 1, height: 14, background: "#EEF3F6", borderRadius: 7, overflow: "hidden", position: "relative" }}>
                {[25, 50, 75].map((m) => (
                  <div key={m} style={{ position: "absolute", right: `${m}%`, top: 0, bottom: 0, width: 1, background: "#fff" }} />
                ))}
                <div style={{ height: "100%", width: `${row.val}%`, background: row.color, borderRadius: 7 }} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: row.color, width: 24, flexShrink: 0, textAlign: "left" }}>{row.val}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [screen, setScreen] = useState("start");
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [partner, setPartner] = useState(1);
  const [domainIdx, setDomainIdx] = useState(0);
  const [ans1, setAns1] = useState({});
  const [ans2, setAns2] = useState({});
  const [sd1, setSd1] = useState({});
  const [sd2, setSd2] = useState({});
  const [context, setContext] = useState({ duration: "", age: "", children: "" });
  const [consentChecked, setConsentChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saveWarning, setSaveWarning] = useState("");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminRows, setAdminRows] = useState(null);
  const [prevResultInput, setPrevResultInput] = useState("");
  const [prevResultText, setPrevResultText] = useState("");
  const [showPrevInput, setShowPrevInput] = useState(false);
  const [viaJoinLink, setViaJoinLink] = useState(false);
  const [linkCopyStatus, setLinkCopyStatus] = useState("idle");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const joinData = params.get("join");
      if (joinData) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(joinData)))));
        setCode(decoded.c || genCode());
        setAns1(decoded.a1 || {});
        setSd1(decoded.s1 || {});
        setContext(decoded.ctx || { duration: "", age: "", children: "" });
        setPartner(2);
        setDomainIdx(0);
        setViaJoinLink(true);
        setScreen("handoff");
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch (e) {
      console.error("join-link decode failed", e);
    }
  }, []);

  function buildJoinUrl() {
    const base = window.location.origin + window.location.pathname;
    const payload = { c: code, a1: ans1, s1: sd1, ctx: context };
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    return `${base}?join=${encoded}`;
  }

  const isSdPage = domainIdx === DOMAINS.length;
  const domain = isSdPage ? null : DOMAINS[domainIdx];
  const currentAnswers = partner === 1 ? ans1 : ans2;
  const setCurrentAnswers = partner === 1 ? setAns1 : setAns2;
  const currentSd = partner === 1 ? sd1 : sd2;
  const setCurrentSd = partner === 1 ? setSd1 : setSd2;

  const domainAnswers = domain ? currentAnswers[domain.key] || {} : {};
  const domainComplete = domain
    ? domain.items.every((_, i) => domainAnswers[i] != null)
    : SD_ITEMS.every((_, i) => currentSd[i] != null);

  const shuffledIdx = useMemo(() => {
    if (!domain) return SD_ITEMS.map((_, i) => i);
    return shuffle(domain.items.map((_, i) => i), seedFromString(code + domain.key + partner));
  }, [domain, code, partner]);

  async function saveState(patch) {
    const payload = {
      code,
      createdAt: patch.createdAt ?? Date.now(),
      context: patch.context ?? context,
      ans1: patch.ans1 ?? ans1,
      ans2: patch.ans2 ?? ans2,
      sd1: patch.sd1 ?? sd1,
      sd2: patch.sd2 ?? sd2,
      ans1Done: patch.ans1Done ?? false,
      ans2Done: patch.ans2Done ?? false,
    };
    try {
      const r = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) return { ok: false, detail: data.error || `HTTP ${r.status}` };
      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, detail: (e && (e.message || e.toString())) || "خطای شبکه" };
    }
  }

  function startNew() {
    setCode(genCode());
    setAns1({}); setAns2({}); setSd1({}); setSd2({});
    setContext({ duration: "", age: "", children: "" });
    setConsentChecked(false);
    setPartner(1);
    setDomainIdx(0);
    setScreen("consent");
  }

  async function loadByCode() {
    setErr("");
    const c = codeInput.trim().toUpperCase();
    if (!c) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/get?code=${encodeURIComponent(c)}`);
      if (!r.ok) throw new Error("not found");
      const { data } = await r.json();
      setCode(c);
      setAns1(data.ans1 || {}); setAns2(data.ans2 || {});
      setSd1(data.sd1 || {}); setSd2(data.sd2 || {});
      setContext(data.context || { duration: "", age: "", children: "" });
      if (data.ans1Done && data.ans2Done) {
        setScreen("results");
      } else if (data.ans1Done) {
        setPartner(2); setDomainIdx(0); setScreen("handoff");
      } else {
        setPartner(1); setDomainIdx(0); setScreen("quiz");
      }
    } catch (e) {
      setErr("کدی با این مشخصات پیدا نشد. لطفاً کد را بررسی کنید.");
    }
    setBusy(false);
  }

  function answerItem(i, val) {
    if (isSdPage) {
      setCurrentSd((prev) => ({ ...prev, [i]: val }));
    } else {
      setCurrentAnswers((prev) => ({ ...prev, [domain.key]: { ...(prev[domain.key] || {}), [i]: val } }));
    }
  }

  async function nextPage() {
    const lastPage = DOMAINS.length; // sd page index
    if (domainIdx < lastPage) {
      setDomainIdx(domainIdx + 1);
    } else {
      setBusy(true);
      setErr("");
      let res;
      if (partner === 1) {
        res = await saveState({ createdAt: Date.now(), ans1, ans1Done: true, ans2, ans2Done: false, sd1 });
        if (!res.ok) setSaveWarning(`⚠ ذخیره‌سازیِ پس‌زمینه (برایِ پژوهشگر) ناموفق بود؛ اما پاسخ‌های شما همچنان محفوظ است و می‌توانید ادامه دهید. جزئیاتِ فنی: ${res.detail}`);
        setScreen("privateResult");
      } else {
        res = await saveState({ ans1, ans1Done: true, ans2, ans2Done: true, sd1, sd2 });
        if (!res.ok) setSaveWarning(`⚠ ذخیره‌سازیِ پس‌زمینه (برایِ پژوهشگر) ناموفق بود؛ نتیجه‌ی زیر همچنان کاملاً معتبر است. جزئیاتِ فنی: ${res.detail}`);
        setScreen("privateResult");
      }
      setBusy(false);
    }
  }

  const scores = useMemo(() => {
    const s1 = {}, s2 = {};
    DOMAINS.forEach((d) => {
      s1[d.key] = scoreDomain(ans1[d.key] || {}, d.items);
      s2[d.key] = scoreDomain(ans2[d.key] || {}, d.items);
    });
    return { s1, s2 };
  }, [ans1, ans2]);

  async function loadAdmin() {
    setBusy(true);
    try {
      const r = await fetch("/api/list");
      const data = await r.json();
      setAdminRows(data.rows || []);
    } catch (e) {
      setAdminRows([]);
    }
    setBusy(false);
  }

  return (
    <div dir="rtl" style={{ ...FONT, minHeight: "100vh", background: "#EAF4FB", padding: "24px 16px" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid #2B6777; outline-offset: 2px; }
        @media print {
          html, body { height: auto !important; overflow: visible !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {screen === "start" && (
          <Card>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 34, marginBottom: 6 }}>🌿</div>
              <p style={{ fontSize: 11, color: "#8CA3B0", margin: "0 0 4px", fontWeight: 700 }}>{BRAND.academy}</p>
              <h1 style={{ fontSize: 21, color: "#1F2D3D", margin: "0 0 6px", fontWeight: 800 }}>نقشه‌ی رابطه‌یِ ما</h1>
              <p style={{ fontSize: 13.5, color: "#5A7080", lineHeight: 1.9, margin: 0, fontWeight: 600 }}>
                زندگی من چه خواهد شد؟ زیر‌پوست رابطه ما چه می‌گذرد و چه آسیب‌هایی رابطه ما را تهدید می‌کند؟
              </p>
              <p style={{ fontSize: 12.5, color: "#8CA3B0", lineHeight: 1.9, margin: "8px 0 0" }}>
                یک سنجش سریع و مشترک برای شناخت نقاط قوت و آسیب‌پذیریِ رابطه — هرکدام از شما جداگانه پاسخ می‌دهد، سپس نقشه‌ی مشترکتان ساخته می‌شود.
              </p>
            </div>

            <button onClick={startNew} style={{ width: "100%", marginTop: 24, padding: "15px", borderRadius: 14, border: "none", background: "#2B6777", color: "#fff", fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>
              شروع سنجشِ جدید برای یک زوج
            </button>

            <button onClick={() => setShowPrevInput((v) => !v)} className="no-print"
              style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "#5A7080", fontSize: 11.5, cursor: "pointer", textDecoration: "underline" }}>
              {showPrevInput ? "بستن" : "بازآزماییِ دوره‌ای؟ نتیجه‌ی قبلی را برایِ مقایسه بچسبانید (اختیاری)"}
            </button>
            {showPrevInput && (
              <div style={{ marginTop: 8 }}>
                <textarea value={prevResultInput} onChange={(e) => setPrevResultInput(e.target.value)} rows={3}
                  placeholder="متنِ ذخیره‌شده از سنجشِ قبلی (شروع‌شونده با CPL1|...)"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 10.5, fontFamily: "monospace", direction: "ltr", resize: "vertical" }} />
                <button onClick={() => { setPrevResultText(prevResultInput.trim()); setShowPrevInput(false); }}
                  disabled={!prevResultInput.trim()}
                  style={{ width: "100%", marginTop: 6, padding: "9px", borderRadius: 10, border: "none", background: prevResultInput.trim() ? "#2B6777" : "#D6E3EA", color: "#fff", fontWeight: 700, cursor: prevResultInput.trim() ? "pointer" : "not-allowed", fontSize: 12 }}>
                  ثبتِ نتیجه‌ی قبلی برایِ مقایسه
                </button>
                {prevResultText && <p style={{ fontSize: 10.5, color: "#4C7A5E", marginTop: 6 }}>✅ ثبت شد؛ در پایانِ این سنجش، مقایسه نمایش داده می‌شود.</p>}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#DCEAF2" }} />
              <span style={{ fontSize: 12, color: "#8CA3B0" }}>یا</span>
              <div style={{ flex: 1, height: 1, background: "#DCEAF2" }} />
            </div>

            <p style={{ fontSize: 12.5, color: "#5A7080", marginBottom: 8 }}>بازگشت با کدِ قبلی رابطه‌تان:</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="مثلاً: A2K9QZ"
                style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid #C9DEE8", fontSize: 14, textAlign: "center", letterSpacing: 2, ...FONT }} maxLength={6} />
              <button onClick={loadByCode} disabled={busy} style={{ padding: "0 18px", borderRadius: 12, border: "1px solid #2B6777", background: "#fff", color: "#2B6777", fontWeight: 700, cursor: "pointer" }}>
                ورود
              </button>
            </div>
            {err && <p style={{ color: "#A6432F", fontSize: 12.5, marginTop: 8 }}>{err}</p>}
            <p style={{ fontSize: 10.5, color: "#9AAEB9", marginTop: 18, lineHeight: 1.8 }}>
              پاسخ‌ها با یک کدِ اختصاصی ذخیره می‌شود؛ هرکس این کد را داشته باشد می‌تواند نتیجه را ببیند، پس آن را نزد خود نگه دارید.
            </p>
            <button onClick={() => setScreen("adminLogin")} className="no-print" style={{ marginTop: 18, background: "none", border: "none", color: "#B7C6CE", fontSize: 10.5, cursor: "pointer", textDecoration: "underline" }}>
              پنل آموزشی
            </button>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #EEF3F6", textAlign: "center" }}>
              <p style={{ fontSize: 13.5, fontWeight: 800, color: "#1F2D3D", margin: "0 0 4px" }}>{BRAND.name}</p>
              <p style={{ fontSize: 11, color: "#5A7080", margin: "0 0 10px", lineHeight: 1.8 }}>{BRAND.credential}</p>
              <p style={{ fontSize: 12, color: "#2B6777", margin: "0 0 4px", fontWeight: 600 }}>📞 {BRAND.phone}</p>
              <p style={{ fontSize: 12, color: "#2B6777", margin: "0 0 4px", fontWeight: 600 }}>📷 instagram.com/{BRAND.instagram}</p>
              <p style={{ fontSize: 12, color: "#5A7080", margin: 0 }}>📍 {BRAND.city}</p>
            </div>

            <p style={{ fontSize: 9.5, color: "#D3DEE4", marginTop: 14, textAlign: "center" }}>
              نسخه: ۲۰۲۶-۰۷-۱۰ / ارسالِ لینکِ دعوتِ همسر هم از طریقِ پیامک
            </p>
          </Card>
        )}

        {screen === "consent" && (
          <Card>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1F2D3D", margin: "0 0 14px" }}>پیش از شروع</h2>
            <div style={{ fontSize: 13, color: "#4B6070", lineHeight: 2, background: "#F7FAFC", padding: "12px 14px", borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: "0 0 8px" }}>• این پرسشنامه یک <b>غربالگری اولیه</b> است، نه ابزار تشخیصی یا جایگزین مشاوره‌ی تخصصی.</p>
              <p style={{ margin: "0 0 8px" }}>• هر نفر جدا و صادقانه پاسخ می‌دهد؛ دیدن پاسخ‌های همسر توسط طرف مقابل در این مرحله ممکن نیست.</p>
              <p style={{ margin: "0 0 8px" }}>• نتیجه فقط با کدِ اختصاصیِ شما قابل مشاهده است.</p>
              <p style={{ margin: 0 }}>• اگر دیدن نتیجه در لحظه برایتان ناراحت‌کننده بود، طبیعی است — پیشنهاد می‌شود نتیجه را با یک متخصص مرور کنید.</p>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, color: "#5A7080", display: "block", marginBottom: 5 }}>مدت رابطه/ازدواج</label>
              <select value={context.duration} onChange={(e) => setContext({ ...context, duration: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 13, ...FONT }}>
                <option value="">انتخاب کنید</option>
                <option>کمتر از ۱ سال</option><option>۱ تا ۵ سال</option><option>۶ تا ۱۰ سال</option><option>بیش از ۱۰ سال</option>
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, color: "#5A7080", display: "block", marginBottom: 5 }}>بازه‌ی سنی زوج</label>
              <select value={context.age} onChange={(e) => setContext({ ...context, age: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 13, ...FONT }}>
                <option value="">انتخاب کنید</option>
                <option>زیر ۲۵</option><option>۲۵ تا ۳۴</option><option>۳۵ تا ۴۴</option><option>۴۵ به بالا</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, color: "#5A7080", display: "block", marginBottom: 5 }}>فرزند؟</label>
              <select value={context.children} onChange={(e) => setContext({ ...context, children: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 13, ...FONT }}>
                <option value="">انتخاب کنید</option>
                <option>ندارند</option><option>یک فرزند</option><option>دو فرزند یا بیشتر</option>
              </select>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#4B6070", marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} style={{ marginTop: 3 }} />
              <span>موارد بالا را می‌پذیرم و مایل به شروعِ سنجش هستم.</span>
            </label>

            <button onClick={() => setScreen("quiz")} disabled={!consentChecked}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: consentChecked ? "#2B6777" : "#D6E3EA", color: "#fff", fontSize: 15, fontWeight: 700, cursor: consentChecked ? "pointer" : "not-allowed" }}>
              شروعِ پاسخ‌دهیِ نفر اول
            </button>
          </Card>
        )}

        {screen === "quiz" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: partner === 1 ? "#2B6777" : "#E8975C" }}>نفر {partner === 1 ? "اول" : "دوم"}</span>
              <span style={{ fontSize: 11.5, color: "#8CA3B0" }}>بخش {domainIdx + 1} از {DOMAINS.length + 1}</span>
            </div>
            <div style={{ height: 5, background: "#EAF4FB", borderRadius: 4, overflow: "hidden", marginBottom: 18 }}>
              <div style={{ height: "100%", width: `${(domainIdx / (DOMAINS.length + 1)) * 100}%`, background: partner === 1 ? "#2B6777" : "#E8975C", transition: "width .3s" }} />
            </div>

            {!isSdPage ? (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1F2D3D", margin: "0 0 4px" }}>{domain.title}</h2>
                <p style={{ fontSize: 12, color: "#8CA3B0", margin: "0 0 4px" }}>با اولین حسی که دارید پاسخ دهید؛ پاسخ درست یا غلط وجود ندارد.</p>
                {shuffledIdx.map((origI) => (
                  <LikertRow key={origI} text={domain.items[origI].t} value={domainAnswers[origI]} onChange={(v) => answerItem(origI, v)} />
                ))}
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1F2D3D", margin: "0 0 4px" }}>چند گویه‌ی پایانی</h2>
                <p style={{ fontSize: 12, color: "#8CA3B0", margin: "0 0 4px" }}>این چند گویه به ما کمک می‌کند نتیجه را دقیق‌تر تفسیر کنیم.</p>
                {SD_ITEMS.map((t, i) => (
                  <LikertRow key={i} text={t} value={currentSd[i]} onChange={(v) => answerItem(i, v)} />
                ))}
              </>
            )}

            <button onClick={nextPage} disabled={!domainComplete || busy}
              style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 14, border: "none", background: domainComplete ? (partner === 1 ? "#2B6777" : "#E8975C") : "#D6E3EA", color: "#fff", fontSize: 15, fontWeight: 700, cursor: domainComplete ? "pointer" : "not-allowed" }}>
              {busy ? "در حال ثبت…" : domainIdx < DOMAINS.length ? "بخش بعدی" : "پایان و ثبت پاسخ‌ها"}
            </button>
            {err && <p style={{ color: "#A6432F", fontSize: 12, marginTop: 10, lineHeight: 1.8, textAlign: "center" }}>{err}</p>}
          </Card>
        )}

        {screen === "privateResult" && (() => {
          const myAns = partner === 1 ? ans1 : ans2;
          const myScores = {};
          DOMAINS.forEach((d) => { myScores[d.key] = scoreDomain(myAns[d.key] || {}, d.items); });
          const myOverall = Math.round(DOMAINS.reduce((s, d) => s + myScores[d.key], 0) / DOMAINS.length);
          const allFlags = detectCriticalFlags(ans1, ans2);
          const myFlags = allFlags.filter((f) => f.partner === partner);
          const hasHighSeverity = myFlags.some((f) => f.severity === "بالا");

          function goNext() {
            if (partner === 1) { setPartner(2); setDomainIdx(0); setScreen("handoff"); }
            else { setScreen("results"); }
          }

          return (
            <Card>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>🔒</div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1F2D3D", margin: "0 0 6px" }}>نتیجه‌ی شخصیِ شما (نفرِ {partner === 1 ? "اول" : "دوم"})</h2>
                <p style={{ fontSize: 11.5, color: "#8CA3B0", lineHeight: 1.85 }}>
                  این صفحه فقط برایِ خودِ شماست؛ همسرتان این جزئیات را نمی‌بیند. نتیجه‌ی مشترک (بدونِ این جزئیاتِ شخصی) در قدمِ بعد نمایش داده می‌شود.
                </p>
              </div>

              <div style={{ background: "#EAF4FB", borderRadius: 12, padding: "12px", textAlign: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 11.5, color: "#5A7080" }}>امتیازِ کلیِ شخصیِ شما</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: LEVEL_COLOR[level(myOverall)] }}>{myOverall} از ۱۰۰</div>
              </div>

              {DOMAINS.map((d) => (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, width: 70, color: "#4B6070" }}>{d.short}</span>
                  <div style={{ flex: 1, height: 8, background: "#EAF4FB", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${myScores[d.key]}%`, background: LEVEL_COLOR[level(myScores[d.key])] }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#8CA3B0", width: 26 }}>{myScores[d.key]}</span>
                </div>
              ))}

              {myFlags.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#A6432F", marginBottom: 8 }}>نکاتِ ویژه‌ی شما:</p>
                  {myFlags.map((f, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: "#4B6070", marginBottom: 8, background: f.severity === "بالا" ? "#FBEAE7" : "#F7FAFC", borderRadius: 10, padding: "9px 11px" }}>
                      <div style={{ fontWeight: 700, color: "#1F2D3D", marginBottom: 4 }}>🔺 {f.label}</div>
                      <p style={{ margin: 0, lineHeight: 1.85, color: "#2B6777" }}>➜ {f.action}</p>
                    </div>
                  ))}
                  {hasHighSeverity && (
                    <p style={{ fontSize: 12, color: "#A6432F", lineHeight: 1.9, background: "#FBEAE7", borderRadius: 10, padding: "10px 12px", fontWeight: 600 }}>
                      ⚠ پیشنهاد می‌شود پیش از دیدنِ نتیجه‌ی مشترک با همسرتان، این موارد را با یک متخصص در میان بگذارید.
                    </p>
                  )}
                </div>
              )}

              {partner === 1 && (
                <div style={{ marginTop: 20, background: "#F7FAFC", borderRadius: 12, padding: "14px" }}>
                  <p style={{ fontSize: 12.5, color: "#4B6070", lineHeight: 1.9, marginBottom: 10, fontWeight: 700 }}>
                    📤 یا به‌جایِ دادنِ همین گوشی، لینک را برایِ همسرتان با پیامک بفرستید تا با گوشیِ خودش ادامه دهد:
                  </p>
                  <a href={`sms:${/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ? "&" : "?"}body=${encodeURIComponent(buildJoinUrl())}`}
                    style={{ display: "block", width: "100%", padding: "12px", borderRadius: 10, background: "#2B6777", color: "#fff", fontWeight: 700, textAlign: "center", textDecoration: "none", fontSize: 13, marginBottom: 8 }}>
                    💬 ارسالِ لینک با پیامک برایِ همسر
                  </a>
                  <p style={{ fontSize: 10, color: "#9AAEB9", marginBottom: 10 }}>
                    برنامه‌ی پیامک باز می‌شود؛ فقط شماره‌ی همسرتان را انتخاب و «ارسال» را بزنید.
                  </p>
                  <textarea readOnly value={buildJoinUrl()} rows={2} onFocus={(e) => e.target.select()}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 10, fontFamily: "monospace", direction: "ltr", resize: "vertical", background: "#fff" }} />
                  <button onClick={async () => {
                    try { await navigator.clipboard.writeText(buildJoinUrl()); setLinkCopyStatus("copied"); } catch (e) { setLinkCopyStatus("failed"); }
                  }} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, border: "1px solid #2B6777", background: "#fff", color: "#2B6777", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>
                    {linkCopyStatus === "copied" ? "✅ کپی شد! برایِ همسرتان بفرستید" : linkCopyStatus === "failed" ? "❌ کپیِ خودکار کار نکرد — از باکسِ بالا با انگشت انتخاب کنید" : "📋 اگر پیامک باز نشد: کپیِ لینک"}
                  </button>
                  <p style={{ fontSize: 10, color: "#9AAEB9", marginTop: 8, lineHeight: 1.7 }}>
                    وقتی همسرتان این لینک را باز کند، پاسخ‌های شما از قبل بارگذاری شده و او فقط پاسخ‌های خودش را کامل می‌کند؛ در پایان، هر دویِ شما نقشه‌ی مشترک را (روی گوشیِ او) می‌بینید.
                  </p>
                </div>
              )}

              <button onClick={goNext} style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 14, border: "none", background: partner === 1 ? "#2B6777" : "#E8975C", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {partner === 1 ? "یا: ادامه با همینِ گوشی (دادنِ دستگاه به همسر)" : "متوجه شدم — دیدنِ نتیجه‌ی مشترک"}
              </button>
            </Card>
          );
        })()}

        {screen === "handoff" && (
          <Card style={{ textAlign: "center", padding: "36px 24px" }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🤝</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1F2D3D", margin: "0 0 10px" }}>نوبت نفر دوم است</h2>
            <p style={{ fontSize: 13.5, color: "#5A7080", lineHeight: 1.9, marginBottom: 18 }}>
              {viaJoinLink
                ? "همسرتان شما را برای تکمیلِ این ارزیابی دعوت کرده. پاسخِ نفرِ اول قبلاً ثبت شده و بعد از تکمیلِ پاسخ‌هایِ شما، نقشه‌ی مشترک نمایش داده می‌شود."
                : "لطفاً دستگاه را به همسرتان بدهید. پاسخ‌های نفر اول ذخیره شد و بعد از تکمیل پاسخ‌های نفر دوم، نقشه‌ی مشترک نمایش داده می‌شود."}
            </p>
            <div style={{ background: "#EAF4FB", borderRadius: 12, padding: "12px", marginBottom: 16 }}>
              <span style={{ fontSize: 11.5, color: "#5A7080" }}>کدِ رابطه‌ی شما</span>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: "#2B6777" }}>{code}</div>
            </div>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#4B6070", marginBottom: 16, textAlign: "right", cursor: "pointer" }}>
              <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} style={{ marginTop: 3 }} />
              <span>نفر دوم: تأیید می‌کنم که مستقل و صادقانه پاسخ می‌دهم و پاسخ‌های نفر اول را ندیده‌ام.</span>
            </label>
            <button onClick={() => setScreen("quiz")} disabled={!consentChecked}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: consentChecked ? "#E8975C" : "#EADFD3", color: "#fff", fontSize: 15, fontWeight: 700, cursor: consentChecked ? "pointer" : "not-allowed" }}>
              شروع پاسخ‌دهیِ نفر دوم
            </button>
          </Card>
        )}

        {screen === "results" && (
          <ResultsView code={code} scores={scores} context={context} sd1={sd1} sd2={sd2} ans1={ans1} ans2={ans2} saveWarning={saveWarning} onGoAdmin={() => setScreen("adminLogin")} prevResultText={prevResultText} />
        )}

        {screen === "adminLogin" && (
          <Card>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1F2D3D", margin: "0 0 14px" }}>ورود به پنل آموزشی</h2>
            <input type="password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} placeholder="رمز عبور"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #C9DEE8", fontSize: 14, marginBottom: 12, ...FONT }} />
            <button onClick={async () => { if (adminPassInput === ADMIN_PASS) { await loadAdmin(); setScreen("admin"); } else setErr("رمز نادرست است."); }}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#2B6777", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              ورود
            </button>
            {err && <p style={{ color: "#A6432F", fontSize: 12.5, marginTop: 8 }}>{err}</p>}
            <button onClick={() => { setErr(""); setScreen("start"); }} style={{ marginTop: 14, background: "none", border: "none", color: "#8CA3B0", fontSize: 12, cursor: "pointer" }}>بازگشت</button>
          </Card>
        )}

        {screen === "admin" && (
          <AdminDashboard rows={adminRows} busy={busy} onRefresh={loadAdmin} onBack={() => setScreen("start")} />
        )}
      </div>
    </div>
  );
}

function compositeRiskBand(s1, s2) {
  const domainAvgs = DOMAINS.map((d) => (s1[d.key] + s2[d.key]) / 2);
  const overall = domainAvgs.reduce((a, b) => a + b, 0) / domainAvgs.length;
  const worst = Math.min(...domainAvgs);
  const maxGap = Math.max(...DOMAINS.map((d) => Math.abs(s1[d.key] - s2[d.key])));

  // simple, transparent heuristic: weighted toward the weakest domain and
  // the largest perceptual gap, not just the flat average — a relationship
  // can look fine "on average" while one collapsed domain drives real risk.
  const compositeSafety = Math.round(overall * 0.5 + worst * 0.35 + (100 - maxGap) * 0.15);

  if (compositeSafety >= 75) return { band: "کم", color: "#4C7A5E", score: compositeSafety };
  if (compositeSafety >= 50) return { band: "متوسط", color: "#B9822F", score: compositeSafety };
  return { band: "بالا", color: "#A6432F", score: compositeSafety };
}

function ResultsView({ code, scores, context, sd1, sd2, ans1, ans2, saveWarning, onGoAdmin, prevResultText }) {
  const { s1, s2 } = scores;
  const overall = Math.round(DOMAINS.reduce((s, d) => s + s1[d.key] + s2[d.key], 0) / (DOMAINS.length * 2));
  const sdAvg1 = sdAverage(sd1), sdAvg2 = sdAverage(sd2);
  const idealized1 = sdAvg1 >= 4.3, idealized2 = sdAvg2 >= 4.3;
  const [copyStatus, setCopyStatus] = useState("idle");

  function rawDataText() {
    // فرمتِ فوق‌فشرده: هر گویه فقط یک رقم (۰ تا ۵، ۰=بدون‌پاسخ)
    // ترتیبِ ثابت: برایِ هر حیطه به‌ترتیبِ DOMAINS، ابتدا نفرِ اول سپس نفرِ دوم
    let digits = "";
    DOMAINS.forEach((d) => {
      d.items.forEach((_, i) => { digits += String((ans1[d.key] || {})[i] ?? 0); });
    });
    DOMAINS.forEach((d) => {
      d.items.forEach((_, i) => { digits += String((ans2[d.key] || {})[i] ?? 0); });
    });
    return `CPL1|${code}|${digits}`;
  }

  function smsLink() {
    const number = "+989015091346";
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const sep = isIOS ? "&" : "?";
    return `sms:${number}${sep}body=${encodeURIComponent(rawDataText())}`;
  }

  return (
    <div id="print-area">
      {saveWarning && (
        <Card style={{ marginBottom: 10, background: "#FBF3E7", border: "1px solid #F0DDBB" }}>
          <p style={{ fontSize: 12.5, color: "#7A5B2E", lineHeight: 1.9, margin: "0 0 12px", fontWeight: 700 }}>
            📌 نتیجه‌ی این زوج را برایِ دفتر بفرستید:
          </p>
          <a href={smsLink()} className="no-print"
            style={{ display: "block", width: "100%", padding: "13px", borderRadius: 12, background: "#2B6777", color: "#fff", fontWeight: 700, textAlign: "center", textDecoration: "none", fontSize: 13.5, marginBottom: 8 }}>
            💬 ارسالِ خودکار با پیامک به دفتر
          </a>
          <p style={{ fontSize: 10.5, color: "#9AAEB9", marginBottom: 10, textAlign: "center" }}>
            با زدنِ این دکمه، برنامه‌ی پیامکِ گوشی‌تان با شماره و متنِ آماده باز می‌شود؛ فقط دکمه‌ی «ارسال» را بزنید.
          </p>
          <button onClick={async () => {
            try { await navigator.clipboard.writeText(rawDataText()); setCopyStatus("copied"); } catch (e) { setCopyStatus("failed"); }
          }} className="no-print"
            style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1px solid #2B6777", background: "#fff", color: "#2B6777", fontWeight: 700, cursor: "pointer", fontSize: 12.5, marginBottom: 8 }}>
            {copyStatus === "copied" ? "✅ کپی شد! حالا در پیامک/واتساپ بچسبانید و بفرستید" : copyStatus === "failed" ? "❌ کپی نشد — از باکسِ زیر با انگشت انتخاب کنید" : "📋 اگر پیامکِ خودکار باز نشد: کپیِ نتیجه"}
          </button>
          {copyStatus === "failed" && (
            <>
              <textarea readOnly value={rawDataText()} rows={4} onFocus={(e) => e.target.select()}
                className="no-print"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #2B6777", fontSize: 11, fontFamily: "monospace", direction: "ltr", resize: "vertical", background: "#fff" }} />
              <p style={{ fontSize: 11, color: "#5A7080", marginTop: 10, lineHeight: 1.9 }}>
                <b>راهنما:</b> انگشت را رویِ متنِ بالا نگه دارید تا گزینه‌ی «Select All / انتخابِ همه» ظاهر شود ← «Copy / کپی» را بزنید.
              </p>
            </>
          )}
        </Card>
      )}
      <Card>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <p style={{ fontSize: 10.5, color: "#8CA3B0", margin: "0 0 2px", fontWeight: 700 }}>{BRAND.academy}</p>
          <p style={{ fontSize: 11.5, color: "#8CA3B0", margin: 0 }}>کدِ رابطه: <b style={{ color: "#2B6777" }}>{code}</b></p>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1F2D3D", margin: "6px 0" }}>نقشه‌ی مشترک شما</h2>
          <p style={{ fontSize: 12.5, color: "#5A7080" }}>امتیاز کلی تعهد و پایبندیِ رابطه: <b style={{ color: LEVEL_COLOR[level(overall)] }}>{overall} از ۱۰۰</b></p>
          {(context.duration || context.age || context.children) && (
            <p style={{ fontSize: 11, color: "#9AAEB9", margin: "2px 0 0" }}>
              {[context.duration, context.age, context.children].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {(() => {
          const withAvgOv = DOMAINS.map((d) => ({ d, avg: Math.round((s1[d.key] + s2[d.key]) / 2) }));
          const weakestOv = [...withAvgOv].sort((a, b) => a.avg - b.avg)[0];
          const anyHighFlagOv = detectCriticalFlags(ans1 || {}, ans2 || {}).some((f) => f.severity === "بالا");
          const patternCountOv = detectPatterns(s1, s2).length;

          let severity, sevColor, treatability;
          if (anyHighFlagOv || overall < 40) {
            severity = "بحرانی"; sevColor = "#A6432F";
            treatability = "نیازمندِ پیگیریِ فوریِ حرفه‌ای — تاخیر، ریسک را افزایش می‌دهد.";
          } else if (patternCountOv > 0 || overall < 60) {
            severity = "قابلِ توجه"; sevColor = "#B9822F";
            treatability = "قابلِ بهبود با اقدامِ به‌موقع و آگاهانه.";
          } else if (overall < 75) {
            severity = "خفیف"; sevColor = "#B9822F";
            treatability = "قابلِ بهبود با اقدامِ به‌موقع و آگاهانه.";
          } else {
            severity = "در حدِ طبیعی"; sevColor = "#4C7A5E";
            treatability = "وضعیتِ پایدار؛ حفظِ روندِ فعلی کافی است.";
          }

          return (
            <div style={{ background: "#F7FAFC", borderRadius: 14, padding: "16px", marginBottom: 18 }}>
              <p style={{ fontSize: 12.5, fontWeight: 800, color: "#1F2D3D", textAlign: "center", margin: "0 0 12px" }}>📋 نمای کلی</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: LEVEL_COLOR[level(overall)] }}>{overall}٪</div>
                  <div style={{ fontSize: 10.5, color: "#8CA3B0" }}>درصدِ وضعیتِ کلی</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2B6777" }}>{weakestOv.d.short}</div>
                  <div style={{ fontSize: 10.5, color: "#8CA3B0" }}>بیشترین مشکل در این ناحیه</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: sevColor }}>{severity}</div>
                  <div style={{ fontSize: 10.5, color: "#8CA3B0" }}>شدتِ وضعیت</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2B6777", lineHeight: 1.5 }}>{treatability}</div>
                  <div style={{ fontSize: 10.5, color: "#8CA3B0", marginTop: 4 }}>چشم‌اندازِ بهبود</div>
                </div>
              </div>
              <p style={{ fontSize: 10, color: "#9AAEB9", lineHeight: 1.8, marginTop: 12, textAlign: "center" }}>
                برایِ مرجع: زوج‌درمانیِ استاندارد معمولاً بینِ ۸ تا ۲۰ جلسه طول می‌کشد (آمارِ کلیِ حرفه‌ای، نه پیش‌بینیِ اختصاصیِ این آزمون برایِ رابطه‌ی شما).
              </p>
            </div>
          );
        })()}

        {prevResultText && (() => {
          let prev;
          try {
            prev = parseCoupleRaw(prevResultText);
          } catch (e) {
            return (
              <div style={{ background: "#FBEAE7", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#A6432F" }}>
                متنِ نتیجه‌ی قبلی خوانده نشد؛ لطفاً از صحتِ آن مطمئن شوید.
              </div>
            );
          }
          const prevS1 = {}, prevS2 = {};
          DOMAINS.forEach((d) => {
            prevS1[d.key] = scoreDomain(prev.ans1[d.key] || {}, d.items);
            prevS2[d.key] = scoreDomain(prev.ans2[d.key] || {}, d.items);
          });
          const prevOverall = Math.round(DOMAINS.reduce((s, d) => s + prevS1[d.key] + prevS2[d.key], 0) / (DOMAINS.length * 2));
          const deltaOverall = overall - prevOverall;
          return (
            <div style={{ marginBottom: 18, background: "#EAF4FB", borderRadius: 12, padding: "14px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1F2D3D", margin: "0 0 8px" }}>📊 مقایسه با سنجشِ قبلی</p>
              <p style={{ fontSize: 12.5, color: "#4B6070", marginBottom: 10 }}>
                امتیازِ کلی: از <b>{prevOverall}</b> به <b>{overall}</b>{" "}
                <span style={{ color: deltaOverall > 0 ? "#4C7A5E" : deltaOverall < 0 ? "#A6432F" : "#8CA3B0", fontWeight: 700 }}>
                  ({deltaOverall > 0 ? "+" : ""}{deltaOverall})
                </span>
              </p>
              {DOMAINS.map((d) => {
                const oldAvg = Math.round((prevS1[d.key] + prevS2[d.key]) / 2);
                const newAvg = Math.round((s1[d.key] + s2[d.key]) / 2);
                const delta = newAvg - oldAvg;
                return (
                  <div key={d.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#4B6070", marginBottom: 4 }}>
                    <span>{d.short}</span>
                    <span>{oldAvg} ← {newAvg} <b style={{ color: delta > 0 ? "#4C7A5E" : delta < 0 ? "#A6432F" : "#8CA3B0" }}>({delta > 0 ? "+" : ""}{delta})</b></span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {(() => {
          const withAvg = DOMAINS.map((d) => ({ d, avg: Math.round((s1[d.key] + s2[d.key]) / 2) }));
          const strong = withAvg.filter((x) => x.avg >= 75).map((x) => x.d.title);
          const weak = withAvg.filter((x) => x.avg < 50).map((x) => x.d.title);
          return (
            <p style={{ fontSize: 12.5, color: "#3A4D5C", lineHeight: 2, background: "#F7FAFC", borderRadius: 12, padding: "12px 14px", margin: "4px 0 16px" }}>
              📍 به زبانِ ساده: امتیازِ کلیِ تعهد و پایبندیِ شما <b>{overall} از ۱۰۰</b> است.{" "}
              {strong.length > 0 && <>در حیطه‌ی {strong.map((t) => `«${t}»`).join(" و ")} وضعیتِ خوبی دارید. </>}
              {weak.length > 0 ? (
                <>بیشترین نیاز به توجه در حیطه‌ی {weak.map((t) => `«${t}»`).join(" و ")} است.</>
              ) : (
                <>هیچ حیطه‌ای در وضعیتِ بحرانی نیست، اما همیشه جای رشد وجود دارد.</>
              )}
            </p>
          );
        })()}

        <RadarChart p1={s1} p2={s2} domains={DOMAINS} />

        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 12, color: "#2B6777", fontWeight: 700, cursor: "pointer", textAlign: "center", listStyle: "none" }}>
            📊 نمایشِ دقیقِ عددی روی خط‌کش (برای خوانشِ بدونِ ابهام)
          </summary>
          <div style={{ marginTop: 10 }}>
            <DomainBarChart p1={s1} p2={s2} domains={DOMAINS} />
          </div>
        </details>

        <div style={{ display: "flex", justifyContent: "center", gap: 20, margin: "10px 0 18px", fontSize: 12.5 }}>
          <span style={{ color: "#2B6777", fontWeight: 700 }}>● نفر اول</span>
          <span style={{ color: "#E8975C", fontWeight: 700 }}>● نفر دوم</span>
        </div>

        {(() => {
          const risk = compositeRiskBand(s1, s2);
          return (
            <div style={{ border: `1.5px solid ${risk.color}55`, background: `${risk.color}14`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: risk.color }}>سطحِ خطرِ ترکیبی: {risk.band}</span>
                <span style={{ fontSize: 11.5, color: "#8CA3B0" }}>شاخص: {risk.score}/۱۰۰</span>
              </div>
              <p style={{ fontSize: 10.5, color: "#7C8D97", lineHeight: 1.8, margin: "6px 0 0" }}>
                این یک دسته‌بندیِ راهنما بر پایه‌ی ضعیف‌ترین حیطه و بزرگ‌ترین شکافِ ادراکی است، نه یک احتمالِ آماریِ اعتباریابی‌شده. تفسیرِ دقیق‌تر نیازمندِ ارزیابیِ تخصصی است.
              </p>
            </div>
          );
        })()}

        {(idealized1 || idealized2) && (
          <div style={{ background: "#FBF3E7", border: "1px solid #F0DDBB", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 12, lineHeight: 1.8, color: "#7A5B2E" }}>
            ⚠ پاسخ‌های {idealized1 && idealized2 ? "هر دو نفر" : idealized1 ? "نفر اول" : "نفر دوم"} در برخی گویه‌های کنترلی بیش‌ازحد ایده‌آل‌گرایانه بود؛ نتیجه را با احتیاطِ بیشتری تفسیر کنید.
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1F2D3D", margin: "0 0 10px" }}>🔎 تحلیلِ عمیق‌ترِ الگو و ریسک</h3>

          {(() => {
            const patterns = detectPatterns(s1, s2);
            if (patterns.length === 0) return null;
            return (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#A6432F", margin: "0 0 8px" }}>الگوهای شناسایی‌شده (بر پایه‌ی ترکیبِ چند حیطه، نه یک حیطه‌ی تنها):</p>
                {patterns.map((p) => {
                  const scoreStr = p.domains
                    .map((dk) => {
                      const dom = DOMAINS.find((x) => x.key === dk);
                      const a = Math.round((s1[dk] + s2[dk]) / 2);
                      return `${dom.short}=${a}`;
                    })
                    .join("، ");
                  return (
                    <div key={p.id} style={{ background: "#FBF3E7", border: "1px solid #F0DDBB", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#7A5B2E", marginBottom: 4 }}>⚠ {p.title}</div>
                      <p style={{ fontSize: 10.5, color: "#8C6D3F", margin: "0 0 6px", fontFamily: "monospace", direction: "ltr", textAlign: "right" }}>نمره‌هایِ شما: {scoreStr}</p>
                      <p style={{ fontSize: 11.5, color: "#5A4B33", lineHeight: 1.85, margin: "0 0 8px" }}>{p.mechanism}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#2B6777", margin: "0 0 5px" }}>راهکارهایِ فوری:</p>
                      {p.actions.map((a, i) => (
                        <div key={i} style={{ fontSize: 11.5, color: "#2B6777", lineHeight: 1.85, marginBottom: 3 }}>➜ {a}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {(() => {
            const gaps = allPerceptionGaps(s1, s2);
            if (gaps.length === 0) return null;
            return (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1F2D3D", margin: "0 0 8px" }}>شکاف‌های ادراکیِ قابل‌توجه ({gaps.length} حیطه):</p>
                {gaps.map((g) => (
                  <div key={g.domain.key} style={{ fontSize: 11.5, color: "#4B6070", lineHeight: 1.9, marginBottom: 6, background: "#F7FAFC", borderRadius: 8, padding: "8px 10px" }}>
                    <b>«{g.domain.title}»</b> — شکافِ {g.gap} امتیازی. نفرِ {g.higher} این حیطه را بهتر از آنچه نفرِ {g.higher === 1 ? 2 : 1} حس می‌کند، می‌بیند — یعنی نفرِ {g.higher === 1 ? 2 : 1} در این حیطه حسِ امنیتِ کمتری دارد، حتی اگر نفرِ دیگر متوجهِ این تفاوت نباشد.
                  </div>
                ))}
              </div>
            );
          })()}

          {(() => {
            const flags = detectCriticalFlags(ans1 || {}, ans2 || {});
            if (flags.length === 0) return null;
            const seen = new Set();
            const deduped = flags.filter((f) => {
              const k = f.domain + f.idx;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
            return (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1F2D3D", margin: "0 0 8px" }}>حیطه‌هایِ نیازمندِ توجهِ فوری (مستقلِ از میانگینِ کلی):</p>
                {deduped.map((f, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: "#4B6070", marginBottom: 8, background: f.severity === "بالا" ? "#FBEAE7" : "#F7FAFC", borderRadius: 10, padding: "9px 11px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#1F2D3D" }}>🔺 {f.label}</span>
                      <span style={{ fontWeight: 700, color: f.severity === "بالا" ? "#A6432F" : "#B9822F", fontSize: 10.5, flexShrink: 0, marginRight: 8 }}>{f.severity}</span>
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 10, color: "#9AAEB9", marginTop: 6, lineHeight: 1.7 }}>
                  این موارد به‌دلیلِ اهمیتِ بالینیِ خودشان جدا پرچم‌گذاری شده‌اند و مستقل از این‌که کدامتان مطرح کرده، پیشنهاد می‌شود با یک متخصص در میان گذاشته شوند. جزئیاتِ دقیق‌تر و شخصی‌شده در صفحه‌ی نتیجه‌ی خصوصیِ هرکدام از شما (که قبل از این صفحه دیدید) موجود بود.
                </p>
              </div>
            );
          })()}
        </div>

        {(() => {
          const anyHighFlag = detectCriticalFlags(ans1 || {}, ans2 || {}).some((f) => f.severity === "بالا");
          const patternCount = detectPatterns(s1, s2).length;
          let tier, tierColor, tierText, actionLink, actionLabel;
          if (anyHighFlag || overall < 45) {
            tier = "نیازمندِ پیگیریِ حرفه‌ای";
            tierColor = "#A6432F";
            tierText = `بر اساسِ نتیجه‌ی شما، پیشنهاد می‌شود در اسرع‌وقت یک جلسه‌ی مشاوره با ${BRAND.name} یا یک متخصصِ زوج‌درمانی داشته باشید — تماس: ${BRAND.phone}`;
            actionLink = CONSULT_BOOKING_LINK;
            actionLabel = "📅 رزروِ جلسه‌ی مشاوره";
          } else if (patternCount > 0 || overall < 65) {
            tier = "پیشنهادِ آموزشِ تکمیلی";
            tierColor = "#B9822F";
            tierText = `نتیجه‌ی شما نشان می‌دهد شرکت در وبینارها/کارگاه‌های آموزشیِ ${BRAND.academy} می‌تواند کمک‌کننده باشد — برای اطلاع از برنامه‌ها، اینستاگرام instagram.com/${BRAND.instagram} را دنبال کنید.`;
            actionLink = WEBINAR_PACKAGE_LINK;
            actionLabel = "🎓 خریدِ بسته‌ی آموزشی/وبینار";
          } else {
            tier = "روندِ خوب — ادامه دهید";
            tierColor = "#4C7A5E";
            tierText = "وضعیتِ کلیِ رابطه‌ی شما مطلوب است؛ توصیه می‌شود همین روند را حفظ کنید و سنجشِ مجدد را در ۳ ماهِ دیگر تکرار کنید.";
            actionLink = null;
          }
          return (
            <div style={{ background: "#FFFFFF", border: `2px solid ${tierColor}`, borderRadius: 12, padding: "14px", marginBottom: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: tierColor, margin: "0 0 6px" }}>🧭 مسیرِ پیشنهادی: {tier}</p>
              <p style={{ fontSize: 12, color: "#4B6070", lineHeight: 1.9, margin: actionLink ? "0 0 12px" : 0 }}>{tierText}</p>
              {actionLink && (
                <a href={actionLink} target="_blank" rel="noopener noreferrer" className="no-print"
                  style={{ display: "block", width: "100%", padding: "11px", borderRadius: 10, background: tierColor, color: "#fff", fontWeight: 700, textAlign: "center", textDecoration: "none", fontSize: 13 }}>
                  {actionLabel}
                </a>
              )}
            </div>
          );
        })()}

        {(() => {
          const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
          const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
          const startStr = `${fmt(threeMonthsLater)}`;
          const endDate = new Date(threeMonthsLater.getTime() + 24 * 60 * 60 * 1000);
          const endStr = `${fmt(endDate)}`;
          const calText = encodeURIComponent("بازآزماییِ نقشه‌ی رابطه");
          const calDetails = encodeURIComponent(`سنجشِ مجددِ رابطه با کدِ قبلی: ${code}\nمتنِ ذخیره‌ی نتیجه‌ی این دوره را برایِ مقایسه نگه دارید.`);
          const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calText}&dates=${startStr}/${endStr}&details=${calDetails}`;
          return (
            <div style={{ background: "#F7FAFC", borderRadius: 12, padding: "14px", marginBottom: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1F2D3D", margin: "0 0 8px" }}>🔁 بازآزماییِ سه‌ماهه</p>
              <p style={{ fontSize: 11.5, color: "#5A7080", lineHeight: 1.9, marginBottom: 10 }}>
                برای دیدنِ پیشرفتِ رابطه، توصیه می‌شود ۳ ماهِ دیگر دوباره همین سنجش را پر کنید. متنِ زیر را (که همان کدِ خامِ نتیجه‌ی این دوره است) ذخیره کنید و آن زمان، در صفحه‌ی شروع، بخشِ «مقایسه با نتیجه‌ی قبلی» جای‌گذاری کنید:
              </p>
              <textarea readOnly value={rawDataText()} rows={3} onFocus={(e) => e.target.select()}
                className="no-print"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 10, fontFamily: "monospace", direction: "ltr", resize: "vertical", background: "#fff", marginBottom: 8 }} />
              <a href={calUrl} target="_blank" rel="noopener noreferrer" className="no-print"
                style={{ display: "block", width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #2B6777", background: "#fff", color: "#2B6777", fontWeight: 700, textAlign: "center", textDecoration: "none", fontSize: 12.5 }}>
                📅 افزودنِ یادآوری به تقویمِ گوگل (۳ ماهِ دیگر)
              </a>
            </div>
          );
        })()}

        {(() => {
          const withAvg2 = DOMAINS.map((d) => ({ d, avg: Math.round((s1[d.key] + s2[d.key]) / 2) }));
          const sorted = [...withAvg2].sort((a, b) => a.avg - b.avg);
          const weakestKey = sorted[0].d.key;
          const strongestKey = sorted[sorted.length - 1].d.key;

          return DOMAINS.map((d) => {
            const s1val = s1[d.key], s2val = s2[d.key];
            const avg = Math.round((s1val + s2val) / 2);
            const lv = level(avg);
            const gap = Math.abs(s1val - s2val);
            const higherPartner = s1val > s2val ? 1 : 2;

            let rankNote = "";
            if (d.key === weakestKey && sorted.length > 1) {
              rankNote = `این حیطه، در مقایسه با ۵ حیطه‌ی دیگرِ شما، پایین‌ترین امتیاز را دارد — یعنی نقطه‌ی شروعِ منطقیِ کار همین‌جاست.`;
            } else if (d.key === strongestKey && sorted.length > 1) {
              rankNote = `این حیطه، در مقایسه با بقیه‌ی حیطه‌های شما، بالاترین امتیاز را دارد.`;
            } else {
              rankNote = `نسبت به میانگینِ کلیِ رابطه‌ی شما (${overall})، این حیطه ${avg >= overall ? "کمی بالاتر" : "کمی پایین‌تر"} است.`;
            }

            let gapNote = "";
            if (gap >= 25) {
              gapNote = ` نکته‌ی مهم: بینِ نمره‌ی نفرِ اول (${s1val}) و نفرِ دوم (${s2val})، ${gap} امتیاز فاصله است — یعنی نفرِ ${higherPartner === 1 ? 2 : 1} این حیطه را به‌مراتب پرخطرتر از نفرِ ${higherPartner} می‌بیند.`;
            } else if (gap >= 15) {
              gapNote = ` نمره‌ی شما (${s1val}) و همسرتان (${s2val}) کمی متفاوت است (${gap} امتیاز فاصله)، ارزشِ گفتگو دارد.`;
            } else {
              gapNote = ` نمره‌ی شما (${s1val}) و همسرتان (${s2val}) به هم نزدیک است — برداشتِ مشابهی از این حیطه دارید.`;
            }

            return (
              <div key={d.key} style={{ padding: "14px 0", borderBottom: "1px solid #EEF3F6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#1F2D3D", margin: 0 }}>{d.title}</h3>
                  <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_COLOR[lv] }}>{LEVEL_LABEL[lv]} · {avg}</span>
                </div>
                <p style={{ fontSize: 11.5, color: "#5A7080", lineHeight: 1.9, margin: "6px 0 0" }}>
                  {rankNote}{gapNote}
                </p>
                <div style={{ fontSize: 12.5, color: "#4B6070", lineHeight: 1.8, margin: "8px 0 0", background: "#F7FAFC", padding: "8px 10px", borderRadius: 8 }}>
                  {d.action[lv].map((a, i) => (
                    <div key={i} style={{ marginBottom: i < d.action[lv].length - 1 ? 4 : 0 }}>💡 {a}</div>
                  ))}
                </div>
              </div>
            );
          });
        })()}

        <button onClick={() => window.print()} className="no-print"
          style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 14, border: "1px solid #2B6777", background: "#fff", color: "#2B6777", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          🖨 چاپ / ذخیره به‌صورت PDF
        </button>

        <p style={{ fontSize: 10.5, color: "#9AAEB9", marginTop: 16, lineHeight: 1.8, textAlign: "center" }}>
          این ابزار یک غربالگری سریع است و جایگزین ارزیابی بالینی تخصصی نیست. کدِ «{code}» را نگه دارید تا هر زمان بخواهید به این نتیجه بازگردید.
        </p>
        <button onClick={onGoAdmin} className="no-print" style={{ display: "block", margin: "10px auto 0", background: "none", border: "none", color: "#B7C6CE", fontSize: 10.5, cursor: "pointer", textDecoration: "underline" }}>
          (برایِ پژوهشگر) رفتن به پنلِ آموزشی — همین نشست
        </button>

        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #EEF3F6", textAlign: "center" }}>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: "#1F2D3D", margin: "0 0 4px" }}>{BRAND.name}</p>
          <p style={{ fontSize: 11, color: "#5A7080", margin: "0 0 10px", lineHeight: 1.8 }}>{BRAND.credential}</p>
          <p style={{ fontSize: 12, color: "#2B6777", margin: "0 0 4px", fontWeight: 600 }}>📞 {BRAND.phone}</p>
          <p style={{ fontSize: 12, color: "#2B6777", margin: "0 0 4px", fontWeight: 600 }}>📷 instagram.com/{BRAND.instagram}</p>
          <p style={{ fontSize: 12, color: "#5A7080", margin: 0 }}>📍 {BRAND.city}</p>
        </div>
      </Card>
    </div>
  );
}

function exportRawCSV(rows) {
  const completed = (rows || []).filter((r) => r.ans1Done && r.ans2Done);
  const header = ["code", "partner", "duration", "age", "children"];
  DOMAINS.forEach((d) => d.items.forEach((_, i) => header.push(`${d.key}_${i + 1}`)));
  SD_ITEMS.forEach((_, i) => header.push(`sd_${i + 1}`));

  const lines = [header.join(",")];
  completed.forEach((r) => {
    [1, 2].forEach((p) => {
      const ans = p === 1 ? r.ans1 : r.ans2;
      const sd = p === 1 ? r.sd1 : r.sd2;
      const row = [r.code, p, r.context?.duration || "", r.context?.age || "", r.context?.children || ""];
      DOMAINS.forEach((d) => d.items.forEach((_, i) => row.push((ans[d.key] || {})[i] ?? "")));
      SD_ITEMS.forEach((_, i) => row.push((sd || {})[i] ?? ""));
      lines.push(row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
  });

  const csv = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relationship-map-raw-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCoupleRaw(text) {
  const clean = text.trim();
  const parts = clean.split("|").map((p) => p.trim());
  if (parts[0] !== "CPL1") throw new Error("invalid format");
  const code = parts[1] || "UNKNOWN";
  const digits = (parts[2] || "").replace(/\D/g, "");
  const totalItems = DOMAINS.reduce((s, d) => s + d.items.length, 0);
  if (digits.length < totalItems * 2) throw new Error("incomplete data");
  const ans1 = {}, ans2 = {};
  let pos = 0;
  DOMAINS.forEach((d) => {
    ans1[d.key] = {};
    d.items.forEach((_, i) => { ans1[d.key][i] = Number(digits[pos]); pos++; });
  });
  DOMAINS.forEach((d) => {
    ans2[d.key] = {};
    d.items.forEach((_, i) => { ans2[d.key][i] = Number(digits[pos]); pos++; });
  });
  return { code, ans1, ans2, ans1Done: true, ans2Done: true, context: {}, createdAt: Date.now() };
}

function parseCoupleRawBatch(bigText) {
  const chunks = bigText.split(/(?=CPL1\|)/g).map((c) => c.trim()).filter((c) => c.startsWith("CPL1|"));
  const parsed = [];
  let failedCount = 0;
  chunks.forEach((c) => {
    try { parsed.push(parseCoupleRaw(c)); } catch (e) { failedCount++; }
  });
  return { parsed, failedCount };
}

function AdminDashboard({ rows, busy, onRefresh, onBack }) {
  const [manualRows, setManualRows] = useState([]);
  const [pasteText, setPasteText] = useState("");
  const [pasteErr, setPasteErr] = useState("");
  const allRows = [...(rows || []), ...manualRows];
  const completed = allRows.filter((r) => r.ans1Done && r.ans2Done);
  const domainAvgAll = {};
  DOMAINS.forEach((d) => {
    const vals = completed.map((r) => {
      const s1 = scoreDomain(r.ans1[d.key] || {}, d.items);
      const s2 = scoreDomain(r.ans2[d.key] || {}, d.items);
      return (s1 + s2) / 2;
    });
    domainAvgAll[d.key] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  });

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1F2D3D", margin: 0 }}>پنل آموزشی</h2>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#8CA3B0", fontSize: 12, cursor: "pointer" }}>خروج</button>
      </div>

      <details style={{ marginBottom: 14 }}>
        <summary style={{ fontSize: 12, color: "#8CA3B0", cursor: "pointer", listStyle: "none", textAlign: "center" }}>
          ➕ افزودنِ دستیِ داده‌ای که ذخیره‌سازیِ خودکار نداشت (پشتیبان)
        </summary>
        <div style={{ marginTop: 10, background: "#F7FAFC", borderRadius: 12, padding: 12 }}>
          <p style={{ fontSize: 11.5, color: "#5A7080", marginBottom: 8, lineHeight: 1.85 }}>
            متنی که زوج از دکمه‌ی «کپیِ داده‌ی خام» در صفحه‌ی نتیجه گرفته را اینجا جای‌گذاری کنید (می‌توانید چند زوج را پشتِ‌سرِهم پیست کنید):
          </p>
          <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4} placeholder="CPL1|A2K9QZ|4235142351..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #C9DEE8", fontSize: 11.5, marginBottom: 8, direction: "ltr", resize: "vertical" }} />
          <button onClick={() => {
            const { parsed, failedCount } = parseCoupleRawBatch(pasteText);
            if (parsed.length === 0) { setPasteErr("هیچ داده‌ی قابلِ‌خواندنی پیدا نشد."); return; }
            setManualRows((prev) => [...prev, ...parsed]);
            setPasteText("");
            setPasteErr(failedCount > 0 ? `${parsed.length} زوج اضافه شد؛ ${failedCount} بخش قابلِ خواندن نبود.` : `${parsed.length} زوج با موفقیت اضافه شد.`);
          }} disabled={!pasteText.trim()}
            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: pasteText.trim() ? "#2B6777" : "#D6E3EA", color: "#fff", fontWeight: 700, cursor: pasteText.trim() ? "pointer" : "not-allowed", fontSize: 12.5 }}>
            افزودن به نتایج
          </button>
          {pasteErr && <p style={{ fontSize: 11, color: "#5A7080", marginTop: 6 }}>{pasteErr}</p>}
        </div>
      </details>

      {busy && <p style={{ fontSize: 13, color: "#5A7080" }}>در حال بارگذاری…</p>}

      {!busy && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "#EAF4FB", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#2B6777" }}>{allRows.length}</div>
              <div style={{ fontSize: 10.5, color: "#5A7080" }}>کل کدهای ثبت‌شده</div>
            </div>
            <div style={{ flex: 1, background: "#EAF4FB", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#2B6777" }}>{completed.length}</div>
              <div style={{ fontSize: 10.5, color: "#5A7080" }}>زوج‌های تکمیل‌شده</div>
            </div>
          </div>

          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#1F2D3D", margin: "0 0 8px" }}>میانگین هر حیطه (پایه‌ی هنجاریابی)</h3>
          {DOMAINS.map((d) => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, width: 90, color: "#4B6070" }}>{d.short}</span>
              <div style={{ flex: 1, height: 8, background: "#EAF4FB", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${domainAvgAll[d.key]}%`, background: "#2B6777" }} />
              </div>
              <span style={{ fontSize: 11, color: "#8CA3B0", width: 26 }}>{domainAvgAll[d.key]}</span>
            </div>
          ))}

          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#1F2D3D", margin: "18px 0 8px" }}>فهرست کدها</h3>
          <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #EEF3F6", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: "#F7FAFC" }}>
                  <th style={{ padding: 8, textAlign: "right" }}>کد</th>
                  <th style={{ padding: 8, textAlign: "right" }}>وضعیت</th>
                  <th style={{ padding: 8, textAlign: "right" }}>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((r, i) => (
                  <tr key={r.code + i} style={{ borderTop: "1px solid #EEF3F6" }}>
                    <td style={{ padding: 8 }}>{r.code}</td>
                    <td style={{ padding: 8 }}>{r.ans1Done && r.ans2Done ? "تکمیل‌شده" : r.ans1Done ? "در انتظار نفر دوم" : "شروع‌نشده"}</td>
                    <td style={{ padding: 8 }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={onRefresh} style={{ width: "100%", marginTop: 14, padding: "11px", borderRadius: 12, border: "1px solid #2B6777", background: "#fff", color: "#2B6777", fontWeight: 700, cursor: "pointer" }}>
            بروزرسانی داده‌ها
          </button>
          <button onClick={() => exportRawCSV(allRows)} disabled={!completed.length}
            style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 12, border: "none", background: completed.length ? "#2B6777" : "#D6E3EA", color: "#fff", fontWeight: 700, cursor: completed.length ? "pointer" : "not-allowed" }}>
            ⬇ دانلود داده‌ی خام (CSV) برای تحلیل آماری
          </button>
          <p style={{ fontSize: 10, color: "#9AAEB9", marginTop: 8, textAlign: "center", lineHeight: 1.7 }}>
            این فایل، پاسخِ تک‌تکِ گویه‌ها برای هر نفر را دارد — همان چیزی که برای آلفای کرونباخ و تحلیل عاملی لازم است.
          </p>
        </>
      )}
    </Card>
  );
}
