"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "What documents do I need to rent a vehicle?",
    answer: "You need a valid driving license, government-issued ID (Aadhar card/passport), and a credit/debit card for security deposit. All documents should be original and valid.",
    category: "Booking"
  },
  {
    id: "2",
    question: "How does hourly pricing work?",
    answer: "Our vehicles are priced per hour with a minimum booking of 3 hours. You pay only for the hours you use. For example, if you book a car for 5 hours at ₹6/hour, you'll pay ₹30 plus applicable taxes.",
    category: "Pricing"
  },
  {
    id: "3",
    question: "Can I cancel or modify my booking?",
    answer: "Yes, you can cancel your booking up to 2 hours before the start time through your dashboard. Modifications are subject to vehicle availability. Cancellation charges may apply as per our policy.",
    category: "Booking"
  },
  {
    id: "4",
    question: "Is fuel included in the rental price?",
    answer: "No, fuel costs are separate from the rental price. The vehicle will be provided with a full tank and should be returned with a full tank. Alternatively, you can pay for the fuel consumed.",
    category: "Pricing"
  },
  {
    id: "5",
    question: "What happens if I return the vehicle late?",
    answer: "Late returns are charged at the hourly rate. If you're running late, please contact us immediately. We recommend extending your booking in advance to avoid late fees.",
    category: "Booking"
  },
  {
    id: "6",
    question: "Are the vehicles insured?",
    answer: "Yes, all our vehicles come with comprehensive insurance coverage. However, you are responsible for any damages caused due to negligent driving or traffic violations.",
    category: "Insurance"
  },
  {
    id: "7",
    question: "Do you provide delivery and pickup services?",
    answer: "Yes, we offer doorstep delivery and pickup services in select cities for an additional fee. This service is subject to availability and location constraints.",
    category: "Services"
  },
  {
    id: "8",
    question: "What is the minimum age requirement?",
    answer: "The minimum age to rent a vehicle is 18 years for motorcycles and 21 years for cars. You must have a valid driving license for at least 1 year.",
    category: "Requirements"
  },
  {
    id: "9",
    question: "Can I extend my booking while using the vehicle?",
    answer: "Yes, you can extend your booking through our app or by calling our customer support, subject to vehicle availability. Extensions are charged at the same hourly rate.",
    category: "Booking"
  },
  {
    id: "10",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure Razorpay payment gateway. Cash payments are not accepted for online bookings.",
    category: "Payment"
  }
]

const categories = ["All", "Booking", "Pricing", "Insurance", "Services", "Requirements", "Payment"]

export function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredFAQs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory)

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <HelpCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our vehicle rental service
            </p>
          </motion.div>
        </div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <CardTitle className="text-left text-lg">{faq.question}</CardTitle>
                        <CardDescription className="text-left mt-1">
                          Category: {faq.category}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {openFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {openFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0">
                          <div className="border-t pt-4">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Still Have Questions?
              </h3>
              <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
                Our customer support team is available 24/7 to help you with any queries or concerns.
                Don't hesitate to reach out!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Phone className="w-4 h-4 mr-2" />
                  Call: +91 98765 43210
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
