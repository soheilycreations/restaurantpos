/**
 * LankaQR (EMVCo) Generator Utility
 * Generates the EMVCo string for Sri Lankan merchants.
 */

interface LankaQRFields {
  merchantName: string;
  merchantCity: string;
  merchantId: string; // e.g., your bank's merchant ID
  amount: number;
  reference?: string;
}

export function generateLankaQRString({
  merchantName,
  merchantCity,
  merchantId,
  amount,
  reference = 'POS-BILL'
}: LankaQRFields): string {
  
  const tags: Record<string, string> = {
    '00': '01', // Payload Format Indicator
    '01': '12', // Point of Initiation Method (11: Static, 12: Dynamic)
    
    // Merchant Account Info (Customizable per Bank, using generic 26)
    '26': formatTag('26', {
      '00': 'lk.lankaqr', // Application ID
      '01': merchantId,   // Merchant Account Number
    }),
    
    '52': '5812', // Merchant Category Code (Eating places and Restaurants)
    '53': '144',  // Transaction Currency (LKR)
    '54': amount.toFixed(2), // Transaction Amount
    '58': 'LK',   // Country Code
    '59': merchantName.slice(0, 25), // Merchant Name
    '60': merchantCity.slice(0, 15), // Merchant City
  };

  if (reference) {
    tags['62'] = formatTag('62', {
      '01': reference.slice(0, 25) // Reference ID
    });
  }

  // Construct base string
  let emvCode = '';
  Object.keys(tags).sort().forEach(tag => {
    emvCode += tag + tags[tag].length.toString().padStart(2, '0') + tags[tag];
  });

  // Tag 63: Checksum
  emvCode += '6304';
  const crc = calculateCRC16(emvCode);
  emvCode += crc;

  return emvCode;
}

/**
 * Format nested tags
 */
function formatTag(parentTag: string, children: Record<string, string>): string {
  let content = '';
  Object.keys(children).sort().forEach(tag => {
    content += tag + children[tag].length.toString().padStart(2, '0') + children[tag];
  });
  return content;
}

/**
 * CRC16-CCITT (0xFFFF) Implementation
 */
function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
