"use client";

import type { FormEvent, ReactNode } from "react";
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
import {
  CreditCard,
  FilePenLine,
  LayoutDashboard,
  NotebookPen,
  Plug,
  Search,
  Send,
  Settings,
} from "lucide-react";
import type { MeResponse } from "@noteship/domain";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dashboardCopy, { type DashboardCopy, Lang } from "../../data/dashboard";
import sharedCopy from "../../data/marketing-shared";
import { getEntitlements, type EntitlementsSnapshot } from "../../lib/entitlements";
import { apiFetch } from "../../lib/api/client";
import { createContentSession, createNote, listNotes } from "../../lib/api/notes";
import { updateMeSettings } from "../../lib/api/users";
import type { NoteResponse } from "../../lib/api/types";
import { getStoredLang, persistLang } from "../../lib/language";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import LoadingScreen from "../ui/LoadingScreen";
import ContentShell from "./shell/ContentShell";
import ResizableHandle from "./shell/ResizableHandle";
import SidebarNav from "./shell/SidebarNav";
import {
  SHELL_BREAKPOINTS,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH_DESKTOP,
  SIDEBAR_MAX_WIDTH_WIDE,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_SNAP_POINTS,
  SIDEBAR_STORAGE_KEYS,
} from "./shell/constants";
import Topbar from "./shell/Topbar";
import type { SidebarNavItem } from "./shell/types";

type DashboardContextValue = {
  entitlements: EntitlementsSnapshot;
  isAr: boolean;
  lang: Lang;
  me: MeResponse["user"] | null;
  recentNotes: NoteResponse[];
  recentNotesStatus: "loading" | "ready" | "error";
  refreshNotes: () => Promise<void>;
  setLang: (lang: Lang) => void;
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

const navIcons = {
  overview: LayoutDashboard,
  notes: NotebookPen,
  search: Search,
  drafts: FilePenLine,
  publishing: Send,
  integrations: Plug,
  billing: CreditCard,
  settings: Settings,
} as const;

const emptyStateClass =
  "rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getDefaultSidebarWidth = (viewportWidth: number) => {
  if (viewportWidth >= SHELL_BREAKPOINTS.wideMin) return SIDEBAR_DEFAULT_WIDTH.wide;
  if (viewportWidth > SHELL_BREAKPOINTS.tabletMax) return SIDEBAR_DEFAULT_WIDTH.desktop;
  return SIDEBAR_DEFAULT_WIDTH.tablet;
};

const getSidebarMaxWidth = (isWide: boolean) =>
  isWide ? SIDEBAR_MAX_WIDTH_WIDE : SIDEBAR_MAX_WIDTH_DESKTOP;

const getSnappedSidebarWidth = (value: number, max: number) => {
  const candidates = SIDEBAR_SNAP_POINTS.filter((point) => point <= max);
  if (candidates.length === 0) return clamp(value, SIDEBAR_MIN_WIDTH, max);
  const nearest = candidates.reduce((prev, next) =>
    Math.abs(next - value) < Math.abs(prev - value) ? next : prev,
  );
  return clamp(nearest, SIDEBAR_MIN_WIDTH, max);
};

const getContentMaxWidthClass = (pathname: string | null) => {
  if (!pathname) return "max-w-[1280px]";
  if (pathname.startsWith("/dashboard/notes")) return "max-w-[1200px]";
  if (
    pathname.startsWith("/dashboard/search") ||
    pathname.startsWith("/dashboard/drafts") ||
    pathname.startsWith("/dashboard/publishing")
  ) {
    return "max-w-[1400px]";
  }
  return "max-w-[1280px]";
};

const getBreadcrumbs = (pathname: string | null, copy: DashboardCopy) => {
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  if (segments.length <= 1) return [copy.nav.overview];
  const routeSegment = segments[1];
  const matched = navKeys.find((key) => {
    const [, keySegment] = navRoutes[key].split("/dashboard/");
    return keySegment === routeSegment;
  });
  if (!matched || matched === "overview") return [copy.nav.overview];
  return [copy.nav.overview, copy.nav[matched]];
};

