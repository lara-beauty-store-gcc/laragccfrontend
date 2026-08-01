import { businessConfig } from '@/config/business';

/** Lara Beauty WhatsApp (E.164 without +): +1 (240) 210-7635 */
export const WHATSAPP_DEFAULT_DIGITS = '12402107635';

const DEFAULT_GREETING =
  'مرحباً، عندي استفسار عن منتجات لارا للجمال 🌿';

/** International digits only — for wa.me / api.whatsapp.com */
export function normalizeWhatsAppDigits(
  whatsappNumber: string = businessConfig.support.whatsappNumber,
): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  return digits || WHATSAPP_DEFAULT_DIGITS;
}

/** Opens chat directly with no pre-filled message (best for floating button). */
export function buildWhatsAppDirectUrl(
  whatsappNumber: string = businessConfig.support.whatsappNumber,
): string {
  return `https://wa.me/${normalizeWhatsAppDigits(whatsappNumber)}`;
}

/** Alternative deep link (some desktop browsers). */
export function buildWhatsAppApiSendUrl(
  whatsappNumber: string = businessConfig.support.whatsappNumber,
): string {
  return `https://api.whatsapp.com/send?phone=${normalizeWhatsAppDigits(whatsappNumber)}`;
}

/** Chat with optional pre-filled message (thank-you / support with order context). */
export function buildWhatsAppChatUrl(
  message: string = DEFAULT_GREETING,
  whatsappNumber: string = businessConfig.support.whatsappNumber,
): string {
  const digits = normalizeWhatsAppDigits(whatsappNumber);
  const trimmed = message.trim();
  if (!trimmed) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(trimmed)}`;
}

export const whatsAppDefaultMessage = DEFAULT_GREETING;

/** Use on click handlers — opens WhatsApp app reliably on mobile in-app browsers. */
export function openWhatsAppChat(
  message?: string,
  whatsappNumber?: string,
): void {
  const url = message
    ? buildWhatsAppChatUrl(message, whatsappNumber)
    : buildWhatsAppDirectUrl(whatsappNumber);
  window.location.assign(url);
}
