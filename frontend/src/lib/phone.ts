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

/** @deprecated use isValidUaePhone */
export const isValidKuwaitPhone = isValidUaePhone;

/** @deprecated use normalizeUaePhone */
export const normalizeKuwaitPhone = normalizeUaePhone;
