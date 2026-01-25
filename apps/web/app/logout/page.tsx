"use client";

import { useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";

const LogoutPage = () => {
  const { logout } = useAuth();

  useEffect(() => {
    void logout();
  }, [logout]);

  return <div>Signing out...</div>;
};

export default LogoutPage;
