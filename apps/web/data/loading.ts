import type { Lang } from "./dashboard";

export type LoadingSurface = "authRedirect" | "authCallback" | "dashboard" | "integrationCallback";

export type LoadingCopy = {
  title: string;
  surfaces: Record<
    LoadingSurface,
    {
      messages: string[];
      steps: string[];
      errorTitle: string;
      errorCopy: string;
      actionLabel?: string;
    }
  >;
};

const loadingCopy: Record<Lang, LoadingCopy> = {
  en: {
    title: "Noteship",
    surfaces: {
      authRedirect: {
        messages: ["Preparing secure sign in...", "Opening Auth0...", "Taking you to login..."],
        steps: ["Redirecting securely", "Checking your route", "Almost there"],
        errorTitle: "Could not open login",
        errorCopy: "Please refresh and try again.",
        actionLabel: "Try again",
      },
      authCallback: {
        messages: [
          "Completing sign in...",
          "Checking your session...",
          "Opening your workspace...",
        ],
        steps: ["Finishing sign in", "Securing your session", "Almost ready"],
        errorTitle: "We could not complete sign in",
        errorCopy: "Please try again.",
        actionLabel: "Back to login",
      },
      dashboard: {
        messages: ["Preparing your workspace...", "Loading your notes...", "Opening Noteship..."],
        steps: ["Checking your session", "Syncing workspace", "Almost ready"],
        errorTitle: "Workspace could not load",
        errorCopy: "Please refresh and try again.",
      },
      integrationCallback: {
        messages: [
          "Finalizing integration...",
          "Checking LinkedIn connection...",
          "Returning to integrations...",
        ],
        steps: ["Verifying callback", "Saving connection", "Almost ready"],
        errorTitle: "Integration could not connect",
        errorCopy: "Please return to Integrations and try again.",
        actionLabel: "Back to Integrations",
      },
    },
  },
  ar: {
    title: "Noteship",
    surfaces: {
      authRedirect: {
        messages: [
          "جارٍ تجهيز تسجيل الدخول الآمن...",
          "جارٍ فتح Auth0...",
          "سيتم نقلك لتسجيل الدخول...",
        ],
        steps: ["إعادة توجيه آمنة", "التحقق من المسار", "اقتربنا"],
        errorTitle: "تعذر فتح تسجيل الدخول",
        errorCopy: "حدّث الصفحة وحاول مرة أخرى.",
        actionLabel: "حاول مرة أخرى",
      },
      authCallback: {
        messages: [
          "جارٍ إكمال تسجيل الدخول...",
          "جارٍ التحقق من الجلسة...",
          "جارٍ فتح مساحة العمل...",
        ],
        steps: ["إكمال تسجيل الدخول", "تأمين الجلسة", "جاهز تقريبًا"],
        errorTitle: "تعذر إكمال تسجيل الدخول",
        errorCopy: "حاول مرة أخرى.",
        actionLabel: "العودة لتسجيل الدخول",
      },
      dashboard: {
        messages: ["جارٍ تجهيز مساحة العمل...", "جارٍ تحميل ملاحظاتك...", "جارٍ فتح Noteship..."],
        steps: ["التحقق من الجلسة", "مزامنة مساحة العمل", "جاهز تقريبًا"],
        errorTitle: "تعذر تحميل مساحة العمل",
        errorCopy: "حدّث الصفحة وحاول مرة أخرى.",
      },
      integrationCallback: {
        messages: [
          "جارٍ إنهاء التكامل...",
          "جارٍ التحقق من اتصال LinkedIn...",
          "جارٍ العودة للتكاملات...",
        ],
        steps: ["التحقق من العودة", "حفظ الاتصال", "جاهز تقريبًا"],
        errorTitle: "تعذر ربط التكامل",
        errorCopy: "ارجع إلى التكاملات وحاول مرة أخرى.",
        actionLabel: "العودة إلى التكاملات",
      },
    },
  },
};

export default loadingCopy;
