import { businessConfig } from '@/config/business';

const DEFAULT_GREETING =
  'مرحباً، عندي استفسار عن منتجات لارا للجمال 🌿';

/** wa.me link — digits only in path */
export function buildWhatsAppChatUrl(
  message: string = DEFAULT_GREETING,
  whatsappNumber: string = businessConfig.support.whatsappNumber,
): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${digits}?text=${text}`;
}

export const whatsAppDefaultMessage = DEFAULT_GREETING;
