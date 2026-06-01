import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friends Advertising - Premium Outdoor Solutions",
  description: "The Complete Outdoor Solution based in Mumbai and Satara. Specializing in flex boards, LED signs, and transit advertising.",
};

import PageShell from "@/components/PageShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--neon-purple)] selection:text-white"
        suppressHydrationWarning
      >
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
