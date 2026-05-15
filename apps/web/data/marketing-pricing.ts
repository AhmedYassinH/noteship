import { Lang } from "./marketing-shared";

export type PricingCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
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
    heroKicker: "Pricing",
    heroTitle: "Plans that match your publishing cadence",
    heroSub: "Clear limits, clear outcomes, no placeholder pricing language.",
    primaryCta: "Request early access",
    secondaryCta: "See how it works",
    plansTitle: "Plans",
    plansLead: "Built for individual experts who publish from their own knowledge base.",
    plans: [
      {
        name: "Free",
        price: "Starter",
        desc: "For building your system and publishing occasionally.",
        items: [
          "Capture + preserve notes",
          "Meaning-based recall",
          "Low AI draft quota",
          "Manual publish",
        ],
        cta: "Request early access",
      },
      {
        name: "Pro",
        price: "$18/mo",
        badge: "Most popular",
        desc: "For consistent weekly publishing with less operational overhead.",
        items: [
          "Higher AI draft quota",
          "Scheduling",
          "Detailed status timeline",
          "Expanded storage",
        ],
        cta: "Request early access",
      },
    ],
    comparisonTitle: "Compare plans",
    comparisonLead: "Practical differences that affect day-to-day publishing output.",
    comparison: [
      { feature: "Capture + preserve notes", free: "Included", pro: "Included" },
      { feature: "Meaning-based recall", free: "Included", pro: "Included" },
      { feature: "AI draft quota", free: "Low", pro: "High" },
      { feature: "Scheduling", free: "-", pro: "Included" },
      { feature: "Publishing status detail", free: "Basic", pro: "Detailed" },
      { feature: "Storage", free: "Starter", pro: "Expanded" },
    ],
    faqTitle: "Pricing FAQ",
    faq: [
      {
        q: "Can I switch plans later?",
        a: "Yes. You can upgrade without losing your notes or drafts.",
      },
      {
        q: "What happens when I hit limits?",
        a: "Core note access stays available. AI drafts and scheduling follow plan limits.",
      },
      {
        q: "Do integrations expand over time?",
        a: "Yes. LinkedIn and Medium are current connectors, and integration coverage will keep growing.",
      },
    ],
    finalTitle: "Turn your notes into consistent publishing",
    finalCopy: "Request access and we will reach out with next-step onboarding details.",
    finalPrimary: "Request early access",
    finalSecondary: "Contact us",
  },
  ar: {
    heroKicker: "الأسعار",
    heroTitle: "خطط تناسب وتيرة نشرك",
    heroSub: "حدود واضحة ونتائج واضحة، بدون لغة تسعير مؤقتة.",
    primaryCta: "اطلب وصولًا مبكرًا",
    secondaryCta: "شاهد كيف يعمل",
    plansTitle: "الخطط",
    plansLead: "مصممة للخبراء المستقلين الذين ينشرون من قاعدة معرفتهم الخاصة.",
    plans: [
      {
        name: "مجاني",
        price: "Starter",
        desc: "لبناء نظامك المعرفي والنشر بشكل متقطع.",
        items: ["التقاط + حفظ الملاحظات", "استرجاع بالمعنى", "حصة AI منخفضة", "نشر يدوي"],
        cta: "اطلب وصولًا مبكرًا",
      },
      {
        name: "Pro",
        price: "$18/شهريًا",
        badge: "الأكثر استخدامًا",
        desc: "لنشر أسبوعي منتظم مع مجهود تشغيلي أقل.",
        items: ["حصة AI أعلى", "الجدولة", "خط زمني تفصيلي للحالة", "سعة تخزين أكبر"],
        cta: "اطلب وصولًا مبكرًا",
      },
    ],
    comparisonTitle: "مقارنة الخطط",
    comparisonLead: "فروقات عملية تؤثر على مخرجات النشر اليومية.",
    comparison: [
      { feature: "التقاط + حفظ الملاحظات", free: "متاح", pro: "متاح" },
      { feature: "استرجاع بالمعنى", free: "متاح", pro: "متاح" },
      { feature: "حصة مسودات AI", free: "منخفضة", pro: "مرتفعة" },
      { feature: "الجدولة", free: "-", pro: "متاح" },
      { feature: "تفاصيل حالة النشر", free: "أساسية", pro: "تفصيلية" },
      { feature: "التخزين", free: "مبدئي", pro: "موسع" },
    ],
    faqTitle: "أسئلة الأسعار",
    faq: [
      {
        q: "هل يمكنني تغيير الخطة لاحقًا؟",
        a: "نعم. يمكنك الترقية بدون فقدان الملاحظات أو المسودات.",
      },
      {
        q: "ماذا يحدث عند الوصول إلى الحدود؟",
        a: "يبقى الوصول للملاحظات متاحًا، بينما تخضع مسودات AI والجدولة لحدود الخطة.",
      },
      {
        q: "هل ستزداد التكاملات مع الوقت؟",
        a: "نعم. LinkedIn وMedium متاحان حاليًا، والتكاملات ستتوسع تدريجيًا.",
      },
    ],
    finalTitle: "حوّل ملاحظاتك إلى نشر منتظم",
    finalCopy: "اطلب الوصول وسنتواصل معك بتفاصيل الانضمام.",
    finalPrimary: "اطلب وصولًا مبكرًا",
    finalSecondary: "تواصل معنا",
  },
};

export default pricingCopy;
