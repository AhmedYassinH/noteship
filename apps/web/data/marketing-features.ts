import { Lang } from "./marketing-shared";

export type FeaturesCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
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
    heroEyebrow: "Product workflow",
    heroTitle: "A practical system from notes to published output.",
    heroLead:
      "Noteship keeps capture, recall, drafting, and publishing in one focused workflow for solo operators who publish from lived knowledge.",
    primaryCta: "Start free",
    secondaryCta: "View pricing",
    sections: [
      {
        title: "Capture and preserve",
        copy: "Store rough thinking in a calm editor that stays useful after the first draft.",
        items: ["Markdown-backed notes", "Upload small artifacts", "Exportable source material"],
      },
      {
        title: "Recall and repurpose",
        copy: "Find relevant ideas by meaning, then turn the source note into grounded angles.",
        items: ["Meaning-based retrieval", "Context-rich snippets", "Source-grounded drafts"],
      },
      {
        title: "Publish and track",
        copy: "Move from draft to LinkedIn with clear state, retries, and recovery visibility.",
        items: ["LinkedIn connector", "Publish now", "Scheduling prepared for paid plans"],
      },
    ],
    reliabilityTitle: "Built for calm operations",
    reliabilityItems: [
      { title: "Backend enforcement", copy: "Plan limits are enforced server-side." },
      { title: "Async publishing", copy: "Worker jobs handle unreliable vendor calls." },
      { title: "Portable content", copy: "Notes and drafts stay exportable." },
    ],
    ctaTitle: "Stop rewriting what your notes already know.",
    ctaCopy: "Start free and turn captured thinking into publish-ready work.",
    ctaPrimary: "Start free",
    ctaSecondary: "Contact us",
  },
  ar: {
    heroEyebrow: "سير عمل المنتج",
    heroTitle: "نظام عملي من الملاحظات إلى المخرجات المنشورة.",
    heroLead:
      "يجمع Noteship الالتقاط والاسترجاع والصياغة والنشر في سير عمل مركز للمستقلين الذين ينشرون من معرفة متراكمة.",
    primaryCta: "ابدأ مجانًا",
    secondaryCta: "عرض التسعير",
    sections: [
      {
        title: "التقاط وحفظ",
        copy: "احفظ التفكير الخام في محرر هادئ يبقى مفيدًا بعد المسودة الأولى.",
        items: ["ملاحظات قائمة على Markdown", "رفع مرفقات صغيرة", "مواد مصدر قابلة للتصدير"],
      },
      {
        title: "استرجاع وإعادة توظيف",
        copy: "اعثر على الأفكار المناسبة بالمعنى ثم حوّل الملاحظة الأصلية إلى زوايا grounded.",
        items: ["استرجاع بالمعنى", "مقاطع سياقية واضحة", "مسودات مرتبطة بالمصدر"],
      },
      {
        title: "نشر وتتبع",
        copy: "انتقل من المسودة إلى LinkedIn مع حالة واضحة وإعادة محاولة ومسار استرداد.",
        items: ["موصل LinkedIn", "نشر فوري", "جدولة مجهزة للخطط المدفوعة"],
      },
    ],
    reliabilityTitle: "مصمم لتشغيل هادئ",
    reliabilityItems: [
      { title: "فرض من الخلفية", copy: "يتم فرض حدود الخطة من الخادم." },
      { title: "نشر غير متزامن", copy: "تتعامل وظائف الخلفية مع مكالمات المنصات غير المستقرة." },
      { title: "محتوى قابل للنقل", copy: "تبقى الملاحظات والمسودات قابلة للتصدير." },
    ],
    ctaTitle: "توقف عن إعادة كتابة ما تعرفه ملاحظاتك بالفعل.",
    ctaCopy: "ابدأ مجانًا وحوّل تفكيرك المحفوظ إلى عمل جاهز للنشر.",
    ctaPrimary: "ابدأ مجانًا",
    ctaSecondary: "تواصل معنا",
  },
};

export default featuresCopy;
