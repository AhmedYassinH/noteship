import { Lang } from "./marketing-shared";

export type HomeCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  heroPrimary: string;
  heroSecondary: string;
  proof: string[];
  visual: {
    recallLabel: string;
    recallTitle: string;
    draftLabel: string;
    draftCopy: string;
    metricDrafts: string;
    metricDraftsValue: string;
    metricRecall: string;
    metricRecallValue: string;
    publish: string;
  };
  strip: { value: string; label: string }[];
  workflowEyebrow: string;
  workflowTitle: string;
  workflowLead: string;
  workflowSteps: { number: string; title: string; copy: string }[];
  launchEyebrow: string;
  launchTitle: string;
  launchLead: string;
  launchItems: { value: string; label: string }[];
  trustEyebrow: string;
  trustTitle: string;
  trustItems: { title: string; copy: string }[];
  pricing: {
    freeBadge: string;
    freeTitle: string;
    freeCopy: string;
    freePrice: string;
    freeCta: string;
    proBadge: string;
    proTitle: string;
    proCopy: string;
    proPrice: string;
    proCta: string;
  };
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalEyebrow: string;
  finalTitle: string;
  finalCta: string;
};

const homeCopy: Record<Lang, HomeCopy> = {
  en: {
    heroEyebrow: "Free launch is open",
    heroTitle: "Your publishing partner",
    heroLead:
      "Noteship turns your notes into a living publishing system: capture ideas, recall them by meaning, generate LinkedIn drafts, and keep momentum without rewriting from scratch.",
    heroPrimary: "Start free",
    heroSecondary: "See workflow",
    proof: ["Free plan by default", "LinkedIn now", "Export anytime"],
    visual: {
      recallLabel: "Recall match",
      recallTitle: "Pricing objections from client calls",
      draftLabel: "LinkedIn draft",
      draftCopy:
        "Your best post is usually already in your notes. The system should find it before you rewrite it.",
      metricDrafts: "Drafts",
      metricDraftsValue: "Ready",
      metricRecall: "Recall",
      metricRecallValue: "Fast",
      publish: "Publish now",
    },
    strip: [
      { value: "Free", label: "Start with the launch plan" },
      { value: "Draft", label: "Turn notes into LinkedIn posts" },
      { value: "Own", label: "Export your notes anytime" },
    ],
    workflowEyebrow: "Workflow",
    workflowTitle: "Five moves from raw thought to published post.",
    workflowLead:
      "The product should feel like forward motion, not a records system. Every step takes you closer to output.",
    workflowSteps: [
      { number: "01", title: "Capture", copy: "Drop in rough notes, ideas, and references." },
      { number: "02", title: "Recall", copy: "Search by meaning when exact words are gone." },
      { number: "03", title: "Draft", copy: "Generate posts grounded in the source note." },
      {
        number: "04",
        title: "Shape",
        copy: "Edit tone, language, and structure before publishing.",
      },
      { number: "05", title: "Ship", copy: "Publish to LinkedIn with clear state and recovery." },
    ],
    launchEyebrow: "Launch plan",
    launchTitle: "A real workspace, free while paid plans are prepared.",
    launchLead:
      "Start building your knowledge base, generate a focused number of drafts, publish to LinkedIn, and keep ownership of your notes from day one.",
    launchItems: [
      { value: "Write", label: "Capture and organize notes" },
      { value: "Recall", label: "Find ideas by meaning" },
      { value: "Draft", label: "Generate LinkedIn-ready angles" },
      { value: "Ship", label: "Publish when the draft is ready" },
    ],
    trustEyebrow: "Trust",
    trustTitle: "Private by default. Portable by design.",
    trustItems: [
      {
        title: "Scoped content access",
        copy: "User content is separated by identity and served through controlled content sessions.",
      },
      {
        title: "Backend enforcement",
        copy: "Plan limits live on the backend, so the web UI cannot become the source of truth.",
      },
      {
        title: "No lock-in posture",
        copy: "Notes and drafts stay exportable as the product grows.",
      },
    ],
    pricing: {
      freeBadge: "Live now",
      freeTitle: "Free",
      freeCopy: "For public launch, every new user starts here.",
      freePrice: "$0",
      freeCta: "Start free",
      proBadge: "Coming soon",
      proTitle: "Pro",
      proCopy: "Higher quotas, scheduling, and expanded storage when billing opens.",
      proPrice: "$18",
      proCta: "Coming soon",
    },
    faqTitle: "FAQ",
    faq: [
      {
        q: "Which integrations are available now?",
        a: "LinkedIn is available now, with more integrations planned over time.",
      },
      {
        q: "Can I move my data out later?",
        a: "Yes. Notes and drafts remain exportable.",
      },
      {
        q: "Can I publish in Arabic or other RTL languages?",
        a: "Yes. Noteship keeps the interface and publishing workflow RTL-aware.",
      },
    ],
    finalEyebrow: "Start with what you already know",
    finalTitle: "Your next post is probably buried in yesterday's notes.",
    finalCta: "Start free",
  },
  ar: {
    heroEyebrow: "الإطلاق المجاني مفتوح",
    heroTitle: "شريكك في النشر",
    heroLead:
      "يحوّل Noteship ملاحظاتك إلى نظام نشر حي: التقط الأفكار، واسترجعها بالمعنى، وأنشئ مسودات LinkedIn، وحافظ على الزخم دون إعادة الكتابة من الصفر.",
    heroPrimary: "ابدأ مجانًا",
    heroSecondary: "شاهد سير العمل",
    proof: ["الخطة المجانية افتراضيًا", "LinkedIn الآن", "تصدير في أي وقت"],
    visual: {
      recallLabel: "نتيجة استرجاع",
      recallTitle: "اعتراضات التسعير من مكالمات العملاء",
      draftLabel: "مسودة LinkedIn",
      draftCopy:
        "أفضل منشور لديك غالبًا موجود داخل ملاحظاتك. يجب أن يجده النظام قبل أن تعيد كتابته.",
      metricDrafts: "المسودات",
      metricDraftsValue: "جاهزة",
      metricRecall: "الاسترجاع",
      metricRecallValue: "سريع",
      publish: "انشر الآن",
    },
    strip: [
      { value: "مجاني", label: "ابدأ بخطة الإطلاق" },
      { value: "صياغة", label: "حوّل الملاحظات إلى منشورات LinkedIn" },
      { value: "امتلاك", label: "صدّر ملاحظاتك في أي وقت" },
    ],
    workflowEyebrow: "سير العمل",
    workflowTitle: "خمس خطوات من فكرة خام إلى منشور.",
    workflowLead:
      "يجب أن يشعر المنتج بالحركة إلى الأمام، لا كنظام سجلات. كل خطوة تقربك من المخرج النهائي.",
    workflowSteps: [
      { number: "01", title: "التقاط", copy: "أضف الملاحظات الخام والأفكار والمراجع." },
      { number: "02", title: "استرجاع", copy: "ابحث بالمعنى عندما تختفي الكلمات الدقيقة." },
      { number: "03", title: "صياغة", copy: "أنشئ منشورات مرتبطة بالملاحظة الأصلية." },
      { number: "04", title: "تشكيل", copy: "عدّل النبرة واللغة والبنية قبل النشر." },
      { number: "05", title: "نشر", copy: "انشر إلى LinkedIn مع حالة واضحة ومسار استرداد." },
    ],
    launchEyebrow: "خطة الإطلاق",
    launchTitle: "مساحة عمل حقيقية ومجانية بينما نجهز الخطط المدفوعة.",
    launchLead:
      "ابدأ ببناء قاعدة معرفتك، وأنشئ عددًا مركزًا من المسودات، وانشر إلى LinkedIn، واحتفظ بملكية ملاحظاتك من اليوم الأول.",
    launchItems: [
      { value: "اكتب", label: "التقط الملاحظات ونظمها" },
      { value: "استرجع", label: "اعثر على الأفكار بالمعنى" },
      { value: "صغ", label: "أنشئ زوايا جاهزة لـ LinkedIn" },
      { value: "انشر", label: "انشر عندما تصبح المسودة جاهزة" },
    ],
    trustEyebrow: "الثقة",
    trustTitle: "خصوصية افتراضية. وقابلية نقل من البداية.",
    trustItems: [
      {
        title: "وصول محتوى محدود",
        copy: "يتم فصل محتوى المستخدمين حسب الهوية وتقديمه عبر جلسات محتوى مضبوطة.",
      },
      {
        title: "فرض من الخلفية",
        copy: "حدود الخطة تعيش في الخلفية، لذلك لا تصبح واجهة الويب مصدر الحقيقة.",
      },
      {
        title: "لا احتجاز",
        copy: "تبقى الملاحظات والمسودات قابلة للتصدير مع نمو المنتج.",
      },
    ],
    pricing: {
      freeBadge: "متاح الآن",
      freeTitle: "مجاني",
      freeCopy: "في الإطلاق العام، يبدأ كل مستخدم جديد هنا.",
      freePrice: "$0",
      freeCta: "ابدأ مجانًا",
      proBadge: "قريبًا",
      proTitle: "Pro",
      proCopy: "حصص أعلى، وجدولة، وتخزين أوسع عند فتح الفوترة.",
      proPrice: "$18",
      proCta: "قريبًا",
    },
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {
        q: "ما التكاملات المتاحة الآن؟",
        a: "LinkedIn متاح الآن، ومع الوقت ستتوسع التغطية إلى تكاملات إضافية.",
      },
      {
        q: "هل أستطيع نقل بياناتي لاحقًا؟",
        a: "نعم. الملاحظات والمسودات قابلة للتصدير.",
      },
      {
        q: "هل يمكنني النشر بالعربية أو بلغات RTL؟",
        a: "نعم. يحافظ Noteship على واجهة وسير نشر متوافقين مع RTL.",
      },
    ],
    finalEyebrow: "ابدأ بما تعرفه بالفعل",
    finalTitle: "منشورك القادم غالبًا مدفون في ملاحظات الأمس.",
    finalCta: "ابدأ مجانًا",
  },
};

export default homeCopy;
