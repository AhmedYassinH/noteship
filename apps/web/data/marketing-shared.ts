export type Lang = "en" | "ar";

export type SharedCopy = {
  brandTagline: string;
  navLinks: { label: string; href: string }[];
  ctas: {
    primary: string;
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
      primary: "Start free",
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
      primary: "ابدأ مجانًا",
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
