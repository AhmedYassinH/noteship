"use client";

import { useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";

const LoginPage = () => {
  const { login } = useAuth();

  useEffect(() => {
    void login("/dashboard");
  }, [login]);

  return <div>Redirecting to login...</div>;
};

export default LoginPage;
