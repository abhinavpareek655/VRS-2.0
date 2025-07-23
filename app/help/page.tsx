"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FAQSection } from "@/components/faq-section"
import { 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Shield,
  FileText,
  CreditCard,
  Car,
  User,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Download,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const supportOptions = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our support team",
      action: "Call Now",
      contact: "+91 98765 43210",
      available: "24/7",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help through live chat",
      action: "Start Chat",
      contact: "Average response: 2 mins",
      available: "24/7",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      contact: "support@rentwheels.com",
      available: "Response within 2 hours",
      color: "bg-purple-100 text-purple-800"
    }
  ]

  const quickLinks = [
    {
      icon: Car,
      title: "Booking Help",
      description: "Learn how to book and manage your rentals",
      items: ["How to book a vehicle", "Modifying bookings", "Cancellation policy", "Payment issues"]
    },
    {
      icon: User,
      title: "Account Support",
      description: "Manage your account and profile",
      items: ["Profile settings", "Password reset", "Verification documents", "Loyalty program"]
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Payment methods and billing queries",
      items: ["Payment methods", "Refund policy", "Invoice download", "Payment failures"]
    },
    {
      icon: Shield,
      title: "Safety & Insurance",
      description: "Vehicle safety and insurance coverage",
      items: ["Insurance coverage", "Accident reporting", "Emergency contact", "Safety guidelines"]
    }
  ]

  const policies = [
    {
      title: "Terms & Conditions",
      description: "Complete terms of service and usage policies",
      icon: FileText,
      link: "/terms"
    },
    {
      title: "Privacy Policy",
      description: "How we handle and protect your personal data",
      icon: Shield,
      link: "/privacy"
    },
    {
      title: "Refund Policy",
      description: "Guidelines for cancellations and refunds",
      icon: CreditCard,
      link: "/refund-policy"
    },
    {
      title: "User Guide",
      description: "Step-by-step guide to using our platform",
      icon: BookOpen,
      link: "/user-guide"
    }
  ]

  const emergencyContacts = [
    {
      type: "Roadside Assistance",
      number: "+91 98765 00000",
      description: "24/7 emergency roadside support"
    },
    {
      type: "Accident Helpline",
      number: "+91 98765 11111",
      description: "Immediate assistance for accidents"
    },
    {
      type: "Customer Emergency",
      number: "+91 98765 22222",
      description: "Urgent customer support matters"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Help & Support</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              We're here to help you every step of the way. Find answers, get support, or contact us directly.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for help articles, policies, or common questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder-white/70 focus:bg-white focus:text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Contact Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100">
                    <option.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="font-semibold text-gray-900 mb-1">{option.contact}</div>
                    <Badge className={option.color}>{option.available}</Badge>
                  </div>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Help Links */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <section.icon className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left w-full">
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-16">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Emergency Contacts
              </CardTitle>
              <CardDescription className="text-red-600">
                For urgent situations requiring immediate assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">{contact.type}</h4>
                    <div className="text-2xl font-bold text-red-700 mb-2">{contact.number}</div>
                    <p className="text-sm text-red-600">{contact.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies & Documentation */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Policies & Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {policies.map((policy, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <policy.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{policy.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{policy.description}</p>
                  <Link href={policy.link}>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Policy
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Status */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Service Status
              </CardTitle>
              <CardDescription>Current status of our services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h4 className="font-semibold text-green-800">Booking System</h4>
                    <p className="text-sm text-green-600">All systems operational</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h4 className="font-semibold text-green-800">Payment Gateway</h4>
                    <p className="text-sm text-green-600">All systems operational</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h4 className="font-semibold text-green-800">Customer Support</h4>
                    <p className="text-sm text-green-600">Response time: &lt;2 mins</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* Still Need Help */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Still Need Help?
              </h3>
              <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our dedicated support team is ready to assist you
                with any questions or concerns you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-200">
                  <Download className="w-5 h-5 mr-2" />
                  Download User Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
