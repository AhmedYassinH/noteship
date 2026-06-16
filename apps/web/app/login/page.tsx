"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import LoadingScreen from "../../components/ui/LoadingScreen";

const LoginPage = () => {
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    void login("/dashboard").catch(() => setStatus("error"));
  }, [login]);

  return (
    <LoadingScreen
      state={status}
      surface="authRedirect"
      onErrorAction={() => {
        setStatus("loading");
        void login("/dashboard").catch(() => setStatus("error"));
      }}
    />
  );
};

export default LoginPage;
