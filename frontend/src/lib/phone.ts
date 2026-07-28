/** UAE: 9 digits after +971. Also accepts 0... or 971... prefix. */
const AE = /^(?:\+?971)?0?(\d{9})$/;

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

export function normalizeUaePhone(input: string): string | null {
  const local = parseUaePhoneDigits(input);
  return local ? `+971${local}` : null;
}

/** Digits shown next to +971 — max 9. */
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
    return `رقم الجوال ناقص — لازم ${UAE_PHONE_DIGITS} أرقام`;
  }
  return `رقم الجوال لازم يكون ${UAE_PHONE_DIGITS} أرقام`;
}

/** Always +971XXXXXXXXX for Google Sheets / exports. */
export function formatPhoneForSheet(input: string): string {
  const normalized = normalizeUaePhone(input);
  if (normalized) return normalized;

  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('971') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+971${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+971${digits}`;
  }
  if (input.trim().startsWith('+')) {
    return input.replace(/\s|[-().]/g, '');
  }

  return digits ? `+${digits}` : '';
}

/** @deprecated use isValidUaePhone */
export const isValidKuwaitPhone = isValidUaePhone;

/** @deprecated use normalizeUaePhone */
export const normalizeKuwaitPhone = normalizeUaePhone;
