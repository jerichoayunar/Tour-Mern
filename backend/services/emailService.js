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
// 🔹 TEST EMAIL SERVICE
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
  testEmailService
};
