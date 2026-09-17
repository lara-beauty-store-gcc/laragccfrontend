const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length >= 5 && email.length <= 254 && EMAIL_RE.test(email);
}

export function emailErrorMessage(value: string): string {
  if (!value.trim()) return 'البريد الإلكتروني مطلوب';
  return 'أدخلي بريد إلكتروني صحيح — مثال: name@email.com';
}
