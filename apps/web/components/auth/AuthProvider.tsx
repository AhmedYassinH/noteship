"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import type { ReactNode } from "react";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <UserProvider>{children}</UserProvider>;
};

export default AuthProvider;
