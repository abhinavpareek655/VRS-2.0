"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  HeadphonesIcon
} from "lucide-react"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  })
  const { toast } = useToast()

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 98765 43210", "+91 98765 43211"],
      description: "24/7 Customer Support"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@rentwheels.com", "booking@rentwheels.com"],
      description: "We'll respond within 2 hours"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Business Park", "Sector 18, Gurgaon, Haryana"],
      description: "Mon-Sat: 9 AM - 8 PM"
    }
  ]

  const offices = [
    {
      city: "Mumbai",
      address: "Office 201, Trade Center, Bandra West",
      phone: "+91 22 2665 4321",
      email: "mumbai@rentwheels.com"
    },
    {
      city: "Delhi",
      address: "Floor 3, Metro Plaza, Rajouri Garden",
      phone: "+91 11 4567 8910",
      email: "delhi@rentwheels.com"
    },
    {
      city: "Bangalore",
      address: "Tower B, Tech Park, Electronic City",
      phone: "+91 80 2345 6789",
      email: "bangalore@rentwheels.com"
    },
    {
      city: "Chennai",
      address: "Suite 401, Marina Complex, T. Nagar",
      phone: "+91 44 2876 5432",
      email: "chennai@rentwheels.com"
    }
  ]

  const faqs = [
    {
      question: "What documents do I need for booking?",
      answer: "You need a valid driving license, Aadhar card, and a credit/debit card for security deposit."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel up to 2 hours before your booking time. Cancellation charges may apply."
    },
    {
      question: "Is fuel included in the rental?",
      answer: "No, fuel costs are separate. The vehicle will be provided with a full tank and should be returned with a full tank."
    },
    {
      question: "What happens if I return the vehicle late?",
      answer: "Late returns are charged at an hourly rate. Please contact us if you need to extend your booking."
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 2 hours.",
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      })
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">Contact Us</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Have questions? Need help with your booking? We're here to assist you 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                24/7 Support
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Expert Assistance
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <info.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <CardTitle>{info.title}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {info.details.map((detail, idx) => (
                  <div key={idx} className="font-medium text-gray-900 mb-1">{detail}</div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">Booking Support</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Query</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief subject"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Describe your query in detail..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQs and Office Locations */}
          <div className="space-y-8">
            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm ml-6">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Our Offices</CardTitle>
                <CardDescription>Visit us in person for assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offices.map((office, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-gray-900">{office.city}</h4>
                      </div>
                      <div className="ml-6 space-y-1 text-sm text-gray-600">
                        <p>{office.address}</p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {office.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {office.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-16">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency Support
              </CardTitle>
              <CardDescription className="text-red-600">
                For urgent assistance or roadside support during your rental period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency: +91 98765 00000
                </Button>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp: +91 98765 11111
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
