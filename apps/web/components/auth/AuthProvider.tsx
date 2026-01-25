"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@auth0/auth0-spa-js";
import {
  getAccessToken,
  getUserProfile,
  isAuthenticated as checkIsAuthenticated,
  loginWithRedirect,
  logout,
} from "../../lib/auth-spa";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: User;
  error?: Error;
  login: (returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const authed = await checkIsAuthenticated();
        const profile = authed ? await getUserProfile() : undefined;
        if (mounted) {
          setIsAuthenticated(authed);
          setUser(profile);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Auth initialization failed"));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void init();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      error,
      login: loginWithRedirect,
      logout,
      getToken: getAccessToken,
    }),
    [isLoading, isAuthenticated, user, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
