import { Inter, Poppins } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SM Store | Quality products, delivered across Pakistan",
    template: "%s | SM Store",
  },
  description:
    "Shop curated everyday products at SM Store. Secure checkout, cash on delivery, and nationwide shipping across Pakistan.",
  applicationName: "SM Store",
  keywords: ["SM Store", "online shopping Pakistan", "ecommerce", "PKR"],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "SM Store",
    title: "SM Store | Quality products, delivered across Pakistan",
    description:
      "Shop curated everyday products at SM Store. Secure checkout, cash on delivery, and nationwide shipping.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SM Store | Quality products, delivered across Pakistan",
    description:
      "Shop curated everyday products at SM Store. Secure checkout and nationwide delivery.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0F1A",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body className="min-h-svh">
        <a
          href="#main-content"
          className="sr-only z-100 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
