/**
 * utils/mailer.js
 *
 * Nodemailer SMTP transporter configuration & email template functions.
 *
 * Supports any SMTP provider (Resend, SendGrid, Amazon SES, Gmail, etc.)
 * configured via environment variables. All secrets live in .env.
 *
 * Exports:
 *  - sendOtpEmail(toEmail, otpCode) → Sends branded OTP verification email
 *
 * SMTP Environment Variables Required:
 *  SMTP_HOST         → e.g. "smtp.resend.com" or "smtp.sendgrid.net"
 *  SMTP_PORT         → e.g. "587" (TLS) or "465" (SSL)
 *  SMTP_SECURE       → "true" for port 465, "false" for 587
 *  SMTP_USER         → SMTP username (e.g. "apikey" for SendGrid)
 *  SMTP_PASS         → SMTP password / API key
 *  SMTP_SENDER_EMAIL → The "from" address shown to recipients
 */

const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// 1. Create the transporter — reused for every email send
// ---------------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  // true for port 465 (SSL), false for port 587 (STARTTLS)
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ---------------------------------------------------------------------------
// 2. Exported email helper functions
// ---------------------------------------------------------------------------

/**
 * Sends a branded OTP verification email to the specified address.
 *
 * @param {string} toEmail  - Recipient's email address
 * @param {string} otpCode  - 6-digit OTP code to embed in the email
 * @returns {Promise}       - Nodemailer sendMail promise
 */
exports.sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    // The sender display name and address
    from: `"TripMate India" <${process.env.SMTP_SENDER_EMAIL || "no-reply@tripmate.in"}>`,
    to: toEmail,
    subject: "Verification Code — TripMate India",
    // Branded, responsive HTML email template
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f4f6f9; color: #121214; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #dce2e7;">
        <h2 style="color: #1a73e8; font-family: Montserrat, sans-serif; margin-bottom: 8px;">TripMate India</h2>
        <p style="font-size: 15px; line-height: 22px; color: #5e6573;">
          Enter this verification code in the app to complete authentication:
        </p>
        <div style="font-size: 32px; font-weight: bold; background-color: #ffffff; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #dce2e7; margin: 24px 0; color: #1a73e8; letter-spacing: 4px;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; line-height: 18px; color: #8c93a3;">
          This code is single-use and will expire in <strong>5 minutes</strong>.
          If you did not request this, please disregard this message.
        </p>
        <hr style="border: none; border-top: 1px solid #dce2e7; margin: 16px 0;" />
        <p style="font-size: 11px; color: #b0b8c8; text-align: center;">
          &copy; ${new Date().getFullYear()} TripMate India. All rights reserved.
        </p>
      </div>
    `,
  };

  console.log(`\n=========================================`);
  console.log(`[DEVELOPMENT] Mock OTP Email for ${toEmail}`);
  console.log(`OTP CODE: ${otpCode}`);
  console.log(`=========================================\n`);

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer failed to send email. Ensure domain is verified if using Resend. Continuing for development.");
    console.error(error.message);
    return;
  }
};
