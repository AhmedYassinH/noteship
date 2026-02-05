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
    heroSub: "Join the waitlist and we'll let you know when early access opens.",
    primaryCta: "Join the waitlist",
    secondaryCta: "Get updates",
    plansTitle: "Plans",
    plansLead: "Everything you need to capture, recall, draft, and publish consistently.",
    plans: [
      {
        name: "Free",
        price: "Starter",
        desc: "Best for exploring Noteship and drafting occasionally.",
        items: ["Recall by meaning", "Export anytime", "AI drafts (low quota)", "Manual publish"],
        cta: "Join the waitlist",
      },
      {
        name: "Pro",
        price: "$18/mo",
        badge: "Most popular",
        desc: "For consistent publishing with clear scheduling.",
        items: ["Higher AI drafts", "Scheduling", "Clear status", "More notes & storage"],
        cta: "Join the waitlist",
      },
    ],
    comparisonTitle: "Compare plans",
    comparisonLead: "Clear limits and entitlements based on your plan.",
    comparison: [
      { feature: "Recall by meaning", free: "Included", pro: "Included" },
      { feature: "AI draft quota", free: "Low", pro: "High" },
      { feature: "Scheduling", free: "—", pro: "Included" },
      { feature: "Publishing status", free: "Basic", pro: "Detailed" },
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
    finalCopy: "Join the waitlist and we'll reach out when early access opens.",
    finalPrimary: "Join the waitlist",
    finalSecondary: "Get updates",
  },
  ar: {
    heroKicker: "التسعير",
    heroTitle: "اختر الخطة التي تناسب وتيرة نشرِك.",
    heroSub: "انضم إلى قائمة الانتظار وسنخبرك عند فتح الوصول المبكر.",
    primaryCta: "انضم إلى قائمة الانتظار",
    secondaryCta: "تابع التحديثات",
    plansTitle: "الخطط",
    plansLead: "كل ما تحتاجه لالتقاط الأفكار واسترجاعها وصناعة المسودات والنشر بثبات.",
    plans: [
      {
        name: "مجاني",
        price: "مبدئي",
        desc: "مناسب لاستكشاف Noteship وصناعة المسودات أحياناً.",
        items: [
          "استرجاع بالمعنى",
          "تصدير في أي وقت",
          "مسودات بالذكاء الاصطناعي (حصة منخفضة)",
          "نشر يدوي",
        ],
        cta: "انضم إلى قائمة الانتظار",
      },
      {
        name: "Pro",
        price: "$18 / شهر",
        badge: "الأكثر شيوعاً",
        desc: "للنشر المنتظم مع جدولة واضحة.",
        items: ["مسودات أكثر بالذكاء الاصطناعي", "جدولة", "حالة واضحة", "ملاحظات وتخزين أكثر"],
        cta: "انضم إلى قائمة الانتظار",
      },
    ],
    comparisonTitle: "مقارنة الخطط",
    comparisonLead: "حدود وصلاحيات واضحة حسب خطتك.",
    comparison: [
      { feature: "استرجاع بالمعنى", free: "متاح", pro: "متاح" },
      { feature: "حصة مسودات الذكاء الاصطناعي", free: "منخفضة", pro: "مرتفعة" },
      { feature: "الجدولة", free: "—", pro: "متاحة" },
      { feature: "حالة النشر", free: "أساسية", pro: "تفصيلية" },
      { feature: "الملاحظات والتخزين", free: "مبدئي", pro: "أوسع" },
    ],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {
        q: "هل يمكنني تغيير الخطة لاحقاً؟",
        a: "نعم. يمكنك الترقية في أي وقت مع الاحتفاظ بكل ملاحظاتك.",
      },
      {
        q: "ماذا يحدث إذا وصلت إلى الحدود؟",
        a: "يمكنك الوصول لملاحظاتك، لكن تطبق حدود المسودات والجدولة.",
      },
      {
        q: "هل تدعمون الفرق؟",
        a: "ليس في MVP. Noteship يركز حالياً على المستشارين الفرديين.",
      },
    ],
    finalTitle: "جاهز للنشر بانتظام؟",
    finalCopy: "انضم إلى القائمة وسنراسلك عند فتح الوصول المبكر.",
    finalPrimary: "انضم إلى قائمة الانتظار",
    finalSecondary: "تابع التحديثات",
  },
};

export default pricingCopy;
