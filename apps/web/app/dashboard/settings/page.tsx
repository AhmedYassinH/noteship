"use client";

import { useMemo } from "react";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { Card } from "../../../components/ui/Card";
import LanguageToggle from "../../../components/ui/LanguageToggle";

const SettingsPage = () => {
  const { lang, setLang, isAr, me } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);

  return (
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.settings.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.settings.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <h2 className="m-0 mb-2 text-[0.95rem] font-semibold">{t.settings.profile}</h2>
          <p className="m-0 text-[0.85rem] text-[#5b6474]">{me?.name ?? me?.email ?? "-"}</p>
        </Card>
        <Card className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <h2 className="m-0 mb-2 text-[0.95rem] font-semibold">{t.settings.language}</h2>
          <LanguageToggle lang={lang} onChange={setLang} />
        </Card>
      </div>
    </main>
  );
};

export default SettingsPage;
