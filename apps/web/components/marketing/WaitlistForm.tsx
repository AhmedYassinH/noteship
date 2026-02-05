"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import homeCopy from "../../data/marketing-home";
import type { Lang } from "../../data/marketing-shared";

type WaitlistFormProps = {
  lang: Lang;
  source: string;
};

const WaitlistForm = ({ lang, source }: WaitlistFormProps) => {
  const t = useMemo(() => homeCopy[lang], [lang]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (status === "loading" || status === "success") {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("https://formspree.io/f/mreqjovo", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          language: lang,
          source,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        return;
      }

      setStatus("error");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      action="https://formspree.io/f/mreqjovo"
      method="POST"
      className="grid gap-3"
    >
      <label htmlFor={`waitlist-email-${source}`} className="text-[0.95rem] font-semibold">
        {t.waitlistEmailLabel}
      </label>
      <Input
        id={`waitlist-email-${source}`}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.waitlistEmailPlaceholder}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (status === "error") {
            setStatus("idle");
          }
        }}
        required
        disabled={status === "success"}
        className="h-12 rounded-[14px] border border-[rgba(15,23,42,0.12)] bg-white px-4 text-[1rem] text-left rtl:text-right"
      />
      <input type="hidden" name="language" value={lang} />
      <input type="hidden" name="source" value={source} />
      <Button
        type="submit"
        size="pill"
        disabled={status === "loading" || status === "success"}
        className="h-12 shadow-[0_14px_28px_rgba(15,118,110,0.22)]"
      >
        {status === "loading" ? t.waitlistCtaLoading : t.waitlistCta}
      </Button>
      <div aria-live="polite" className="min-h-[44px] text-[0.95rem]">
        {status === "success" ? (
          <>
            <p className="m-0 font-semibold text-[var(--ns-accent-strong)]">
              {t.waitlistSuccessTitle}
            </p>
            <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
              {t.waitlistSuccessCopy}
            </p>
          </>
        ) : null}
        {status === "error" ? <p className="m-0 text-rose-600">{t.waitlistErrorCopy}</p> : null}
      </div>
    </form>
  );
};

export default WaitlistForm;
