import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = "https://register.atomicpathshala.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Free Biology Strategy & Roadmap Session | Atomic Pathshala",
    template: "%s | Atomic Pathshala",
  },
  description:
    "Register free for Atomic Pathshala's live Biology Strategy & Roadmap Session on Google Meet. Get the complete NEET Biology strategy, study plan, NCERT approach and doubt discussion.",
  keywords: [
    "Atomic Pathshala",
    "NEET Biology",
    "Biology Strategy Session",
    "NEET Roadmap",
    "NCERT Biology",
    "Free NEET Session",
  ],
  authors: [{ name: "Atomic Pathshala" }],
  openGraph: {
    title: "Free Biology Strategy & Roadmap Session | Atomic Pathshala",
    description:
      "Join a free live Google Meet session on NEET Biology strategy, roadmap, study plan, NCERT approach and doubt discussion.",
    url: "/register",
    siteName: "Atomic Pathshala",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Biology Strategy & Roadmap Session | Atomic Pathshala",
    description:
      "Join a free live Google Meet session on NEET Biology strategy, roadmap, study plan, NCERT approach and doubt discussion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-body bg-ink text-paper antialiased">{children}</body>
    </html>
  );
}
