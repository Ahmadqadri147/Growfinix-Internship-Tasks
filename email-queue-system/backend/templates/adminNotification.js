// Admin notification — full enquiry/booking details for the staff inbox.
function adminNotification(enquiry) {
  const date = enquiry.bookingDate
    ? new Date(enquiry.bookingDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not specified';

  const time = enquiry.bookingDate
    ? new Date(enquiry.bookingDate).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

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
                <td style="background:linear-gradient(135deg,#0f172a,#334155);padding:28px 32px;">
                  <h1 style="margin:0;color:#ffffff;font-size:20px;">New ${escapeHtml(enquiry.type).toUpperCase()} — action required</h1>
                  <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Reference #${escapeHtml(enquiry._id?.toString().slice(-8) || '')}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 20px;color:#555555;line-height:1.6;">
                    A new request was submitted through the website. Details below.
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 8px;">
                    ${[
                      ['Full Name', enquiry.fullName],
                      ['Email', enquiry.email],
                      ['Phone', enquiry.phone],
                      ['Subject', enquiry.subject],
                      ['Type', enquiry.type],
                      ['Booking Date', `${date} at ${time}`],
                      ['Guests', enquiry.guests || 1],
                    ]
                      .map(
                        ([label, value]) => `
                        <tr>
                          <td style="width:120px;padding:8px 12px;background:#f1f5f9;border-radius:6px 0 0 6px;color:#334155;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;">${label}</td>
                          <td style="padding:8px 16px;background:#f8fafc;border-radius:0 6px 6px 0;color:#0f172a;font-size:14px;">${escapeHtml(value)}</td>
                        </tr>`
                      )
                      .join('')}
                    <tr>
                      <td style="width:120px;padding:8px 12px;background:#f1f5f9;border-radius:6px 0 0 6px;color:#334155;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Message</td>
                      <td style="padding:8px 16px;background:#f8fafc;border-radius:0 6px 6px 0;color:#0f172a;font-size:14px;line-height:1.6;">${escapeHtml(enquiry.message)}</td>
                    </tr>
                  </table>
                  <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">
                    Submitted at ${new Date(enquiry.createdAt || Date.now()).toLocaleString('en-GB')}
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

module.exports = adminNotification;