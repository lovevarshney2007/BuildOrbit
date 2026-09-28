import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import "./globals.css"

// Inter is the primary UI font per DESIGN_SYSTEM.md
const inter = Inter({
  variable: "--font-geist-sans", // reusing the same CSS var name to keep globals.css unchanged
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "BuildOrbit",
    template: "%s | BuildOrbit",
  },
  description:
    "BuildOrbit — Professional Workforce, HR & CRM management platform.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  )
}
