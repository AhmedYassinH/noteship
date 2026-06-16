"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import {
  connectIntegration,
  disconnectIntegration,
  listIntegrations,
} from "../../../lib/api/notes";
import type { IntegrationAccountResponse, IntegrationProvider } from "../../../lib/api/types";

const providers: IntegrationProvider[] = ["linkedin"];

const IntegrationsPage = () => {
  const { lang, isAr } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [items, setItems] = useState<IntegrationAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await listIntegrations();
      setItems(response.items);
    } catch {
      setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      const callbackUrl = `${window.location.origin}/callback/integrations/${provider}`;
      const response = await connectIntegration(provider, callbackUrl);
      window.location.href = response.url;
    } catch {
      setError(true);
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    try {
      await disconnectIntegration(provider);
      await load();
    } catch {
      setError(true);
    }
  };

  const statusFor = (provider: IntegrationProvider) =>
    items.find((item) => item.provider === provider)?.status ?? "revoked";

  return (
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.integrations.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.integrations.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
            {t.common.loading}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]"
            role="alert"
          >
            <p>{t.common.error}</p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              {t.common.retry}
            </Button>
          </div>
        ) : (
          providers.map((provider) => {
            const status = statusFor(provider);
            return (
              <Card
                key={provider}
                className="grid gap-3 rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
              >
                <h2 className="m-0 text-[0.95rem] font-semibold">{provider}</h2>
                <Badge variant="secondary" className="rounded-full">
                  {status}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {status === "connected" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDisconnect(provider)}
                    >
                      {t.integrations.disconnect}
                    </Button>
                  ) : (
                    <Button type="button" size="pill" onClick={() => handleConnect(provider)}>
                      {t.integrations.connect}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
};

export default IntegrationsPage;
