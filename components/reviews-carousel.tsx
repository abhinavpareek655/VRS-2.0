"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"

interface Review {
  id: string
  userName: string
  userImage: string
  rating: number
  comment: string
  vehicleName: string
  date: string
  verified: boolean
}

const testimonials: Review[] = [
  {
    id: "1",
    userName: "Arjun Sharma",
    userImage: "/placeholder-user.jpg",
    rating: 5,
    comment: "Excellent service! The BMW 5 Series was in perfect condition and the booking process was seamless. Highly recommended for business trips.",
    vehicleName: "BMW 5 Series",
    date: "2024-12-15",
    verified: true
  },
  {
    id: "2",
    userName: "Priya Patel",
    userImage: "/placeholder-user.jpg",
    rating: 5,
    comment: "Amazing experience with RentWheels! The Honda CB350RS was perfect for my weekend trip. Clean, well-maintained, and great customer service.",
    vehicleName: "Honda CB350RS",
    date: "2024-12-10",
    verified: true
  },
  {
    id: "3",
    userName: "Rahul Kumar",
    userImage: "/placeholder-user.jpg",
    rating: 4,
    comment: "Good value for money. The Maruti Swift was fuel efficient and perfect for city drives. The hourly pricing is very convenient.",
    vehicleName: "Maruti Swift",
    date: "2024-12-08",
    verified: true
  },
  {
    id: "4",
    userName: "Sneha Reddy",
    userImage: "/placeholder-user.jpg",
    rating: 5,
    comment: "Outstanding service! Booked the Toyota Fortuner for a family trip to Goa. Spacious, comfortable, and the staff was very helpful.",
    vehicleName: "Toyota Fortuner",
    date: "2024-12-05",
    verified: true
  },
  {
    id: "5",
    userName: "Vikram Singh",
    userImage: "/placeholder-user.jpg",
    rating: 5,
    comment: "The KTM Duke 390 was a beast! Perfect for my solo adventure trip. RentWheels made the entire process hassle-free.",
    vehicleName: "KTM Duke 390",
    date: "2024-12-01",
    verified: true
  }
]

export function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const interval = setInterval(nextReview, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600">Real experiences from real customers</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <Quote className="w-12 h-12 text-yellow-400" />
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>
                
                <blockquote className="text-lg text-gray-700 mb-6 italic">
                  "{testimonials[currentIndex].comment}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonials[currentIndex].userImage} />
                    <AvatarFallback>
                      {testimonials[currentIndex].userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {testimonials[currentIndex].userName}
                      {testimonials[currentIndex].verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Rented {testimonials[currentIndex].vehicleName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(testimonials[currentIndex].date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center mt-8 gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevReview}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextReview}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-yellow-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">4.8/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">25,000+</div>
            <div className="text-gray-600">Successful Trips</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">99.2%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  )
}
