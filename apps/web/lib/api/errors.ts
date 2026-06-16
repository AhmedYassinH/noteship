import type { Lang } from "../../data/dashboard";
import { ApiError } from "./client";

const localizedApiErrors: Record<Lang, Record<string, string>> = {
  en: {
    RATE_LIMITED: "You have hit a temporary limit. Try again shortly.",
    PLAN_LIMIT_EXCEEDED: "You have reached the Free plan limit.",
    FEATURE_NOT_AVAILABLE: "This feature is not available during the free launch.",
    BILLING_DISABLED: "Paid plans are coming soon.",
    UPLOAD_LEASE_EXPIRED: "Upload link expired after 3 minutes. Choose the file again to retry.",
    STORAGE_LIMIT_EXCEEDED: "Storage limit reached on the Free plan.",
    LINKEDIN_TOO_MANY_IMAGES:
      "Too many images are embedded in this draft for one LinkedIn post. Remove extra images and try again.",
    LINKEDIN_MULTIPLE_PDFS_NOT_ALLOWED:
      "LinkedIn supports one PDF per post. Keep only one PDF in the draft and try again.",
    LINKEDIN_MEDIA_MIX_NOT_ALLOWED: "Use either images or one PDF in a post, not both together.",
    LINKEDIN_MEDIA_INVALID: "Only media embedded from this note can be published to LinkedIn.",
    LINKEDIN_TOO_LONG:
      "Draft exceeds the single-post limit. Use overflow comments or shorten the draft.",
  },
  ar: {
    RATE_LIMITED: "وصلت إلى حد مؤقت. حاول مرة أخرى بعد قليل.",
    PLAN_LIMIT_EXCEEDED: "وصلت إلى حد الخطة المجانية.",
    FEATURE_NOT_AVAILABLE: "هذه الميزة غير متاحة خلال الإطلاق المجاني.",
    BILLING_DISABLED: "الخطط المدفوعة قريبًا.",
    UPLOAD_LEASE_EXPIRED: "انتهت صلاحية رابط الرفع بعد 3 دقائق. اختر الملف مرة أخرى للمحاولة.",
    STORAGE_LIMIT_EXCEEDED: "وصلت إلى حد التخزين في الخطة المجانية.",
    LINKEDIN_TOO_MANY_IMAGES:
      "توجد صور أكثر من المسموح في منشور LinkedIn واحد. احذف الصور الزائدة وحاول مرة أخرى.",
    LINKEDIN_MULTIPLE_PDFS_NOT_ALLOWED:
      "يدعم LinkedIn ملف PDF واحدًا لكل منشور. أبقِ ملفًا واحدًا وحاول مرة أخرى.",
    LINKEDIN_MEDIA_MIX_NOT_ALLOWED: "استخدم الصور أو ملف PDF واحد، وليس الاثنين معًا.",
    LINKEDIN_MEDIA_INVALID: "يمكن نشر الوسائط المضمنة من هذه الملاحظة فقط على LinkedIn.",
    LINKEDIN_TOO_LONG:
      "تتجاوز المسودة حد المنشور الواحد. استخدم التعليقات المتتابعة أو اختصر المسودة.",
  },
};

const inferUploadCode = (message: string): string | null => {
  const normalized = message.toLowerCase();
  if (normalized.includes("expired") && normalized.includes("upload")) {
    return "UPLOAD_LEASE_EXPIRED";
  }
  if (normalized.includes("storage") || normalized.includes("quota")) {
    return "STORAGE_LIMIT_EXCEEDED";
  }
  return null;
};

export const formatApiError = (error: unknown, lang: Lang, fallback: string): string => {
  if (error instanceof ApiError) {
    const code = error.code ?? inferUploadCode(error.message);
    if (code && localizedApiErrors[lang][code]) {
      return localizedApiErrors[lang][code];
    }
    if (error.status === 429) {
      return localizedApiErrors[lang].RATE_LIMITED;
    }
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};
