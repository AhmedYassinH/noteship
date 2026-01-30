export type Lang = "en" | "ar";

export type SharedCopy = {
  brandTagline: string;
  navLinks: { label: string; href: string }[];
  ctas: { primary: string; secondary: string };
  auth: { dashboard: string; logout: string };
  footer: {
    summary: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    bottom: string;
  };
};

const sharedCopy: Record<Lang, SharedCopy> = {
  en: {
    brandTagline: "Recall by meaning. Publish with consistency.",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
    ctas: {
      primary: "Start free",
      secondary: "Log in",
    },
    auth: {
      dashboard: "Dashboard",
      logout: "Log out",
    },
    footer: {
      summary:
        "Recall your ideas by meaning, repurpose them into drafts, and publish consistently — grounded in your notes.",
      columns: [
        {
          title: "Product",
          links: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Integrations", href: "/features#integrations" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/features#about" },
            { label: "FAQ", href: "/pricing#faq" },
            { label: "Contact", href: "mailto:hello@noteship.app" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Docs", href: "/features#docs" },
            { label: "Status", href: "/features#reliability" },
            { label: "Changelog", href: "/features#changelog" },
          ],
        },
      ],
      bottom: "© 2026 Noteship. All rights reserved.",
    },
  },
  ar: {
    brandTagline: "استرجاع بالمعنى ونشر بثبات.",
    navLinks: [
      { label: "الرئيسية", href: "/" },
      { label: "المزايا", href: "/features" },
      { label: "التسعير", href: "/pricing" },
    ],
    ctas: {
      primary: "ابدأ مجاناً",
      secondary: "تسجيل الدخول",
    },
    auth: {
      dashboard: "لوحة التحكم",
      logout: "تسجيل الخروج",
    },
    footer: {
      summary:
        "استرجع أفكارك بالمعنى، وأعد توظيفها في مسودات، وانشر بثبات — كل ذلك مبني على ملاحظاتك.",
      columns: [
        {
          title: "المنتج",
          links: [
            { label: "المزايا", href: "/features" },
            { label: "التسعير", href: "/pricing" },
            { label: "التكاملات", href: "/features#integrations" },
          ],
        },
        {
          title: "الشركة",
          links: [
            { label: "عن Noteship", href: "/features#about" },
            { label: "الأسئلة الشائعة", href: "/pricing#faq" },
            { label: "تواصل", href: "mailto:hello@noteship.app" },
          ],
        },
        {
          title: "الموارد",
          links: [
            { label: "الوثائق", href: "/features#docs" },
            { label: "الحالة", href: "/features#reliability" },
            { label: "التغييرات", href: "/features#changelog" },
          ],
        },
      ],
      bottom: "© 2026 Noteship. جميع الحقوق محفوظة.",
    },
  },
};

export default sharedCopy;
