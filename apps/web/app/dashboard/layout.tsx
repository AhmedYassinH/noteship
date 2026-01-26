import type { ReactNode } from "react";
import DashboardShell from "../../components/dashboard/DashboardShell";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardLayout;
