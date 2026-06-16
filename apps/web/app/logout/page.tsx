"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import LoadingScreen from "../../components/ui/LoadingScreen";

const LogoutPage = () => {
  const { logout } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  const startLogout = useCallback(() => {
    setStatus("loading");
    void logout().catch(() => {
      setStatus("error");
    });
  }, [logout]);

  useEffect(() => {
    startLogout();
  }, [startLogout]);

  return <LoadingScreen state={status} surface="authLogout" onErrorAction={startLogout} />;
};

export default LogoutPage;
