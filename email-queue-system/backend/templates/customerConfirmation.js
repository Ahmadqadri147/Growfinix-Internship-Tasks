// Customer confirmation — sent to the person who submitted the form.
function customerConfirmation(enquiry) {
  const date = enquiry.bookingDate
    ? new Date(enquiry.bookingDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Flexible';

  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Segoe UI, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;">We received your request</h1>
                  <p style="margin:6px 0 0;color:#dcd7ff;font-size:14px;">Reference #${escapeHtml(enquiry._id?.toString().slice(-8) || '')}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 8px;color:#333333;">Hi <strong>${escapeHtml(enquiry.fullName)}</strong>,</p>
                  <p style="margin:0 0 24px;color:#555555;line-height:1.6;">
                    Thank you for getting in touch. Your ${escapeHtml(enquiry.type)} has been received and
                    our team will contact you shortly at <strong>${escapeHtml(enquiry.email)}</strong>.
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr><td style="padding:4px 0;color:#8892a6;font-size:13px;">Subject</td><td style="padding:4px 0;color:#333333;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(enquiry.subject)}</td></tr>
                          <tr><td style="padding:4px 0;color:#8892a6;font-size:13px;">Booking Date</td><td style="padding:4px 0;color:#333333;font-size:13px;font-weight:600;text-align:right;">${date}</td></tr>
                          <tr><td style="padding:4px 0;color:#8892a6;font-size:13px;">Guests</td><td style="padding:4px 0;color:#333333;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(enquiry.guests || 1)}</td></tr>
                          <tr><td style="padding:4px 0;color:#8892a6;font-size:13px;vertical-align:top;">Message</td><td style="padding:4px 0;color:#333333;font-size:13px;text-align:right;">${escapeHtml(enquiry.message || '-')}</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:24px 0 0;color:#555555;line-height:1.6;font-size:13px;">
                    Status: <strong style="color:#16a34a;">Confirmed — awaiting our reply</strong>
                  </p>
                  <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

module.exports = customerConfirmation;