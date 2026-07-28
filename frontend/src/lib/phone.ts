/** UAE mobile validation: +971, 9 digits, starts 50/52/54/55/56/58 */
const AE = /^(?:\+?971)?0?(5[024568]\d{7})$/;

export function isValidUaePhone(input: string): boolean {
  return AE.test(input.replace(/\s|-/g, ''));
}

export function normalizeUaePhone(input: string): string | null {
  const m = input.replace(/\s|-/g, '').match(AE);
  if (!m) return null;
  return `+971${m[1]}`;
}

/** Keep only digits for the local part shown next to +971. */
export function formatUaePhoneInput(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('971')) return digits.slice(3, 12);
  if (digits.startsWith('0')) return digits.slice(1, 10);
  return digits.slice(0, 9);
}

/** @deprecated use isValidUaePhone */
export const isValidKuwaitPhone = isValidUaePhone;

/** @deprecated use normalizeUaePhone */
export const normalizeKuwaitPhone = normalizeUaePhone;
