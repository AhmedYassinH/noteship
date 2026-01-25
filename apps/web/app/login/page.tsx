import { redirect } from "next/navigation";

const LoginPage = () => {
  redirect("/api/auth/login?returnTo=/dashboard");
};

export default LoginPage;
