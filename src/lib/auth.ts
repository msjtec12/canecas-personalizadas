import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

const DEV_FALLBACK_PASSCODE = 'admin123';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getAdminPasscode(): string | null {
  const configured = process.env.ADMIN_PASSCODE;
  if (configured) return configured;
  return process.env.NODE_ENV === 'production' ? null : DEV_FALLBACK_PASSCODE;
}

function getSessionSecret(): string | null {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured) return configured;
  return process.env.NODE_ENV === 'production'
    ? null
    : 'montua-dev-session-secret-change-me';
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getAdminPasscode() && getSessionSecret());
}

export function verifyAdminPasscode(passcode: string): boolean {
  const expected = getAdminPasscode();
  if (!expected || !passcode) return false;

  const a = Buffer.from(passcode);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET não configurado.');
  }

  const payload = {
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;

  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function isAuthenticatedAdmin(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get('admin_session')?.value);
}
