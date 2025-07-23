import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { PromotionalBanner, FloatingPromoCard } from "@/components/promotional-banner"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RentWheels - Premium Car & Bike Rentals",
  description:
    "Rent premium cars and bikes with ease. Best prices, excellent service, and a wide selection of vehicles.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/RentWheels-logo.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' && (
            <div className="bg-green-600 text-white py-2 px-4 text-center text-sm font-medium">
              🧪 <strong>Testing Mode Active:</strong> All bookings are charged ₹1 for testing purposes. This is not production pricing.
            </div>
          )}
          <PromotionalBanner />
          <main>{children}</main>
          <FloatingPromoCard />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
