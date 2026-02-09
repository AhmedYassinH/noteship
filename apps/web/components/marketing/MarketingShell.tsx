"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";
import sharedCopy, { Lang } from "../../data/marketing-shared";
import WaitlistModal from "./WaitlistModal";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

type MarketingLanguageState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const MarketingLanguageContext = createContext<MarketingLanguageState | undefined>(undefined);
type WaitlistModalState = {
  openWaitlist: () => void;
};

const WaitlistModalContext = createContext<WaitlistModalState | undefined>(undefined);

export const useMarketingLanguage = () => {
  const ctx = useContext(MarketingLanguageContext);
  if (!ctx) {
    throw new Error("useMarketingLanguage must be used within MarketingShell");
  }
  return ctx;
};

export const useWaitlistModal = () => {
  const ctx = useContext(WaitlistModalContext);
  if (!ctx) {
    throw new Error("useWaitlistModal must be used within MarketingShell");
  }
  return ctx;
};

const MarketingShell = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const pathname = usePathname();
  const copy = useMemo(() => sharedCopy[lang], [lang]);
  const isAr = lang === "ar";
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const openWaitlist = () => {
    setIsWaitlistOpen(true);
  };

  const closeWaitlist = () => {
    setIsWaitlistOpen(false);
  };

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ar")) {
      setLang("ar");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
  }, [lang, isAr]);

  useEffect(() => {
    if (!isLangMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isLangMenuOpen]);

  return (
    <MarketingLanguageContext.Provider value={{ lang, setLang }}>
      <WaitlistModalContext.Provider value={{ openWaitlist }}>
        <DirectionProvider dir={isAr ? "rtl" : "ltr"}>
          <div
            className={cn(
              "relative min-h-screen bg-[linear-gradient(180deg,#f8f9f8_0%,#f4f6f8_55%,#f8f7f4_100%)] px-6 pb-16 pt-6 text-[var(--ns-ink)]",
              "font-body text-left rtl:text-right",
            )}
          >
            <header className="relative z-40 mx-auto flex w-full max-w-[1160px] items-center justify-between gap-4 border-b border-[rgba(15,23,42,0.12)] pb-4 max-[1020px]:flex-wrap">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-inherit no-underline"
                aria-label="Noteship home"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-[rgba(15,118,110,0.18)] bg-white">
                  <Image src="/noteship-mark.svg" alt="" width={34} height={34} priority />
                </span>
                <span className="text-[1.04rem] font-semibold">Noteship</span>
              </Link>

              <nav
                className="flex flex-wrap items-center gap-2"
                aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}
              >
                {copy.navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[0.9rem] font-medium text-[var(--ns-muted)] transition-colors hover:text-slate-900",
                        isActive && "bg-[rgba(15,23,42,0.06)] text-slate-900",
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
                <Button type="button" size="pill" onClick={openWaitlist}>
                  {copy.ctas.primary}
                </Button>

                <div className="relative z-[80]" ref={langMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsLangMenuOpen((open) => !open)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(15,23,42,0.14)] bg-white px-2.5 text-[var(--ns-muted)] transition-colors hover:text-slate-900"
                    aria-label={isAr ? "اختيار اللغة" : "Choose language"}
                    aria-haspopup="menu"
                    aria-expanded={isLangMenuOpen}
                  >
                    <Languages className="h-4 w-4" aria-hidden="true" />
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  {isLangMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute end-0 z-[90] mt-2 w-[210px] overflow-hidden rounded-xl border border-[rgba(15,23,42,0.14)] bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.14)]"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[0.92rem] transition-colors hover:bg-[rgba(15,23,42,0.06)]"
                        onClick={() => {
                          setLang("en");
                          setIsLangMenuOpen(false);
                        }}
                        role="menuitem"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true">🇺🇸</span>
                          <span>English</span>
                        </span>
                        {lang === "en" ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : null}
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[0.92rem] transition-colors hover:bg-[rgba(15,23,42,0.06)]"
                        onClick={() => {
                          setLang("ar");
                          setIsLangMenuOpen(false);
                        }}
                        role="menuitem"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true">🇸🇦</span>
                          <span>العربية</span>
                        </span>
                        {lang === "ar" ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : null}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </header>

            <div className="relative z-10 mx-auto mt-12 flex w-full max-w-[1160px] flex-col gap-14">
              {children}
            </div>

            <footer
              id="contact"
              className="relative z-10 mx-auto mt-20 grid w-full max-w-[1160px] gap-6 border-t border-[rgba(15,23,42,0.12)] pt-8"
            >
              <div className="grid gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Image src="/noteship-mark.svg" alt="" width={30} height={30} />
                  <span className="text-[1rem] font-semibold">Noteship</span>
                </div>
                <p className="m-0 max-w-[640px] text-[var(--ns-muted)]">{copy.footer.summary}</p>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[18px]">
                {copy.footer.columns.map((column) => (
                  <div key={column.title} className="grid gap-2">
                    <span className="text-[0.95rem] font-semibold">{column.title}</span>
                    {column.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="w-fit text-[var(--ns-muted)] underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              <div className="text-[0.88rem] text-[var(--ns-muted)]">{copy.footer.bottom}</div>
            </footer>
          </div>
        </DirectionProvider>
        <WaitlistModal open={isWaitlistOpen} onClose={closeWaitlist} lang={lang} />
      </WaitlistModalContext.Provider>
    </MarketingLanguageContext.Provider>
  );
};

export default MarketingShell;
