"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Gift, Clock, Percent, Star, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Promotion {
  id: string
  title: string
  description: string
  discount: string
  code: string
  validUntil: string
  type: "discount" | "offer" | "new" | "limited"
  color: string
  icon: React.ElementType
}

const promotions: Promotion[] = [
  {
    id: "1",
    title: "New User Special",
    description: "Get 25% off your first booking",
    discount: "25% OFF",
    code: "WELCOME25",
    validUntil: "2024-01-31",
    type: "new",
    color: "from-yellow-500 to-yellow-600",
    icon: Gift
  },
  {
    id: "2",
    title: "Flash Sale",
    description: "Limited time offer - Book now!",
    discount: "40% OFF",
    code: "FLASH40",
    validUntil: "2024-01-25",
    type: "limited",
    color: "from-red-500 to-red-600",
    icon: Zap
  },
  {
    id: "3",
    title: "Weekend Special",
    description: "Special rates for weekend bookings",
    discount: "30% OFF",
    code: "WEEKEND30",
    validUntil: "2024-02-28",
    type: "offer",
    color: "from-purple-500 to-purple-600",
    icon: Star
  }
]

export function PromotionalBanner() {
  const [currentPromo, setCurrentPromo] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const isDismissed = sessionStorage.getItem("promoBannerDismissed")
    if (isDismissed) {
      setDismissed(true)
      setIsVisible(false)
    }
  }, [])

  useEffect(() => {
    if (!dismissed && promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromo((prev) => (prev + 1) % promotions.length)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [dismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    sessionStorage.setItem("promoBannerDismissed", "true")
  }

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // You could add a toast notification here
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "new": return "bg-green-100 text-green-800"
      case "limited": return "bg-red-100 text-red-800"
      case "offer": return "bg-purple-100 text-purple-800"
      default: return "bg-blue-100 text-blue-800"
    }
  }

  if (dismissed || !isVisible || promotions.length === 0) return null

  const promo = promotions[currentPromo]
  const Icon = promo.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-16 z-40"
      >
        <div className={`bg-gradient-to-r ${promo.color} text-white overflow-hidden`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4 flex-1">
                <div className="hidden sm:block">
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(promo.type)}>
                        {promo.type.charAt(0).toUpperCase() + promo.type.slice(1)}
                      </Badge>
                      <span className="font-bold text-lg">{promo.discount}</span>
                    </div>
                    
                    <div className="text-sm sm:text-base">
                      <span className="font-semibold">{promo.title}</span>
                      <span className="mx-2 hidden sm:inline">•</span>
                      <span className="opacity-90">{promo.description}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs opacity-75 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Valid until {new Date(promo.validUntil).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-mono bg-white/20 px-2 py-1 rounded">
                      {promo.code}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyPromoCode(promo.code)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Copy Code
                    </Button>
                    <Link href="/vehicles">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-white/90"
                      >
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="ml-4 p-1 hover:bg-white/20 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress indicator for multiple promos */}
          {promotions.length > 1 && (
            <div className="bg-white/20 h-1">
              <div 
                className="bg-white h-full transition-all duration-5000 ease-linear"
                style={{ width: `${((currentPromo + 1) / promotions.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Floating promotional card for bottom-right corner
export function FloatingPromoCard() {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show after 5 seconds
    const timer = setTimeout(() => {
      const isDismissed = localStorage.getItem("floatingPromoDismissed")
      if (!isDismissed) {
        setIsVisible(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    localStorage.setItem("floatingPromoDismissed", "true")
  }

  if (!isVisible || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-0 shadow-2xl">
          <CardContent className="p-6 text-center relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-4 h-4 text-black" />
            </button>
            
            <Gift className="w-12 h-12 text-black mx-auto mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Special Offer!</h3>
            <p className="text-black/80 mb-4">
              Get 20% off your next booking with code
            </p>
            <div className="bg-black/20 rounded px-3 py-2 font-mono text-black font-bold mb-4">
              SAVE20
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText("SAVE20")}
                className="flex-1 bg-white/20 border-black/30 text-black hover:bg-white/30"
              >
                Copy Code
              </Button>
              <Link href="/vehicles" className="flex-1">
                <Button size="sm" className="w-full bg-black text-white hover:bg-gray-800">
                  Book Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
