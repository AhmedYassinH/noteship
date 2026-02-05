"use client";

import { useEffect, useMemo, useRef } from "react";
import homeCopy from "../../data/marketing-home";
import type { Lang } from "../../data/marketing-shared";
import WaitlistForm from "./WaitlistForm";
import { cn } from "@/lib/utils";

type WaitlistModalProps = {
  open: boolean;
  onClose: () => void;
  lang: Lang;
};

const WaitlistModal = ({ open, onClose, lang }: WaitlistModalProps) => {
  const t = useMemo(() => homeCopy[lang], [lang]);
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
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[2px]"
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
          "relative z-10 w-full max-w-[680px] overflow-hidden rounded-[28px] border border-[rgba(15,23,42,0.12)] bg-white/95 p-7 text-left shadow-[0_24px_48px_rgba(15,23,42,0.18)]",
          "max-[720px]:p-6",
          isAr && "text-right",
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-[rgba(15,118,110,0.35)]"
        />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={cn(
            "absolute top-4 h-9 w-9 rounded-full border border-[rgba(15,23,42,0.12)] bg-white text-[0.9rem] font-semibold text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.12)] hover:bg-slate-50",
            isAr ? "left-4" : "right-4",
          )}
        >
          X
        </button>
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <div className="grid gap-4">
            <span className="inline-flex w-fit items-center rounded-full border border-[rgba(15,23,42,0.12)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--ns-muted)]">
              {t.waitlistKicker}
            </span>
            <div className="grid gap-2">
              <h2
                id="waitlist-modal-title"
                className="m-0 font-headline text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-[1.25]"
              >
                {t.waitlistTitle}
              </h2>
              <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
                {t.waitlistLead}
              </p>
            </div>
            <div className="rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-[#f7f8f9] p-4">
              <p className="m-0 text-[0.95rem] text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {t.waitlistNote}
              </p>
            </div>
          </div>
          <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <WaitlistForm lang={lang} source="marketing-modal" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
