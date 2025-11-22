import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export const defaultMetadata: Metadata = {
  title: "RTFOS - Real Time Food Ordering System",
  description:
    "A real-time restaurant ordering system where customers can scan a QR code, browse the menu, place orders, and track their order status live — powered by Next.js, TypeScript, Tailwind CSS, ShadCN, Node.js, Express, MongoDB, and Socket.IO.",

  applicationName: "RTFOS - Real Time Food Ordering System",
  creator: "TechSaws",
  generator: "Next.js",
  keywords: [
    "real time ordering",
    "restaurant app",
    "QR menu",
    "kitchen dashboard",
    "admin panel",
    "food ordering system",
    "TechSaws",
    "Next.js project",
  ],

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    title: "RTFOS - Real Time Food Ordering System",
    description:
      "An end-to-end real-time food ordering and management platform for restaurants with QR-based tables, live order tracking, and payment integration.",
    url: BASE_URL,
    siteName: "RTFOS - Real Time Food Ordering System",
    type: "website",
    images: [
      {
        url: "/favicons/logo-512x512.png",
        width: 512,
        height: 512,
        alt: "RTFOS - Real Time Food Ordering System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RTFOS - Real Time Food Ordering System",
    description:
      "Real-time restaurant ordering system built with Next.js, TypeScript, Tailwind, ShadCN, and Socket.IO.",
    images: ["/favicons/logo-512x512.png"],
    creator: "@TechSaws",
  },

  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        url: "/favicons/logo-512x512.png",
        sizes: "512x512",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "/favicons/logo-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "/favicons/logo-96x96.png",
        sizes: "96x96",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "/favicons/logo.png",
        sizes: "834x408",
      },
      { rel: "icon", type: "image/svg+xml", url: "/favicons/logo.svg" },
      { rel: "icon", type: "image/x-icon", url: "/favicons/favicon.ico" },
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        url: "/favicons/favicon.ico",
      },
    ],
    apple: [
      {
        rel: "apple-touch-icon",
        url: "/favicons/apple-icon.png",
        sizes: "180x180",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export function GetPageMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    ...defaultMetadata,
    ...overrides,
    title: overrides.title ?? defaultMetadata.title,
    description: overrides.description ?? defaultMetadata.description,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...overrides.openGraph,
      title: overrides.title || defaultMetadata.openGraph?.title,
      description:
        overrides.description || defaultMetadata.openGraph?.description,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...overrides.twitter,
      title: overrides.title || defaultMetadata.twitter?.title,
      description:
        overrides.description || defaultMetadata.twitter?.description,
    },
  };
}
