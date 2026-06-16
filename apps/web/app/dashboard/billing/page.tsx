"use client";

import { useMemo } from "react";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

const BillingPage = () => {
  const { lang, isAr, me } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);

  return (
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.billing.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.billing.subtitle}</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="m-0 mb-2 text-[0.95rem] font-semibold">{t.billing.currentPlanLabel}</p>
            <p className="m-0 text-[1.4rem] font-semibold">{me?.planId ?? "free"}</p>
            <p className="m-0 text-[0.85rem] text-[#5b6474]">
              {me?.subscriptionStatus ?? t.billing.defaultStatus}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="pill" disabled>
                {t.billing.upgrade}
              </Button>
              <Button type="button" variant="outline" size="pill" disabled>
                {t.billing.manage}
              </Button>
            </div>
            <p className="m-0 text-[0.85rem] text-[#5b6474]">{t.billing.comingSoon}</p>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default BillingPage;
