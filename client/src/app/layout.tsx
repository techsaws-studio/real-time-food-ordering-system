import type { Metadata, Viewport } from "next";
import { Orbitron, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { GetPageMetadata } from "@/utils/meta-data";

// STYLE SHEETS SOURCE
import "@/styles/globals.css";
import "@/styles/includes.css";

// FONT CONFIGURATIONS
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

// WEBSITE METADATA AND VIEWPORT
export const metadata: Metadata = GetPageMetadata();
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${inter.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
