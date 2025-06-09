import type React from "react"
import type { Metadata } from "next"
import I18nProvider from '@/app/i18n/client';
import { Inter, Noto_Serif_Khmer } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { languages } from '@/app/i18n/settings';
import "./globals.css"
import { Header } from "@radix-ui/react-accordion";
import { Footer } from "react-day-picker";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { EnhancedHeader } from "@/components/header";

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fertilizer MS  | Fertilizer Management System by Suon Phanun",
  description: "A comprehensive fertilizer management system",
  authors: { name: "Suon Phanun", url: "https://me.konkmeng.site" },
  icons: {
    icon: '/images/icon.ico'
  },
  keywords: [
    "Fertilizer Management System",
    "Inventory Tracking",
    "Fertilizer Software",
    "Farm Management",
    "Agricultural Tools",
    "Suon Phanun",
    "Khmer Agriculture"
  ],
  openGraph: {
    title: "Fertilizer MS",
    description: "Streamline your fertilizer operations with Fertilizer MS by Suon Phanun.",
    url: "https://huotsopheaksakana.site",
    siteName: "Fertilizer MS",
    images: [
      {
        url: "/images/profile.webp",
        width: 1200,
        height: 630,
        alt: "Fertilizer MS Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://huotsopheaksakana.site"),
  twitter: {
    card: "summary_large_image",
    title: "Fertilizer MS",
    description: "Manage your fertilizer inventory and operations efficiently with Fertilizer MS.",
    creator: "@suonphanun",
    images: ["/images/og-image.jpg"],
  },
}

const notoKhmer = Noto_Serif_Khmer({
  weight: ['400', '700'],
  subsets: ['khmer'],
  display: 'swap',
});

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode,
  params: { lng: string }
}>) {
  return (
    <html lang={lng} className={notoKhmer.className} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <div className="flex h-screen bg-background">
              <div className="flex flex-1 flex-col overflow-hidden">{children}
              </div>
            </div>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
