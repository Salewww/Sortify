import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sortify - Client Access Onboarding",
  description: "Get client access set up fast. Track it. Remind it. Audit it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
