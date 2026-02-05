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
  waitlistTitle: string;
  waitlistKicker: string;
  waitlistLead: string;
  waitlistNote: string;
  waitlistEmailLabel: string;
  waitlistEmailPlaceholder: string;
  waitlistCta: string;
  waitlistCtaLoading: string;
  waitlistSuccessTitle: string;
  waitlistSuccessCopy: string;
  waitlistErrorCopy: string;
};

const homeCopy: Record<Lang, HomeCopy> = {
  en: {
    heroKicker: "Recall by meaning for solo consultants",
    heroTitle: "Find ideas by meaning. Ship posts without rewrites.",
    heroSub:
      "Noteship turns your notes into LinkedIn and Medium drafts with meaning-based recall, calm editing, and simple scheduling.",
    primaryCta: "Join the waitlist",
    secondaryCta: "Get updates",
    heroImage: "/hero_en.png",
    heroImageAlt: "English UI showing recall and publish timeline",
    heroHighlights: [
      { label: "Drafts in", value: "<5 min" },
      { label: "Supported platforms", value: "LinkedIn + Medium" },
      { label: "Export", value: "Anytime" },
    ],
    highlightsTitle: "Everything stays searchable, portable, and on-brand",
    highlightsLead: "Capture once, reuse forever. Noteship keeps your archive ready to publish.",
    highlights: [
      {
        title: "Meaning-based recall",
        copy: "Find ideas by meaning, even when you forget the exact wording.",
      },
      {
        title: "Voice-preserving drafts",
        copy: "Drafts keep your tone and structure. No more rewriting from scratch.",
      },
      {
        title: "Reliable publishing",
        copy: "Clear scheduling and status updates for consistent shipping.",
      },
    ],
    workflowTitle: "A workflow built for real consulting work",
    workflowLead: "From note to post, each step stays fast and predictable.",
    workflowSteps: [
      { title: "Capture once", copy: "Write in a calm editor and keep notes organized." },
      {
        title: "Recall by meaning",
        copy: "Find any idea using meaning-based recall across your notes.",
      },
      { title: "Generate drafts", copy: "Draft posts that keep your voice and structure." },
      {
        title: "Publish with confidence",
        copy: "Schedule or publish instantly with clear status.",
      },
    ],
    proofTitle: "Designed for consistency, not chaos",
    proofStats: [
      { label: "Average time to first draft", value: "4 min" },
      { label: "Scheduling", value: "Built-in" },
      { label: "Export", value: "Anytime" },
    ],
    integrationsTitle: "Integrations that keep you in flow",
    integrationsLead: "Start with the platforms that matter most for independent consultants.",
    integrations: [
      { name: "LinkedIn", copy: "Publish drafts, schedule posts, and track status." },
      { name: "Medium", copy: "Ship long-form posts without changing your workflow." },
    ],
    pricingTitle: "Simple pricing that scales with your output",
    pricingLead: "Start free, then upgrade once scheduling and higher AI limits matter.",
    pricingCards: [
      {
        name: "Free",
        price: "Starter",
        desc: "For capturing ideas and drafting on your own schedule.",
        items: ["Recall by meaning", "Export anytime", "AI drafts (low quota)", "Manual publish"],
        cta: "Join the waitlist",
      },
      {
        name: "Pro",
        price: "$18/mo",
        desc: "For consultants who publish regularly and need consistency.",
        items: ["Higher AI drafts", "Scheduling", "Clear status", "More notes & storage"],
        cta: "Join the waitlist",
      },
    ],
    finalTitle: "Ready to ship your ideas?",
    finalCopy: "Recall by meaning, draft fast, and publish with consistency.",
    finalPrimary: "Join the waitlist",
    finalSecondary: "Get updates",
    waitlistTitle: "Join the Noteship waitlist",
    waitlistKicker: "Early access",
    waitlistLead: "Be first to know when early access opens. We'll keep it short and practical.",
    waitlistNote: "No spam. Unsubscribe anytime.",
    waitlistEmailLabel: "Email",
    waitlistEmailPlaceholder: "you@company.com",
    waitlistCta: "Join the waitlist",
    waitlistCtaLoading: "Joining...",
    waitlistSuccessTitle: "You're on the list",
    waitlistSuccessCopy: "Thanks for joining. We'll reach out as soon as early access opens.",
    waitlistErrorCopy: "Something went wrong. Please try again.",
  },
  ar: {
    heroKicker: "استرجاع بالمعنى للمستشارين المستقلين",
    heroTitle: "اعثر على الأفكار بالمعنى. انشر دون إعادة كتابة.",
    heroSub:
      "يحوّل Noteship ملاحظاتك إلى مسودات جاهزة لـ LinkedIn و Medium مع استرجاع بالمعنى، تحرير هادئ، وجدولة بسيطة.",
    primaryCta: "انضم إلى القائمة",
    secondaryCta: "تابع التحديثات",
    heroImage: "/hero_ar.png",
    heroImageAlt: "واجهة عربية مع الاسترجاع بالمعنى وخط النشر",
    heroHighlights: [
      { label: "الوقت لأول مسودة", value: "<5 دقائق" },
      { label: "المنصات المدعومة", value: "LinkedIn و Medium" },
      { label: "التصدير", value: "في أي وقت" },
    ],
    highlightsTitle: "كل شيء يبقى قابلاً للبحث والنقل وبصوتك",
    highlightsLead: "التقط مرة واحدة، وعاود الاستخدام دائماً.",
    highlights: [
      {
        title: "استرجاع بالمعنى",
        copy: "اعثر على الأفكار بالمعنى حتى لو نسيت الصياغة.",
      },
      {
        title: "مسودات تحفظ صوتك",
        copy: "المسودات تحافظ على أسلوبك وبنيتك دون إعادة كتابة.",
      },
      {
        title: "نشر موثوق",
        copy: "جدولة واضحة وتحديثات حالة للنشر المنتظم.",
      },
    ],
    workflowTitle: "سير عمل مبني لواقع الاستشارات",
    workflowLead: "من الملاحظة إلى المنشور بخطوات سريعة وواضحة.",
    workflowSteps: [
      { title: "التقط مرة واحدة", copy: "اكتب في محرر هادئ واحتفظ بالملاحظات منظمة." },
      { title: "استرجع بالمعنى", copy: "اعثر على أي فكرة بالمعنى عبر ملاحظاتك." },
      { title: "ولّد المسودات", copy: "اكتب مسودات تحافظ على صوتك وبنيتك." },
      { title: "انشر بثقة", copy: "جدّل أو انشر فوراً مع حالة واضحة." },
    ],
    proofTitle: "مصمم للثبات لا للفوضى",
    proofStats: [
      { label: "متوسط وقت أول مسودة", value: "4 دقائق" },
      { label: "الجدولة", value: "مدمجة" },
      { label: "التصدير", value: "في أي وقت" },
    ],
    integrationsTitle: "تكاملات تبقيك في تدفق العمل",
    integrationsLead: "ابدأ بالمنصات الأكثر أهمية للمستشارين المستقلين.",
    integrations: [
      { name: "LinkedIn", copy: "انشر المسودات، وجدّل المنشورات، وتتبع الحالة." },
      { name: "Medium", copy: "انشر المقالات الطويلة دون تغيير سير العمل." },
    ],
    pricingTitle: "تسعير بسيط يتسع لإنتاجك",
    pricingLead: "ابدأ مجاناً ثم رقِّ عندما تصبح الجدولة وحدود الذكاء الاصطناعي مهمة.",
    pricingCards: [
      {
        name: "مجاني",
        price: "مبدئي",
        desc: "لالتقاط الأفكار وصياغة المسودات وفق جدولك.",
        items: [
          "استرجاع بالمعنى",
          "تصدير في أي وقت",
          "مسودات بالذكاء الاصطناعي (حصة منخفضة)",
          "نشر يدوي",
        ],
        cta: "انضم إلى القائمة",
      },
      {
        name: "Pro",
        price: "$18 / شهر",
        desc: "لمن ينشر بانتظام ويحتاج إلى ثبات.",
        items: ["مسودات أكثر بالذكاء الاصطناعي", "جدولة", "حالة واضحة", "ملاحظات وتخزين أكثر"],
        cta: "انضم إلى القائمة",
      },
    ],
    finalTitle: "جاهز لنشر أفكارك؟",
    finalCopy: "استرجع بالمعنى، اكتب بسرعة، وانشر بثبات.",
    finalPrimary: "انضم إلى القائمة",
    finalSecondary: "تابع التحديثات",
    waitlistTitle: "انضم إلى قائمة الانتظار",
    waitlistKicker: "الوصول المبكر",
    waitlistLead: "كن أول من يعرف عند فتح الوصول المبكر. رسائل قصيرة وواضحة.",
    waitlistNote: "لا رسائل مزعجة. يمكنك الإلغاء في أي وقت.",
    waitlistEmailLabel: "البريد الإلكتروني",
    waitlistEmailPlaceholder: "you@example.com",
    waitlistCta: "انضم إلى القائمة",
    waitlistCtaLoading: "جارٍ الإرسال...",
    waitlistSuccessTitle: "تم تسجيلك",
    waitlistSuccessCopy: "شكراً لانضمامك. سنراسلك عند فتح الوصول المبكر.",
    waitlistErrorCopy: "حدث خطأ. حاول مرة أخرى.",
  },
};

export default homeCopy;
