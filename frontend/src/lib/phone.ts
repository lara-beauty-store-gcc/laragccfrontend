/** UAE mobile: +971, 9 digits, must start with 50/52/54/55/56/58. Accepts 05… or 5… or +971… */
const AE = /^(?:\+?971)?0?(5[024568]\d{7})$/;

export const UAE_PHONE_DIGITS = 9;
export const UAE_PHONE_EXAMPLE = '501234567';

function cleanPhone(input: string) {
  return input.replace(/\s|[-().]/g, '');
}

/** Returns local 9-digit part or null. */
export function parseUaePhoneDigits(input: string): string | null {
  const m = cleanPhone(input).match(AE);
  return m ? m[1] : null;
}

export function isValidUaePhone(input: string): boolean {
  return parseUaePhoneDigits(input) !== null;
}

/** Canonical E.164: +971XXXXXXXXX */
export function normalizeUaePhone(input: string): string | null {
  const local = parseUaePhoneDigits(input);
  return local ? `+971${local}` : null;
}

/**
 * What the customer typed in checkout — keeps 05… or 5… digits only.
 * Accepts paste of +971501234567 / 971501234567 / 0501234567 / 501234567.
 */
export function formatUaePhoneInput(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('971')) digits = digits.slice(3);
  if (digits.startsWith('05')) return digits.slice(0, 10);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, UAE_PHONE_DIGITS);
}

export function uaePhoneDigitsTarget(input: string): number {
  const digits = formatUaePhoneInput(input);
  return digits.startsWith('05') ? 10 : UAE_PHONE_DIGITS;
}

export function uaePhoneErrorMessage(input: string): string {
  const digits = formatUaePhoneInput(input);
  if (!digits) return 'رقم الجوال مطلوب';
  const target = uaePhoneDigitsTarget(input);
  if (digits.length < target) {
    return target === 10
      ? 'رقم الجوال ناقص — مثال: 0501234567'
      : `رقم الجوال ناقص — لازم ${UAE_PHONE_DIGITS} أرقام`;
  }
  if (!/^0?5[024568]/.test(digits)) {
    return 'رقم جوال إماراتي غير صحيح — مثال: 501234567 أو 0501234567';
  }
  return 'رقم جوال إماراتي غير صحيح — مثال: 501234567 أو 0501234567';
}

/** Sheet + thank-you: always +971 then 9 local digits (customer 05… → +9715…). */
export function formatPhoneForSheet(input: string): string {
  const local = parseUaePhoneDigits(input);
  if (local) return `+971${local}`;

  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('971') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }

  return '';
}

/** Same as sheet format — shown to customer after order. */
export const formatPhoneForDisplay = formatPhoneForSheet;

/** Collapse whitespace but keep the full name (never take first word only). */
export function normalizeCustomerName(input: string): string {
  return String(input || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @deprecated use isValidUaePhone */
export const isValidKuwaitPhone = isValidUaePhone;

/** @deprecated use normalizeUaePhone */
export const normalizeKuwaitPhone = normalizeUaePhone;
