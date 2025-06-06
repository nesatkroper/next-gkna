import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import I18nProvider from '@/app/i18n/client';
import { dir } from 'i18next';
import { languages } from '@/app/i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fertilizer Management System",
  description: "A comprehensive fertilizer management system",
}

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode,
  params: { lng: string }
}>) {
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <I18nProvider>
          {children}
</
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


