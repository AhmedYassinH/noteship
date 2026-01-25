import { redirect } from "next/navigation";

const LogoutPage = () => {
  redirect("/api/auth/logout?returnTo=/");
};

export default LogoutPage;
