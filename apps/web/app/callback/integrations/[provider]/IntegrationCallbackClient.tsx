"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { finalizeIntegrationCallback } from "../../../../lib/api/notes";
import type { IntegrationProvider } from "../../../../lib/api/types";
import LoadingScreen from "../../../../components/ui/LoadingScreen";

const finalizeRequestKeys = new Set<string>();

const isIntegrationProvider = (value: string): value is IntegrationProvider => value === "linkedin";

type IntegrationCallbackClientProps = {
  provider: string;
};

const IntegrationCallbackClient = ({ provider }: IntegrationCallbackClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "error">("pending");

  const integrationProvider = useMemo(() => provider, [provider]);

  useEffect(() => {
    if (!isIntegrationProvider(integrationProvider)) {
      setStatus("error");
      return;
    }

    const code = searchParams?.get("code");
    const state = searchParams?.get("state");
    const oauthError = searchParams?.get("error");
    const redirectUrl = `${window.location.origin}/callback/integrations/${integrationProvider}`;

    if (oauthError) {
      setStatus("error");
      return;
    }

    if (!code || !state) {
      setStatus("error");
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
      }
    };

    void complete();
  }, [integrationProvider, router, searchParams]);

  return (
    <LoadingScreen
      state={status === "error" ? "error" : "loading"}
      surface="integrationCallback"
      onErrorAction={() => router.replace("/dashboard/integrations")}
    />
  );
};

export default IntegrationCallbackClient;
