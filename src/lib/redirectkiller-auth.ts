import { runtimeEnv } from '@/lib/runtime-env';

export function redirectkillerAdminPassword() {
  return runtimeEnv('REDIRECTKILLER_ADMIN_PASSWORD');
}

export function isRedirectkillerAuthorized(req: Request) {
  const password = redirectkillerAdminPassword();
  if (!password) return false;

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const headerPassword = req.headers.get('x-redirectkiller-password') || bearer;

  return headerPassword === password;
}
