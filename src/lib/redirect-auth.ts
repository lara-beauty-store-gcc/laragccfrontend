import { runtimeEnv } from '@/lib/runtime-env';

export function redirectAdminSecret() {
  return (
    runtimeEnv('REDIRECT_ADMIN_SECRET') ||
    runtimeEnv('SHEETS_WEBHOOK_SECRET') ||
    runtimeEnv('ORDERS_SYNC_SECRET')
  );
}

export function isRedirectAdminAuthorized(req: Request) {
  const secret = redirectAdminSecret();
  if (!secret) return false;

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const headerSecret = req.headers.get('x-admin-secret') || bearer;

  return headerSecret === secret;
}
