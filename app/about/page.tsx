"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Car, 
  Users, 
  Shield, 
  Clock, 
  Award, 
  MapPin, 
  Phone, 
  Mail,
  Star,
  CheckCircle,
  Globe
} from "lucide-react"

export default function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "10,000+", icon: Users },
    { label: "Vehicles Available", value: "500+", icon: Car },
    { label: "Cities Covered", value: "15+", icon: MapPin },
    { label: "Years of Service", value: "8+", icon: Award },
  ]

  const features = [
    {
      icon: Shield,
      title: "100% Secure Payments",
      description: "All transactions are encrypted and secure with Razorpay payment gateway"
    },
    {
      icon: Clock,
      title: "24/7 Customer Support",
      description: "Round-the-clock assistance for all your vehicle rental needs"
    },
    {
      icon: CheckCircle,
      title: "Instant Booking",
      description: "Book your vehicle instantly with our streamlined booking process"
    },
    {
      icon: Globe,
      title: "Pan-India Service",
      description: "Available in major cities across India with expanding coverage"
    }
  ]

  const team = [
    {
      name: "Sant Lal Pareek",
      role: "Founder & CEO",
      image: "/ceo.jpg",
      description: "10+ years in automotive industry"
    },
    {
      name: "Prerna Pareek",
      role: "Head of Operations",
      image: "/hoo.jpg",
      description: "Expert in fleet management"
    },
    {
      name: "Abhinav Pareek",
      role: "Technology Lead",
      image: "/tech-lead.png",
      description: "Building world-class rental platform"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">About RentWheels</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your trusted partner for premium vehicle rentals across India. 
              Experience freedom, comfort, and reliability on every journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                4.8/5 Rating
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                10,000+ Customers
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2016, RentWheels started with a simple mission: to make vehicle 
                  rentals accessible, affordable, and hassle-free for everyone. What began as 
                  a small fleet of 20 vehicles has now grown into India's most trusted vehicle 
                  rental platform.
                </p>
                <p>
                  We understand that every journey is unique, whether it's a business trip, 
                  family vacation, or daily commute. That's why we offer a diverse fleet of 
                  well-maintained vehicles, from luxury sedans to economical hatchbacks, 
                  from powerful motorcycles to spacious SUVs.
                </p>
                <p>
                  Our commitment to quality, transparency, and customer satisfaction has earned 
                  us the trust of thousands of customers across India. We continue to innovate 
                  and expand our services to make your travel experience better every day.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/our-fleet.jpg" 
                alt="Our Fleet"
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium Fleet</h3>
                <p>500+ vehicles across 15 cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RentWheels?</h2>
          <p className="text-xl text-gray-600">Experience the difference with our premium services</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people behind RentWheels</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="text-yellow-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers and book your perfect vehicle today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vehicles">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Browse Vehicles
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white bg-transparent border-white hover:bg-white hover:text-black">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
