import { NextRequest } from 'next/server';

export const ADMIN_DEFAULT_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
export const ADMIN_AUTH_TOKEN = 'feitodenos-admin-auth-token-2026';

/**
 * Valida se a requisição possui credenciais administrativas válidas
 * via header x-admin-token, header Authorization Bearer ou cookie admin_session.
 */
export function isAuthenticatedAdmin(request: NextRequest): boolean {
  const tokenHeader = request.headers.get('x-admin-token');
  if (tokenHeader === ADMIN_AUTH_TOKEN) return true;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === ADMIN_AUTH_TOKEN) {
    return true;
  }

  const cookieToken = request.cookies.get('admin_session')?.value;
  if (cookieToken === ADMIN_AUTH_TOKEN) return true;

  return false;
}
