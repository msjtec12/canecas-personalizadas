import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrders } from '@/lib/orderService';
import { OrderStatus } from '@/types/configurator';
import { isAuthenticatedAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Autenticação administrativa obrigatória.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const orders = await getOrders({ search: id });
    const order = orders.find((o) => o.id === id || o.orderNumber === id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Erro ao buscar pedido por id:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao buscar pedido' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado para alteração de status de pedido.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, notes } = body as { status: OrderStatus; notes?: string };

    if (!status) {
      return NextResponse.json({ success: false, error: 'Novo status é obrigatório' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status, notes);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado para atualização' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
