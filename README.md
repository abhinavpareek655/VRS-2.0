# Vehicle Rental System (VRS 2.0)

A modern, full-stack vehicle rental platform built with Next.js 15, Supabase, and Razorpay integration.

## 🚀 Features

### Core Functionality
- **Real-time Vehicle Search**: Find available vehicles by location and dates
- **Smart Date Filtering**: Automatically excludes booked vehicles from search results
- **Instant Payment Processing**: Secure Razorpay integration for immediate booking confirmation
- **Email Notifications**: Automated booking confirmations and cancellation emails with invoices
- **User Authentication**: Complete signup/login system with Supabase Auth
- **Booking Management**: Track and manage all your reservations
- **Admin Dashboard**: Comprehensive vehicle and booking management

### Technical Features
- **Payment Security**: PCI-compliant payment processing with Razorpay
- **Date Conflict Prevention**: Real-time availability checking prevents double bookings
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized with Next.js 15 App Router

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Razorpay
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Maps**: React Leaflet + OpenStreetMap

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Razorpay account

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/abhinavpareek655/VRS-2.0.git
   cd VRS-2.0
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Razorpay Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Email Configuration (See docs/EMAIL_SETUP.md for details)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_from_email@gmail.com
   ```

3. **Database Setup**
   - Run the SQL scripts in `scripts/` folder in your Supabase SQL editor
   - First run `setup-database.sql` then `seed-data.sql`

4. **Start Development**
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

```
VRS-2.0/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── confirm-booking/
│   │   ├── create-razorpay-order/
│   │   ├── search-vehicles/
│   │   └── vehicle-availability/
│   ├── dashboard/         # User dashboard
│   ├── vehicles/          # Vehicle pages
│   └── (auth)/           # Auth pages
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── booking-widget.tsx
│   ├── razorpay-payment-form.tsx
│   └── navbar.tsx
├── lib/                  # Utilities
│   ├── supabase.ts       # Database client
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
└── scripts/              # Database setup scripts
```

## 🎯 Key Features in Detail

### Booking Flow
1. **Search**: Users search for vehicles by location and dates
2. **Browse**: Available vehicles are displayed with real-time hourly pricing
3. **Select**: Users choose a vehicle and fill booking details (minimum 3 hours)
4. **Payment**: Secure payment form loads with Razorpay integration
5. **Confirm**: Instant booking confirmation with unique ID
6. **Email**: Automated invoice email sent with all booking details

### Payment Processing
- Secure Razorpay payment form
- Real-time payment verification
- Automatic booking confirmation
- Payment failure handling
- Transaction history tracking

## 🔧 API Endpoints

- `GET /api/search-vehicles` - Search available vehicles
- `GET /api/vehicle-availability` - Get booked dates for a vehicle
- `POST /api/create-razorpay-order` - Initialize Razorpay payment
- `POST /api/confirm-booking` - Confirm booking after payment
- `POST /api/send-email` - Send booking confirmation/cancellation emails

## 🔒 Security Features

- **Payment Security**: PCI-compliant Razorpay integration
- **Authentication**: Secure JWT-based auth with Supabase
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in XSS protection

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible design:
- Responsive vehicle cards with image galleries
- Interactive date pickers with availability checking
- Loading states and error handling
- Toast notifications for user feedback
- Mobile-optimized navigation

## 🚀 Deployment

Ready for deployment on Vercel, Netlify, or any Node.js hosting platform:

1. Build the project: `pnpm build`
2. Set environment variables in your hosting platform
3. Deploy the `dist` folder

## 📱 Mobile Experience

- Fully responsive design
- Touch-optimized interactions
- Fast loading on mobile networks
- Progressive Web App ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email abhinavpareek655@gmail.com or create an issue in the repository.

---

**VRS 2.0** - Making vehicle rental simple, secure, and efficient! 🚗✨