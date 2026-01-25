import { Lang } from "./marketing-shared";

export type HomeCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  heroImageAlt: string;
  heroHighlights: { label: string; value: string }[];
  highlightsTitle: string;
  highlightsLead: string;
  highlights: { title: string; copy: string }[];
  workflowTitle: string;
  workflowLead: string;
  workflowSteps: { title: string; copy: string }[];
  proofTitle: string;
  proofStats: { label: string; value: string }[];
  integrationsTitle: string;
  integrationsLead: string;
  integrations: { name: string; copy: string }[];
  pricingTitle: string;
  pricingLead: string;
  pricingCards: { name: string; price: string; desc: string; items: string[]; cta: string }[];
  finalTitle: string;
  finalCopy: string;
  finalPrimary: string;
  finalSecondary: string;
};

const homeCopy: Record<Lang, HomeCopy> = {
  en: {
    heroKicker: "Semantic-first publishing for solo consultants",
    heroTitle: "Find ideas by meaning. Ship posts without rewrites.",
    heroSub:
      "Noteship turns Markdown notes into LinkedIn and Medium drafts with semantic recall, tone control, and scheduling that stays reliable.",
    primaryCta: "Start free",
    secondaryCta: "Explore pricing",
    heroImage:
      "/annotated%20screenshot%20of%20English%20UI%20%2C%20showing%20publish%20status%20timeline..png",
    heroImageAlt: "English UI showing semantic search and publish timeline",
    heroHighlights: [
      { label: "Drafts in", value: "<5 min" },
      { label: "Supported platforms", value: "LinkedIn + Medium" },
      { label: "Storage", value: "Markdown in S3" },
    ],
    highlightsTitle: "Everything stays searchable, portable, and on-brand",
    highlightsLead:
      "Capture once, reuse forever. Noteship keeps your archive clean and ready to publish.",
    highlights: [
      {
        title: "Semantic memory",
        copy: "Search by intent, not keywords. Embeddings refresh on every save.",
      },
      {
        title: "Voice-preserving drafts",
        copy: "Drafts keep your tone and format. No more rewriting from scratch.",
      },
      {
        title: "Reliable scheduling",
        copy: "Async publishing with retries and clear status updates.",
      },
    ],
    workflowTitle: "A workflow built for real consulting work",
    workflowLead: "From note to post, each step is designed to stay fast and predictable.",
    workflowSteps: [
      { title: "Capture once", copy: "Write in a calm editor and save to Markdown automatically." },
      {
        title: "Search by meaning",
        copy: "Find any idea using semantic recall across your notes.",
      },
      { title: "Generate drafts", copy: "Draft posts that keep your voice and structure." },
      {
        title: "Publish with confidence",
        copy: "Schedule or publish instantly with reliable retries.",
      },
    ],
    proofTitle: "Designed for consistency, not chaos",
    proofStats: [
      { label: "Average time to first draft", value: "4 min" },
      { label: "Retries handled automatically", value: "Built-in" },
      { label: "Export format", value: "Markdown" },
    ],
    integrationsTitle: "Integrations that keep you in flow",
    integrationsLead: "Start with the platforms that matter most for independent consultants.",
    integrations: [
      { name: "LinkedIn", copy: "Publish drafts, schedule with retries, and track status." },
      { name: "Medium", copy: "Ship long-form posts without changing your workflow." },
    ],
    pricingTitle: "Simple pricing that scales with your output",
    pricingLead: "Start free, then upgrade once scheduling and higher AI limits matter.",
    pricingCards: [
      {
        name: "Free",
        price: "Starter",
        desc: "For capturing ideas and drafting on your own schedule.",
        items: ["Semantic search", "Markdown export", "AI drafts (low quota)", "Manual publish"],
        cta: "Start free",
      },
      {
        name: "Pro",
        price: "$18/mo",
        desc: "For consultants who publish regularly and need reliability.",
        items: ["Higher AI drafts", "Scheduling", "Retries + status", "More notes & storage"],
        cta: "Upgrade to Pro",
      },
    ],
    finalTitle: "Ready to ship your ideas?",
    finalCopy: "Turn your knowledge base into a steady publishing pipeline.",
    finalPrimary: "Start free",
    finalSecondary: "See pricing",
  },
  ar: {
    heroKicker: "نشر دلالي للمستشارين المستقلين",
    heroTitle: "اعثر على الأفكار بالمعنى. انشر من دون إعادة كتابة.",
    heroSub:
      "نوتشِب يحول ملاحظات Markdown إلى مسودات لينكدإن وميديوم مع بحث دلالي، تحكم في النبرة، وجدولة موثوقة.",
    primaryCta: "ابدأ مجاناً",
    secondaryCta: "استعرض الأسعار",
    heroImage:
      "/%D9%84%D9%82%D8%B7%D8%A9%20%D9%86%D8%B8%D9%8A%D9%81%D8%A9%20%D9%84%D9%88%D8%A7%D8%AC%D9%87%D8%A9%20%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9%20%D9%85%D8%B9%20%D9%86%D8%AA%D8%A7%D8%A6%D8%AC%20%D8%A8%D8%AD%D8%AB%20%D8%AF%D9%84%D8%A7%D9%84%D9%8A%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%8A%D9%85%D9%8A%D9%86%20%D9%88%D9%85%D8%B3%D9%88%D8%AF%D8%A9%20%D9%84%D9%8A%D9%86%D9%83%D8%AF%D8%A5%D9%86%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%8A%D8%B3%D8%A7%D8%B1%20(%D9%88%D8%A7%D8%AC%D9%87%D8%A9%20RTL)..png",
    heroImageAlt: "واجهة عربية مع بحث دلالي ومسودة جاهزة للنشر",
    heroHighlights: [
      { label: "زمن أول مسودة", value: "أقل من ٥ دقائق" },
      { label: "المنصات المدعومة", value: "لينكدإن + ميديوم" },
      { label: "التخزين", value: "Markdown على S3" },
    ],
    highlightsTitle: "أفكارك تبقى قابلة للبحث والنقل وعلى أسلوبك",
    highlightsLead: "دوّن مرة واحدة، ثم أعِد الاستخدام بلا فوضى.",
    highlights: [
      {
        title: "ذاكرة دلالية",
        copy: "ابحث بالمعنى لا بالكلمات المفتاحية، مع تحديث تلقائي بعد كل تعديل.",
      },
      {
        title: "مسودات على صوتك",
        copy: "النبرة والشكل يبقيان كما هما—لا إعادة كتابة متعبة.",
      },
      {
        title: "جدولة موثوقة",
        copy: "نشر غير متزامن مع محاولات إعادة وحالات واضحة.",
      },
    ],
    workflowTitle: "مسار عمل واقعي للمستشارين",
    workflowLead: "من الفكرة إلى المنشور بخطوات واضحة وسريعة.",
    workflowSteps: [
      { title: "التقاط مرة واحدة", copy: "اكتب في محرر هادئ مع حفظ تلقائي إلى Markdown." },
      { title: "بحث بالمعنى", copy: "اعثر على أي فكرة عبر استدعاء دلالي." },
      { title: "توليد مسودات", copy: "مسودات تحفظ أسلوبك وبنيتك." },
      { title: "نشر بثقة", copy: "جدولة أو نشر فوري مع محاولات إعادة تلقائية." },
    ],
    proofTitle: "مصمم للثبات وليس للفوضى",
    proofStats: [
      { label: "متوسط زمن أول مسودة", value: "٤ دقائق" },
      { label: "محاولات إعادة تلقائية", value: "مدمجة" },
      { label: "صيغة التصدير", value: "Markdown" },
    ],
    integrationsTitle: "اندماجات تبقيك في التدفق",
    integrationsLead: "ابدأ بالمنصات الأكثر أهمية للمستشارين المستقلين.",
    integrations: [
      { name: "لينكدإن", copy: "نشر وجدولة مع حالات واضحة ومحاولات إعادة." },
      { name: "ميديوم", copy: "انشر مقالات طويلة من دون تغيير مسارك." },
    ],
    pricingTitle: "أسعار بسيطة تتوسع مع إنتاجك",
    pricingLead: "ابدأ مجاناً ثم طوّر عندما تحتاج الجدولة وحدوداً أعلى.",
    pricingCards: [
      {
        name: "مجاني",
        price: "Starter",
        desc: "لالتقاط الأفكار وصياغة المسودات على وقتك.",
        items: ["بحث دلالي", "تصدير Markdown", "حصص مسودات منخفضة", "نشر يدوي"],
        cta: "ابدأ مجاناً",
      },
      {
        name: "برو",
        price: "$18 / شهر",
        desc: "لمن ينشر بانتظام ويحتاج إلى موثوقية أعلى.",
        items: ["حصص مسودات أعلى", "جدولة", "محاولات إعادة + حالات", "ملاحظات وتخزين أكثر"],
        cta: "الترقية إلى برو",
      },
    ],
    finalTitle: "جاهز لشحن أفكارك؟",
    finalCopy: "حوّل قاعدة معرفتك إلى خط نشر ثابت.",
    finalPrimary: "ابدأ مجاناً",
    finalSecondary: "الأسعار",
  },
};

export default homeCopy;
