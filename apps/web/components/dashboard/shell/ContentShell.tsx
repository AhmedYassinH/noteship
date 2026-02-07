"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentShellProps = {
  children: ReactNode;
  maxWidthClass: string;
};

const ContentShell = ({ children, maxWidthClass }: ContentShellProps) => {
  return (
    <div className="flex flex-1 flex-col px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
      <div className={cn("mx-auto flex w-full min-w-0 flex-col gap-6", maxWidthClass)}>
        {children}
      </div>
    </div>
  );
};

export default ContentShell;
