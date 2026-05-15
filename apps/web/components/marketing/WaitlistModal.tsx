"use client";

import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import sharedCopy from "../../data/marketing-shared";
import type { Lang } from "../../data/marketing-shared";
import AccessRequestForm from "./WaitlistForm";
import { cn } from "@/lib/utils";

type WaitlistModalProps = {
  open: boolean;
  onClose: () => void;
  lang: Lang;
};

const WaitlistModal = ({ open, onClose, lang }: WaitlistModalProps) => {
  const t = useMemo(() => sharedCopy[lang].access, [lang]);
  const isAr = lang === "ar";
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      const input = dialogRef.current?.querySelector<HTMLInputElement>("input[type='email']");
      input?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
        lang={lang}
        dir={isAr ? "rtl" : "ltr"}
        className={cn(
          "relative z-10 w-full max-w-[680px] overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.14)] bg-white p-7 text-left shadow-[0_20px_44px_rgba(15,23,42,0.16)]",
          "max-[720px]:p-6",
          isAr && "text-right",
        )}
      >
        <button
          type="button"
          aria-label={isAr ? "إغلاق" : "Close"}
          onClick={onClose}
          className={cn(
            "absolute top-4 h-9 w-9 rounded-full border border-[rgba(15,23,42,0.16)] bg-white text-slate-700 transition-colors hover:bg-slate-50",
            "inline-flex items-center justify-center",
            isAr ? "left-4" : "right-4",
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mb-5 grid gap-2 pr-10 rtl:pr-0 rtl:pl-10">
          <span className="inline-flex w-fit items-center rounded-full border border-[rgba(15,23,42,0.12)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ns-muted)]">
            {t.kicker}
          </span>
          <h2 id="waitlist-modal-title" className="m-0 font-headline text-[1.65rem] leading-[1.22]">
            {t.title}
          </h2>
          <p className="m-0 text-[0.98rem] text-[var(--ns-muted)] leading-[1.7] rtl:leading-[1.9]">
            {t.lead}
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(15,23,42,0.1)] bg-[#fbfcfc] p-5">
          <AccessRequestForm lang={lang} source="marketing-modal" />
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
