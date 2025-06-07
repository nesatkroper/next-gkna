import type React from "react"
import type { Metadata } from "next"
import I18nProvider from '@/app/i18n/client';
import { Inter, Noto_Serif_Khmer } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { languages } from '@/app/i18n/settings';
import "./globals.css"

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fertilizer Management System",
  description: "A comprehensive fertilizer management system",
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
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


// import type React from "react"
// import type { Metadata } from "next"
// import I18nProvider from '@/app/i18n/client';
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"
// import { languages } from '@/app/i18n/settings';
// import { Noto_Serif_Khmer, Inter } from '@next/font/google'
// import "./globals.css"

// export async function generateStaticParams() {
//   return languages.map((lng) => ({ lng }));
// }

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "Fertilizer Management System",
//   description: "A comprehensive fertilizer management system",
// }

// const notoKhmer = Noto_Serif_Khmer({
//   weight: ['400', '700'],
//   subsets: ['khmer'],
//   display: 'swap',
// });

// export default function RootLayout({
//   children,
//   params: { lng },
// }: Readonly<{
//   children: React.ReactNode,
//   params: { lng: string }
// }>) {
//   return (
//     <html lang={lng} className={notoKhmer.className} suppressHydrationWarning>
//       <body className={inter.className}>
//         <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
//           <I18nProvider>
//             {children}
//           </I18nProvider>
//           <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }


