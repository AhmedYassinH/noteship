"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";
import sharedCopy, { Lang } from "../../data/marketing-shared";
import { Button } from "../ui/button";
import LanguageToggle from "../ui/LanguageToggle";
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
  const [lang, setLang] = useState<Lang>("en");
  const pathname = usePathname();
  const copy = useMemo(() => sharedCopy[lang], [lang]);
  const isAr = lang === "ar";
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
  }, [lang, isAr]);

  return (
    <MarketingLanguageContext.Provider value={{ lang, setLang }}>
      <DirectionProvider dir={isAr ? "rtl" : "ltr"}>
        <div
          className={cn(
            "relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#f3f6f4_0%,#eef2f7_45%,#f9f5ee_100%)] px-6 pb-20 pt-6 text-[var(--ns-ink)]",
            "font-body text-left rtl:text-right",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-[-180px] z-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#7dd3c7,transparent_65%)] opacity-35",
              isAr ? "left-[-120px]" : "right-[-120px]",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-[-220px] z-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_60%_40%,#f3b664,transparent_60%)] opacity-35",
              isAr ? "right-[-160px]" : "left-[-160px]",
            )}
          />

          <header className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/90 px-5 py-4 shadow-[0_20px_55px_rgba(15,23,42,0.15)] backdrop-blur-md max-[960px]:flex-col max-[960px]:items-stretch">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-inherit no-underline"
              aria-label="Noteship home"
            >
              <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-[rgba(15,118,110,0.2)] bg-[radial-gradient(circle_at_30%_30%,rgba(15,118,110,0.15),#ffffff)] shadow-[0_12px_28px_rgba(15,118,110,0.2)]">
                <Image src="/noteship-mark.svg" alt="" width={44} height={44} priority />
              </span>
              <span className="grid gap-1">
                <span className="text-[1.06rem] font-semibold tracking-[0.01em]">Noteship</span>
                <span className="text-[0.92rem] text-[var(--ns-muted)]">{copy.brandTagline}</span>
              </span>
            </Link>

            <nav
              className="flex flex-wrap items-center gap-3"
              aria-label={isAr ? "OU,OAÃU+U,U, OU,OAÃ±OA?USO3US" : "Main navigation"}
            >
              {copy.navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    className={cn(
                      "rounded-full px-3 py-2 text-[var(--ns-muted)] font-semibold transition-colors hover:bg-[rgba(15,118,110,0.1)] hover:text-slate-900",
                      isActive && "bg-[rgba(15,118,110,0.1)] text-slate-900",
                    )}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-wrap items-center gap-2.5 max-[960px]:justify-between">
              <LanguageToggle lang={lang} onChange={setLang} />
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="pill"
                    className="bg-[rgba(15,23,42,0.06)] text-slate-900 hover:bg-[rgba(15,23,42,0.12)]"
                  >
                    <Link href="/logout">{copy.auth.logout}</Link>
                  </Button>
                  <Button asChild size="pill" className="px-4 py-2.5">
                    <Link href="/dashboard">{copy.auth.dashboard}</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="pill"
                    className="bg-[rgba(15,23,42,0.06)] text-slate-900 hover:bg-[rgba(15,23,42,0.12)]"
                  >
                    <Link href="/login">{copy.ctas.secondary}</Link>
                  </Button>
                  <Button asChild size="pill" className="px-4 py-2.5">
                    <Link href="/login">{copy.ctas.primary}</Link>
                  </Button>
                </>
              )}
            </div>
          </header>

          <div className="relative z-10 mx-auto mt-12 flex w-full max-w-[1200px] flex-col gap-14">
            {children}
          </div>

          <footer className="relative z-10 mx-auto mt-[72px] grid w-full max-w-[1200px] gap-6 rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-white/90 p-7 shadow-[0_18px_36px_rgba(15,23,42,0.08)] max-[720px]:p-[22px]">
            <div className="grid gap-2.5">
              <div className="flex items-center gap-2.5">
                <Image src="/noteship-mark.svg" alt="" width={36} height={36} />
                <span className="text-[1.1rem] font-semibold">Noteship</span>
              </div>
              <p className="m-0 text-[var(--ns-muted)]">{copy.footer.summary}</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[18px]">
              {copy.footer.columns.map((column) => (
                <div key={column.title} className="grid gap-2">
                  <span className="text-[0.95rem] font-semibold">{column.title}</span>
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[var(--ns-muted)] no-underline hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="text-[0.9rem] text-[var(--ns-muted)]">{copy.footer.bottom}</div>
          </footer>
        </div>
      </DirectionProvider>
    </MarketingLanguageContext.Provider>
  );
};

export default MarketingShell;
