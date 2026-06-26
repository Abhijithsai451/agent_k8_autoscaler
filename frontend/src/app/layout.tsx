import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { AppNav } from "@/components/AppNav"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "kron - agent control plane",
  description: "Dispatch and track durable background agent tasks",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <AppNav />
        <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
