/**
 * Formats a WhatsApp URL or number to ensure it includes the default identification message.
 * If the URL is already a WhatsApp URL and lacks a text parameter, it appends it.
 * If it is a phone number, it converts it to a wa.me URL with the message.
 */
export function formatWhatsappUrl(urlOrNumber: string, message = "Olá, venho do site Raquel Neumann"): string {
  if (!urlOrNumber) return urlOrNumber;

  const cleanUrl = urlOrNumber.trim();

  // If it is an absolute URL
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    if (cleanUrl.includes('wa.me') || cleanUrl.includes('api.whatsapp.com')) {
      // If it doesn't have a text parameter, append it
      if (!cleanUrl.includes('text=')) {
        const textParam = `text=${encodeURIComponent(message)}`;
        const separator = cleanUrl.includes('?') ? '&' : '?';
        return `${cleanUrl}${separator}${textParam}`;
      }
    }
    return cleanUrl;
  }

  // If it's a phone number (containing digits only, or with some formatting)
  const digitsOnly = cleanUrl.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    const textParam = `text=${encodeURIComponent(message)}`;
    return `https://wa.me/${digitsOnly}?${textParam}`;
  }

  return cleanUrl;
}
