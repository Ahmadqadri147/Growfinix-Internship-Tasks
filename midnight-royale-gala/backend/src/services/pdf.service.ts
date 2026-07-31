// PDF service using a simple string-based PDF generator approach
// In production, consider using pdfkit or puppeteer

export const generateTicketPdf = async (
  bookingRef: string,
  eventTitle: string,
  eventDate: string,
  attendeeName: string,
  seatInfo: string,
  qrBase64: string
): Promise<Buffer> => {
  const qrHtml = `<img src="${qrBase64}" />`;
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Georgia, serif; margin: 0; padding: 40px; background: #0a0a0a; color: #d4af37; }
  .ticket { max-width: 500px; margin: auto; border: 2px solid #d4af37; border-radius: 12px; padding: 30px; background: #1a1a1a; }
  h1 { text-align: center; font-size: 24px; letter-spacing: 2px; }
  .details { margin: 20px 0; }
  .details p { margin: 8px 0; }
  .qr { text-align: center; margin: 20px 0; }
  .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
</style></head>
<body>
<div class="ticket">
  <h1>MIDNIGHT ROYALE GALA</h1>
  <hr style="border-color:#d4af37">
  <div class="qr">${qrHtml}</div>
  <div class="details">
    <p><strong>Booking:</strong> ${bookingRef}</p>
    <p><strong>Event:</strong> ${eventTitle}</p>
    <p><strong>Date:</strong> ${eventDate}</p>
    <p><strong>Attendee:</strong> ${attendeeName}</p>
    <p><strong>Seat:</strong> ${seatInfo}</p>
  </div>
  <div class="footer">Present this ticket at the venue for entry.</div>
</div>
</body>
</html>`;

  return Buffer.from(html);
};
