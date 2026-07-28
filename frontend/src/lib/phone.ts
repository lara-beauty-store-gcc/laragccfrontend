/** UAE checkout: +971 + 9 local digits. Any prefix accepted (50, 55, 54, etc.). */
export const UAE_PHONE_DIGITS = 9;
export const UAE_PHONE_EXAMPLE = '501234567';

function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/** Local 9-digit part after stripping +971 / leading 0. */
export function parseUaePhoneDigits(input: string): string | null {
  let digits = digitsOnly(input);
  if (digits.startsWith('971')) digits = digits.slice(3);
  if (digits.startsWith('0') && digits.length >= 10) digits = digits.slice(1);
  if (digits.length === 9) return digits;
  if (digits.length > 9) return digits.slice(-9);
  return null;
}

export function isValidUaePhone(input: string): boolean {
  return parseUaePhoneDigits(input) !== null;
}

/** Canonical: +971XXXXXXXXX */
export function normalizeUaePhone(input: string): string | null {
  const local = parseUaePhoneDigits(input);
  return local ? `+971${local}` : null;
}

/** Input next to +971 — digits only, accepts 05… or 9 digits. */
export function formatUaePhoneInput(input: string): string {
  let digits = digitsOnly(input);
  if (digits.startsWith('971')) digits = digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(0, 10);
  return digits.slice(0, UAE_PHONE_DIGITS);
}

export function uaePhoneDigitsTarget(input: string): number {
  const digits = formatUaePhoneInput(input);
  return digits.startsWith('0') ? 10 : UAE_PHONE_DIGITS;
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
  return 'رقم الجوال ناقص — لازم 9 أرقام';
}

/** Sheet + thank-you: always +971 + 9 digits. */
export function formatPhoneForSheet(input: string): string {
  const local = parseUaePhoneDigits(input);
  if (local) return `+971${local}`;

  const digits = digitsOnly(input);
  if (digits.startsWith('971') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }

  return '';
}

export const formatPhoneForDisplay = formatPhoneForSheet;

export function normalizeCustomerName(input: string): string {
  return String(input || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @deprecated use isValidUaePhone */
export const isValidKuwaitPhone = isValidUaePhone;

/** @deprecated use normalizeUaePhone */
export const normalizeKuwaitPhone = normalizeUaePhone;
