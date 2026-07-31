import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#d4af37',
        light: '#000000',
      },
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code.');
  }
};

export const generateQRCodeBuffer = async (data: string): Promise<Buffer> => {
  try {
    return await QRCode.toBuffer(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#d4af37',
        light: '#00000000',
      },
    });
  } catch (error) {
    throw new Error('Failed to generate QR code buffer.');
  }
};
