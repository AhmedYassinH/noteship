export type Lang = "en" | "ar";

export type SharedCopy = {
  brandTagline: string;
  navLinks: { label: string; href: string }[];
  ctas: {
    primary: string;
  };
  access: {
    kicker: string;
    title: string;
    lead: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    rolePlaceholder: string;
    cadenceLabel: string;
    cadencePlaceholder: string;
    cta: string;
    ctaLoading: string;
    successTitle: string;
    successCopy: string;
    errorCopy: string;
  };
  footer: {
    summary: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    bottom: string;
  };
};

const sharedCopy: Record<Lang, SharedCopy> = {
  en: {
    brandTagline: "Capture, preserve, recall, repurpose, publish.",
    navLinks: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/#contact" },
    ],
    ctas: {
      primary: "Request early access",
    },
    access: {
      kicker: "Early access",
      title: "Request early access to Noteship",
      lead: "Tell us how you publish today. We prioritize active consultants and creators.",
      emailLabel: "Work email",
      emailPlaceholder: "you@company.com",
      roleLabel: "What do you do?",
      rolePlaceholder: "Consultant, coach, founder...",
      cadenceLabel: "Publishing cadence",
      cadencePlaceholder: "Weekly, twice monthly, daily...",
      cta: "Request early access",
      ctaLoading: "Sending...",
      successTitle: "Request received",
      successCopy: "Thanks. We'll email you with next-step access details.",
      errorCopy: "Could not send your request. Please try again.",
    },
    footer: {
      summary:
        "A knowledge system that turns notes into output. Stop rewriting what you already know.",
      columns: [
        {
          title: "Product",
          links: [
            { label: "How it works", href: "/#how-it-works" },
            { label: "Pricing", href: "/pricing" },
            { label: "FAQ", href: "/#faq" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "Contact", href: "mailto:me@ahmedyassin.dev" },
            { label: "Privacy", href: "/#security" },
            { label: "Reliability", href: "/#security" },
          ],
        },
      ],
      bottom: "© 2026 Noteship. All rights reserved.",
    },
  },
  ar: {
    brandTagline: "التقط، احفظ، استرجع، أعد التوظيف، ثم انشر.",
    navLinks: [
      { label: "كيف يعمل", href: "/#how-it-works" },
      { label: "الأسعار", href: "/pricing" },
      { label: "الأسئلة الشائعة", href: "/#faq" },
      { label: "تواصل", href: "/#contact" },
    ],
    ctas: {
      primary: "اطلب وصولًا مبكرًا",
    },
    access: {
      kicker: "وصول مبكر",
      title: "اطلب الوصول المبكر إلى Noteship",
      lead: "أخبرنا كيف تنشر اليوم. نعطي الأولوية للخبراء وصناع المحتوى النشطين.",
      emailLabel: "بريد العمل",
      emailPlaceholder: "you@company.com",
      roleLabel: "ماذا تعمل؟",
      rolePlaceholder: "مستشار، مدرب، مؤسس...",
      cadenceLabel: "وتيرة النشر",
      cadencePlaceholder: "أسبوعي، مرتين شهريًا، يومي...",
      cta: "اطلب وصولًا مبكرًا",
      ctaLoading: "جارٍ الإرسال...",
      successTitle: "تم استلام الطلب",
      successCopy: "شكرًا لك. سنرسل تفاصيل الخطوة التالية عبر البريد.",
      errorCopy: "تعذر إرسال الطلب. حاول مرة أخرى.",
    },
    footer: {
      summary: "نظام معرفة يحول الملاحظات إلى مخرجات. توقف عن إعادة كتابة ما تعرفه بالفعل.",
      columns: [
        {
          title: "المنتج",
          links: [
            { label: "كيف يعمل", href: "/#how-it-works" },
            { label: "الأسعار", href: "/pricing" },
            { label: "الأسئلة الشائعة", href: "/#faq" },
          ],
        },
        {
          title: "الشركة",
          links: [
            { label: "تواصل", href: "mailto:me@ahmedyassin.dev" },
            { label: "الخصوصية", href: "/#security" },
            { label: "الاعتمادية", href: "/#security" },
          ],
        },
      ],
      bottom: "© 2026 Noteship. جميع الحقوق محفوظة.",
    },
  },
};

export default sharedCopy;
