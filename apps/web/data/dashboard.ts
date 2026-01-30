export type Lang = "en" | "ar";

export type DashboardCopy = {
  nav: {
    overview: string;
    notes: string;
    search: string;
    drafts: string;
    publishing: string;
    integrations: string;
    billing: string;
    settings: string;
  };
  topbar: {
    searchPlaceholder: string;
    quickAction: string;
    newNote: string;
  };
  shell: {
    menu: string;
    close: string;
    collapse: string;
    expand: string;
    logout: string;
    recent: string;
    ready: string;
    saving: string;
    saved: string;
    saveFailed: string;
    navigationLabel: string;
    sidebarLabel: string;
  };
  overview: {
    title: string;
    subtitle: string;
    stats: { label: string; value: string }[];
    recentNotes: string;
    emptyNotes: string;
    publishQueue: string;
    emptyQueue: string;
  };
  notes: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyCopy: string;
    createCta: string;
  };
  note: {
    editorTitle: string;
    draftsTitle: string;
    publishTitle: string;
    scheduleTitle: string;
    emptyDrafts: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    uploadAsset: string;
    uploading: string;
    uploadFailed: string;
    scheduleUpsell: string;
    upgradeCta: string;
    generateLinkedIn: string;
    generateMedium: string;
    publishNow: string;
    schedule: string;
  };
  search: {
    title: string;
    subtitle: string;
    empty: string;
    emptyQuery: string;
    resultsLabel: string;
  };
  drafts: {
    title: string;
    subtitle: string;
    empty: string;
    upsell: string;
  };
  publishing: {
    title: string;
    subtitle: string;
    empty: string;
    upsell: string;
  };
  integrations: {
    title: string;
    subtitle: string;
    connect: string;
    disconnect: string;
  };
  billing: {
    title: string;
    subtitle: string;
    upgrade: string;
    manage: string;
    currentPlanLabel: string;
    defaultStatus: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profile: string;
    language: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
  };
  table: {
    note: string;
    title: string;
    updated: string;
    status: string;
    provider: string;
  };
};

