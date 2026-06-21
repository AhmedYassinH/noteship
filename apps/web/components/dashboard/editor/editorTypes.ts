import type { LucideIcon } from "lucide-react";

export type EditorDirection = "ltr" | "rtl";
export type UploadIntent = "embed" | "attach";
export type ArtifactType = "image" | "pdf";
export type MenuMode = "insert" | "slash";

export type SlashRange = {
  from: number;
  to: number;
};

export type TopLevelBlockSelection = {
  index: number;
  pos: number;
  size: number;
};

export type CommandMenuAnchor = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type BlockCommand = {
  id: string;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  run: () => void | Promise<void>;
};
