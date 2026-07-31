import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: '"Midnight Royale Gala" <noreply@midnightroyale.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email send error:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
};

export const sendBookingConfirmation = async (
  email: string,
  name: string,
  bookingRef: string,
  eventTitle: string,
  eventDate: string,
  totalAmount: number,
  qrCodeBase64?: string
): Promise<void> => {
  const qrHtml = qrCodeBase64
    ? `<div style="text-align:center;margin:20px 0;"><img src="${qrCodeBase64}" alt="QR Code" style="width:200px;height:200px;"/></div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#0a0a0a;color:#d4af37;padding:40px;">
      <div style="max-width:600px;margin:auto;background:#1a1a1a;border:1px solid #d4af37;border-radius:8px;padding:40px;">
        <h1 style="text-align:center;color:#d4af37;font-size:28px;letter-spacing:2px;">Midnight Royale Gala</h1>
        <hr style="border-color:#d4af37;margin:20px 0;">
        <p>Dear ${name},</p>
        <p>Your booking has been confirmed!</p>
        ${qrHtml}
        <div style="background:#2a2a2a;padding:20px;border-radius:4px;margin:20px 0;">
          <p><strong>Booking Reference:</strong> ${bookingRef}</p>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
        </div>
        <p>Please present your QR code at the venue for entry.</p>
        <p style="text-align:center;margin-top:30px;color:#888;">&copy; 2024 Midnight Royale Gala. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Booking Confirmed - ${bookingRef}`,
    html,
  });
};
