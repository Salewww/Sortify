import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Sortify — Stop chasing clients for documents",
    template: "%s · Sortify",
  },
  description:
    "Send one link, your client uploads everything. No chasing emails, no missed documents. Client onboarding built for bookkeepers and accountants. From $14/mo.",
  metadataBase: new URL("https://sortify.app"),
  keywords: [
    "client onboarding software accountants",
    "document collection bookkeepers",
    "client portal accounting",
    "bookkeeper client management",
    "accounting client intake software",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sortify",
    title: "Sortify — Stop chasing clients for documents",
    description:
      "Send one link, your client uploads everything. Client onboarding built for bookkeepers — from $14/mo with a 14-day free trial.",
    url: "https://sortify.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sortify — Client onboarding for bookkeepers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sortify — Stop chasing clients for documents",
    description:
      "Send one link, your client uploads everything. Built for bookkeepers. From $14/mo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
