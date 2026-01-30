import type { ReactNode } from "react";
import AuthProvider from "../components/auth/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "Noteship",
  description:
    "AI-first notes workflow for consultants and coaches: recall by meaning, repurpose drafts, publish consistently.",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
