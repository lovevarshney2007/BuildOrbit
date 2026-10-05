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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-background text-on-surface dark:text-white flex flex-row antialiased">
        {children}
      </body>
    </html>
  )
}
