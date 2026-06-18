"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";
import sharedCopy, { Lang } from "../../data/marketing-shared";
import { getStoredLang, persistLang } from "../../lib/language";
import { cn } from "@/lib/utils";

type MarketingLanguageState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const MarketingLanguageContext = createContext<MarketingLanguageState | undefined>(undefined);

export const useMarketingLanguage = () => {
  const ctx = useContext(MarketingLanguageContext);
  if (!ctx) {
    throw new Error("useMarketingLanguage must be used within MarketingShell");
  }
  return ctx;
};

const MarketingShell = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => getStoredLang());
  const pathname = usePathname();
  const copy = useMemo(() => sharedCopy[lang], [lang]);
  const isAr = lang === "ar";
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    persistLang(lang);
  }, [lang, isAr]);

  useEffect(() => {
    if (!isLangMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isLangMenuOpen]);

  return (
    <MarketingLanguageContext.Provider value={{ lang, setLang }}>
      <DirectionProvider dir={isAr ? "rtl" : "ltr"}>
        <div
          className="relative isolate min-h-screen overflow-x-hidden bg-[#f7f8f4] text-[#101817] font-body text-left rtl:text-right"
          lang={lang}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div
            data-testid="marketing-background-layer"
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              backgroundImage: [
                "radial-gradient(circle at 16% 18%, rgba(199,243,107,0.48), transparent 20%)",
                "radial-gradient(circle at 86% 12%, rgba(153,233,255,0.38), transparent 24%)",
                "radial-gradient(circle at 82% 86%, rgba(255,179,167,0.32), transparent 25%)",
                "linear-gradient(rgba(16,24,23,0.11) 1px, transparent 1px)",
                "linear-gradient(90deg, rgba(16,24,23,0.11) 1px, transparent 1px)",
              ].join(", "),
              backgroundSize: "auto, auto, auto, 44px 44px, 44px 44px",
            }}
          />

          <header className="sticky top-0 z-40 grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-[rgba(16,24,23,0.08)] bg-[#f7f8f4]/85 px-[clamp(18px,5vw,56px)] py-4 backdrop-blur-[18px] max-[900px]:grid-cols-[1fr_auto]">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-inherit no-underline"
              aria-label="Noteship home"
            >
              <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-[rgba(16,24,23,0.12)] bg-white">
                <Image
                  src="/noteship-mark.svg"
                  alt=""
                  width={68}
                  height={68}
                  className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
                  priority
                />
              </span>
              <span className="grid">
                <span className="text-[1rem] font-extrabold leading-tight">Noteship</span>
                <span className="max-w-[170px] truncate text-[0.74rem] text-[#5f6b66]">
                  {copy.brandTagline}
                </span>
              </span>
            </Link>

            <nav
              className="flex flex-wrap items-center justify-center gap-2 max-[900px]:hidden"
              aria-label={copy.navAriaLabel}
            >
              {copy.navLinks.map((link) => {
                const baseHref = link.href.split("#")[0];
                const isPageLink = !link.href.includes("#");
                const isActive = isPageLink && pathname === baseHref;
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    className={cn(
                      "rounded-full border border-transparent px-3.5 py-2 text-[0.92rem] text-[#263531] transition-colors hover:border-[rgba(16,24,23,0.14)] hover:bg-white/75",
                      isActive && "border-[rgba(16,24,23,0.14)] bg-white/75",
                    )}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#101817] px-4 text-[0.92rem] font-bold text-white transition-opacity hover:opacity-90"
              >
                {copy.ctas.primary}
              </Link>

              <div className="relative z-[80]" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(16,24,23,0.14)] bg-white/75 px-3 text-[#263531] transition-colors hover:bg-white"
                  aria-label={copy.chooseLanguage}
                  aria-haspopup="menu"
                  aria-expanded={isLangMenuOpen}
                >
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {isLangMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute end-0 z-[90] mt-2 w-[210px] overflow-hidden rounded-xl border border-[rgba(16,24,23,0.14)] bg-white p-1.5 shadow-[0_12px_28px_rgba(16,24,23,0.14)]"
                  >
                    {(["en", "ar"] as Lang[]).map((nextLang) => (
                      <button
                        key={nextLang}
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[0.92rem] transition-colors hover:bg-[rgba(16,24,23,0.06)] rtl:text-right"
                        onClick={() => {
                          setLang(nextLang);
                          setIsLangMenuOpen(false);
                        }}
                        role="menuitem"
                      >
                        <span>{nextLang === "en" ? "English" : "العربية"}</span>
                        {lang === nextLang ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="relative z-10">{children}</div>

          <footer
            id="contact"
            className="relative z-10 mx-auto grid w-full max-w-[1260px] gap-8 px-[clamp(18px,5vw,56px)] pb-10 pt-16"
          >
            <div className="grid gap-3 border-t border-[rgba(16,24,23,0.12)] pt-8">
              <div className="flex items-center gap-2.5">
                <Image src="/noteship-mark.svg" alt="" width={30} height={30} />
                <span className="text-[1rem] font-bold">Noteship</span>
              </div>
              <p className="m-0 max-w-[720px] text-[#5f6b66] leading-7">{copy.footer.summary}</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
              {copy.footer.columns.map((column) => (
                <div key={column.title} className="grid gap-2">
                  <span className="text-[0.95rem] font-bold">{column.title}</span>
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-fit text-[#5f6b66] underline-offset-4 transition-colors hover:text-[#101817] hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="text-[0.88rem] text-[#5f6b66]">{copy.footer.bottom}</div>
          </footer>
        </div>
      </DirectionProvider>
    </MarketingLanguageContext.Provider>
  );
};

export default MarketingShell;
