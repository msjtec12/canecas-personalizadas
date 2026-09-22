import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_DEFAULT_PASSCODE, ADMIN_AUTH_TOKEN } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode || passcode !== ADMIN_DEFAULT_PASSCODE) {
      return NextResponse.json(
        { success: false, error: 'Senha de acesso administrativo incorreta.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      token: ADMIN_AUTH_TOKEN,
      message: 'Autenticado com sucesso no Painel de Produção & Gestão.',
    });

    // Define cookie HttpOnly seguro para navegação contínua no admin
    response.cookies.set('admin_session', ADMIN_AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erro ao processar login.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sessão administrativa encerrada.' });
  response.cookies.delete('admin_session');
  return response;
}
