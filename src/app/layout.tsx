import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"

// Geist Sans (variable font covers all weights)
const geistSans = localFont({
  src: "../fonts/geist-font/fonts/Geist/webfonts/Geist[wght].woff2",
  variable: "--font-geist-sans",
  weight: "100 900", // variable font range
})

// Geist Mono
const geistMono = localFont({
  src: "../fonts/geist-font/fonts/GeistMono/webfonts/GeistMono[wght].woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "SMEGo",
  description: "SME Operations Management Platform",
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
