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

export const sendBookingCancellationEmail = async (cancellationDetails: any) => {
  try {
    const transporter = createTransporter()
    
    const { booking, vehicle, user, reason, refundInfo } = cancellationDetails
    
    if (!user?.email) {
      console.log('❌ No user email found, skipping cancellation email')
      return { success: false, error: 'No user email provided' }
    }
    
    const subject = `Booking Cancelled - ${vehicle?.name} (${booking.id})`
    
    const emailHtml = `
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #dc2626; text-align: center;">❌ Booking Cancelled</h1>
    <h2>Hello ${user.full_name || user.email},</h2>
    <p>Your vehicle booking has been <strong>cancelled</strong> as requested.</p>
    
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h3>Cancelled Booking Details</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Vehicle:</strong> ${vehicle?.name}</p>
      <p><strong>Pickup Location:</strong> ${booking.pickup_location}</p>
      <p><strong>Pickup Date:</strong> ${new Date(booking.pickup_date).toLocaleString()}</p>
      <p><strong>Return Date:</strong> ${new Date(booking.return_date).toLocaleString()}</p>
      <p><strong>Total Amount:</strong> ₹${booking.total_amount}</p>
      <p><strong>Cancellation Reason:</strong> ${reason}</p>
    </div>

    <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3>💰 Refund Information</h3>
      <p><strong>Refund Amount:</strong> ₹${refundInfo.refundAmount} (${refundInfo.refundPercentage}% of total)</p>
      <p><strong>Processing Time:</strong> ${refundInfo.processingTime}</p>
      <p><strong>Refund Method:</strong> Original payment method</p>
    </div>

    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>📞 Need Help?</h3>
      <p>If you have any questions about your cancellation or refund, please contact us:</p>
      <p><strong>Email:</strong> support@rentwheels.com</p>
      <p><strong>Phone:</strong> +91-XXXX-XXXX</p>
    </div>

    <p>Thank you for choosing RentWheels. We hope to serve you again in the future!</p>
    
    <hr style="margin: 30px 0; border: none; height: 1px; background-color: #e5e7eb;" />
    <div style="text-align: center; color: #6b7280; font-size: 12px;">
      <p>RentWheels - Your Trusted Car Rental Partner</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>`

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject,
      html: emailHtml
    }

    console.log('📤 Sending cancellation email to:', user.email)
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Cancellation email sent successfully:', result.messageId)
    
    return { 
      success: true, 
      messageId: result.messageId,
      result: result 
    }
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
