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
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MeResponse } from "@noteship/domain";
import { useAuth } from "../auth/AuthProvider";
import dashboardCopy, { Lang } from "../../data/dashboard";
import sharedCopy from "../../data/marketing-shared";
import { createContentSession, createNote, listNotes } from "../../lib/api/notes";
import { apiFetch } from "../../lib/api/client";
import type { NoteResponse } from "../../lib/api/types";
import { getEntitlements, type EntitlementsSnapshot } from "../../lib/entitlements";
import styles from "../../app/dashboard/dashboard.module.css";

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
  const collapseIcon = isAr ? (collapsed ? "◀" : "▶") : collapsed ? "▶" : "◀";

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
        title: isAr ? "ملاحظة جديدة" : "New note",
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
      <div className={`${styles.shell} ${isAr ? styles.rtl : ""}`}>
        <div className={styles.content}>
          <div className={styles.emptyState}>{copy.common.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      <div
        className={`${styles.shell} ${isAr ? styles.rtl : ""}`}
        data-collapsed={collapsed}
        data-mobile-open={mobileOpen}
      >
        <aside
          className={styles.sidebar}
          id="dashboard-sidebar"
          aria-label={copy.shell.sidebarLabel}
        >
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <Image src="/noteship-mark.svg" alt="" width={30} height={30} />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Noteship</span>
              <span className={styles.brandTagline}>{shared.brandTagline}</span>
            </span>
          </div>

          <nav className={styles.nav} aria-label={copy.shell.navigationLabel}>
            {navKeys.map((key) => {
              const href = navRoutes[key];
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={key}
                  href={href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.navIcon}>{copy.nav[key].slice(0, 1)}</span>
                  <span className={styles.navLabel}>{copy.nav[key]}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.sidebarSection}>
            <span className={styles.sidebarSectionTitle}>{copy.shell.recent}</span>
            <div className={styles.noteList}>
              {recentNotesStatus === "loading" ? (
                <span className={styles.noteMeta}>{copy.common.loading}</span>
              ) : recentNotesStatus === "error" ? (
                <div className={styles.sidebarError}>
                  <span className={styles.noteMeta}>{copy.common.error}</span>
                  <button
                    type="button"
                    className={styles.sidebarAction}
                    onClick={() => void refreshNotes()}
                  >
                    {copy.common.retry}
                  </button>
                </div>
              ) : recentNotes.length === 0 ? (
                <span className={styles.noteMeta}>{copy.overview.emptyNotes}</span>
              ) : (
                recentNotes.map((note) => (
                  <Link
                    key={note.noteId}
                    href={`/dashboard/notes?noteId=${encodeURIComponent(note.noteId)}`}
                    className={styles.noteItem}
                  >
                    <span className={styles.noteTitle}>{note.title}</span>
                    <span className={styles.noteMeta}>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setCollapsed((v) => !v)}
              aria-pressed={collapsed}
              aria-label={collapsed ? copy.shell.expand : copy.shell.collapse}
              title={collapsed ? copy.shell.expand : copy.shell.collapse}
            >
              <span className={styles.collapseIcon} aria-hidden="true">
                {collapseIcon}
              </span>
              <span className={styles.srOnly}>
                {collapsed ? copy.shell.expand : copy.shell.collapse}
              </span>
            </button>
            <button
              type="button"
              className={styles.collapseButton}
              onClick={() => setMobileOpen(false)}
            >
              {copy.shell.close}
            </button>
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.topbar}>
            <button
              type="button"
              className={styles.pillButton}
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="dashboard-sidebar"
            >
              {copy.shell.menu}
            </button>
            <span className={styles.topbarTitle}>{me?.name ?? me?.email ?? "Noteship"}</span>
            <form className={styles.searchBox} onSubmit={handleSearchSubmit} role="search">
              <input
                ref={searchInputRef}
                className={styles.searchInput}
                type="search"
                placeholder={copy.topbar.searchPlaceholder}
                aria-label={copy.topbar.searchPlaceholder}
                defaultValue={searchParams?.get("q") ?? ""}
              />
            </form>
            <div className={styles.topbarActions}>
              <button type="button" className={styles.pillButton} onClick={handleCreateNote}>
                {copy.topbar.newNote}
              </button>
              <Link className={`${styles.pillButton} ${styles.primaryButton}`} href="/logout">
                {copy.shell.logout}
              </Link>
            </div>
          </header>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className={styles.shell}>
          <div className={styles.content}>
            <div className={styles.emptyState}>{dashboardCopy.en.common.loading}</div>
          </div>
        </div>
      }
    >
      <DashboardShellInner>{children}</DashboardShellInner>
    </Suspense>
  );
};

export default DashboardShell;
