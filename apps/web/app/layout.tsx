import type { ReactNode } from "react";
import AuthProvider from "../components/auth/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "Noteship",
  description: "Semantic-first notes and publishing pipeline for solo consultants.",
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
