/** UAE mobile: +971, 9 digits, starts 50/52/54/55/56/58 */
const AE_MOBILE = /^(?:\+?971)?0?(5[024568]\d{7})$/;

/** Kuwait mobile: +965, 8 digits, starts 5/6/9 */
const KW_MOBILE = /^(?:\+?965)?0?([569]\d{7})$/;

export function normalizeUaePhone(input) {
  const raw = String(input || '').replace(/\s|-/g, '');
  const m = raw.match(AE_MOBILE);
  if (!m) return null;
  return `+971${m[1]}`;
}

export function isValidUaePhone(input) {
  return normalizeUaePhone(input) !== null;
}

export function normalizeKuwaitPhone(input) {
  const raw = String(input || '').replace(/\s|-/g, '');
  const m = raw.match(KW_MOBILE);
  if (!m) return null;
  return `+965${m[1]}`;
}

export function isValidKuwaitPhone(input) {
  return normalizeKuwaitPhone(input) !== null;
}

/** Prefer UAE (current market), fall back to Kuwait for legacy payloads. */
export function normalizeMarketPhone(input) {
  return normalizeUaePhone(input) || normalizeKuwaitPhone(input);
}

export function isValidMarketPhone(input) {
  return isValidUaePhone(input) || isValidKuwaitPhone(input);
}
