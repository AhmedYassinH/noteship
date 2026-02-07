import type { LucideIcon } from "lucide-react";

export type ShellDir = "ltr" | "rtl";

export type SidebarNavItem = {
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  key: string;
  label: string;
};
