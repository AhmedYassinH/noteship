import type { ReactNode } from "react";
import MarketingShell from "../../components/marketing/MarketingShell";

const MarketingLayout = ({ children }: { children: ReactNode }) => {
  return <MarketingShell>{children}</MarketingShell>;
};

export default MarketingLayout;
