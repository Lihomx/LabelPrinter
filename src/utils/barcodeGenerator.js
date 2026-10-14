import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

/**
 * Generate high-resolution 1D barcode as DataURL (Canvas)
 * @param {string} text - Content to encode
 * @param {object} options - Format options
 * @returns {string} dataURL
 */
export const generateBarcode = (text, options = {}) => {
  if (!text) return '';
  const canvas = document.createElement('canvas');
  try {
    JsBarcode(canvas, String(text), {
      format: options.format || 'CODE128',
      width: options.width || 2,
      height: options.height || 60,
      displayValue: options.displayValue !== false,
      font: 'Inter, sans-serif',
      fontSize: options.fontSize || 14,
      textMargin: 2,
      margin: options.margin || 2,
      background: '#ffffff',
      lineColor: '#000000',
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('JsBarcode error:', err);
    return '';
  }
};

/**
 * Generate 2D QR Code as DataURL
 * @param {string} text - Content to encode
 * @param {object} options - Options
 * @returns {Promise<string>} dataURL
 */
export const generateQRCode = async (text, options = {}) => {
  if (!text) return '';
  try {
    return await QRCode.toDataURL(String(text), {
      width: options.size || 200,
      margin: options.margin || 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QRCode error:', err);
    return '';
  }
};
