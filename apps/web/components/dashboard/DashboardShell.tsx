"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MeResponse } from "@noteship/domain";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import dashboardCopy, { Lang } from "../../data/dashboard";
import sharedCopy from "../../data/marketing-shared";
import { createContentSession, createNote, listNotes } from "../../lib/api/notes";
import { apiFetch } from "../../lib/api/client";
import type { NoteResponse } from "../../lib/api/types";
import { getEntitlements, type EntitlementsSnapshot } from "../../lib/entitlements";
import { cn } from "@/lib/utils";

type DashboardContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isAr: boolean;
  me: MeResponse["user"] | null;
  entitlements: EntitlementsSnapshot;
  recentNotes: NoteResponse[];
  recentNotesStatus: "loading" | "ready" | "error";
  refreshNotes: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardShell");
  }
  return ctx;
};

const navKeys = [
  "overview",
  "notes",
  "search",
  "drafts",
  "publishing",
  "integrations",
  "billing",
  "settings",
] as const;

const navRoutes: Record<(typeof navKeys)[number], string> = {
  overview: "/dashboard",
  notes: "/dashboard/notes",
  search: "/dashboard/search",
  drafts: "/dashboard/drafts",
  publishing: "/dashboard/publishing",
  integrations: "/dashboard/integrations",
  billing: "/dashboard/billing",
  settings: "/dashboard/settings",
};

const emptyStateClass =
  "rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]";

