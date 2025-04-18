import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import "maplibre-gl/dist/maplibre-gl.css";
// Add this to your app/layout.tsx or similar
import "../styles/disaster-map.css";
// In app/layout.tsx or similar
import "mapbox-gl/dist/mapbox-gl.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sentinel Flow - AI powered Smart Web Dashboard",
  description:
    "Get real-time, location-specific disaster alerts with AI-powered severity analysis, safety tips, and optional crowdsourced reports.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
