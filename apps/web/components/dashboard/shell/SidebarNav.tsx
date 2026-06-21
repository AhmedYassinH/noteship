"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NoteResponse } from "../../../lib/api/types";
import { noteHref } from "../../../lib/routes";
import { Button } from "../../ui/Button";
import { cn } from "@/lib/utils";
import type { ShellDir, SidebarNavItem } from "./types";
import { PanelLeft } from "lucide-react";

type SidebarNavProps = {
  brandTagline: string;
  children?: ReactNode;
  className?: string;
  collapseLabel: string;
  collapsed: boolean;
  dir: ShellDir;
  errorLabel: string;
  expandLabel: string;
  headerId?: string;
  navAriaLabel: string;
  navItems: SidebarNavItem[];
  onRetryRecent: () => void;
  onToggleCollapsed: () => void;
  recentEmptyLabel: string;
  recentLabel: string;
  recentNotes: NoteResponse[];
  recentStatus: "loading" | "ready" | "error";
  retryLabel: string;
  showCollapseToggle?: boolean;
  sidebarAriaLabel: string;
  title: string;
};

const SidebarNav = ({
  brandTagline,
  children,
  className,
  collapseLabel,
  collapsed,
  dir,
  errorLabel,
  expandLabel,
  headerId,
  navAriaLabel,
  navItems,
  onRetryRecent,
  onToggleCollapsed,
  recentEmptyLabel,
  recentLabel,
  recentNotes,
  recentStatus,
  retryLabel,
  showCollapseToggle = true,
  sidebarAriaLabel,
  title,
}: SidebarNavProps) => {
  const showExpandedContent = !collapsed;
  const toggleLabel = collapsed ? expandLabel : collapseLabel;

  return (
    <div aria-label={sidebarAriaLabel} className={cn("flex h-full flex-col gap-4", className)}>
      <div className={cn("group relative flex items-center gap-3", collapsed && "justify-center")}>
        {collapsed ? (
          <span className="relative block h-10 w-10">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.1)] transition-opacity duration-150 group-hover:opacity-0 group-focus-within:opacity-0">
              <Image src="/noteship-mark.svg" alt="" width={30} height={30} />
            </span>
            <Button
              aria-label={toggleLabel}
              aria-pressed={collapsed}
              className={cn(
                "absolute inset-0 h-10 w-10 rounded-[14px] border border-[rgba(15,23,42,0.1)] bg-white p-0 shadow-[0_8px_20px_rgba(15,23,42,0.1)]",
                "opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
              )}
              data-testid="dashboard-sidebar-toggle"
              onClick={onToggleCollapsed}
              size="icon"
              title={toggleLabel}
              type="button"
              variant="outline"
            >
              <PanelLeft className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
              <span className="sr-only">{toggleLabel}</span>
            </Button>
          </span>
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.1)]">
            <Image src="/noteship-mark.svg" alt="" width={30} height={30} />
          </span>
        )}
        {showExpandedContent ? (
          <span className="grid">
            <span className="text-[1.05rem] font-semibold" id={headerId}>
              {title}
            </span>
            <span className="text-[0.78rem] text-[#5b6474]">{brandTagline}</span>
          </span>
        ) : null}
        {!collapsed && showCollapseToggle ? (
          <Button
            aria-label={toggleLabel}
            aria-pressed={collapsed}
            className={cn(
              "rounded-full border-[rgba(15,23,42,0.12)] bg-white ml-auto rtl:ml-0 rtl:mr-auto",
              "h-9 w-9 px-0",
            )}
            data-testid="dashboard-sidebar-toggle"
            onClick={onToggleCollapsed}
            size="icon"
            title={toggleLabel}
            type="button"
            variant="outline"
          >
            <PanelLeft className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
            <span className="sr-only">{toggleLabel}</span>
          </Button>
        ) : null}
      </div>

      <nav aria-label={navAriaLabel} className="grid gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const iconOnly = collapsed;
          return (
            <Link
              aria-current={item.isActive ? "page" : undefined}
              aria-label={iconOnly ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[12px] border border-transparent px-3 py-2.5 text-[#445167] font-medium outline-none",
                "transition-colors hover:bg-[rgba(15,118,110,0.08)] hover:text-slate-900 hover:border-[rgba(15,118,110,0.2)]",
                "focus-visible:ring-2 focus-visible:ring-[var(--ns-accent)] focus-visible:ring-offset-2",
                item.isActive &&
                  "bg-[rgba(15,118,110,0.1)] text-slate-900 border-[rgba(15,118,110,0.24)]",
                iconOnly && "justify-center px-2.5",
              )}
              href={item.href}
              key={item.key}
              title={iconOnly ? item.label : undefined}
            >
              <span className="grid h-5 w-5 place-items-center text-[var(--ns-accent-strong)]">
                <Icon className="h-4 w-4" />
              </span>
              {!iconOnly ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-2 grid gap-2 border-t border-[rgba(15,23,42,0.08)] pt-3",
          collapsed && "hidden",
        )}
      >
        <span className="text-[0.75rem] uppercase tracking-[0.14em] text-[#5b6474]">
          {recentLabel}
        </span>
        <div className="grid gap-1.5">
          {recentStatus === "loading" ? (
            <div className="grid gap-1.5">
              <div className="h-8 animate-pulse rounded-[10px] bg-[rgba(15,23,42,0.08)]" />
              <div className="h-8 animate-pulse rounded-[10px] bg-[rgba(15,23,42,0.08)]" />
            </div>
          ) : recentStatus === "error" ? (
            <div className="grid gap-2">
              <span className="text-[0.8rem] text-[#5b6474]">{errorLabel}</span>
              <Button
                className="h-auto border-[rgba(15,23,42,0.12)] px-3 py-1 text-xs"
                onClick={onRetryRecent}
                size="sm"
                type="button"
                variant="outline"
              >
                {retryLabel}
              </Button>
            </div>
          ) : recentNotes.length === 0 ? (
            <span className="text-[0.8rem] text-[#5b6474]">{recentEmptyLabel}</span>
          ) : (
            recentNotes.map((note) => (
              <Link
                className="grid gap-0.5 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 text-inherit outline-none transition-shadow hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent)] focus-visible:ring-offset-2"
                href={noteHref(note.noteId)}
                key={note.noteId}
              >
                <span className="truncate text-[0.84rem] font-medium">{note.title}</span>
                <span className="text-[0.75rem] text-[#5b6474]">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto" />
      {children}
    </div>
  );
};

export default SidebarNav;
