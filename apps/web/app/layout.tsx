import type { Metadata } from "next";
import { Geist, Geist_Mono, Geist_Pixel } from "next/font/google";
import "./globals.css";

const geistPixel = Geist_Pixel({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Relay",
  description: "Place AI voice calls and watch them happen live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = `${geistPixel.variable} ${geistSans.variable} ${geistMono.variable}`;

  return (
    <html lang="en">
      <body className={fontClasses}>{children}</body>
    </html>
  );
}
