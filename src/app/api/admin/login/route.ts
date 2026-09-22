import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminPasscode,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Autenticação administrativa não configurada no servidor.' },
        { status: 503 }
      );
    }

    const { passcode } = await request.json();

    if (typeof passcode !== 'string' || !verifyAdminPasscode(passcode)) {
      return NextResponse.json(
        { success: false, error: 'Senha de acesso administrativo incorreta.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Autenticado com sucesso no Painel de Produção & Gestão.',
    });

    response.cookies.set('admin_session', createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao processar login.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sessão administrativa encerrada.' });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
