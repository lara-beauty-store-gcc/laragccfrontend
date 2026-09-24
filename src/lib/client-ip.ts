export function clientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? '';
  return req.headers.get('x-real-ip') ?? req.headers.get('cf-connecting-ip') ?? '';
}

export function isPrivateIp(ip: string) {
  const value = ip.trim();
  if (!value || value === '127.0.0.1' || value === '::1') return true;
  if (value.startsWith('10.') || value.startsWith('192.168.') || value.startsWith('172.')) return true;
  return false;
}
