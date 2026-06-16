import type { Lang } from "../data/dashboard";

export const LANGUAGE_STORAGE_KEY = "noteship-lang";

export const isLang = (value: unknown): value is Lang => value === "en" || value === "ar";

export const getBrowserLang = (): Lang => {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
};

export const getStoredLang = (): Lang => {
  if (typeof window === "undefined") return getBrowserLang();
  const storedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLang(storedLang) ? storedLang : getBrowserLang();
};

export const persistLang = (lang: Lang) => {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};
