"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { finalizeIntegrationCallback } from "../../../../lib/api/notes";
import type { IntegrationProvider } from "../../../../lib/api/types";
import { Button } from "../../../../components/ui/Button";

const finalizeRequestKeys = new Set<string>();

const isIntegrationProvider = (value: string): value is IntegrationProvider => value === "linkedin";

type IntegrationCallbackClientProps = {
  provider: string;
};

const IntegrationCallbackClient = ({ provider }: IntegrationCallbackClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "error">("pending");
  const [message, setMessage] = useState("Finalizing integration...");

  const integrationProvider = useMemo(() => provider, [provider]);

  useEffect(() => {
    if (!isIntegrationProvider(integrationProvider)) {
      setStatus("error");
      setMessage("Unsupported integration provider.");
      return;
    }

    const code = searchParams?.get("code");
    const state = searchParams?.get("state");
    const oauthError = searchParams?.get("error");
    const oauthErrorDescription = searchParams?.get("error_description");
    const redirectUrl = `${window.location.origin}/callback/integrations/${integrationProvider}`;

    if (oauthError) {
      setStatus("error");
      setMessage(oauthErrorDescription || oauthError);
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setMessage("Missing OAuth code/state.");
      return;
    }

    const finalizeKey = `${integrationProvider}:${state}:${code}`;
    if (finalizeRequestKeys.has(finalizeKey)) {
      return;
    }
    finalizeRequestKeys.add(finalizeKey);

    const complete = async () => {
      try {
        await finalizeIntegrationCallback(integrationProvider, { code, state, redirectUrl });
        router.replace("/dashboard/integrations?status=connected");
      } catch (error) {
        finalizeRequestKeys.delete(finalizeKey);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Failed to finalize integration.");
      }
    };

    void complete();
  }, [integrationProvider, router, searchParams]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="m-0 text-2xl font-semibold">Integration Callback</h1>
      <p className="m-0 text-sm text-[#5b6474]">{message}</p>
      {status === "error" ? (
        <Button type="button" onClick={() => router.replace("/dashboard/integrations")}>
          Back to Integrations
        </Button>
      ) : null}
    </main>
  );
};

export default IntegrationCallbackClient;
