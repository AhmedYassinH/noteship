"use client";

import { useEffect, useState } from "react";
import { handleAuthCallback } from "../../lib/auth-spa";
import LoadingScreen from "../../components/ui/LoadingScreen";

const CallbackPage = () => {
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const complete = async () => {
      try {
        const returnTo = await handleAuthCallback();
        window.location.replace(returnTo ?? "/dashboard");
      } catch {
        setStatus("error");
      }
    };

    void complete();
  }, []);

  return (
    <LoadingScreen
      state={status}
      surface="authCallback"
      onErrorAction={() => window.location.replace("/login")}
    />
  );
};

export default CallbackPage;
