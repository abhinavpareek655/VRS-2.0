# VRS 2.0 Setup Guide

Complete setup instructions for the Vehicle Rental System.

## 📋 Prerequisites

- Node.js 18+ and pnpm/npm
- Supabase account (for database)
- Razorpay account (for payments)

## 🏗️ Installation

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd VRS-2.0
pnpm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Database Setup
1. Create a new Supabase project
2. Run `scripts/setup-database.sql` in Supabase SQL Editor
3. Run `scripts/seed-data.sql` for sample data
4. Enable Row Level Security (RLS) for all tables

### 4. Start Development
```bash
pnpm dev
```

## 🧪 Testing the System

1. **Search**: Use the booking widget on homepage with future dates
2. **Browse**: View available vehicles filtered by your dates
3. **Book**: Select a vehicle, fill details, and test payment (use Razorpay test cards)
4. **Confirm**: See instant booking confirmation

### Razorpay Test Cards
- **Successful payment**: `4111 1111 1111 1111`
- **Declined payment**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

## 🔧 Key Features Working

✅ Real-time vehicle availability  
✅ Date conflict prevention  
✅ Secure Razorpay payments  
✅ User authentication  
✅ Booking management  
✅ Admin dashboard  

## 🚀 Production Deployment

### 1. Build for Production
```bash
pnpm build
```

### 2. Environment Variables
Set production environment variables in your hosting platform

### 3. Configure
3. **Configure**: Set up production Razorpay webhooks
4. **Deploy**: Push to your hosting platform

## 🔍 Troubleshooting

### Common Issues
- Database connection: Check Supabase URL and keys
- Payment errors: Verify Razorpay keys in `.env.local`
- Build errors: Ensure all dependencies are installed
- Auth issues: Check Supabase auth configuration

### Debug Steps
- Check browser console for errors
- Verify Razorpay keys in `.env.local`
- Check Razorpay dashboard for errors
- Ensure database tables are created
- Verify environment variables are loaded

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Integration Guide](https://razorpay.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🛠️ Development Tools

- VS Code with TypeScript extension
- Supabase CLI for database management
- Razorpay Dashboard for payment monitoring
- Browser DevTools for debugging

---

🎉 **You're all set!** Your Vehicle Rental System is ready for development and testing.