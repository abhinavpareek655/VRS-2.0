import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? +process.env.SMTP_PORT : 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendBookingConfirmationEmail = async (bookingDetails: any) => {
  try {
    const transporter = createTransporter()
    
    // Extract email - try different property paths
    const userEmail = bookingDetails.user?.email || bookingDetails.email || bookingDetails.customerEmail
    
    if (!userEmail) {
      console.log('❌ No user email found, skipping email')
      return { success: false, error: 'No user email provided' }
    }
    
    // Extract booking data from different possible structures
    const vehicleName = bookingDetails.vehicle?.name || bookingDetails.vehicleName || 'Vehicle'
    const customerName = bookingDetails.user?.full_name || bookingDetails.customerName || 'Customer'
    const bookingId = bookingDetails.booking?.id || bookingDetails.bookingId || 'N/A'
    const totalAmount = bookingDetails.totalAmount || 0
    const originalAmount = bookingDetails.originalAmount
    const testingMode = bookingDetails.testingMode || false
    
    const subject = `Booking Confirmation - ${vehicleName} (${bookingId})`
    
    const emailHtml = `
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #2563eb; text-align: center;">🚗 Booking Confirmed!</h1>
    <h2>Hello ${customerName},</h2>
    <p>Your vehicle booking has been confirmed successfully.</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Booking Details</h3>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Vehicle:</strong> ${vehicleName}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Pickup Location:</strong> ${bookingDetails.booking?.pickup_location || 'To be confirmed'}</p>
      ${bookingDetails.booking?.special_requests ? `<p><strong>Special Requests:</strong> ${bookingDetails.booking.special_requests}</p>` : ''}
    </div>
    
    ${testingMode && originalAmount ? `
      <div style="background-color: #f59e0b; color: white; padding: 10px; border-radius: 8px; text-align: center; margin: 10px 0; font-weight: bold;">
        🧪 TESTING MODE - Original Amount: <span style="text-decoration: line-through;">₹${originalAmount}</span>
      </div>
    ` : ''}
    
    <div style="background-color: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h3>Total Amount: ₹${totalAmount}</h3>
      ${totalAmount === 1 ? '<p>Testing Mode - ₹1 charged instead of full amount</p>' : ''}
    </div>
    
    <p>Thank you for choosing RentWheels!</p>
    
    <div style="background-color: #e5e7eb; padding: 15px; text-align: center; color: #6b7280; margin-top: 30px;">
      <p>&copy; 2025 RentWheels. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: subject,
      html: emailHtml
    }

    console.log('📤 Sending email to:', userEmail)
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', result.messageId)
    
    return { 
      success: true, 
      messageId: result.messageId,
      result: result 
    }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export const sendBookingCancellationEmail = async (cancellationDetails: {
  bookingId: string
  vehicleName: string
  pickupDate: string
  reason: string
  amount: number
}) => {
  try {
    const transporter = createTransporter()
    
    const subject = `Booking Cancelled - ${cancellationDetails.vehicleName} (${cancellationDetails.bookingId})`
    
    const emailHtml = `
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #dc2626; text-align: center;">❌ Booking Cancelled</h1>
    <h2>Hello,</h2>
    <p>Your vehicle booking has been cancelled as requested.</p>
    
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h3>Cancellation Details</h3>
      <p><strong>Booking ID:</strong> ${cancellationDetails.bookingId}</p>
      <p><strong>Vehicle:</strong> ${cancellationDetails.vehicleName}</p>
      <p><strong>Original Pickup Date:</strong> ${new Date(cancellationDetails.pickupDate).toLocaleDateString()}</p>
      <p><strong>Amount:</strong> ₹${cancellationDetails.amount}</p>
      <p><strong>Cancellation Reason:</strong> ${cancellationDetails.reason}</p>
    </div>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4>Refund Information</h4>
      <p>Your refund will be processed within 5-7 business days according to our cancellation policy.</p>
    </div>
    
    <p>We're sorry to see you go. If you have any questions, please don't hesitate to contact us.</p>
    
    <div style="background-color: #e5e7eb; padding: 15px; text-align: center; color: #6b7280; margin-top: 30px;">
      <p>&copy; 2025 RentWheels. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: subject,
      html: emailHtml
    }

    const result = await transporter.sendMail(mailOptions)
    
    return { 
      success: true, 
      messageId: result.messageId
    }
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export const sendBookingModificationEmail = async (modificationDetails: {
  bookingId: string
  vehicleName: string
  oldPickupDate: string
  newPickupDate: string
  oldAmount: number
  newAmount: number
}) => {
  try {
    const transporter = createTransporter()
    
    const subject = `Booking Modified - ${modificationDetails.vehicleName} (${modificationDetails.bookingId})`
    const amountDifference = modificationDetails.newAmount - modificationDetails.oldAmount
    
    const emailHtml = `
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #2563eb; text-align: center;">✏️ Booking Modified</h1>
    <h2>Hello,</h2>
    <p>Your vehicle booking has been modified successfully.</p>
    
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <h3>Modification Details</h3>
      <p><strong>Booking ID:</strong> ${modificationDetails.bookingId}</p>
      <p><strong>Vehicle:</strong> ${modificationDetails.vehicleName}</p>
      
      <div style="margin: 15px 0;">
        <h4 style="margin-bottom: 5px;">Pickup Date Changes:</h4>
        <p style="margin: 5px 0;"><span style="text-decoration: line-through; color: #6b7280;">Old: ${new Date(modificationDetails.oldPickupDate).toLocaleDateString()}</span></p>
        <p style="margin: 5px 0; color: #059669; font-weight: bold;">New: ${new Date(modificationDetails.newPickupDate).toLocaleDateString()}</p>
      </div>
      
      <div style="margin: 15px 0;">
        <h4 style="margin-bottom: 5px;">Amount Changes:</h4>
        <p style="margin: 5px 0;"><span style="text-decoration: line-through; color: #6b7280;">Old: ₹${modificationDetails.oldAmount}</span></p>
        <p style="margin: 5px 0; color: #059669; font-weight: bold;">New: ₹${modificationDetails.newAmount}</p>
        <p style="margin: 5px 0; color: ${amountDifference >= 0 ? '#dc2626' : '#059669'}; font-weight: bold;">
          Difference: ${amountDifference >= 0 ? '+' : ''}₹${amountDifference}
        </p>
      </div>
    </div>
    
    <div style="background-color: ${amountDifference >= 0 ? '#fef2f2' : '#f0fdf4'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4>Payment Information</h4>
      ${amountDifference > 0 
        ? `<p>Additional payment of ₹${amountDifference} is required. You will be contacted shortly for payment processing.</p>`
        : amountDifference < 0 
        ? `<p>A refund of ₹${Math.abs(amountDifference)} will be processed within 5-7 business days.</p>`
        : `<p>No additional payment required.</p>`
      }
    </div>
    
    <p>Your booking is now pending admin approval for the changes. You will receive a confirmation once approved.</p>
    
    <div style="background-color: #e5e7eb; padding: 15px; text-align: center; color: #6b7280; margin-top: 30px;">
      <p>&copy; 2025 RentWheels. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: subject,
      html: emailHtml
    }

    const result = await transporter.sendMail(mailOptions)
    
    return { 
      success: true, 
      messageId: result.messageId
    }
  } catch (error) {
    console.error('❌ Error sending modification email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
