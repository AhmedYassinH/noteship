import { Lang } from "./marketing-shared";

export type PricingCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  primaryCta: string;
  secondaryCta: string;
  plansTitle: string;
  plansLead: string;
  plans: {
    name: string;
    price: string;
    desc: string;
    badge?: string;
    items: string[];
    cta: string;
    disabled?: boolean;
  }[];
  comparisonTitle: string;
  comparisonLead: string;
  comparison: { feature: string; free: string; pro: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalCopy: string;
  finalPrimary: string;
  finalSecondary: string;
};

const pricingCopy: Record<Lang, PricingCopy> = {
  en: {
    heroEyebrow: "Pricing",
    heroTitle: "Free while paid plans are prepared.",
    heroLead:
      "Public launch starts with a real free workspace. Pro stays visible so the product direction is clear, but billing remains closed for now.",
    primaryCta: "Start free",
    secondaryCta: "See workflow",
    plansTitle: "Plans",
    plansLead: "Simple launch posture for individual experts publishing from their notes.",
    plans: [
      {
        name: "Free",
        price: "$0",
        badge: "Live now",
        desc: "For building your system and publishing occasionally.",
        items: [
          "Free plan by default",
          "Capture and preserve notes",
          "Meaning-based recall",
          "Focused draft quota",
          "Manual LinkedIn publish",
        ],
        cta: "Start free",
      },
      {
        name: "Pro",
        price: "$18",
        badge: "Coming soon",
        desc: "For consistent publishing with higher quotas and scheduling.",
        items: ["Higher AI quota", "Scheduling", "Expanded storage", "More room to publish"],
        cta: "Coming soon",
        disabled: true,
      },
    ],
    comparisonTitle: "Compare plans",
    comparisonLead: "Practical differences that affect day-to-day publishing output.",
    comparison: [
      { feature: "Default plan for new users", free: "Included", pro: "Later" },
      { feature: "Capture and preserve notes", free: "Included", pro: "Included" },
      { feature: "Meaning-based recall", free: "Included", pro: "Included" },
      { feature: "AI draft quota", free: "Focused", pro: "Higher" },
      { feature: "Scheduling", free: "Coming soon", pro: "Included later" },
      { feature: "Billing access", free: "Disabled", pro: "Coming soon" },
    ],
    faqTitle: "Pricing FAQ",
    faq: [
      {
        q: "Can I pay for Pro now?",
        a: "No. Billing is intentionally disabled during the free-only public launch.",
      },
      {
        q: "What happens when I hit limits?",
        a: "Core note access stays available. Costly actions follow the free plan limits.",
      },
      {
        q: "Will my notes move when paid plans open?",
        a: "No. Your existing notes remain in the same workspace.",
      },
    ],
    finalTitle: "Start free and build the publishing habit first.",
    finalCopy: "Paid plans can wait. Your knowledge base does not have to.",
    finalPrimary: "Start free",
    finalSecondary: "Contact us",
  },
  ar: {
    heroEyebrow: "التسعير",
    heroTitle: "مجاني بينما نجهز الخطط المدفوعة.",
    heroLead:
      "يبدأ الإطلاق العام بمساحة عمل مجانية حقيقية. يبقى Pro ظاهرًا لتوضيح اتجاه المنتج، لكن الفوترة مغلقة حاليًا.",
    primaryCta: "ابدأ مجانًا",
    secondaryCta: "شاهد سير العمل",
    plansTitle: "الخطط",
    plansLead: "وضع إطلاق بسيط للخبراء المستقلين الذين ينشرون من ملاحظاتهم.",
    plans: [
      {
        name: "مجاني",
        price: "$0",
        badge: "متاح الآن",
        desc: "لبناء نظامك والنشر بشكل متقطع.",
        items: [
          "الخطة المجانية افتراضيًا",
          "التقاط وحفظ الملاحظات",
          "استرجاع بالمعنى",
          "حصة مسودات مركزة",
          "نشر يدوي إلى LinkedIn",
        ],
        cta: "ابدأ مجانًا",
      },
      {
        name: "Pro",
        price: "$18",
        badge: "قريبًا",
        desc: "للنشر المنتظم مع حصص أعلى وجدولة.",
        items: ["حصة AI أعلى", "جدولة", "تخزين أوسع", "مساحة أكبر للنشر"],
        cta: "قريبًا",
        disabled: true,
      },
    ],
    comparisonTitle: "مقارنة الخطط",
    comparisonLead: "فروقات عملية تؤثر على مخرجات النشر اليومية.",
    comparison: [
      { feature: "الخطة الافتراضية للمستخدمين الجدد", free: "متاح", pro: "لاحقًا" },
      { feature: "التقاط وحفظ الملاحظات", free: "متاح", pro: "متاح" },
      { feature: "استرجاع بالمعنى", free: "متاح", pro: "متاح" },
      { feature: "حصة مسودات AI", free: "مركزة", pro: "أعلى" },
      { feature: "الجدولة", free: "قريبًا", pro: "متاحة لاحقًا" },
      { feature: "الوصول للفوترة", free: "معطل", pro: "قريبًا" },
    ],
    faqTitle: "أسئلة التسعير",
    faq: [
      {
        q: "هل يمكنني الدفع لـ Pro الآن؟",
        a: "لا. الفوترة معطلة عمدًا أثناء الإطلاق العام المجاني.",
      },
      {
        q: "ماذا يحدث عند الوصول إلى الحدود؟",
        a: "يبقى الوصول الأساسي للملاحظات متاحًا. الإجراءات المكلفة تتبع حدود الخطة المجانية.",
      },
      {
        q: "هل ستنتقل ملاحظاتي عند فتح الخطط المدفوعة؟",
        a: "لا. تبقى ملاحظاتك الحالية في مساحة العمل نفسها.",
      },
    ],
    finalTitle: "ابدأ مجانًا وابن عادة النشر أولًا.",
    finalCopy: "يمكن للخطط المدفوعة أن تنتظر. قاعدة معرفتك لا تحتاج إلى الانتظار.",
    finalPrimary: "ابدأ مجانًا",
    finalSecondary: "تواصل معنا",
  },
};

export default pricingCopy;
