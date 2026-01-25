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
    heroTitle: "Pick the plan that matches your publishing cadence.",
    heroSub: "Start free, upgrade for scheduling and higher AI limits when you’re ready.",
    primaryCta: "Start free",
    secondaryCta: "Talk to us",
    plansTitle: "Plans",
    plansLead: "Everything you need to capture, search, draft, and publish consistently.",
    plans: [
      {
        name: "Free",
        price: "Starter",
        desc: "Best for exploring Noteship and drafting occasionally.",
        items: [
          "Semantic search across notes",
          "Markdown storage + export",
          "AI drafts (low quota)",
          "Manual publish",
        ],
        cta: "Start free",
      },
      {
        name: "Pro",
        price: "$18/mo",
        badge: "Most popular",
        desc: "For consistent publishing with reliable scheduling.",
        items: [
          "Higher AI drafts",
          "Scheduling + retries",
          "Status timeline",
          "More notes & storage",
        ],
        cta: "Upgrade to Pro",
      },
    ],
    comparisonTitle: "Compare plans",
    comparisonLead: "Clear limits and entitlements based on your plan.",
    comparison: [
      { feature: "Semantic search", free: "Included", pro: "Included" },
      { feature: "AI draft quota", free: "Low", pro: "High" },
      { feature: "Scheduling", free: "—", pro: "Included" },
      { feature: "Publish retries", free: "—", pro: "Included" },
      { feature: "Status timeline", free: "Basic", pro: "Advanced" },
      { feature: "Notes & storage", free: "Starter", pro: "Expanded" },
    ],
    faqTitle: "FAQ",
    faq: [
      {
        q: "Can I switch plans later?",
        a: "Yes. Upgrade any time and keep all of your notes.",
      },
      {
        q: "What happens if I hit limits?",
        a: "You can still access notes, but draft and scheduling limits apply.",
      },
      {
        q: "Do you support teams?",
        a: "Not in MVP. Noteship is focused on solo consultants for now.",
      },
    ],
    finalTitle: "Ready to publish consistently?",
    finalCopy: "Start free and upgrade when scheduling becomes essential.",
    finalPrimary: "Start free",
    finalSecondary: "See features",
  },
  ar: {
    heroKicker: "الأسعار",
    heroTitle: "اختر الخطة التي تناسب إيقاع نشرِك.",
    heroSub: "ابدأ مجاناً وطور للجدولة وحدود ذكاء أعلى عندما تحتاج.",
    primaryCta: "ابدأ مجاناً",
    secondaryCta: "تواصل معنا",
    plansTitle: "الخطط",
    plansLead: "كل ما تحتاجه للكتابة والبحث والصياغة والنشر بثبات.",
    plans: [
      {
        name: "مجاني",
        price: "Starter",
        desc: "مثالي لتجربة نوتشِب وصياغة متقطعة.",
        items: ["بحث دلالي", "تخزين وتصدير Markdown", "حصص مسودات منخفضة", "نشر يدوي"],
        cta: "ابدأ مجاناً",
      },
      {
        name: "برو",
        price: "$18 / شهر",
        badge: "الأكثر شيوعاً",
        desc: "للنشر المنتظم مع جدولة موثوقة.",
        items: [
          "حصص مسودات أعلى",
          "جدولة + محاولات إعادة",
          "خط زمني للحالات",
          "ملاحظات وتخزين أكثر",
        ],
        cta: "الترقية إلى برو",
      },
    ],
    comparisonTitle: "مقارنة الخطط",
    comparisonLead: "حدود واستحقاقات واضحة حسب الخطة.",
    comparison: [
      { feature: "بحث دلالي", free: "متاح", pro: "متاح" },
      { feature: "حصص المسودات", free: "منخفضة", pro: "مرتفعة" },
      { feature: "الجدولة", free: "—", pro: "متاحة" },
      { feature: "محاولات إعادة", free: "—", pro: "متاحة" },
      { feature: "خط زمني للحالات", free: "أساسي", pro: "متقدم" },
      { feature: "الملاحظات والتخزين", free: "بداية", pro: "موسع" },
    ],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      { q: "هل يمكنني تغيير الخطة لاحقاً؟", a: "نعم، ويمكنك الاحتفاظ بكل ملاحظاتك." },
      {
        q: "ماذا يحدث عند الوصول للحدود؟",
        a: "تظل الملاحظات متاحة، لكن حدود الصياغة والجدولة تطبق.",
      },
      { q: "هل تدعمون الفرق؟", a: "ليس في النسخة الأولية، نركز على المستشارين المستقلين حالياً." },
    ],
    finalTitle: "جاهز للنشر بثبات؟",
    finalCopy: "ابدأ مجاناً ثم طوّر عندما تصبح الجدولة أساسية.",
    finalPrimary: "ابدأ مجاناً",
    finalSecondary: "الميزات",
  },
};

export default pricingCopy;
