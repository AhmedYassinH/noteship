"use client";

import type { FormEvent, RefObject } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LogOut, Menu, Plus } from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { cn } from "@/lib/utils";
import type { ShellDir } from "./types";

type TopbarProps = {
  breadcrumbs: string[];
  dir: ShellDir;
  isMobile: boolean;
  logoutLabel: string;
  menuLabel: string;
  newNoteLabel: string;
  onCreateNote: () => void;
  onOpenNavigation: () => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  searchDefaultValue: string;
  searchInputRef: RefObject<HTMLInputElement>;
  searchPlaceholder: string;
  showNavigationMenu: boolean;
  userLabel: string;
};

const isLikelyLtrToken = (value: string) => /[@/:#.]/.test(value);

const Topbar = ({
  breadcrumbs,
  dir,
  isMobile,
  logoutLabel,
  menuLabel,
  newNoteLabel,
  onCreateNote,
  onOpenNavigation,
  onSearchSubmit,
  searchDefaultValue,
  searchInputRef,
  searchPlaceholder,
  showNavigationMenu,
  userLabel,
}: TopbarProps) => {
  const Separator = dir === "rtl" ? ChevronLeft : ChevronRight;
  const nameNeedsLtr = isLikelyLtrToken(userLabel);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-[rgba(15,23,42,0.1)] bg-white/92 px-4 py-3 backdrop-blur-sm",
        "md:px-6 md:py-4 lg:px-8 lg:py-4",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {showNavigationMenu ? (
          <Button
            aria-label={menuLabel}
            className="h-10 w-10 rounded-full border-[rgba(15,23,42,0.12)] bg-white p-0"
            onClick={onOpenNavigation}
            size="icon"
            title={menuLabel}
            type="button"
            variant="outline"
          >
            <Menu className="h-4 w-4" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1 md:flex-none">
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1 text-[0.78rem] text-[#5b6474] sm:flex"
          >
            {breadcrumbs.map((segment, index) => (
              <span className="inline-flex min-w-0 items-center gap-1" key={`${segment}-${index}`}>
                {index > 0 ? <Separator className="h-3.5 w-3.5 text-[#94a3b8]" /> : null}
                <span className={cn("truncate", index > 0 && "max-[1100px]:hidden")}>
                  {segment}
                </span>
              </span>
            ))}
          </nav>
          <span
            className="block max-w-[200px] truncate text-[0.95rem] font-semibold text-[#0f172a] sm:max-w-[260px]"
            dir={nameNeedsLtr ? "ltr" : undefined}
            style={nameNeedsLtr ? { unicodeBidi: "isolate" } : undefined}
          >
            {userLabel}
          </span>
        </div>

        <form
          className="order-last flex w-full items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f3f4f7] px-3 py-2 md:order-none md:min-w-[180px] md:max-w-[520px] md:flex-1"
          onSubmit={onSearchSubmit}
          role="search"
        >
          <Input
            aria-label={searchPlaceholder}
            className="h-auto border-none bg-transparent p-0 text-[0.9rem] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            defaultValue={searchDefaultValue}
            placeholder={searchPlaceholder}
            ref={searchInputRef}
            type="search"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 rtl:ml-0 rtl:mr-auto">
          <Button onClick={onCreateNote} size="pill" type="button" variant="outline">
            <Plus className="h-4 w-4" />
            <span className="max-[1100px]:hidden">{newNoteLabel}</span>
          </Button>
          <Button
            asChild
            className={cn(isMobile && "px-3")}
            size="pill"
            variant={isMobile ? "outline" : "default"}
          >
            <Link href="/logout">
              <LogOut className="h-4 w-4" />
              {!isMobile ? (
                <span>{logoutLabel}</span>
              ) : (
                <span className="sr-only">{logoutLabel}</span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
