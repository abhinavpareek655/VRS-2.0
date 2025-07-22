"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  Bell,
  CreditCard,
  Key,
  Download,
  Trash2,
  Camera,
  Settings,
  Award,
  Star
} from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    drivingLicense: '',
    emergencyContact: '',
    bio: ''
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    bookingReminders: true,
    promocodeAlerts: true
  })
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    memberSince: '',
    favoriteVehicle: '',
    loyaltyPoints: 0
  })

  const { user, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadProfileData()
      loadUserStats()
    }
  }, [user])

  const loadProfileData = () => {
    // In a real app, this would fetch from Supabase profile table
    setProfileData({
      fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      dateOfBirth: '',
      drivingLicense: '',
      emergencyContact: '',
      bio: ''
    })
    
    setStats({
      totalBookings: Math.floor(Math.random() * 25) + 5,
      totalSpent: Math.floor(Math.random() * 50000) + 10000,
      memberSince: user?.created_at ? new Date(user.created_at).getFullYear().toString() : '2024',
      favoriteVehicle: 'BMW 5 Series',
      loyaltyPoints: Math.floor(Math.random() * 5000) + 1000
    })
  }

  const loadUserStats = async () => {
    try {
      // Fetch actual booking stats
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("total_price, created_at")
        .eq("user_id", user?.id)
        .eq("status", "completed")

      if (!error && bookings) {
        const totalSpent = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0)
        const totalBookings = bookings.length
        
        setStats(prev => ({
          ...prev,
          totalBookings,
          totalSpent
        }))
      }
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // In a real app, save to Supabase profile table
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (typeof value === 'boolean') {
      setPreferences(prev => ({ ...prev, [field]: value }))
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // In a real app, this would delete the user account
      toast({
        title: "Account deletion requested",
        description: "Your account deletion request has been submitted. You'll receive a confirmation email.",
      })
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: "Please contact support for assistance.",
        variant: "destructive",
      })
    }
  }

  const getUserLevel = (points: number) => {
    if (points >= 5000) return { level: "Platinum", color: "bg-purple-100 text-purple-800" }
    if (points >= 3000) return { level: "Gold", color: "bg-yellow-100 text-yellow-800" }
    if (points >= 1000) return { level: "Silver", color: "bg-gray-100 text-gray-800" }
    return { level: "Bronze", color: "bg-orange-100 text-orange-800" }
  }

  const userLevel = getUserLevel(stats.loyaltyPoints)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                <AvatarFallback className="text-3xl">
                  {profileData.fullName.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{profileData.fullName}</h1>
              <p className="text-xl opacity-90 mb-4">{profileData.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Badge className={userLevel.color}>
                  <Award className="w-4 h-4 mr-1" />
                  {userLevel.level} Member
                </Badge>
                <Badge variant="secondary">
                  <Star className="w-4 h-4 mr-1" />
                  {stats.loyaltyPoints} Points
                </Badge>
                <Badge variant="secondary">
                  Member since {stats.memberSince}
                </Badge>
              </div>
            </div>

            <div className="md:ml-auto">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">₹{stats.totalSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.loyaltyPoints}</div>
              <div className="text-sm text-gray-600">Loyalty Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-lg font-bold text-purple-600 mb-2">{stats.favoriteVehicle}</div>
              <div className="text-sm text-gray-600">Favorite Vehicle</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled // Email usually can't be changed
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="drivingLicense">Driving License Number</Label>
                    <Input
                      id="drivingLicense"
                      value={profileData.drivingLicense}
                      onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
                      disabled={!isEditing}
                      placeholder="DL1234567890123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={profileData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how you receive updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive booking updates via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Get booking alerts via SMS</p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Booking Reminders</h4>
                      <p className="text-sm text-gray-600">Reminders 24 hours before pickup</p>
                    </div>
                    <Switch
                      checked={preferences.bookingReminders}
                      onCheckedChange={(checked) => handleInputChange('bookingReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) => handleInputChange('marketingEmails', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Promocode Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified about new discounts</p>
                    </div>
                    <Switch
                      checked={preferences.promocodeAlerts}
                      onCheckedChange={(checked) => handleInputChange('promocodeAlerts', checked)}
                    />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-gray-600">Manage your logged-in devices</p>
                    </div>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      View Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that will affect your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved payment methods</h3>
                    <p className="text-gray-500 mb-6">Add a payment method for faster checkout</p>
                    <Button>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View and download your past invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
                    <p className="text-gray-500 mb-6">Your completed bookings will appear here</p>
                    <Link href="/bookings">
                      <Button variant="outline">
                        View Bookings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
