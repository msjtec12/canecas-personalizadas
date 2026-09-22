import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders, CreateOrderPayload } from '@/lib/orderService';
import { isAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Autenticação administrativa obrigatória.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const period = (searchParams.get('period') as 'hoje' | '7d' | '30d' | 'todos') || undefined;

    const orders = await getOrders({ search, status, period });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderPayload;

    // Validações básicas de payload
    if (!body.customer?.name || !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'Nome e telefone do cliente são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!body.productId || !body.surfacesState) {
      return NextResponse.json(
        { success: false, error: 'Produto e configuração de superfícies são obrigatórios.' },
        { status: 400 }
      );
    }

    // Criação segura com recálculo obrigatório no servidor
    const order = await createOrder(body);

    return NextResponse.json(
      {
        success: true,
        orderNumber: order.orderNumber,
        order,
        recalculatedPrice: {
          unitPrice: order.item.unitPrice,
          totalPrice: order.item.totalPrice,
          quantity: order.item.quantity,
          basePrice: order.item.basePrice,
          additionalSurfacesPrice: order.item.additionalSurfacesPrice,
          packagingPrice: order.item.packagingPrice,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar pedido no servidor:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Não foi possível registrar seu pedido agora. Sua personalização foi preservada. Tente novamente em alguns instantes.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
