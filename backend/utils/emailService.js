import { Resend } from 'resend';
import xss from 'xss';
import dotenv from 'dotenv';

dotenv.config();

// Resend API (HTTP-based — works on Railway which blocks SMTP ports)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not set — email sending will be disabled');
}
const resend = new Resend(RESEND_API_KEY || 'missing_key');

// Use verified domain for sending
const FROM_EMAIL = 'booking@alt-berliner-eckkneipe.de';
const REPLY_TO = 'lutz.richter@gmail.com';
const PROPERTY_NAME = 'Alt-Berliner Eckkneipe';
const PROPERTY_ADDRESS = 'Gustav-Adolf-Straße 146A, 13086 Berlin';
const PROPERTY_PHONE = '+49 178 348 5970';

// Sanitize user input before inserting into HTML emails
const sanitize = (str) => xss(String(str || ''));

// Format date nicely
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
};

// Common email header/footer HTML
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 30px; }
    .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #888; font-size: 14px; }
    .info-value { font-weight: 600; font-size: 14px; color: #333; }
    .total-row { border-top: 2px solid #667eea; padding-top: 12px; margin-top: 8px; }
    .total-row .info-value { color: #667eea; font-size: 18px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-confirmed { background: #d1fae5; color: #065f46; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .footer { background: #1a1a2e; color: #aaa; padding: 25px 30px; text-align: center; font-size: 13px; }
    .footer a { color: #667eea; text-decoration: none; }
    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; }
    h2 { color: #1a1a2e; margin: 0 0 10px; font-size: 20px; }
    p { line-height: 1.6; margin: 0 0 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${PROPERTY_NAME}</h1>
      <p>Your unique Berlin apartment</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p><strong>${PROPERTY_NAME}</strong></p>
      <p>${PROPERTY_ADDRESS}</p>
      <p>📞 ${PROPERTY_PHONE} &nbsp;|&nbsp; ✉️ <a href="mailto:${FROM_EMAIL}">${FROM_EMAIL}</a></p>
      <p style="margin-top: 15px; font-size: 11px; color: #666;">
        © ${new Date().getFullYear()} ${PROPERTY_NAME}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Booking details block (reused across templates)
const bookingDetailsBlock = (booking) => `
  <div class="info-box">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#888;font-size:14px;">Property</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${PROPERTY_NAME}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="padding:8px 0;color:#888;font-size:14px;">Check-in</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${formatDate(booking.checkInDate)}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="padding:8px 0;color:#888;font-size:14px;">Check-out</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${formatDate(booking.checkOutDate)}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="padding:8px 0;color:#888;font-size:14px;">Nights</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${booking.numberOfNights}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="padding:8px 0;color:#888;font-size:14px;">Guests</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${booking.numberOfGuests}</td>
      </tr>
      <tr style="border-top:2px solid #667eea;margin-top:8px;">
        <td style="padding:12px 0 8px;color:#888;font-size:14px;font-weight:600;">Total</td>
        <td style="padding:12px 0 8px;font-weight:700;font-size:18px;text-align:right;color:#667eea;">€${booking.totalPrice}</td>
      </tr>
    </table>
  </div>
`;

// ─── EMAIL TEMPLATES ───

export const sendBookingConfirmation = async (booking) => {
  const guestName = sanitize(booking.user?.name || 'Guest');
  const guestEmail = sanitize(booking.user?.email);
  if (!guestEmail) return { success: false, message: 'No guest email' };

  const html = emailWrapper(`
    <h2>Booking Confirmed! ✓</h2>
    <p>Dear ${guestName},</p>
    <p>Great news — your booking at <strong>${PROPERTY_NAME}</strong> has been <span class="status-badge status-confirmed">Confirmed</span>.</p>
    ${bookingDetailsBlock(booking)}
    <h3 style="margin-top:25px;font-size:16px;color:#1a1a2e;">Important Information</h3>
    <ul style="color:#555;font-size:14px;line-height:1.8;">
      <li><strong>Check-in time:</strong> 15:00 – 23:00</li>
      <li><strong>Check-out time:</strong> Before 10:00</li>
      <li><strong>Address:</strong> ${PROPERTY_ADDRESS}</li>
      <li><strong>Contact:</strong> ${PROPERTY_PHONE}</li>
    </ul>
    <p style="margin-top:20px;">We look forward to welcoming you! If you have any questions, don't hesitate to contact us.</p>
    <p>Best regards,<br/><strong>${PROPERTY_NAME} Team</strong></p>
  `);

  return sendEmail(guestEmail, `Booking Confirmed – ${PROPERTY_NAME}`, html);
};

export const sendBookingCancellation = async (booking) => {
  const guestName = sanitize(booking.user?.name || 'Guest');
  const guestEmail = sanitize(booking.user?.email);
  if (!guestEmail) return { success: false, message: 'No guest email' };

  const html = emailWrapper(`
    <h2>Booking Cancelled</h2>
    <p>Dear ${guestName},</p>
    <p>We regret to inform you that your booking at <strong>${PROPERTY_NAME}</strong> has been <span class="status-badge status-cancelled">Cancelled</span>.</p>
    ${bookingDetailsBlock(booking)}
    <p>If you believe this was done in error, or if you'd like to rebook, please contact us:</p>
    <p style="text-align:center;margin:25px 0;">
      <a href="mailto:${FROM_EMAIL}" class="btn">Contact Us</a>
    </p>
    <p>We hope to welcome you in the future.</p>
    <p>Best regards,<br/><strong>${PROPERTY_NAME} Team</strong></p>
  `);

  return sendEmail(guestEmail, `Booking Cancelled – ${PROPERTY_NAME}`, html);
};

export const sendBookingPending = async (booking) => {
  const guestName = sanitize(booking.user?.name || 'Guest');
  const guestEmail = sanitize(booking.user?.email);
  if (!guestEmail) return { success: false, message: 'No guest email' };

  const html = emailWrapper(`
    <h2>Booking Received</h2>
    <p>Dear ${guestName},</p>
    <p>Thank you for booking at <strong>${PROPERTY_NAME}</strong>! Your reservation is currently <span class="status-badge status-pending">Pending</span> and will be reviewed shortly.</p>
    ${bookingDetailsBlock(booking)}
    <p>You will receive another email once your booking is confirmed. If you have any questions, feel free to reach out.</p>
    <p>Best regards,<br/><strong>${PROPERTY_NAME} Team</strong></p>
  `);

  return sendEmail(guestEmail, `Booking Received – ${PROPERTY_NAME}`, html);
};

// Send admin notification
export const sendAdminNotification = async (booking, action) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'lutz.richter@gmail.com';
  if (!adminEmail) return { success: false, message: 'No admin email configured' };

  const actionLabel = action === 'new' ? 'New Booking' : action === 'cancelled' ? 'Booking Cancelled' : 'Booking Updated';

  const html = emailWrapper(`
    <h2>${actionLabel}</h2>
    <p>A booking has been ${action === 'new' ? 'created' : action}.</p>
    <p><strong>Guest:</strong> ${sanitize(booking.user?.name || 'Unknown')} (${sanitize(booking.user?.email || 'No email')})</p>
    ${bookingDetailsBlock(booking)}
    <p><strong>Status:</strong> <span class="status-badge status-${booking.status}">${booking.status}</span></p>
  `);

  return sendEmail(adminEmail, `[Admin] ${actionLabel} – ${PROPERTY_NAME}`, html);
};

// Core send function using Resend HTTP API
const sendEmail = async (to, subject, html) => {
  if (!RESEND_API_KEY) {
    console.log(`📧 [Email skipped - No Resend API key] To: ${to}, Subject: ${subject}`);
    return { success: true, message: 'Email skipped (no API key)', skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${PROPERTY_NAME} <${FROM_EMAIL}>`,
      replyTo: REPLY_TO,
      to: [to],
      subject,
      html
    });

    if (error) {
      console.error(`📧 Email error to ${to}:`, error.message);
      return { success: false, message: error.message };
    }

    console.log(`📧 Email sent to ${to}: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`📧 Email error to ${to}:`, error.message);
    return { success: false, message: error.message };
  }
};

// Send contact form message to admin
export const sendContactMessage = async ({ name, email, subject, message }) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'lutz.richter@gmail.com';
  const safeName = sanitize(name);
  const safeEmail = sanitize(email);
  const safeSubject = sanitize(subject);
  const safeMessage = sanitize(message);

  const html = emailWrapper(`
    <h2>New Contact Message</h2>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#888;font-size:14px;">From</td>
          <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${safeName}</td>
        </tr>
        <tr style="border-top:1px solid #eee;">
          <td style="padding:8px 0;color:#888;font-size:14px;">Email</td>
          <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;"><a href="mailto:${safeEmail}" style="color:#667eea;">${safeEmail}</a></td>
        </tr>
        <tr style="border-top:1px solid #eee;">
          <td style="padding:8px 0;color:#888;font-size:14px;">Subject</td>
          <td style="padding:8px 0;font-weight:600;font-size:14px;text-align:right;">${safeSubject}</td>
        </tr>
      </table>
    </div>
    <h3 style="margin-top:20px;font-size:16px;color:#1a1a2e;">Message</h3>
    <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:10px 0;border-left:4px solid #764ba2;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#333;">${safeMessage}</div>
    <p style="margin-top:20px;"><a href="mailto:${safeEmail}" class="btn">Reply to ${safeName}</a></p>
  `);

  return sendEmail(adminEmail, `[Contact] ${subject} – ${PROPERTY_NAME}`, html);
};

// Send admin alert when Smoobu sync fails after all retries
export const sendSmoobuSyncFailedAlert = async (booking, error) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'lutz.richter@gmail.com';
  if (!adminEmail) return { success: false, message: 'No admin email configured' };

  const html = emailWrapper(`
    <h2 style="color: #dc2626;">⚠️ Smoobu Sync Failed</h2>
    <p>A paid booking could <strong>not</strong> be synced to Smoobu after multiple retry attempts. Please add it manually in the Smoobu dashboard.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p><strong>Guest:</strong> ${sanitize(booking.user?.name || 'Unknown')}</p>
    <p><strong>Email:</strong> ${sanitize(booking.user?.email || 'No email')}</p>
    ${bookingDetailsBlock(booking)}
    <p><strong>Booking ID:</strong> ${booking._id}</p>
    <p><strong>Sync Attempts:</strong> ${booking.smoobuSyncAttempts || 'N/A'}</p>
    <p><strong>Last Error:</strong> <code style="background: #fee2e2; padding: 2px 6px; border-radius: 4px; color: #dc2626;">${sanitize(error || booking.smoobuSyncError || 'Unknown')}</code></p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 0.85rem; color: #888;">Log into <a href="https://login.smoobu.com">Smoobu</a> and create this reservation manually to avoid double-bookings.</p>
  `);

  return sendEmail(adminEmail, `[URGENT] Smoobu Sync Failed – Manual Action Required`, html);
};

export default {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingPending,
  sendAdminNotification,
  sendSmoobuSyncFailedAlert,
  sendContactMessage
};
