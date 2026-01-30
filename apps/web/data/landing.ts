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
    heroKicker: "Recall by meaning. Repurpose. Publish.",
    heroTitle: "Recall ideas by meaning. Publish in your voice—without rewriting.",
    heroSub:
      "Noteship helps consultants and coaches resurface past thinking, turn notes into LinkedIn and Medium drafts, and publish consistently with calm, reliable workflows.",
    primaryCta: "Start drafting",
    secondaryCta: "See how it works",
    heroImage:
      "/annotated%20screenshot%20of%20English%20UI%20%2C%20showing%20publish%20status%20timeline..png",
    heroImageAlt: "English UI showing recall and a LinkedIn draft",
    problemTitle: "Built for people who don't want to rewrite from scratch",
    problemBullets: [
      "You remember the idea, not the exact words.",
      "You need drafts grounded in your own notes.",
      "You want to publish on schedule without extra effort.",
    ],
    howTitle: "How Noteship works",
    howSteps: [
      { title: "Capture once", copy: "Capture a note once and keep it organized." },
      {
        title: "Recall by meaning",
        copy: "Find ideas by meaning when the wording is fuzzy.",
      },
      { title: "Draft + publish", copy: "Turn notes into drafts, publish now or schedule." },
    ],
    pillarsTitle: "Why it works for real publishing",
    pillars: [
      { title: "Meaning-based recall", copy: "Find notes by meaning, not exact keywords." },
      { title: "Grounded drafts", copy: "Drafts stay anchored in your notes and voice." },
      { title: "Consistent publishing", copy: "Clear scheduling and status for LinkedIn/Medium." },
      { title: "Portable notes", copy: "Export your notes anytime, without lock-in." },
    ],
    proofTitle: "Proof points",
    proofStats: [
      { label: "Minutes to first draft", value: "<5" },
      { label: "Platforms at launch", value: "2" },
      { label: "Export", value: "Anytime" },
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
        items: ["Recall by meaning", "Export anytime", "AI drafts (low quota)", "Manual publish"],
        cta: "Start free",
      },
      {
        name: "Pro",
        price: "$18/mo",
        items: ["Higher AI drafts", "Scheduling", "Clear status", "More notes & storage"],
        cta: "Upgrade",
      },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "Can I export my notes?", a: "Yes. Export anytime, no lock-in." },
      { q: "Which platforms are supported?", a: "LinkedIn and Medium at launch, more later." },
      { q: "Is scheduling paid?", a: "Scheduling is Pro-only; manual publish is in Free." },
    ],
    finalTitle: "Ready to ship your ideas?",
    finalCopy: "Recall by meaning, draft fast, publish with confidence.",
    navLinks: [
      { id: "problem", label: "Why Noteship" },
      { id: "how", label: "How it works" },
      { id: "pricing", label: "Pricing" },
      { id: "faq", label: "FAQ" },
    ],
    navCtaPrimary: "Start free",
    navCtaSecondary: "Log in",
    brandTagline: "Recall by meaning. Publish with consistency.",
  },
  ar: {
    heroKicker: "استرجاع بالمعنى · إعادة توظيف · نشر",
    heroTitle: "استرجع الأفكار بالمعنى. انشر بصوتك بدون إعادة كتابة.",
    heroSub:
      "يساعد Noteship المستشارين والمدربين على استرجاع أفكارهم السابقة، وتحويل الملاحظات إلى مسودات جاهزة لـ LinkedIn و Medium، والنشر بانتظام بهدوء.",
    primaryCta: "ابدأ المسودة",
    secondaryCta: "شاهد كيف يعمل",
    heroImage:
      "/%D9%84%D9%82%D8%B7%D8%A9%20%D9%86%D8%B8%D9%8A%D9%81%D8%A9%20%D9%84%D9%88%D8%A7%D8%AC%D9%87%D8%A9%20%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9%20%D9%85%D8%B9%20%D9%86%D8%AA%D8%A7%D8%A6%D8%AC%20%D8%A8%D8%AD%D8%AB%20%D8%AF%D9%84%D8%A7%D9%84%D9%8A%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%8A%D9%85%D9%8A%D9%86%20%D9%88%D9%85%D8%B3%D9%88%D8%AF%D8%A9%20%D9%84%D9%8A%D9%86%D9%83%D8%AF%D8%A5%D9%86%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%8A%D8%B3%D8%A7%D8%B1%20(%D9%88%D8%A7%D8%AC%D9%87%D8%A9%20RTL)..png",
    heroImageAlt: "واجهة عربية مع نتائج بحث بالمعنى",
    problemTitle: "مصمم لمن لا يريد إعادة الكتابة من الصفر",
    problemBullets: [
      "تتذكر الفكرة لا الصياغة.",
      "تحتاج لمسودات مبنية على ملاحظاتك.",
      "تريد النشر بانتظام دون جهد إضافي.",
    ],
    howTitle: "كيف يعمل Noteship",
    howSteps: [
      { title: "التقط مرة واحدة", copy: "اكتب ملاحظتك مرة واحدة واحتفظ بها منظمة." },
      { title: "استرجع بالمعنى", copy: "استرجع بالمعنى عندما لا تتذكر الكلمات." },
      { title: "حوّل وانشر", copy: "حوّل الملاحظات إلى مسودات وانشر الآن أو جدّل." },
    ],
    pillarsTitle: "لماذا يناسب النشر الحقيقي",
    pillars: [
      { title: "استرجاع بالمعنى", copy: "اعثر على الأفكار بحسب المعنى لا الكلمات." },
      { title: "مسودات مبنية على ملاحظاتك", copy: "المسودات تنطلق من ملاحظاتك وصوتك." },
      { title: "نشر بانتظام", copy: "جدولة واضحة وحالات نشر مفهومة." },
      { title: "ملاحظات قابلة للنقل", copy: "صدّر ملاحظاتك في أي وقت." },
    ],
    proofTitle: "دلائل سريعة",
    proofStats: [
      { label: "الوقت لأول مسودة", value: "<5 دقائق" },
      { label: "المنصات عند الإطلاق", value: "2" },
      { label: "التصدير", value: "في أي وقت" },
    ],
    proofImage:
      "/%D9%84%D9%82%D8%B7%D8%A9%20%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9%20%D9%85%D8%B9%20%D8%AE%D8%B7%20%D8%B2%D9%85%D9%86%D9%8A%20%D9%84%D8%AD%D8%A7%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%86%D8%B4%D8%B1%20%D9%88%D9%85%D8%AD%D8%A7%D8%B0%D8%A7%D8%A9%20RTL.png",
    proofImageAlt: "واجهة عربية مع حالة النشر",
    pricingTitle: "التسعير",
    pricingSub: "ابدأ مجاناً. الترقية للجدولة وحدود أعلى للذكاء الاصطناعي.",
    plans: [
      {
        name: "مجاني",
        price: "مبدئي",
        items: [
          "استرجاع بالمعنى",
          "تصدير في أي وقت",
          "مسودات بالذكاء الاصطناعي (حصة منخفضة)",
          "نشر يدوي",
        ],
        cta: "ابدأ مجاناً",
      },
      {
        name: "Pro",
        price: "$18 / شهر",
        items: ["مسودات أكثر بالذكاء الاصطناعي", "جدولة", "حالات نشر واضحة", "ملاحظات وتخزين أكثر"],
        cta: "ترقية",
      },
    ],
    faqTitle: "أسئلة شائعة",
    faq: [
      { q: "هل يمكنني تصدير ملاحظاتي؟", a: "نعم. يمكنك التصدير في أي وقت." },
      { q: "ما هي المنصات المدعومة؟", a: "LinkedIn و Medium عند الإطلاق، والمزيد لاحقاً." },
      { q: "هل الجدولة مدفوعة؟", a: "الجدولة ضمن خطة Pro، والنشر اليدوي في المجانية." },
    ],
    finalTitle: "جاهز لنشر أفكارك؟",
    finalCopy: "استرجع بالمعنى، اكتب بسرعة، وانشر بثقة.",
    navLinks: [
      { id: "problem", label: "لماذا Noteship" },
      { id: "how", label: "كيف يعمل" },
      { id: "pricing", label: "التسعير" },
      { id: "faq", label: "الأسئلة" },
    ],
    navCtaPrimary: "ابدأ مجاناً",
    navCtaSecondary: "تسجيل الدخول",
    brandTagline: "استرجاع بالمعنى ونشر بثبات.",
  },
};

export default landingCopy;