const DashboardShellInner = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLangState] = useState<Lang>(() => getStoredLang());
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [recentNotes, setRecentNotes] = useState<NoteResponse[]>([]);
  const [recentNotesStatus, setRecentNotesStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_DEFAULT_WIDTH.desktop);
  const [viewportWidth, setViewportWidth] = useState<number>(1280);
  const [reducedMotion, setReducedMotion] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const didLoadSidebarPrefsRef = useRef(false);

  const isAr = lang === "ar";
  const copy = useMemo(() => dashboardCopy[lang], [lang]);
  const shared = useMemo(() => sharedCopy[lang], [lang]);
  const entitlements = useMemo(
    () => getEntitlements(me?.planId, me?.subscriptionStatus),
    [me?.planId, me?.subscriptionStatus],
  );

  const isMobile = viewportWidth <= SHELL_BREAKPOINTS.mobileMax;
  const isTablet =
    viewportWidth > SHELL_BREAKPOINTS.mobileMax && viewportWidth <= SHELL_BREAKPOINTS.tabletMax;
  const isWide = viewportWidth >= SHELL_BREAKPOINTS.wideMin;
  const sidebarMaxWidth = getSidebarMaxWidth(isWide);
  const canResizeSidebar = !isMobile && !isTablet && !collapsed;
  const effectiveSidebarWidth = collapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : isMobile
      ? SIDEBAR_MIN_WIDTH
      : isTablet
        ? SIDEBAR_DEFAULT_WIDTH.tablet
        : clamp(sidebarWidth, SIDEBAR_MIN_WIDTH, sidebarMaxWidth);
  const navItems = useMemo<SidebarNavItem[]>(
    () =>
      navKeys.map((key) => {
        const href = navRoutes[key];
        const isActive =
          pathname === href || (href !== "/dashboard" && pathname?.startsWith(`${href}/`));
        return {
          href,
          icon: navIcons[key],
          isActive: Boolean(isActive),
          key,
          label: copy.nav[key],
        };
      }),
    [copy.nav, pathname],
  );
  const breadcrumbs = useMemo(() => getBreadcrumbs(pathname, copy), [copy, pathname]);
  const contentMaxWidthClass = useMemo(() => getContentMaxWidthClass(pathname), [pathname]);
  const userLabel = me?.name ?? me?.email ?? "Noteship";

  const setLang = useCallback(
    (nextLang: Lang) => {
      setLangState(nextLang);
      if (!isAuthenticated) return;
      void updateMeSettings(nextLang)
        .then((response) => {
          setMe(response.user);
        })
        .catch(() => {
          // Keep language responsive locally even if settings sync fails.
        });
    },
    [isAuthenticated],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const syncWidth = () => setViewportWidth(window.innerWidth);
    syncWidth();
    window.addEventListener("resize", syncWidth);
    return () => window.removeEventListener("resize", syncWidth);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const query = searchParams?.toString();
      const returnTo = query ? `${pathname}?${query}` : (pathname ?? "/dashboard");
      void login(returnTo);
    }
  }, [isAuthenticated, isLoading, login, pathname, searchParams]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    persistLang(lang);
    window.localStorage.removeItem("noteship-site-direction");
    window.localStorage.removeItem("noteship-editor-direction");
    window.localStorage.removeItem("noteship-editor-direction-linked");
  }, [isAr, lang]);

  useEffect(() => {
    if (didLoadSidebarPrefsRef.current) return;
    const storedCollapsed = window.localStorage.getItem(SIDEBAR_STORAGE_KEYS.collapsed);
    const storedWidth = Number(window.localStorage.getItem(SIDEBAR_STORAGE_KEYS.width));
    const defaultWidth = getDefaultSidebarWidth(viewportWidth);
    setCollapsed(storedCollapsed === "true");
    setSidebarWidth(
      Number.isFinite(storedWidth) && storedWidth > 0
        ? clamp(storedWidth, SIDEBAR_MIN_WIDTH, sidebarMaxWidth)
        : clamp(defaultWidth, SIDEBAR_MIN_WIDTH, sidebarMaxWidth),
    );
    didLoadSidebarPrefsRef.current = true;
  }, [sidebarMaxWidth, viewportWidth]);

  useEffect(() => {
    if (!didLoadSidebarPrefsRef.current) return;
    setSidebarWidth((prev) => clamp(prev, SIDEBAR_MIN_WIDTH, sidebarMaxWidth));
  }, [sidebarMaxWidth]);

  useEffect(() => {
    if (!didLoadSidebarPrefsRef.current) return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEYS.collapsed, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!didLoadSidebarPrefsRef.current) return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEYS.width, String(Math.round(sidebarWidth)));
  }, [sidebarWidth]);

  useEffect(() => {
    // no-op reserved for route-level shell effects
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const meResponse = await apiFetch<MeResponse>("/me");
        setMe(meResponse.user);
        if (meResponse.user.language === "en" || meResponse.user.language === "ar") {
          setLangState(meResponse.user.language);
        }
        try {
          await createContentSession();
        } catch {
          // Keep dashboard functional if the signed content cookie fails.
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

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
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
      // Keep the user in place; page-level retry handles failures.
    }
  };

  const value = useMemo(
    () => ({
      entitlements,
      isAr,
      lang,
      me,
      recentNotes,
      recentNotesStatus,
      refreshNotes,
      setLang,
    }),
    [entitlements, isAr, lang, me, recentNotes, recentNotesStatus, refreshNotes, setLang],
  );

  if (isLoading || (!isAuthenticated && !me)) {
    return <LoadingScreen lang={lang} surface="dashboard" />;
  }

  return (
    <DashboardContext.Provider value={value}>
      <DirectionProvider dir={isAr ? "rtl" : "ltr"}>
        <div
          className={cn(
            "flex h-screen overflow-hidden bg-[#f6f7fb] text-[var(--ns-ink)] font-body",
          )}
        >
          <aside
            className={cn(
              "relative flex h-full shrink-0 flex-col overflow-y-auto bg-[#f8fafc] px-3 py-4 md:px-4 md:py-5",
              isAr
                ? "border-l border-[rgba(15,23,42,0.1)]"
                : "border-r border-[rgba(15,23,42,0.1)]",
              !reducedMotion && "transition-[width] duration-200",
            )}
            style={{ width: `${effectiveSidebarWidth}px` }}
          >
            <SidebarNav
              brandTagline={shared.brandTagline}
              collapseLabel={copy.shell.collapse}
              collapsed={collapsed}
              dir={isAr ? "rtl" : "ltr"}
              errorLabel={copy.common.error}
              expandLabel={copy.shell.expand}
              navAriaLabel={copy.shell.navigationLabel}
              navItems={navItems}
              onRetryRecent={() => void refreshNotes()}
              onToggleCollapsed={() => setCollapsed((prev) => !prev)}
              recentEmptyLabel={copy.overview.emptyNotes}
              recentLabel={copy.shell.recent}
              recentNotes={recentNotes}
              recentStatus={recentNotesStatus}
              retryLabel={copy.common.retry}
              sidebarAriaLabel={copy.shell.sidebarLabel}
              title="Noteship"
            />
            {canResizeSidebar ? (
              <ResizableHandle
                dir={isAr ? "rtl" : "ltr"}
                max={sidebarMaxWidth}
                min={SIDEBAR_MIN_WIDTH}
                onChange={(nextWidth) => setSidebarWidth(nextWidth)}
                onCommit={() =>
                  setSidebarWidth((prev) => getSnappedSidebarWidth(prev, sidebarMaxWidth))
                }
                reducedMotion={reducedMotion}
                value={sidebarWidth}
              />
            ) : null}
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar
              breadcrumbs={breadcrumbs}
              dir={isAr ? "rtl" : "ltr"}
              isMobile={isMobile}
              logoutLabel={copy.shell.logout}
              newNoteLabel={copy.topbar.newNote}
              onCreateNote={handleCreateNote}
              onSearchSubmit={handleSearchSubmit}
              searchDefaultValue={searchParams?.get("q") ?? ""}
              searchInputRef={searchInputRef}
              searchPlaceholder={copy.topbar.searchPlaceholder}
              userLabel={userLabel}
            />
            <ContentShell maxWidthClass={contentMaxWidthClass}>{children}</ContentShell>
          </div>
        </div>
      </DirectionProvider>
    </DashboardContext.Provider>
  );
};

const DashboardShell = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<LoadingScreen surface="dashboard" />}>
      <DashboardShellInner>{children}</DashboardShellInner>
    </Suspense>
  );
};

export default DashboardShell;
