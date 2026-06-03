import nodemailer from 'nodemailer';

/**
 * Reusable email sending utility.
 * Uses Gmail SMTP by default (configurable via EMAIL_SERVICE env var).
 * 
 * Required env vars:
 *   EMAIL_USER — Gmail address (e.g., aadhiranbabyproducts@gmail.com)
 *   EMAIL_PASS — Gmail App Password (NOT your regular Gmail password)
 *   EMAIL_SERVICE — Optional, defaults to 'gmail'
 */

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email service not configured. Set EMAIL_USER and EMAIL_PASS.');
    }
    // In development, log the email instead of sending
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [DEV] Email Simulation');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { simulated: true };
  }

  const mailOptions = {
    from: `"Aadhiran Kids Collections" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return getTransporter().sendMail(mailOptions);
};

/**
 * Send OTP verification email with a branded HTML template
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name for personalization
 */
export const sendOtpEmail = async (email, otp, name) => {
  const subject = `${otp} is your verification code — Aadhiran Kids Collections`;

  const text = `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n— Aadhiran Kids Collections`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #e11d48; font-size: 24px; margin: 0;">Aadhiran Kids Collections</h1>
      </div>
      
      <div style="background: #fff; border: 1px solid #fecdd3; border-radius: 16px; padding: 32px; text-align: center;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Use this code to verify your email address:</p>
        
        <div style="background: linear-gradient(135deg, #fff1f2, #fce7f3); border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #e11d48;">${otp}</span>
        </div>
        
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          This code expires in <strong>10 minutes</strong>.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      
      <p style="text-align: center; color: #d1d5db; font-size: 12px; margin-top: 24px;">
        © ${new Date().getFullYear()} Aadhiran Kids Collections
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};
