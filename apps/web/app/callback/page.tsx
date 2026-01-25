"use client";

import { useEffect, useState } from "react";
import { handleAuthCallback } from "../../lib/auth-spa";

const CallbackPage = () => {
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    const complete = async () => {
      try {
        const returnTo = await handleAuthCallback();
        window.location.replace(returnTo ?? "/dashboard");
      } catch {
        setMessage("We could not complete sign-in. Please try again.");
      }
    };

    void complete();
  }, []);

  return <div>{message}</div>;
};

export default CallbackPage;