const dashboardCopy: Record<Lang, DashboardCopy> = {
  en: {
    nav: {
      overview: "Overview",
      notes: "Notes",
      search: "Recall",
      drafts: "Drafts",
      publishing: "Publishing",
      integrations: "Integrations",
      billing: "Billing",
      settings: "Settings",
    },
    topbar: {
      searchPlaceholder: "Recall ideas by meaning...",
      quickAction: "Quick actions",
      newNote: "New note",
    },
    shell: {
      menu: "Menu",
      close: "Close",
      collapse: "Collapse",
      expand: "Expand",
      logout: "Log out",
      recent: "Recent",
      ready: "Ready",
      saving: "Saving...",
      saved: "Saved",
      saveFailed: "Save failed",
      navigationLabel: "Dashboard navigation",
      sidebarLabel: "Dashboard sidebar",
    },
    overview: {
      title: "Dashboard",
      subtitle: "Your publishing workflow at a glance.",
      stats: [
        { label: "Notes", value: "-" },
        { label: "Drafts this month", value: "-" },
        { label: "Scheduled", value: "-" },
      ],
      recentNotes: "Recent notes",
      emptyNotes: "No notes yet. Create your first note to start building.",
      publishQueue: "Publishing status",
      emptyQueue: "No scheduled or published posts yet.",
    },
    notes: {
      title: "Notes",
      subtitle: "Capture ideas, recall them fast, and repurpose when ready.",
      emptyTitle: "No notes yet",
      emptyCopy: "Create a note to start your knowledge base.",
      createCta: "Create note",
    },
    note: {
      editorTitle: "Editor",
      draftsTitle: "Drafts",
      publishTitle: "Publish now",
      scheduleTitle: "Schedule",
      emptyDrafts: "No drafts yet. Generate one from this note.",
      titlePlaceholder: "Note title",
      contentPlaceholder: "Start writing...",
      uploadAsset: "Upload",
      uploading: "Uploading...",
      uploadFailed: "Upload failed",
      scheduleUpsell: "Scheduling is available on Pro plans.",
      upgradeCta: "Upgrade to Pro",
      generateLinkedIn: "Generate LinkedIn",
      generateMedium: "Generate Medium",
      publishNow: "Publish now",
      schedule: "Schedule",
    },
    search: {
      title: "Recall",
      subtitle: "Find ideas by meaning, not keywords.",
      empty: "Try a different query to see results.",
      emptyQuery: "Enter a query to recall your notes.",
      resultsLabel: "results",
    },
    drafts: {
      title: "Drafts",
      subtitle: "Generated drafts ready to publish or refine.",
      empty: "No drafts yet. Generate one from a note.",
      upsell: "Upgrade to Pro to unlock scheduled publishing.",
    },
    publishing: {
      title: "Publishing",
      subtitle: "Track scheduled and published posts.",
      empty: "No publishing activity yet.",
      upsell: "Scheduling is a Pro feature. Upgrade to schedule posts.",
    },
    integrations: {
      title: "Integrations",
      subtitle: "Connect LinkedIn and Medium to publish directly.",
      connect: "Connect",
      disconnect: "Disconnect",
    },
    billing: {
      title: "Billing",
      subtitle: "Manage your plan and usage.",
      upgrade: "Upgrade to Pro",
      manage: "Manage billing",
      currentPlanLabel: "Current plan",
      defaultStatus: "active",
    },
    settings: {
      title: "Settings",
      subtitle: "Profile and workspace preferences.",
      profile: "Profile",
      language: "Language",
    },
    common: {
      loading: "Loading...",
      error: "Something went wrong. Please try again.",
      retry: "Retry",
    },
    table: {
      note: "Note",
      title: "Title",
      updated: "Updated",
      status: "Status",
      provider: "Provider",
    },
  },
  ar: {
    nav: {
      overview: "نظرة عامة",
      notes: "الملاحظات",
      search: "استرجاع",
      drafts: "المسودات",
      publishing: "النشر",
      integrations: "التكاملات",
      billing: "الفوترة",
      settings: "الإعدادات",
    },
    topbar: {
      searchPlaceholder: "استرجع الأفكار بالمعنى...",
      quickAction: "إجراءات سريعة",
      newNote: "ملاحظة جديدة",
    },
    shell: {
      menu: "القائمة",
      close: "إغلاق",
      collapse: "تصغير",
      expand: "توسيع",
      logout: "تسجيل الخروج",
      recent: "الأخيرة",
      ready: "جاهز",
      saving: "جارٍ الحفظ...",
      saved: "تم الحفظ",
      saveFailed: "فشل الحفظ",
      navigationLabel: "تنقل لوحة التحكم",
      sidebarLabel: "الشريط الجانبي للوحة التحكم",
    },
    overview: {
      title: "لوحة التحكم",
      subtitle: "سير النشر لديك في لمحة.",
      stats: [
        { label: "الملاحظات", value: "-" },
        { label: "مسودات هذا الشهر", value: "-" },
        { label: "المجدولة", value: "-" },
      ],
      recentNotes: "ملاحظات حديثة",
      emptyNotes: "لا توجد ملاحظات بعد. أنشئ أول ملاحظة للبدء.",
      publishQueue: "حالة النشر",
      emptyQueue: "لا توجد منشورات مجدولة أو منشورة بعد.",
    },
    notes: {
      title: "الملاحظات",
      subtitle: "التقط الأفكار، واسترجعها بسرعة، وأعد توظيفها عند الحاجة.",
      emptyTitle: "لا توجد ملاحظات",
      emptyCopy: "أنشئ ملاحظة لبدء قاعدة معرفتك.",
      createCta: "إنشاء ملاحظة",
    },
    note: {
      editorTitle: "المحرر",
      draftsTitle: "المسودات",
      publishTitle: "انشر الآن",
      scheduleTitle: "جدولة",
      emptyDrafts: "لا توجد مسودات بعد. أنشئ مسودة من هذه الملاحظة.",
      titlePlaceholder: "عنوان الملاحظة",
      contentPlaceholder: "ابدأ الكتابة...",
      uploadAsset: "رفع",
      uploading: "جارٍ الرفع...",
      uploadFailed: "فشل الرفع",
      scheduleUpsell: "الجدولة متاحة ضمن خطة Pro.",
      upgradeCta: "الترقية إلى Pro",
      generateLinkedIn: "إنشاء LinkedIn",
      generateMedium: "إنشاء Medium",
      publishNow: "انشر الآن",
      schedule: "جدولة",
    },
    search: {
      title: "استرجاع",
      subtitle: "اعثر على الأفكار بالمعنى لا بالكلمات.",
      empty: "جرّب عبارة مختلفة لعرض النتائج.",
      emptyQuery: "أدخل عبارة لاسترجاع ملاحظاتك.",
      resultsLabel: "نتائج",
    },
    drafts: {
      title: "المسودات",
      subtitle: "مسودات جاهزة للنشر أو التنقيح.",
      empty: "لا توجد مسودات بعد. أنشئ واحدة من ملاحظة.",
      upsell: "قم بالترقية إلى Pro لفتح ميزة الجدولة.",
    },
    publishing: {
      title: "النشر",
      subtitle: "تابع المنشورات المجدولة والمنشورة.",
      empty: "لا يوجد نشاط نشر بعد.",
      upsell: "الجدولة ميزة في Pro. قم بالترقية للجدولة.",
    },
    integrations: {
      title: "التكاملات",
      subtitle: "اربط LinkedIn و Medium للنشر مباشرة.",
      connect: "ربط",
      disconnect: "إلغاء الربط",
    },
    billing: {
      title: "الفوترة",
      subtitle: "إدارة الخطة والاستخدام.",
      upgrade: "الترقية إلى Pro",
      manage: "إدارة الفوترة",
      currentPlanLabel: "الخطة الحالية",
      defaultStatus: "نشط",
    },
    settings: {
      title: "الإعدادات",
      subtitle: "الملف الشخصي وتفضيلات مساحة العمل.",
      profile: "الملف الشخصي",
      language: "اللغة",
    },
    common: {
      loading: "جارٍ التحميل...",
      error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
    },
    table: {
      note: "ملاحظة",
      title: "العنوان",
      updated: "آخر تحديث",
      status: "الحالة",
      provider: "المنصة",
    },
  },
};

export default dashboardCopy;
