// @/app/layout.tsx

import { Providers } from "./providers";
import { Geist, Geist_Mono, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const entoto = localFont({
  src: "../../public/fonts/entoto.ttf",
  variable: "--font-entoto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rbms.jirehgrp.com"),
  title: "JirehDashboard",
  description:
    "A comprehensive and intuitive dashboard designed to manage your business operations. JirehDashboard empowers owners, employees, and managers to oversee, track orders, manage expenses, and optimize inventory across multiple locations. With role-based access and real-time analytics, it offers a seamless user experience for efficient decision-making and growth.",
  openGraph: {
    title: "JirehDashboard",
    description:
      "A modern dashboard to manage your business operations with efficiency. Track subscriptions, orders, inventory, and expenses.",
    url: "/", 
    siteName: "JirehDashboard",
    images: [
      {
        url: "/images/previewImage.png",
        width: 1200,
        height: 630,
        alt: "JirehDashboard Preview Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JirehDashboard",
    description:
      "A modern dashboard for your business operations, with features for tracking and managing your subscriptions, orders, and expenses.",
    images: ["/images/previewImage.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} ${entoto.variable} font-mono`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
