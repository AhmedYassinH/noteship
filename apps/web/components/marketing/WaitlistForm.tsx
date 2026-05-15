"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import sharedCopy, { type Lang } from "../../data/marketing-shared";

type AccessRequestFormProps = {
  lang: Lang;
  source: string;
};

const AccessRequestForm = ({ lang, source }: AccessRequestFormProps) => {
  const t = useMemo(() => sharedCopy[lang].access, [lang]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [cadence, setCadence] = useState("");

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

    const submissionUrl = typeof window !== "undefined" ? window.location.href : "";
    const submissionDomain = typeof window !== "undefined" ? window.location.hostname : "";

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
          role,
          cadence,
          language: lang,
          source,
          submissionUrl,
          submissionDomain,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setRole("");
        setCadence("");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const submissionUrl = typeof window !== "undefined" ? window.location.href : "";
  const submissionDomain = typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <form
      onSubmit={handleSubmit}
      action="https://formspree.io/f/mreqjovo"
      method="POST"
      className="grid gap-4"
    >
      <label htmlFor={`access-email-${source}`} className="text-[0.9rem] font-semibold">
        {t.emailLabel}
      </label>
      <Input
        id={`access-email-${source}`}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (status === "error") {
            setStatus("idle");
          }
        }}
        required
        disabled={status === "success"}
        className="h-11 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 text-[0.95rem] text-left rtl:text-right"
      />

      <label htmlFor={`access-role-${source}`} className="text-[0.9rem] font-semibold">
        {t.roleLabel}
      </label>
      <Input
        id={`access-role-${source}`}
        name="role"
        type="text"
        placeholder={t.rolePlaceholder}
        value={role}
        onChange={(event) => {
          setRole(event.target.value);
          if (status === "error") {
            setStatus("idle");
          }
        }}
        disabled={status === "success"}
        className="h-11 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 text-[0.95rem] text-left rtl:text-right"
      />

      <label htmlFor={`access-cadence-${source}`} className="text-[0.9rem] font-semibold">
        {t.cadenceLabel}
      </label>
      <Input
        id={`access-cadence-${source}`}
        name="cadence"
        type="text"
        placeholder={t.cadencePlaceholder}
        value={cadence}
        onChange={(event) => {
          setCadence(event.target.value);
          if (status === "error") {
            setStatus("idle");
          }
        }}
        required
        disabled={status === "success"}
        className="h-11 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 text-[0.95rem] text-left rtl:text-right"
      />

      <input type="hidden" name="language" value={lang} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="submissionUrl" value={submissionUrl} />
      <input type="hidden" name="submissionDomain" value={submissionDomain} />
      <Button
        type="submit"
        size="pill"
        disabled={status === "loading" || status === "success"}
        className="mt-1 h-11 w-full"
      >
        {status === "loading" ? t.ctaLoading : t.cta}
      </Button>
      <div aria-live="polite" className="min-h-[44px] text-[0.92rem]">
        {status === "success" ? (
          <>
            <p className="m-0 font-semibold text-[var(--ns-accent-strong)]">{t.successTitle}</p>
            <p className="m-0 text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
              {t.successCopy}
            </p>
          </>
        ) : null}
        {status === "error" ? <p className="m-0 text-rose-600">{t.errorCopy}</p> : null}
      </div>
    </form>
  );
};

export default AccessRequestForm;
