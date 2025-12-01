import nodemailer from 'nodemailer';

// ======================================================
// 🔹 CREATE EMAIL TRANSPORTER
// ======================================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
    console.error('🔍 Check your EMAIL_USER and EMAIL_PASS in .env');
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log('📧 Using email:', process.env.EMAIL_USER);
  }
});

// ======================================================
// 🔹 SEND PASSWORD RESET EMAIL
// ======================================================
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: `"TourBook Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - TourBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You requested to reset your password for your TourBook account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    margin: 15px 0;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            <strong>Reset Token (copy if button doesn't work):</strong><br>
            <code style="background: #f4f4f4; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">
              ${resetToken}
            </code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            TourBook Travel Management System
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', email, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ EMAIL SENDING FAILED:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 SEND PASSWORD CHANGE CONFIRMATION
// ======================================================
export const sendPasswordChangedEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"TourBook Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - TourBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Changed Successfully</h2>
          <p>Hello ${name},</p>
          <p>Your TourBook account password has been successfully changed.</p>
          <p>If you didn't make this change, please contact us immediately.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #666;">
              <strong>Security Tip:</strong> Use a strong, unique password and enable two-factor authentication for better security.
            </p>
          </div>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            TourBook Travel Management System<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #2563eb;">Visit our website</a>
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password change confirmation sent to', email, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ PASSWORD CHANGE EMAIL FAILED:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 SEND BOOKING CONFIRMATION EMAIL
// ======================================================
export const sendBookingConfirmation = async (booking) => {
  try {
    const { clientEmail, clientName, bookingDate, totalPrice, package: pkg, guests } = booking;
    
    // Format date for display
    const tourDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"TourBook Travel" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Booking Confirmation - ${pkg?.title || 'Your Tour'} - TourBook`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="margin: 0;">Booking Confirmed! 🎉</h1>
            <p style="margin: 5px 0 0 0; font-size: 18px;">Your tour adventure awaits</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hello <strong>${clientName}</strong>,</p>
            <p>Thank you for booking with TourBook! Your booking has been received and is pending admin confirmation.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Package:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${pkg?.title || 'Tour Package'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Tour Date:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${tourDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Number of Guests:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${guests || 1}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Total Amount:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #667eea; font-size: 18px;">₱${totalPrice?.toLocaleString('en-PH') || '0'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">Status:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;"><span style="background: #fff3cd; color: #856404; padding: 5px 10px; border-radius: 3px;">Pending Admin Confirmation</span></td>
                </tr>
              </table>
            </div>

            <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0066cc;"><strong>ℹ️ What happens next?</strong></p>
              <p style="margin: 5px 0 0 0; color: #0066cc; font-size: 14px;">Our team will review your booking and send you a confirmation email within 24 hours. Keep an eye on your inbox!</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
              <p style="margin-top: 0; color: #666;"><strong>Booking Reference:</strong></p>
              <p style="margin: 0; font-size: 12px; color: #999; font-family: monospace;">${booking._id || 'REF-PENDING'}</p>
            </div>

            <p style="color: #666; margin-top: 20px;">
              If you need to cancel or modify your booking, please contact us immediately.
            </p>

            <a href="${process.env.FRONTEND_URL}/bookings" 
               style="background-color: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      margin: 20px 0;">
              View Your Bookings
            </a>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              TourBook Travel Management System<br>
              <a href="${process.env.FRONTEND_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation sent to', clientEmail, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ BOOKING CONFIRMATION EMAIL FAILED:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 SEND BOOKING STATUS UPDATE EMAIL
// ======================================================
export const sendBookingStatusUpdate = async (booking, newStatus) => {
  try {
    const { clientEmail, clientName, bookingDate, totalPrice, package: pkg } = booking;
    
    const tourDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let statusMessage = '';
    let statusColor = '#667eea';
    let icon = '✓';

    if (newStatus === 'confirmed') {
      statusMessage = 'Your booking has been confirmed! 🎉 Your tour is all set.';
      statusColor = '#10b981';
      icon = '✅';
    } else if (newStatus === 'cancelled') {
      statusMessage = 'Your booking has been cancelled. We hope to see you on another tour!';
      statusColor = '#ef4444';
      icon = '❌';
    } else if (newStatus === 'pending') {
      statusMessage = 'Your booking status is pending admin review.';
      statusColor = '#f59e0b';
      icon = '⏳';
    }

    const mailOptions = {
      from: `"TourBook Travel" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Booking ${newStatus.toUpperCase()} - ${pkg?.title || 'Your Tour'} - TourBook`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${icon} Booking Status Updated</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hello <strong>${clientName}</strong>,</p>
            <p>${statusMessage}</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColor};">
              <h3 style="margin-top: 0; color: ${statusColor};">Updated Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Package:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${pkg?.title || 'Tour Package'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Tour Date:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${tourDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Total Amount:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">₱${totalPrice?.toLocaleString('en-PH') || '0'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">Status:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;"><span style="background: ${statusColor}33; color: ${statusColor}; padding: 5px 10px; border-radius: 3px;">${newStatus.toUpperCase()}</span></td>
                </tr>
              </table>
            </div>

            <a href="${process.env.FRONTEND_URL}/bookings" 
               style="background-color: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      margin: 20px 0;">
              View Booking Details
            </a>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              TourBook Travel Management System<br>
              <a href="${process.env.FRONTEND_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking status update sent to', clientEmail, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ BOOKING STATUS EMAIL FAILED:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 SEND BOOKING CANCELLATION EMAIL
// ======================================================
export const sendBookingCancellation = async (booking) => {
  try {
    const { clientEmail, clientName, bookingDate, totalPrice, package: pkg, guests, cancellation } = booking;
    
    const tourDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const refundAmount = cancellation?.refundAmount || 0;
    const refundPercentage = cancellation?.refundPercentage || 0;

    const mailOptions = {
      from: `"TourBook Travel" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Booking Cancelled - ${pkg?.title || 'Your Tour'} - TourBook`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">❌ Booking Cancelled</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hello <strong>${clientName}</strong>,</p>
            <p>Your booking has been successfully cancelled. We're sorry to see you go and hope to serve you on a future adventure!</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0; color: #ef4444;">Cancelled Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Package:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${pkg?.title || 'Tour Package'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Tour Date:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${tourDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Number of Guests:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${guests || 1}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Original Amount:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">₱${totalPrice?.toLocaleString('en-PH') || '0'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">Status:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;"><span style="background: #fee2e2; color: #dc2626; padding: 5px 10px; border-radius: 3px;">CANCELLED</span></td>
                </tr>
              </table>
            </div>

            <div style="background: #dcfce7; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #10b981;">💰 Refund Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #166534; font-weight: bold;">Refund Amount:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #10b981; font-size: 20px;">₱${refundAmount.toLocaleString('en-PH')}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #166534;">Refund Percentage:</td>
                  <td style="padding: 5px 0; text-align: right; color: #166534;">${refundPercentage}%</td>
                </tr>
              </table>
              <p style="margin: 15px 0 0 0; color: #166534; font-size: 14px;">
                ${refundPercentage === 100 
                  ? '✅ Full refund! The tour was more than 14 days away.' 
                  : refundPercentage === 50 
                  ? '⚠️ 50% refund. The tour was 7-14 days away.' 
                  : '❌ No refund available. The tour was less than 7 days away.'}
              </p>
              <p style="margin: 10px 0 0 0; color: #166534; font-size: 14px;">
                ${refundAmount > 0 ? 'Your refund will be processed within 5-7 business days.' : ''}
              </p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
              <p style="margin-top: 0; color: #666;"><strong>Booking Reference:</strong></p>
              <p style="margin: 0; font-size: 12px; color: #999; font-family: monospace;">${booking._id || 'REF-PENDING'}</p>
            </div>

            <p style="color: #666; margin-top: 20px;">
              We hope to see you on another adventure soon! Browse our available packages and book your next tour with us.
            </p>

            <a href="${process.env.FRONTEND_URL}/packages" 
               style="background-color: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      margin: 20px 0;">
              Browse Packages
            </a>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              TourBook Travel Management System<br>
              <a href="${process.env.FRONTEND_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking cancellation email sent to', clientEmail, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ BOOKING CANCELLATION EMAIL FAILED:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 SEND INQUIRY RESPONSE EMAIL
// ======================================================
export const sendInquiryResponse = async (inquiry) => {
  try {
    const { email, name, response, subject } = inquiry;

    const mailOptions = {
      from: `"TourBook Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Response to Your Inquiry - ${subject || 'TourBook'} - TourBook`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="margin: 0;">We've Responded to Your Inquiry 💬</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for reaching out to TourBook! Our team has reviewed your inquiry and provided a response below.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin-top: 0; color: #666;"><strong>Your Inquiry:</strong></p>
              <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6;">${subject || 'No subject provided'}</p>
            </div>

            <div style="background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin-top: 0; color: #0066cc;"><strong>Our Response:</strong></p>
              <p style="margin: 0; color: #0066cc; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${response || 'No response provided'}</p>
            </div>

            <p style="color: #666; margin-top: 20px;">
              If you have any follow-up questions, feel free to reply to this email or contact us through our website.
            </p>

            <a href="${process.env.FRONTEND_URL}/inquiry" 
               style="background-color: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      margin: 20px 0;">
              Send Another Inquiry
            </a>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              TourBook Travel Management System<br>
              <a href="${process.env.FRONTEND_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Inquiry response sent to', email, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ INQUIRY RESPONSE EMAIL FAILED:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 TEST EMAIL SERVICE
// ======================================================
// 🔹 SEND TEST EMAIL
// ======================================================
export const sendTestEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"TourBook Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Test Email - TourBook Settings',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Email Test Successful!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p>Email service configured correctly!</p>
            <p><strong>Recipient:</strong> ${email}</p>
            <p><strong>Sender:</strong> ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error(`Failed to send test email: ${error.message}`);
  }
};

// ======================================================
// 🔹 TEST EMAIL SERVICE (Legacy - for debugging)
// ======================================================
export const testEmailService = async () => {
  try {
    const testEmail = process.env.EMAIL_USER;
    const testToken = 'test-token-123';
    return await sendPasswordResetEmail(testEmail, testToken);
  } catch (error) {
    console.error('❌ Email test error:', error.message);
    return false;
  }
};

// ======================================================
// 🔹 EXPORT ALL FUNCTIONS
// ======================================================
export default {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingStatusUpdate,
  sendInquiryResponse,
  sendTestEmail,
  testEmailService
};
