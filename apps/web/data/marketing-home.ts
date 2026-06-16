import { Lang } from "./marketing-shared";

export type HomeCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  heroPrimary: string;
  heroSecondary: string;
  heroTertiary: string;
  heroProof: string[];
  heroImage: string;
  heroImageAlt: string;
  problemTitle: string;
  problemLead: string;
  problemPoints: string[];
  problemQuote: string;
  workflowTitle: string;
  workflowLead: string;
  workflowSteps: { title: string; copy: string }[];
  workflowNote: string;
  pillarsTitle: string;
  pillarsLead: string;
  pillars: { title: string; copy: string; bullets: string[] }[];
  trustTitle: string;
  trustLead: string;
  trustItems: { title: string; copy: string }[];
  pricingTitle: string;
  pricingLead: string;
  pricingCards: { name: string; price: string; desc: string; items: string[]; cta: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalCopy: string;
  finalPrimary: string;
  finalSecondary: string;
};

const homeCopy: Record<Lang, HomeCopy> = {
  en: {
    heroKicker: "Knowledge workflow for consultants and creators",
    heroTitle: "Turn your notes into consistent publishing.",
    heroSub:
      "Noteship helps you capture, preserve, recall, repurpose, and publish without rewriting from scratch.",
    heroPrimary: "Start free",
    heroSecondary: "See how it works",
    heroTertiary: "Review security",
    heroProof: ["Language-flexible workflow", "Expanding integrations", "Export anytime"],
    heroImage: "/hero_en.png",
    heroImageAlt: "Noteship workflow view with recall and draft publishing",
    problemTitle: "Stop rewriting what you already know",
    problemLead:
      "Most consultants lose hours turning old notes into new posts. Context is scattered, drafts drift, and publishing becomes inconsistent.",
    problemPoints: [
      "Ideas are trapped in notebooks, docs, and voice notes.",
      "You remember the concept, not the exact phrase.",
      "Publishing cadence breaks when draft prep takes too long.",
    ],
    problemQuote: "A knowledge system should reduce effort, not create another rewriting loop.",
    workflowTitle: "How it works",
    workflowLead: "One practical flow from rough notes to reliable output.",
    workflowSteps: [
      { title: "Capture", copy: "Collect notes and raw ideas in one calm workspace." },
      { title: "Preserve", copy: "Keep structured records you can revisit anytime." },
      { title: "Recall", copy: "Find the right thought by meaning, not exact wording." },
      { title: "Repurpose", copy: "Transform notes into draft angles for different channels." },
      { title: "Publish", copy: "Ship now or schedule with clear status visibility." },
    ],
    workflowNote:
      "Current connectors include LinkedIn. More integrations are being added over time.",
    pillarsTitle: "Three capability pillars",
    pillarsLead: "Built for experts who publish from lived knowledge.",
    pillars: [
      {
        title: "Recall",
        copy: "Retrieve ideas by intent and context across your archive.",
        bullets: ["Meaning-based retrieval", "Context-rich snippets"],
      },
      {
        title: "Repurpose",
        copy: "Turn one source note into multiple publishing-ready angles.",
        bullets: ["Voice-preserving drafts", "Channel-specific structure"],
      },
      {
        title: "Publish",
        copy: "Move from draft to scheduled or live posts with confidence.",
        bullets: ["Clear posting timeline", "Status and recovery visibility"],
      },
    ],
    trustTitle: "Trust by default",
    trustLead: "Your content should remain private, portable, and reliable.",
    trustItems: [
      {
        title: "Privacy",
        copy: "Content access is scoped per user and routed through secure backend flows.",
      },
      {
        title: "Portability",
        copy: "You can export your notes and drafts anytime without lock-in.",
      },
      {
        title: "Reliability",
        copy: "Async publishing pipeline with status tracking, retries, and failure visibility.",
      },
    ],
    pricingTitle: "Credible pricing for individual operators",
    pricingLead: "Start simple now. Upgrade when scheduling volume and AI limits matter.",
    pricingCards: [
      {
        name: "Free",
        price: "Starter",
        desc: "For solo professionals building a durable knowledge habit.",
        items: ["Capture and preserve notes", "Meaning-based recall", "Low AI draft quota"],
        cta: "Start free",
      },
      {
        name: "Pro",
        price: "$18/mo",
        desc: "For consistent weekly publishing and higher draft throughput.",
        items: ["Higher AI quota", "Scheduling", "Expanded storage"],
        cta: "Start free",
      },
    ],
    faqTitle: "FAQ",
    faq: [
      {
        q: "Which integrations are available now?",
        a: "LinkedIn is available now, and more integrations are rolling out progressively.",
      },
      {
        q: "Can I move my data out later?",
        a: "Yes. Notes and drafts remain exportable.",
      },
      {
        q: "Can I publish in RTL formats?",
        a: "Yes. Noteship supports RTL-ready workflows so Arabic and other RTL content publish cleanly.",
      },
    ],
    finalTitle: "A knowledge system that turns notes into output",
    finalCopy: "Start free and publish consistently from what you already know.",
    finalPrimary: "Start free",
    finalSecondary: "Contact us",
  },
  ar: {
    heroKicker: "سير معرفة للمستشارين وصناع المحتوى",
    heroTitle: "حوّل ملاحظاتك إلى نشر منتظم.",
    heroSub:
      "يساعدك Noteship على الالتقاط والحفظ والاسترجاع وإعادة التوظيف ثم النشر دون إعادة كتابة من الصفر.",
    heroPrimary: "اطلب وصولًا مبكرًا",
    heroSecondary: "شاهد كيف يعمل",
    heroTertiary: "راجع الأمان",
    heroProof: ["سير عمل مرن لغويًا", "تكاملات تتوسع باستمرار", "تصدير في أي وقت"],
    heroImage: "/hero_ar.png",
    heroImageAlt: "واجهة Noteship بالعربية مع الاسترجاع وصياغة المسودات",
    problemTitle: "توقف عن إعادة كتابة ما تعرفه بالفعل",
    problemLead:
      "يخسر كثير من المستشارين ساعات طويلة في تحويل الملاحظات القديمة إلى منشورات جديدة. السياق متفرق، والمسودات تتشتت، وإيقاع النشر يتعطل.",
    problemPoints: [
      "الأفكار موزعة بين دفاتر وملفات وملاحظات صوتية.",
      "تتذكر الفكرة لكن لا تتذكر الصياغة الدقيقة.",
      "وتيرة النشر تنكسر عندما يطول إعداد المسودات.",
    ],
    problemQuote: "نظام المعرفة الجيد يجب أن يقلل الجهد، لا أن يضيف دورة إعادة كتابة جديدة.",
    workflowTitle: "كيف يعمل",
    workflowLead: "تدفق عملي واضح من الملاحظة الخام إلى مخرجات موثوقة.",
    workflowSteps: [
      { title: "التقاط", copy: "اجمع الملاحظات والأفكار الأولية في مساحة هادئة واحدة." },
      { title: "حفظ", copy: "احتفظ بسجل منظم يمكنك الرجوع إليه في أي وقت." },
      { title: "استرجاع", copy: "اعثر على الفكرة بالمعنى لا بالمطابقة الحرفية." },
      { title: "إعادة توظيف", copy: "حوّل الملاحظة إلى زوايا نشر متعددة." },
      { title: "نشر", copy: "انشر فورًا أو جدول مع وضوح كامل للحالة." },
    ],
    workflowNote: "يدعم Noteship حاليًا LinkedIn، مع إضافة تكاملات جديدة تدريجيًا.",
    pillarsTitle: "ثلاث ركائز أساسية",
    pillarsLead: "مصمم للخبراء الذين ينشرون من معرفة متراكمة.",
    pillars: [
      {
        title: "الاسترجاع",
        copy: "استرجع الأفكار حسب المعنى والسياق عبر أرشيفك.",
        bullets: ["استرجاع بالمعنى", "مقاطع سياقية واضحة"],
      },
      {
        title: "إعادة التوظيف",
        copy: "حوّل ملاحظة واحدة إلى أكثر من مسودة جاهزة للنشر.",
        bullets: ["مسودات تحافظ على الصوت", "صياغة مخصصة لكل قناة"],
      },
      {
        title: "النشر",
        copy: "انتقل من المسودة إلى النشر أو الجدولة بثقة.",
        bullets: ["خط زمني واضح", "وضوح حالة النشر والاسترداد"],
      },
    ],
    trustTitle: "ثقة من البداية",
    trustLead: "ينبغي أن يبقى محتواك خاصًا وقابلًا للنقل وموثوقًا.",
    trustItems: [
      {
        title: "الخصوصية",
        copy: "الوصول للمحتوى مقيّد لكل مستخدم ويتم عبر مسارات خلفية آمنة.",
      },
      {
        title: "قابلية النقل",
        copy: "يمكنك تصدير ملاحظاتك ومسوداتك في أي وقت دون احتجاز.",
      },
      {
        title: "الاعتمادية",
        copy: "خط نشر غير متزامن مع تتبع الحالة وإعادة المحاولة عند الفشل.",
      },
    ],
    pricingTitle: "تسعير واضح للمستقلين",
    pricingLead: "ابدأ ببساطة الآن ثم رقّ عند زيادة الجدولة والحجم.",
    pricingCards: [
      {
        name: "مجاني",
        price: "Starter",
        desc: "للمهنيين المستقلين الذين يبنون عادة معرفة مستمرة.",
        items: ["التقاط وحفظ الملاحظات", "استرجاع بالمعنى", "حصة مسودات منخفضة"],
        cta: "اطلب وصولًا مبكرًا",
      },
      {
        name: "Pro",
        price: "$18/شهريًا",
        desc: "لمن ينشر أسبوعيًا ويحتاج وتيرة ثابتة.",
        items: ["حصة AI أعلى", "الجدولة", "سعة تخزين أكبر"],
        cta: "اطلب وصولًا مبكرًا",
      },
    ],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {
        q: "ما التكاملات المتاحة حاليًا؟",
        a: "LinkedIn متاح الآن، ومع الوقت ستتوسع التغطية إلى تكاملات إضافية.",
      },
      {
        q: "هل أستطيع نقل بياناتي لاحقًا؟",
        a: "نعم. الملاحظات والمسودات قابلة للتصدير.",
      },
      {
        q: "هل يمكنني النشر بصيغة RTL؟",
        a: "نعم. يدعم Noteship مسارات نشر متوافقة مع RTL لتظهر العربية والمحتوى المماثل بشكل صحيح.",
      },
    ],
    finalTitle: "نظام معرفة يحول ملاحظاتك إلى مخرجات",
    finalCopy: "اطلب الوصول لتبدأ النشر المنتظم مما تعرفه مسبقًا.",
    finalPrimary: "اطلب وصولًا مبكرًا",
    finalSecondary: "تواصل معنا",
  },
};

export default homeCopy;