const DashboardShellInner = ({ children }: { children: ReactNode }) => {
  const { isLoading, isAuthenticated, login } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [recentNotes, setRecentNotes] = useState<NoteResponse[]>([]);
  const [recentNotesStatus, setRecentNotesStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const entitlements = useMemo(() => getEntitlements(me?.planId), [me?.planId]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isAr = lang === "ar";
  const copy = useMemo(() => dashboardCopy[lang], [lang]);
  const shared = useMemo(() => sharedCopy[lang], [lang]);
  const collapseIcon = isAr ? (collapsed ? "?" : "?") : collapsed ? "?" : "?";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const query = searchParams?.toString();
      const returnTo = query ? `${pathname}?${query}` : (pathname ?? "/dashboard");
      void login(returnTo);
    }
  }, [isLoading, isAuthenticated, login, pathname, searchParams]);

  useEffect(() => {
    const storedLang = window.localStorage.getItem("noteship-lang");
    if (storedLang === "en" || storedLang === "ar") {
      setLang(storedLang);
      return;
    }
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ar")) {
      setLang("ar");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    window.localStorage.setItem("noteship-lang", lang);
  }, [lang, isAr]);

  useEffect(() => {
    const stored = window.localStorage.getItem("noteship-sidebar-collapsed");
    setCollapsed(stored === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("noteship-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const meResponse = await apiFetch<MeResponse>("/me");
        setMe(meResponse.user);
        try {
          await createContentSession();
        } catch {
          // ignore content cookie failures for now
        }
      } catch {
        setMe(null);
      }
    };
    void load();
  }, [isAuthenticated]);

  const refreshNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    setRecentNotesStatus("loading");
    try {
      const result = await listNotes(6);
      setRecentNotes(result.items);
      setRecentNotesStatus("ready");
    } catch {
      setRecentNotes([]);
      setRecentNotesStatus("error");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshNotes();
  }, [refreshNotes]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = searchInputRef.current?.value?.trim();
    if (!value) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(value)}`);
  };

  const handleCreateNote = async () => {
    try {
      const response = await createNote({
        title: isAr ? "?????? ?????" : "New note",
        content: "",
        editorFormat: "tiptap",
      });
      await refreshNotes();
      router.push(`/dashboard/notes?noteId=${encodeURIComponent(response.noteId)}`);
    } catch {
      // no-op, surface error in page if needed
    }
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      isAr,
      me,
      entitlements,
      recentNotes,
      recentNotesStatus,
      refreshNotes,
    }),
    [lang, isAr, me, entitlements, recentNotes, recentNotesStatus, refreshNotes],
  );

  if (isLoading || (!isAuthenticated && !me)) {
    return (
      <DirectionProvider dir={isAr ? "rtl" : "ltr"}>
        <div
          className={cn(
            "min-h-screen bg-[#f6f7fb] text-[var(--ns-ink)] flex",
            "font-body",
            isAr && "flex-row-reverse",
          )}
        >
          <div className="flex flex-1 flex-col gap-6 p-7">
            <div className={emptyStateClass}>{copy.common.loading}</div>
          </div>
        </div>
      </DirectionProvider>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      <DirectionProvider dir={isAr ? "rtl" : "ltr"}>
        <div
          className={cn(
            "min-h-screen bg-[#f6f7fb] text-[var(--ns-ink)] flex",
            "font-body",
            isAr && "flex-row-reverse",
          )}
        >
          <aside
            className={cn(
              "flex flex-col gap-4 border-r border-[rgba(15,23,42,0.1)] bg-[#f8fafc] py-5 px-4 transition-[width] duration-200",
              "max-[960px]:fixed max-[960px]:top-0 max-[960px]:bottom-0 max-[960px]:z-20 max-[960px]:shadow-[0_24px_60px_rgba(15,23,42,0.2)] max-[960px]:transition-transform max-[960px]:duration-200",
              collapsed ? "w-[76px] max-[960px]:w-[260px]" : "w-[260px]",
              isAr
                ? "border-r-0 border-l border-[rgba(15,23,42,0.1)] max-[960px]:right-0 max-[960px]:left-auto"
                : "max-[960px]:left-0",
              mobileOpen
                ? "max-[960px]:translate-x-0"
                : isAr
                  ? "max-[960px]:translate-x-full"
                  : "max-[960px]:-translate-x-full",
            )}
            id="dashboard-sidebar"
            aria-label={copy.shell.sidebarLabel}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.1)]">
                <Image src="/noteship-mark.svg" alt="" width={30} height={30} />
              </span>
              {!collapsed ? (
                <span className="grid">
                  <span className="text-[1.05rem] font-semibold">Noteship</span>
                  <span className="text-[0.78rem] text-[#5b6474]">{shared.brandTagline}</span>
                </span>
              ) : null}
            </div>

            <nav className="grid gap-1.5" aria-label={copy.shell.navigationLabel}>
              {navKeys.map((key) => {
                const href = navRoutes[key];
                const isActive = pathname === href || pathname?.startsWith(`${href}/`);
                return (
                  <Link
                    key={key}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] border border-transparent px-3 py-2.5 text-[#5b6474] font-medium transition-colors",
                      "hover:bg-[rgba(15,118,110,0.08)] hover:text-slate-900 hover:border-[rgba(15,118,110,0.2)]",
                      isActive &&
                        "bg-[rgba(15,118,110,0.08)] text-slate-900 border-[rgba(15,118,110,0.2)]",
                      collapsed && "justify-center",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-[8px] bg-[rgba(15,118,110,0.12)] text-[0.75rem] text-[var(--ns-accent-strong)]">
                      {copy.nav[key].slice(0, 1)}
                    </span>
                    {!collapsed ? <span>{copy.nav[key]}</span> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="grid gap-2">
              {!collapsed ? (
                <span className="text-[0.75rem] uppercase tracking-[0.14em] text-[#5b6474]">
                  {copy.shell.recent}
                </span>
              ) : null}
              <div className="grid gap-1.5">
                {recentNotesStatus === "loading" ? (
                  <span className={cn("text-[0.75rem] text-[#5b6474]", collapsed && "hidden")}>
                    {copy.common.loading}
                  </span>
                ) : recentNotesStatus === "error" ? (
                  <div className={cn("grid gap-2", collapsed && "hidden")}>
                    <span className="text-[0.75rem] text-[#5b6474]">{copy.common.error}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto border-[rgba(15,23,42,0.1)] px-3 py-1 text-xs"
                      onClick={() => void refreshNotes()}
                    >
                      {copy.common.retry}
                    </Button>
                  </div>
                ) : recentNotes.length === 0 ? (
                  <span className={cn("text-[0.75rem] text-[#5b6474]", collapsed && "hidden")}>
                    {copy.overview.emptyNotes}
                  </span>
                ) : (
                  recentNotes.map((note) => (
                    <Link
                      key={note.noteId}
                      href={`/dashboard/notes/${note.noteId}`}
                      className="grid gap-0.5 rounded-[12px] border border-[rgba(15,23,42,0.1)] bg-white px-3 py-2.5 text-inherit transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                    >
                      <span className={cn("text-[0.85rem] font-medium", collapsed && "hidden")}>
                        {note.title}
                      </span>
                      <span className={cn("text-[0.75rem] text-[#5b6474]", collapsed && "hidden")}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {!collapsed ? (
              <div className="mt-auto grid gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-[rgba(15,23,42,0.1)] bg-white"
                  onClick={() => setCollapsed((v) => !v)}
                  aria-pressed={collapsed}
                  aria-label={collapsed ? copy.shell.expand : copy.shell.collapse}
                  title={collapsed ? copy.shell.expand : copy.shell.collapse}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {collapseIcon}
                  </span>
                  <span className="sr-only">
                    {collapsed ? copy.shell.expand : copy.shell.collapse}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[10px] border-[rgba(15,23,42,0.1)] text-[0.85rem]"
                  onClick={() => setMobileOpen(false)}
                >
                  {copy.shell.close}
                </Button>
              </div>
            ) : null}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header
              className={cn(
                "sticky top-0 z-10 flex items-center gap-4 border-b border-[rgba(15,23,42,0.1)] bg-white/90 px-7 py-[18px] backdrop-blur-md max-[960px]:px-4 max-[960px]:py-3",
                isAr && "flex-row-reverse",
              )}
            >
              <Button
                type="button"
                variant="outline"
                size="pill"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="dashboard-sidebar"
              >
                {copy.shell.menu}
              </Button>
              <span className="text-[1rem] font-semibold">
                {me?.name ?? me?.email ?? "Noteship"}
              </span>
              <form
                className="flex max-w-[420px] flex-1 items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f3f4f7] px-3 py-2"
                onSubmit={handleSearchSubmit}
                role="search"
              >
                <Input
                  ref={searchInputRef}
                  className="h-auto border-none bg-transparent p-0 text-[0.9rem] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  type="search"
                  placeholder={copy.topbar.searchPlaceholder}
                  aria-label={copy.topbar.searchPlaceholder}
                  defaultValue={searchParams?.get("q") ?? ""}
                />
              </form>
              <div className="flex items-center gap-2.5">
                <Button type="button" variant="outline" size="pill" onClick={handleCreateNote}>
                  {copy.topbar.newNote}
                </Button>
                <Button asChild size="pill">
                  <Link href="/logout">{copy.shell.logout}</Link>
                </Button>
              </div>
            </header>
            <div className="flex flex-col gap-6 p-7">{children}</div>
          </div>
        </div>
      </DirectionProvider>
    </DashboardContext.Provider>
  );
};

const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f7fb] text-[var(--ns-ink)]">
          <div className="flex flex-col gap-6 p-7">
            <div className={emptyStateClass}>{dashboardCopy.en.common.loading}</div>
          </div>
        </div>
      }
    >
      <DashboardShellInner>{children}</DashboardShellInner>
    </Suspense>
  );
};

export default DashboardShell;
