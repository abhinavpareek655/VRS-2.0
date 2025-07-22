"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingWidget } from "@/components/booking-widget"
import { ReviewsCarousel } from "@/components/reviews-carousel"
import { FAQSection } from "@/components/faq-section"
import { Shield, Zap, Users, Award } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const heroImages = [
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&h=800&fit=crop",
]

const vehicleCategories = [
  {
    title: "Luxury Sedans",
    description: "Premium comfort for executive travel",
    icon: "🚗",
    count: "3 vehicles",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "SUVs & Crossovers",
    description: "Spacious rides for family adventures",
    icon: "🚙",
    count: "2 vehicles",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Sports Cars",
    description: "High-performance driving experience",
    icon: "🏎️",
    count: "2 vehicles",
    color: "from-red-500 to-red-600",
  },
  {
    title: "Motorcycles",
    description: "Freedom on two wheels",
    icon: "🏍️",
    count: "3 vehicles",
    color: "from-purple-500 to-purple-600",
  },
]

const testimonialsRow1 = [
  {
    name: "Sarah Johnson",
    role: "Business Executive",
    content: "Exceptional service and premium vehicles. The booking process was seamless and the car was immaculate.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Michael Chen",
    role: "Travel Enthusiast",
    content: "Perfect for our family vacation. The SUV was spacious and well-maintained. Highly recommended!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Emma Rodriguez",
    role: "Adventure Seeker",
    content: "Amazing experience with the sports car rental. Professional service and great value for money.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
]

const testimonialsRow2 = [
  {
    name: "Amit Verma",
    role: "Frequent Traveler",
    content: "Smooth pickup and return process. The sedan was clean, comfortable, and fuel efficient.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Lisa Nguyen",
    role: "Marketing Consultant",
    content: "Stylish car with an easy-to-use booking interface. Everything went smoothly!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "James Williams",
    role: "Photographer",
    content: "The convertible made my shoot days easier. Very responsive support team too.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
]

const testimonialsRow3 = [
  {
    name: "Priya Sharma",
    role: "Event Planner",
    content: "Booked for a wedding event. Car arrived on time and in pristine condition.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Daniel Kim",
    role: "Tech Entrepreneur",
    content: "Rented a premium car for a client visit. Great impression, smooth ride.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Olivia Davis",
    role: "Student",
    content: "Affordable and reliable for a weekend getaway. Highly satisfied.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
  },
]

const faqs = [
  {
    question: "What documents do I need to rent a vehicle?",
    answer:
      "You'll need a valid driver's license, credit card, and proof of insurance. International travelers may need an International Driving Permit.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "Free cancellation up to 24 hours before your rental start time. Late cancellations may incur a fee.",
  },
  {
    question: "Do you offer insurance coverage?",
    answer:
      "Yes, we offer comprehensive insurance coverage options. Basic coverage is included, with additional protection available.",
  },
  {
    question: "Can I extend my rental period?",
    answer: "Yes, you can extend your rental subject to vehicle availability. Contact us at least 24 hours in advance.",
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showBookingWidget, setShowBookingWidget] = useState(false)

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Handle scroll for booking widget visibility
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      const scrollY = window.scrollY
      setShowBookingWidget(scrollY > heroHeight * 0.3)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Slideshow */}
      <section className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroImages[currentSlide]}
            alt="Luxury Vehicle"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Premium Vehicle
            <br />
            <span className="text-yellow-400">Rental Experience</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-2xl font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover luxury, comfort, and performance with our premium fleet
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/vehicles">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Explore Fleet
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-yellow-400 w-8" : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        {/* Hero Booking Widget */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="max-w-6xl mx-auto">
            <BookingWidget variant="floating" />
          </div>
        </div>
      </section>

      {/* Sticky Booking Widget */}
      <motion.div
        className={`fixed top-16 left-0 right-0 z-40 transition-all duration-300 ${
          showBookingWidget ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        style={{ pointerEvents: showBookingWidget ? "auto" : "none" }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <BookingWidget variant="floating" />
        </div>
      </motion.div>

      {/* Inline Booking Widget for Mobile */}
      <section className="py-8 px-4 bg-white md:hidden">
        <div className="max-w-4xl mx-auto">
          <BookingWidget variant="inline" />
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Choose Your Ride</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From luxury sedans to adventure SUVs, we have the perfect vehicle for every journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vehicleCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/vehicles?category=${encodeURIComponent(category.title.toLowerCase())}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white cursor-pointer">
                    <CardHeader className="text-center pb-4">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{category.title}</CardTitle>
                      <CardDescription className="text-gray-600">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-500 mb-4">{category.count}</p>
                      <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 bg-transparent">
                        View Fleet
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">Why Choose Us</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the difference with our premium service and exceptional fleet
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Fully Insured", desc: "Comprehensive coverage for peace of mind" },
              { icon: Zap, title: "24/7 Support", desc: "Round-the-clock assistance whenever you need" },
              { icon: Users, title: "Expert Team", desc: "Professional staff with years of experience" },
              { icon: Award, title: "Premium Fleet", desc: "Well-maintained luxury vehicles only" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>

          <div className="testimonials-marquee-container overflow-hidden">
            {/* First Row - Left to Right */}
            <div className="testimonial-row mb-8 relative overflow-hidden py-4">
              <div
                className="ticker-track flex items-center"
                style={{
                  animation: "scroll 40s linear infinite",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running"
                }}
              >
                {/* Duplicate testimonials for seamless loop */}
                {[...testimonialsRow1, ...testimonialsRow1].map((testimonial, index) => (
                  <div key={`row1-${index}`} className="testimonial-card flex-shrink-0">
                    <div className="testimonial-content bg-white p-6 rounded-lg shadow-md mx-4 min-w-[300px]">
                      <p className="testimonial-text text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                      <div className="testimonial-author flex items-center">
                        <img
                          alt="Avatar"
                          className="testimonial-avatar w-10 h-10 rounded-full object-cover mr-3"
                          src={testimonial.avatar || "/placeholder.svg"}
                        />
                        <div>
                          <span className="testimonial-handle font-semibold text-gray-900 block">
                            {testimonial.name}
                          </span>
                          <span className="text-sm text-gray-500">{testimonial.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Gradient overlays for smooth fade effect */}
              <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
            </div>

            {/* Second Row - Right to Left */}
            <div className="testimonial-row mb-8 relative overflow-hidden py-4">
              <div
                className="ticker-track flex items-center"
                style={{
                  animation: "scroll-reverse 35s linear infinite",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running"
                }}
              >
                {/* Duplicate testimonials for seamless loop */}
                {[...testimonialsRow2, ...testimonialsRow2].map((testimonial, index) => (
                  <div key={`row2-${index}`} className="testimonial-card flex-shrink-0">
                    <div className="testimonial-content bg-white p-6 rounded-lg shadow-md mx-4 min-w-[300px]">
                      <p className="testimonial-text text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                      <div className="testimonial-author flex items-center">
                        <img
                          alt="Avatar"
                          className="testimonial-avatar w-10 h-10 rounded-full object-cover mr-3"
                          src={testimonial.avatar || "/placeholder.svg"}
                        />
                        <div>
                          <span className="testimonial-handle font-semibold text-gray-900 block">
                            {testimonial.name}
                          </span>
                          <span className="text-sm text-gray-500">{testimonial.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Gradient overlays for smooth fade effect */}
              <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
            </div>

            {/* Third Row - Left to Right */}
            <div className="testimonial-row relative overflow-hidden py-4">
              <div
                className="ticker-track flex items-center"
                style={{
                  animation: "scroll 45s linear infinite",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running"
                }}
              >
                {/* Duplicate testimonials for seamless loop */}
                {[...testimonialsRow3, ...testimonialsRow3].map((testimonial, index) => (
                  <div key={`row3-${index}`} className="testimonial-card flex-shrink-0">
                    <div className="testimonial-content bg-white p-6 rounded-lg shadow-md mx-4 min-w-[300px]">
                      <p className="testimonial-text text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                      <div className="testimonial-author flex items-center">
                        <img
                          alt="Avatar"
                          className="testimonial-avatar w-10 h-10 rounded-full object-cover mr-3"
                          src={testimonial.avatar || "/placeholder.svg"}
                        />
                        <div>
                          <span className="testimonial-handle font-semibull text-gray-900 block">
                            {testimonial.name}
                          </span>
                          <span className="text-sm text-gray-500">{testimonial.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Gradient overlays for smooth fade effect */}
              <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
            </div>
          </div>

          <style jsx>{`
            .ticker-track {
              width: max-content;
              min-width: 100%;
            }
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            @keyframes scroll-reverse {
              0% {
                transform: translateX(-50%);
              }
              100% {
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our rental service</p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsCarousel />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 font-serif">Ready to Start Your Journey?</h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Book your premium vehicle today and experience luxury on the road
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg">
                  Browse Vehicles
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg bg-transparent"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
