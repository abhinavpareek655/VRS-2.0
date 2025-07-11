"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookingWidget } from "@/components/booking-widget"
import { Users, Fuel, Settings, MapPin, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"] & {
  vehicle_categories?: Database["public"]["Tables"]["vehicle_categories"]["Row"]
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    // Apply filters from URL params
    const category = searchParams.get("category")
    const location = searchParams.get("location")

    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, selectedCategory, selectedType, priceRange, sortBy])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          vehicle_categories (
            id,
            name,
            description,
            icon
          )
        `)
        .eq("available", true)

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = [...vehicles]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.vehicle_categories?.name.toLowerCase() === selectedCategory)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === selectedType)
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      filtered = filtered.filter((vehicle) => {
        const price = vehicle.price_per_day
        if (max) {
          return price >= min && price <= max
        } else {
          return price >= min
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price_per_day - b.price_per_day
        case "price-high":
          return b.price_per_day - a.price_per_day
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredVehicles(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Our Fleet</h1>
          <p className="text-gray-600 mb-6">Find the perfect vehicle for your journey</p>

          {/* Booking Widget */}
          <BookingWidget variant="inline" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                  <Input
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="luxury sedans">Luxury Sedans</SelectItem>
                      <SelectItem value="suvs & crossovers">SUVs & Crossovers</SelectItem>
                      <SelectItem value="sports cars">Sports Cars</SelectItem>
                      <SelectItem value="motorcycles">Motorcycles</SelectItem>
                      <SelectItem value="hatchbacks">Hatchbacks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="car">Cars</SelectItem>
                      <SelectItem value="bike">Bikes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price per Day</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-50">₹0 - ₹50</SelectItem>
                      <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                      <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                      <SelectItem value="200">₹200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No vehicles found matching your criteria</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedType("all")
                    setPriceRange("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="group hover:shadow-lg transition-all duration-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={vehicle.images?.[0] || "/placeholder.svg?height=200&width=300"}
                        alt={vehicle.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90">
                          {vehicle.type === "car" ? "🚗" : "🏍️"} {vehicle.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-500 text-black">₹{vehicle.price_per_day}/day</Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                      <CardDescription>
                        {vehicle.brand} {vehicle.model} • {vehicle.year}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {vehicle.seats && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {vehicle.seats}
                          </div>
                        )}
                        {vehicle.fuel_type && (
                          <div className="flex items-center gap-1">
                            <Fuel className="h-4 w-4" />
                            {vehicle.fuel_type}
                          </div>
                        )}
                        {vehicle.transmission && (
                          <div className="flex items-center gap-1">
                            <Settings className="h-4 w-4" />
                            {vehicle.transmission}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mb-4">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{vehicle.location}</span>
                      </div>

                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {vehicle.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {vehicle.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{vehicle.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <Link href={`/vehicles/${vehicle.id}`}>
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                          View Details & Book
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
