import { runtimeEnv } from '@/lib/runtime-env';

function expectedUsername() {
  return runtimeEnv('COD_ADMIN_USERNAME') || runtimeEnv('ADMIN_DASHBOARD_USERNAME');
}

function expectedPassword() {
  return runtimeEnv('COD_ADMIN_PASSWORD') || runtimeEnv('ADMIN_DASHBOARD_PASSWORD');
}

export function codAdminConfigured() {
  return Boolean(expectedUsername() && expectedPassword());
}

export function isCodAdminAuthorized(req: Request) {
  const username = expectedUsername();
  const password = expectedPassword();
  if (!username || !password) return false;

  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded =
        typeof atob === 'function'
          ? atob(auth.slice(6))
          : Buffer.from(auth.slice(6), 'base64').toString('utf8');
      const split = decoded.indexOf(':');
      if (split < 0) return false;
      const user = decoded.slice(0, split);
      const pass = decoded.slice(split + 1);
      return user === username && pass === password;
    } catch {
      return false;
    }
  }

  const headerUser = req.headers.get('x-cod-admin-user') || req.headers.get('x-admin-user') || '';
  const headerPass =
    req.headers.get('x-cod-admin-password') ||
    (auth.startsWith('Bearer ') ? auth.slice(7) : '');

  return headerUser === username && headerPass === password;
}

export function unauthorizedResponse() {
  return Response.json({ error: 'unauthorized' }, { status: 401 });
}
