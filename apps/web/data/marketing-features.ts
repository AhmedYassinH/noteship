import { Lang } from "./marketing-shared";

export type FeaturesCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  sections: { title: string; copy: string; items: string[] }[];
  reliabilityTitle: string;
  reliabilityItems: { title: string; copy: string }[];
  ctaTitle: string;
  ctaCopy: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const featuresCopy: Record<Lang, FeaturesCopy> = {
  en: {
    heroKicker: "How Noteship works",
    heroTitle: "A practical workflow from notes to published output",
    heroSub: "Capture, preserve, recall, repurpose, then publish in a predictable system.",
    primaryCta: "Start free",
    secondaryCta: "View pricing",
    sections: [
      {
        title: "Capture and preserve",
        copy: "Store notes in a format that stays readable and reusable over time.",
        items: ["Markdown-backed storage", "Structured metadata", "Export-ready from day one"],
      },
      {
        title: "Recall and repurpose",
        copy: "Find what matters by meaning, then convert it into channel-ready drafts.",
        items: [
          "Semantic retrieval",
          "Voice-preserving generation",
          "LinkedIn publishing with more integrations planned",
        ],
      },
      {
        title: "Publish and track",
        copy: "Schedule or publish immediately with clear status and recovery flow.",
        items: [
          "Current connector: LinkedIn",
          "Expanding integrations roadmap",
          "Plan-aware limits",
        ],
      },
    ],
    reliabilityTitle: "Built for calm operations",
    reliabilityItems: [
      { title: "Clarity", copy: "Every stage has a visible state." },
      { title: "Control", copy: "You decide what to schedule or publish now." },
      { title: "Portability", copy: "Your notes stay yours." },
    ],
    ctaTitle: "Stop rewriting. Start publishing from your own knowledge base.",
    ctaCopy: "Turn your notes into consistent publishing with a workflow you can trust.",
    ctaPrimary: "Start free",
    ctaSecondary: "Contact us",
  },
  ar: {
    heroKicker: "كيف يعمل Noteship",
    heroTitle: "سير عملي من الملاحظات إلى مخرجات منشورة",
    heroSub: "التقاط، حفظ، استرجاع، إعادة توظيف، ثم نشر ضمن نظام متوقع.",
    primaryCta: "اطلب الوصول المبكر",
    secondaryCta: "عرض التسعير",
    sections: [
      {
        title: "التقاط وحفظ",
        copy: "احفظ ملاحظاتك بصيغة تبقى قابلة للقراءة وإعادة الاستخدام مع الوقت.",
        items: ["تخزين قائم على Markdown", "بيانات وصفية منظمة", "جاهزية للتصدير من البداية"],
      },
      {
        title: "استرجاع وإعادة توظيف",
        copy: "اعثر على المهم بالمعنى ثم حوّله إلى مسودات مناسبة لكل قناة.",
        items: ["استرجاع دلالي", "توليد يحافظ على الصوت", "موصلات لمنصات حالية وقادمة"],
      },
      {
        title: "نشر وتتبع",
        copy: "جدولة أو نشر فوري مع وضوح الحالة ومسار استرداد واضح.",
        items: ["الموصل الحالي: LinkedIn", "خارطة تكاملات تتوسع باستمرار", "حدود مرتبطة بالخطة"],
      },
    ],
    reliabilityTitle: "مصمم لتشغيل هادئ",
    reliabilityItems: [
      { title: "وضوح", copy: "لكل مرحلة حالة مرئية." },
      { title: "تحكم", copy: "أنت من يقرر الجدولة أو النشر الفوري." },
      { title: "قابلية النقل", copy: "ملاحظاتك تبقى ملكك." },
    ],
    ctaTitle: "توقّف عن إعادة الكتابة وابدأ النشر من قاعدة معرفتك.",
    ctaCopy: "حوّل ملاحظاتك إلى نشر منتظم عبر سير عمل موثوق.",
    ctaPrimary: "اطلب الوصول المبكر",
    ctaSecondary: "تواصل معنا",
  },
};

export default featuresCopy;
