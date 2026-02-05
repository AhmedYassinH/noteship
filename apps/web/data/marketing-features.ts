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
    heroTitle: "Your ideas, now ready to ship.",
    heroSub:
      "Noteship keeps your notes recallable by meaning and turns them into drafts that match your voice.",
    primaryCta: "Join the waitlist",
    secondaryCta: "Get updates",
    pillarsTitle: "Core capabilities",
    pillarsLead: "Everything you need to go from idea to publish-ready post.",
    pillars: [
      {
        title: "Meaning-based recall",
        copy: "Find notes by meaning, not keywords.",
      },
      {
        title: "Drafts in your voice",
        copy: "Generate drafts that keep your tone and structure.",
      },
      {
        title: "Consistent publishing",
        copy: "Schedule and publish with clear status.",
      },
      {
        title: "Portable notes",
        copy: "Export your notes anytime without lock-in.",
      },
    ],
    deepDiveTitle: "Deeper feature set",
    deepDiveLead: "Built for consultants who publish consistently and can’t afford chaos.",
    deepDive: [
      {
        title: "Recall by meaning",
        copy: "Keep your memory system sharp as your notes grow.",
        items: [
          "Updates after every edit",
          "Meaning-first recall across your archive",
          "Filters by recency and context",
        ],
      },
      {
        title: "Draft workflow",
        copy: "From note to publish-ready copy without losing your voice.",
        items: [
          "Tone and persona controls",
          "Draft variants for different audiences",
          "Publish now or schedule",
        ],
      },
      {
        title: "Publishing clarity",
        copy: "Ship consistently with visibility you can trust.",
        items: ["Clear status timeline", "Safe scheduling", "Failure visibility and recovery"],
      },
    ],
    workflowTitle: "How it works",
    workflowSteps: [
      { title: "Capture", copy: "Write once and keep notes organized." },
      { title: "Recall", copy: "Find ideas by meaning when wording is fuzzy." },
      { title: "Draft", copy: "Generate posts with your tone and structure." },
      { title: "Publish", copy: "Schedule or publish instantly with clear status." },
    ],
    reliabilityTitle: "Publishing you can trust",
    reliabilityLead: "Designed for consistent output with clear status and control.",
    reliabilityItems: [
      { title: "Clear status", copy: "See what’s drafted, scheduled, or published." },
      { title: "Scheduling you control", copy: "Edit or cancel scheduled posts with ease." },
      { title: "Plan awareness", copy: "See what’s included in your plan at a glance." },
    ],
    aboutTitle: "About Noteship",
    aboutCopy:
      "Noteship is built for independent consultants who publish often, care about their voice, and need clarity without tooling sprawl.",
    ctaTitle: "Bring your ideas to the surface",
    ctaCopy: "Keep everything recallable, draft fast, and publish on your cadence.",
    ctaPrimary: "Join the waitlist",
    ctaSecondary: "Get updates",
  },
  ar: {
    heroKicker: "المزايا",
    heroTitle: "أفكارك جاهزة للنشر.",
    heroSub: "يجعل Noteship ملاحظاتك قابلة للاسترجاع بالمعنى ويحوّلها إلى مسودات بصوتك.",
    primaryCta: "انضم إلى قائمة الانتظار",
    secondaryCta: "تابع التحديثات",
    pillarsTitle: "القدرات الأساسية",
    pillarsLead: "كل ما تحتاجه للانتقال من فكرة إلى منشور جاهز للنشر.",
    pillars: [
      {
        title: "استرجاع بالمعنى",
        copy: "اعثر على الملاحظات بالمعنى لا الكلمات.",
      },
      {
        title: "مسودات بصوتك",
        copy: "ولّد مسودات تحافظ على أسلوبك وبنيتك.",
      },
      {
        title: "نشر منتظم",
        copy: "جدولة ونشر بحالة واضحة.",
      },
      {
        title: "ملاحظات قابلة للنقل",
        copy: "صدّر ملاحظاتك في أي وقت دون قيود.",
      },
    ],
    deepDiveTitle: "تفاصيل أكثر",
    deepDiveLead: "مبني للمستشارين الذين ينشرون باستمرار ولا يتحملون الفوضى.",
    deepDive: [
      {
        title: "استرجاع بالمعنى",
        copy: "حافظ على ذاكرة أفكارك قوية مع نمو أرشيفك.",
        items: ["تحديث بعد كل تعديل", "استرجاع بالمعنى عبر الأرشيف", "فرز بالزمن والسياق"],
      },
      {
        title: "سير المسودات",
        copy: "من الملاحظة إلى نص جاهز للنشر دون فقدان الصوت.",
        items: ["تحكم بالنبرة والشخصية", "نسخ متعددة للجمهور", "نشر الآن أو جدولة"],
      },
      {
        title: "وضوح النشر",
        copy: "انشر بثبات مع رؤية واضحة يمكنك الاعتماد عليها.",
        items: ["خط حالة واضح", "جدولة آمنة", "وضوح الفشل وإمكانية الاستعادة"],
      },
    ],
    workflowTitle: "كيف يعمل",
    workflowSteps: [
      { title: "التقاط", copy: "اكتب مرة واحدة واحتفظ بالملاحظات منظمة." },
      { title: "استرجاع", copy: "اعثر على الأفكار بالمعنى عندما تغيب الصياغة." },
      { title: "مسودة", copy: "ولّد منشورات بصوتك وبنيتك." },
      { title: "نشر", copy: "جدّل أو انشر فوراً مع حالة واضحة." },
    ],
    reliabilityTitle: "نشر يمكنك الوثوق به",
    reliabilityLead: "مصمم لإنتاج منتظم مع حالة واضحة وتحكم كامل.",
    reliabilityItems: [
      { title: "حالة واضحة", copy: "اعرف ما تم تجهيزه وما تم جدولته وما نُشر." },
      { title: "تحكم بالجدولة", copy: "عدّل أو ألغِ الجدولة بسهولة." },
      { title: "وضوح الخطة", copy: "اعرف ما يتضمنه اشتراكك بسرعة." },
    ],
    aboutTitle: "عن Noteship",
    aboutCopy:
      "Noteship مبني للمستشارين المستقلين الذين ينشرون كثيراً، يهتمون بصوتهم، ويحتاجون إلى وضوح دون تعقيد.",
    ctaTitle: "أخرج أفكارك إلى السطح",
    ctaCopy: "اجعل كل شيء قابلاً للاسترجاع، اكتب بسرعة، وانشر وفق إيقاعك.",
    ctaPrimary: "انضم إلى قائمة الانتظار",
    ctaSecondary: "تابع التحديثات",
  },
};

export default featuresCopy;
