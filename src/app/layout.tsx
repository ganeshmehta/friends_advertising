import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import FloatingStarsClient from "@/components/FloatingStarsClient";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friends Advertising - Premium Outdoor Solutions",
  description: "The Complete Outdoor Solution based in Mumbai and Satara. Specializing in flex boards, LED signs, and transit advertising.",
};

import Header from "@/components/Header";

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
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <FloatingStarsClient  />
        </div>
        <Header />
        <div className="flex-1 pt-20 relative z-0">
          {children}
        </div>
      </body>
    </html>
  );
}
