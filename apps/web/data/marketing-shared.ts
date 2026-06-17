export type Lang = "en" | "ar";

export type SharedCopy = {
  brandTagline: string;
  navAriaLabel: string;
  chooseLanguage: string;
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
    brandTagline: "Your publishing partner",
    navAriaLabel: "Main navigation",
    chooseLanguage: "Choose language",
    navLinks: [
      { label: "Workflow", href: "/#workflow" },
      { label: "Launch plan", href: "/#launch-plan" },
      { label: "Trust", href: "/#trust" },
      { label: "Pricing", href: "/pricing" },
    ],
    ctas: {
      primary: "Log in",
    },
    footer: {
      summary:
        "Noteship turns your notes into a living publishing system: capture ideas, recall them by meaning, generate grounded drafts, and publish with confidence.",
      columns: [
        {
          title: "Product",
          links: [
            { label: "Workflow", href: "/#workflow" },
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "Contact", href: "mailto:me@ahmedyassin.dev" },
            { label: "Trust", href: "/#trust" },
            { label: "FAQ", href: "/#faq" },
          ],
        },
      ],
      bottom: "© 2026 Noteship. All rights reserved.",
    },
  },
  ar: {
    brandTagline: "شريكك في النشر",
    navAriaLabel: "التنقل الرئيسي",
    chooseLanguage: "اختيار اللغة",
    navLinks: [
      { label: "سير العمل", href: "/#workflow" },
      { label: "خطة الإطلاق", href: "/#launch-plan" },
      { label: "الثقة", href: "/#trust" },
      { label: "التسعير", href: "/pricing" },
    ],
    ctas: {
      primary: "تسجيل الدخول",
    },
    footer: {
      summary:
        "يحوّل Noteship ملاحظاتك إلى نظام نشر حي: التقط الأفكار، واسترجعها بالمعنى، وأنشئ مسودات مرتبطة بملاحظاتك، وانشر بثقة.",
      columns: [
        {
          title: "المنتج",
          links: [
            { label: "سير العمل", href: "/#workflow" },
            { label: "المزايا", href: "/features" },
            { label: "التسعير", href: "/pricing" },
          ],
        },
        {
          title: "الشركة",
          links: [
            { label: "تواصل", href: "mailto:me@ahmedyassin.dev" },
            { label: "الثقة", href: "/#trust" },
            { label: "الأسئلة الشائعة", href: "/#faq" },
          ],
        },
      ],
      bottom: "© 2026 Noteship. جميع الحقوق محفوظة.",
    },
  },
};

export default sharedCopy;
