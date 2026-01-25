import { Lang } from "./marketing-shared";

export type FeaturesCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  pillarsTitle: string;
  pillarsLead: string;
  pillars: { title: string; copy: string }[];
  deepDiveTitle: string;
  deepDiveLead: string;
  deepDive: { title: string; copy: string; items: string[] }[];
  workflowTitle: string;
  workflowSteps: { title: string; copy: string }[];
  reliabilityTitle: string;
  reliabilityLead: string;
  reliabilityItems: { title: string; copy: string }[];
  aboutTitle: string;
  aboutCopy: string;
  ctaTitle: string;
  ctaCopy: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const featuresCopy: Record<Lang, FeaturesCopy> = {
  en: {
    heroKicker: "Features",
    heroTitle: "Your knowledge base, now a publishing engine.",
    heroSub:
      "Noteship keeps everything in Markdown, layers semantic search on top, and delivers drafts that match your voice.",
    primaryCta: "Start free",
    secondaryCta: "See pricing",
    pillarsTitle: "Core capabilities",
    pillarsLead: "Everything you need to go from idea to publish-ready post.",
    pillars: [
      {
        title: "Semantic recall",
        copy: "Search across notes by meaning, not keywords. Embeddings refresh automatically.",
      },
      {
        title: "Drafts in your tone",
        copy: "Generate drafts with voice controls that keep style and structure intact.",
      },
      {
        title: "Scheduling that sticks",
        copy: "Async publishing with retries, clear states, and a clean timeline.",
      },
      {
        title: "Portable Markdown",
        copy: "Your canonical content stays in Markdown for easy export and future-proofing.",
      },
    ],
    deepDiveTitle: "Deeper feature set",
    deepDiveLead: "Built for consultants who publish consistently and can’t afford chaos.",
    deepDive: [
      {
        title: "Semantic search pipeline",
        copy: "Keep your memory system sharp even as notes grow.",
        items: [
          "Automatic embeddings on every save",
          "Meaning-first search across your archive",
          "Filters by recency and project context",
        ],
      },
      {
        title: "Draft workflow",
        copy: "From note to publish-ready copy without losing your voice.",
        items: [
          "Tone and persona controls",
          "Draft variants for different audiences",
          "One-click publish or schedule",
        ],
      },
      {
        title: "Publishing reliability",
        copy: "Ship consistently with a resilient async pipeline.",
        items: [
          "Retries with transparent status",
          "Clear failure states and recovery",
          "Built-in audit trail for posts",
        ],
      },
    ],
    workflowTitle: "How it works",
    workflowSteps: [
      { title: "Capture", copy: "Write in TipTap and save to Markdown automatically." },
      { title: "Index", copy: "Semantic embeddings keep search fresh after each edit." },
      { title: "Draft", copy: "Generate posts with your tone and preferred structure." },
      { title: "Publish", copy: "Schedule or publish instantly with retries and logs." },
    ],
    reliabilityTitle: "Reliability baked in",
    reliabilityLead: "Noteship is designed as an async-first pipeline.",
    reliabilityItems: [
      { title: "Retries + DLQ", copy: "Failed publishes are retried automatically and tracked." },
      { title: "Clear status timeline", copy: "Know what’s queued, scheduled, or published." },
      {
        title: "Server-side enforcement",
        copy: "Entitlements and limits are enforced by the API.",
      },
    ],
    aboutTitle: "About Noteship",
    aboutCopy:
      "Noteship is built for independent consultants who publish often, care about their voice, and need reliability without tooling sprawl.",
    ctaTitle: "Bring your ideas to the surface",
    ctaCopy: "Keep everything searchable, draft fast, and publish on your cadence.",
    ctaPrimary: "Start free",
    ctaSecondary: "View pricing",
  },
  ar: {
    heroKicker: "الميزات",
    heroTitle: "قاعدة المعرفة تتحول إلى محرك نشر.",
    heroSub: "نوتشِب يحفظ كل شيء في Markdown، ويضيف بحثاً دلالياً، ويولّد مسودات تحافظ على أسلوبك.",
    primaryCta: "ابدأ مجاناً",
    secondaryCta: "الأسعار",
    pillarsTitle: "القدرات الأساسية",
    pillarsLead: "كل ما تحتاجه للانتقال من الفكرة إلى منشور جاهز للنشر.",
    pillars: [
      {
        title: "استدعاء دلالي",
        copy: "ابحث في الملاحظات بالمعنى، مع تحديث تلقائي بعد كل تعديل.",
      },
      {
        title: "مسودات على نبرتك",
        copy: "توليد مسودات تحافظ على الأسلوب والبنية.",
      },
      {
        title: "جدولة ثابتة",
        copy: "نشر غير متزامن مع حالات واضحة ومحاولات إعادة.",
      },
      {
        title: "Markdown قابل للنقل",
        copy: "المحتوى الأساسي يبقى في Markdown لتصدير سهل.",
      },
    ],
    deepDiveTitle: "تفاصيل أكثر",
    deepDiveLead: "مصمم للمستشارين الذين ينشرون باستمرار ولا يحتملون الفوضى.",
    deepDive: [
      {
        title: "خط بحث دلالي",
        copy: "ذاكرة منظمة حتى مع تزايد الأرشيف.",
        items: [
          "تضمينات تلقائية مع كل حفظ",
          "بحث بالمعنى عبر الأرشيف",
          "فلترة حسب الحداثة والسياق",
        ],
      },
      {
        title: "مسار المسودات",
        copy: "من الملاحظة إلى نص قابل للنشر دون فقدان الصوت.",
        items: ["تحكم في النبرة والشخصية", "نسخ متعددة للجمهور", "نشر أو جدولة بضغطة واحدة"],
      },
      {
        title: "موثوقية النشر",
        copy: "نشر متسق عبر خط غير متزامن.",
        items: ["محاولات إعادة مع حالة واضحة", "حالات فشل قابلة للاسترداد", "سجل واضح للمنشورات"],
      },
    ],
    workflowTitle: "كيف يعمل",
    workflowSteps: [
      { title: "التقاط", copy: "اكتب في TipTap مع حفظ تلقائي إلى Markdown." },
      { title: "فهرسة", copy: "تحديث دلالي تلقائي بعد كل تعديل." },
      { title: "صياغة", copy: "مسودات بنبرتك وبنيتك المفضلة." },
      { title: "نشر", copy: "جدولة أو نشر فوري مع محاولات إعادة." },
    ],
    reliabilityTitle: "موثوقية مدمجة",
    reliabilityLead: "نوتشِب مبني كخط غير متزامن من البداية.",
    reliabilityItems: [
      { title: "إعادة المحاولة + DLQ", copy: "إعادة تلقائية وتتبع واضح للفشل." },
      { title: "خط زمني للحالات", copy: "تعرف ما هو مُجدول أو منشور." },
      { title: "فرض على الخادم", copy: "الحدود والاستحقاقات تفرض عبر الـ API." },
    ],
    aboutTitle: "حول نوتشِب",
    aboutCopy:
      "نوتشِب مبني للمستشارين المستقلين الذين ينشرون باستمرار ويهتمون بأسلوبهم وموثوقية النشر.",
    ctaTitle: "أبرز أفكارك للعلن",
    ctaCopy: "احتفظ بكل شيء قابلاً للبحث، صغ بسرعة، وانشر بإيقاعك.",
    ctaPrimary: "ابدأ مجاناً",
    ctaSecondary: "الأسعار",
  },
};

export default featuresCopy;
