export type Lang = "en" | "ar";

export type LandingCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  heroImageAlt: string;
  problemTitle: string;
  problemBullets: string[];
  howTitle: string;
  howSteps: { title: string; copy: string }[];
  pillarsTitle: string;
  pillars: { title: string; copy: string }[];
  proofTitle: string;
  proofStats: { label: string; value: string }[];
  proofImage: string;
  proofImageAlt: string;
  pricingTitle: string;
  pricingSub: string;
  plans: { name: string; price: string; items: string[]; cta: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalCopy: string;
  navLinks: { id: string; label: string }[];
  navCtaPrimary: string;
  navCtaSecondary: string;
  brandTagline: string;
};

const landingCopy: Record<Lang, LandingCopy> = {
  en: {
    heroKicker: "Semantic notes to published posts",
    heroTitle: "Find any idea by meaning. Publish in your voice—without rewrites.",
    heroSub:
      "Noteship helps consultants and coaches turn Markdown notes into LinkedIn and Medium posts with semantic recall, tone control, and reliable scheduling.",
    primaryCta: "Start drafting",
    secondaryCta: "Watch 90s overview",
    heroImage:
      "/annotated%20screenshot%20of%20English%20UI%20%2C%20showing%20publish%20status%20timeline..png",
    heroImageAlt: "English UI showing semantic search and LinkedIn draft",
    problemTitle: "Built for people who don't want to rewrite from scratch",
    problemBullets: [
      "You remember the idea, not the exact words.",
      "You need LinkedIn/Medium posts that keep your tone.",
      "You want scheduling that just works (with retries).",
    ],
    howTitle: "How Noteship works",
    howSteps: [
      { title: "Capture once", copy: "Write in TipTap, autosave to Markdown, attach artifacts." },
      {
        title: "Index by meaning",
        copy: "Background embeddings keep search fresh after each edit.",
      },
      { title: "Draft + publish", copy: "Generate posts in your tone, publish now or schedule." },
    ],
    pillarsTitle: "Why it stays portable",
    pillars: [
      { title: "Markdown first", copy: "Canonical content in S3, easy export/import." },
      { title: "Semantic search", copy: "Find notes by meaning, not exact keywords." },
      { title: "On-brand drafts", copy: "Tone controls keep your voice consistent." },
      { title: "Reliable scheduling", copy: "Retries and clear statuses for LinkedIn/Medium." },
    ],
    proofTitle: "Proof points",
    proofStats: [
      { label: "Minutes to first draft", value: "<5" },
      { label: "Platforms at launch", value: "2" },
      { label: "Export format", value: "Markdown" },
    ],
    proofImage:
      "/annotated%20screenshot%20of%20English%20UI%20%2C%20showing%20publish%20status%20timeline..png",
    proofImageAlt: "Annotated English UI showing publish status timeline",
    pricingTitle: "Pricing",
    pricingSub: "Start free. Upgrade for scheduling and higher AI limits.",
    plans: [
      {
        name: "Free",
        price: "Starter",
        items: ["Semantic search", "Markdown export", "AI drafts (low quota)", "Manual publish"],
        cta: "Start free",
      },
      {
        name: "Pro",
        price: "$18/mo",
        items: ["Higher AI drafts", "Scheduling", "Retries + status", "More notes & storage"],
        cta: "Upgrade",
      },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "Can I export my notes?", a: "Yes. Noteship stores Markdown; export anytime." },
      { q: "Which platforms are supported?", a: "LinkedIn and Medium at launch, more later." },
      { q: "Is scheduling paid?", a: "Scheduling is Pro-only; manual publish is in Free." },
    ],
    finalTitle: "Ready to ship your ideas?",
    finalCopy: "Find by meaning, draft fast, publish with confidence.",
    navLinks: [
      { id: "problem", label: "Why Noteship" },
      { id: "how", label: "How it works" },
      { id: "pricing", label: "Pricing" },
      { id: "faq", label: "FAQ" },
    ],
    navCtaPrimary: "Start free",
    navCtaSecondary: "Log in",
    brandTagline: "Semantic memory for publishing",
  },
  ar: {
    heroKicker: "ملاحظات دلالية إلى منشورات جاهزة",
    heroTitle: "اعثر على أي فكرة بالمعنى. انشر بصوتك من دون إعادة كتابة.",
    heroSub:
      "نوتشِب يساعد المستشارين والمدربين على تحويل الملاحظات إلى منشورات لينكدإن/ميديوم مع بحث دلالي، تحكم في النبرة، وجدولة موثوقة.",
    primaryCta: "ابدأ بالصياغة",
    secondaryCta: "شاهد عرض ٩٠ ثانية",
    heroImage:
      "/%D9%84%D9%82%D8%B7%D8%A9%20%D9%86%D8%B8%D9%8A%D9%81%D8%A9%20%D9%84%D9%88%D8%A7%D8%AC%D9%87%D8%A9%20%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9%20%D9%85%D8%B9%20%D9%86%D8%AA%D8%A7%D8%A6%D8%AC%20%D8%A8%D8%AD%D8%AB%20%D8%AF%D9%84%D8%A7%D9%84%D9%8A%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%8A%D9%85%D9%8A%D9%86%20%D9%88%D9%85%D8%B3%D9%88%D8%AF%D8%A9%20%D9%84%D9%8A%D9%86%D9%83%D8%AF%D8%A5%D9%86%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%8A%D8%B3%D8%A7%D8%B1%20(%D9%88%D8%A7%D8%AC%D9%87%D8%A9%20RTL)..png",
    heroImageAlt: "واجهة عربية مع نتائج بحث دلالي ومسودة لينكدإن",
    problemTitle: "لمن لا يريد إعادة الكتابة كل مرة",
    problemBullets: [
      "تتذكر الفكرة لا الكلمات بالضبط.",
      "تحتاج منشورات لينكدإن/ميديوم تحافظ على أسلوبك.",
      "تريد جدولة تعمل بثبات (مع محاولات إعادة).",
    ],
    howTitle: "كيف يعمل نوتشِب",
    howSteps: [
      { title: "دوّن مرة", copy: "اكتب في TipTap مع حفظ تلقائي إلى Markdown ومرفقات." },
      { title: "فهرسة بالمعنى", copy: "تحديث المتجهات بعد كل تعديل ليبقى البحث دقيقاً." },
      { title: "صياغة ونشر", copy: "ولّد منشورات بأسلوبك، انشر الآن أو جدولة." },
    ],
    pillarsTitle: "لماذا يظل قابلاً للنقل",
    pillars: [
      { title: "Markdown أولاً", copy: "محتوى أساسي في S3 مع تصدير/استيراد سهل." },
      { title: "بحث دلالي", copy: "اعثر على الملاحظات بالمعنى لا بالكلمات المفتاحية." },
      { title: "مسودات على أسلوبك", copy: "تحكم في النبرة ليبقى صوتك ثابتاً." },
      { title: "جدولة موثوقة", copy: "محاولات إعادة وحالات واضحة للينكدإن/ميديوم." },
    ],
    proofTitle: "دلائل",
    proofStats: [
      { label: "دقائق لأول مسودة", value: "أقل من ٥" },
      { label: "منصات عند الإطلاق", value: "٢" },
      { label: "صيغة التصدير", value: "Markdown" },
    ],
    proofImage:
      "/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9%20%D9%85%D8%B9%20%D8%AE%D8%B7%20%D8%B2%D9%85%D9%86%D9%8A%20%D9%84%D8%AD%D8%A7%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%86%D8%B4%D8%B1%20%D9%88%D9%85%D8%AD%D8%A7%D8%B0%D8%A7%D8%A9%20RTL.png",
    proofImageAlt: "لقطة عربية مع خط زمني لحالات النشر",
    pricingTitle: "الأسعار",
    pricingSub: "ابدأ مجاناً. طوّر للجدولة وحصص ذكاء أعلى.",
    plans: [
      {
        name: "مجاني",
        price: "مجاني",
        items: ["بحث دلالي", "تصدير Markdown", "حصص منخفضة للمسودات", "نشر يدوي"],
        cta: "ابدأ مجاناً",
      },
      {
        name: "برو",
        price: "$18 / شهر",
        items: ["حصص أعلى للمسودات", "جدولة", "محاولات إعادة + حالات", "ملاحظات وتخزين أكثر"],
        cta: "ترقية",
      },
    ],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      { q: "هل يمكنني تصدير الملاحظات؟", a: "نعم، نوتشِب يخزن Markdown ويمكن التصدير في أي وقت." },
      { q: "ما المنصات المدعومة؟", a: "لينكدإن وميديوم عند الإطلاق، المزيد لاحقاً." },
      { q: "هل الجدولة مدفوعة؟", a: "الجدولة ضمن برو؛ النشر اليدوي متاح في المجاني." },
    ],
    finalTitle: "جاهز لشحن أفكارك؟",
    finalCopy: "ابحث بالمعنى، صِغ بسرعة، وانشر بثقة.",
    navLinks: [
      { id: "problem", label: "لماذا نوتشِب" },
      { id: "how", label: "كيف يعمل" },
      { id: "pricing", label: "الأسعار" },
      { id: "faq", label: "الأسئلة" },
    ],
    navCtaPrimary: "ابدأ مجاناً",
    navCtaSecondary: "تسجيل دخول",
    brandTagline: "ذاكرة دلالية للنشر",
  },
};

export default landingCopy;
