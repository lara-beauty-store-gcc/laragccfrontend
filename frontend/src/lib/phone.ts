/** UAE mobile: 9 digits starting with 5. Also accepts 05..., 971..., +971... */
const AE = /^(?:\+?971)?0?(5\d{8})$/;

export const UAE_PHONE_DIGITS = 9;
export const UAE_PHONE_EXAMPLE = '501234567';

function cleanPhone(input: string) {
  return input.replace(/\s|[-().]/g, '');
}

/** Returns local 9-digit part (e.g. 501234567) or null. */
export function parseUaePhoneDigits(input: string): string | null {
  const m = cleanPhone(input).match(AE);
  return m ? m[1] : null;
}

export function isValidUaePhone(input: string): boolean {
  return parseUaePhoneDigits(input) !== null;
}

export function normalizeUaePhone(input: string): string | null {
  const local = parseUaePhoneDigits(input);
  return local ? `+971${local}` : null;
}

/** Input shown next to +971 — digits only, max 9. */
export function formatUaePhoneInput(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('971')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, UAE_PHONE_DIGITS);
}

export function uaePhoneErrorMessage(input: string): string {
  const digits = formatUaePhoneInput(input);
  if (!digits) return 'رقم الجوال مطلوب';
  if (digits.length < UAE_PHONE_DIGITS) {
    return `رقم الجوال ناقص — لازم ${UAE_PHONE_DIGITS} أرقام (مثال: ${UAE_PHONE_EXAMPLE})`;
  }
  if (!digits.startsWith('5')) {
    return `رقم الجوال الإماراتي يبدأ بـ 5 — مثال: ${UAE_PHONE_EXAMPLE}`;
  }
  return `رقم جوال إماراتي غير صحيح — مثال: ${UAE_PHONE_EXAMPLE}`;
}

/** @deprecated use isValidUaePhone */
export const isValidKuwaitPhone = isValidUaePhone;

/** @deprecated use normalizeUaePhone */
export const normalizeKuwaitPhone = normalizeUaePhone;
