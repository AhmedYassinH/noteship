import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Noteship",
  description: "Semantic-first notes and publishing for solo consultants.",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
};

export default RootLayout;
