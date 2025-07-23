# Email Setup Guide

This guide explains how to configure email functionality for sending booking confirmations and cancellation emails.

## 🔧 Configuration

The email service uses SMTP to send emails. You need to configure the following environment variables in your `.env.local` file:

```bash
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=your_from_email@gmail.com
```

## 📧 Email Providers Setup

### Gmail Setup
1. **Enable 2-Factor Authentication** on your Google account
2. **Create an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Environment Variables**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_character_app_password
   SMTP_FROM=your_email@gmail.com
   ```

### Outlook/Hotmail Setup
1. **Enable 2-Factor Authentication**
2. **Create an App Password**:
   - Go to Microsoft Account security settings
   - Advanced security options → App passwords
   - Generate password for email

3. **Environment Variables**:
   ```bash
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your_email@outlook.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@outlook.com
   ```

### Yahoo Mail Setup
1. **Enable 2-Factor Authentication**
2. **Generate App Password**:
   - Yahoo Account Info → Account Security
   - Generate and manage app passwords
   - Create password for email

3. **Environment Variables**:
   ```bash
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_USER=your_email@yahoo.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@yahoo.com
   ```

## 🚀 Features

### Booking Confirmation Email
- **Trigger**: Sent automatically after successful payment confirmation
- **Content**: 
  - Booking invoice with all details
  - Vehicle information
  - Rental duration and pricing
  - Payment confirmation
  - Important instructions

### Booking Cancellation Email
- **Trigger**: Sent when user cancels a booking
- **Content**:
  - Cancellation confirmation
  - Refund information (if applicable)
  - Support contact details

## 📋 Email Template Features

The booking confirmation email includes:
- **Professional Design**: Modern, mobile-responsive HTML template
- **Complete Invoice**: All booking and payment details
- **Vehicle Details**: Make, model, type, license plate
- **Rental Information**: Pickup/return dates, location, duration
- **Payment Summary**: Total amount, payment ID, payment method
- **Important Instructions**: Driving license requirements, arrival time, fuel policy
- **Company Branding**: RentWheels logo and contact information

## 🔍 Testing

### Development Testing
1. Set up email credentials in `.env.local`
2. Make a test booking through the application
3. Check your email for the confirmation
4. Test cancellation email by canceling a booking

### Email Content Testing
You can test the email template by calling the API directly:

```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking-confirmation",
    "bookingDetails": {
      "booking": {...},
      "vehicle": {...},
      "user": {"email": "test@example.com", "name": "Test User"},
      "bookingId": "123"
    }
  }'
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Authentication Failed" Error**:
   - Verify app password is correct
   - Ensure 2FA is enabled on your email account
   - Check if the email provider allows app passwords

2. **"Connection Timeout" Error**:
   - Verify SMTP host and port settings
   - Check firewall settings
   - Try different ports (465 for SSL, 587 for TLS)

3. **Emails Not Being Received**:
   - Check spam/junk folder
   - Verify recipient email address
   - Check email provider logs

4. **"TLS/SSL Handshake Failed"**:
   - Try setting `secure: true` for port 465
   - Verify SSL certificate settings
   - Use TLS port 587 instead

### Debug Mode
Enable detailed logging by adding to your environment:
```bash
NODE_ENV=development
```

This will log detailed information about email sending process to the console.

## 📧 Customization

### Email Templates
Email templates are located in `/lib/email.ts`. You can customize:
- **HTML Structure**: Modify the HTML template
- **Styling**: Update CSS styles
- **Content**: Change email text and formatting
- **Branding**: Update logo, colors, and company information

### Adding New Email Types
To add new email types:

1. **Create Template Function**:
   ```typescript
   const generateNewEmailHTML = (data) => {
     return `<html>...</html>`
   }
   ```

2. **Add Sender Function**:
   ```typescript
   export const sendNewEmail = async (details) => {
     // Implementation
   }
   ```

3. **Update API Route**: Add new type to `/api/send-email/route.ts`

## 🔒 Security Best Practices

1. **Never commit email credentials** to version control
2. **Use app passwords** instead of account passwords
3. **Enable 2FA** on email accounts
4. **Rotate passwords regularly**
5. **Monitor email sending logs** for unusual activity
6. **Use environment-specific configurations**

## 📊 Monitoring

Monitor email delivery through:
- Application logs (console output)
- Email provider dashboard
- Failed delivery notifications
- User feedback on email reception

## 🆘 Support

If you encounter issues:
1. Check this documentation first
2. Verify environment variables
3. Test with a simple email first
4. Check email provider documentation
5. Contact technical support with error logs
