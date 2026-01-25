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
    brandTagline: "Semantic memory for publishing",
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
        "Noteship keeps your ideas portable and searchable, then turns them into publish-ready posts.",
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
    brandTagline: "ذاكرة دلالية للنشر",
    navLinks: [
      { label: "الرئيسية", href: "/" },
      { label: "الميزات", href: "/features" },
      { label: "الأسعار", href: "/pricing" },
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
      summary: "نوتشِب يحفظ أفكارك قابلة للبحث والنقل، ثم يحولها إلى منشورات جاهزة للنشر.",
      columns: [
        {
          title: "المنتج",
          links: [
            { label: "الميزات", href: "/features" },
            { label: "الأسعار", href: "/pricing" },
            { label: "الاندماجات", href: "/features#integrations" },
          ],
        },
        {
          title: "الشركة",
          links: [
            { label: "حول نوتشِب", href: "/features#about" },
            { label: "الأسئلة الشائعة", href: "/pricing#faq" },
            { label: "تواصل معنا", href: "mailto:hello@noteship.app" },
          ],
        },
        {
          title: "المصادر",
          links: [
            { label: "المستندات", href: "/features#docs" },
            { label: "الحالة", href: "/features#reliability" },
            { label: "سجل التحديثات", href: "/features#changelog" },
          ],
        },
      ],
      bottom: "© 2026 نوتشِب. جميع الحقوق محفوظة.",
    },
  },
};

export default sharedCopy;
