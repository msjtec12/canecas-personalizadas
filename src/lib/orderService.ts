import fs from 'fs';
import path from 'path';
import { PRODUCTS_CATALOG } from '@/data/products';
import {
  AdminOrder,
  OrderStatus,
  OrderStatusLog,
  ProductSnapshot,
  CustomizationMap,
  SurfaceId,
  OrderCustomer,
  ProductColor,
} from '@/types/configurator';
import { calculateElementMetrics } from './physicalMetrics';
import { isSupabaseConfigured, supabase } from './supabase';
import { getDb, isDbConfigured } from './supabaseServer';

export interface CreateOrderPayload {
  productId: string;
  colorId: string;
  quantity: number;
  includePackaging: boolean;
  customer: OrderCustomer;
  surfacesState: CustomizationMap;
  surfacePreviews?: Record<string, string>;
}

const ORDERS_FILE_PATH = path.join(process.cwd(), 'data', 'orders.json');

function loadOrdersFromDisk(): AdminOrder[] {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Erro ao carregar orders.json do disco:', err);
  }
  return [];
}

function saveOrdersToDisk(orders: AdminOrder[]): void {
  try {
    const dir = path.dirname(ORDERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar orders.json no disco:', err);
  }
}

// Cache em memória para desenvolvimento e fallback operacional
let inMemoryOrders: AdminOrder[] = loadOrdersFromDisk();

/**
 * Gera código de pedido único no formato PED-XXXXXX
 */
export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PED-${code}`;
}

/**
 * Criação segura de pedido com RECÁLCULO OBRIGATÓRIO DE PREÇO no servidor
 * e persistência em cascata no PostgreSQL (Supabase Real).
 */
export async function createOrder(payload: CreateOrderPayload): Promise<AdminOrder> {
  const { productId, colorId, quantity, includePackaging, customer, surfacesState, surfacePreviews } = payload;

  // 1. Busca produto oficial do catálogo (imutabilidade estrita)
  const product = PRODUCTS_CATALOG.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Produto não encontrado no catálogo oficial: ${productId}`);
  }
  const selectedColor: ProductColor =
    product.availableColors.find((c) => c.id === colorId) || product.availableColors[0];

  // 2. RECÁLCULO SEVERO DO VALOR NO SERVIDOR (Nunca confiar no client)
  const customizedSurfaces = Object.entries(surfacesState).filter(
    ([, state]) => state.elements && state.elements.length > 0
  );
  const customizedCount = customizedSurfaces.length;
  const additionalSurfacesCount = Math.max(0, customizedCount - 1);
  const additionalSurfacesCost = additionalSurfacesCount * product.surfaceAdditionalPrice;
  const packagingCost = includePackaging ? product.packagingPrice : 0;
  const unitPrice = Number((product.basePrice + additionalSurfacesCost + packagingCost).toFixed(2));
  const validatedQuantity = Math.max(1, Math.min(100, Math.floor(quantity || 1)));
  const totalAmount = Number((unitPrice * validatedQuantity).toFixed(2));

  // 3. Monta snapshot completo do produto e superfícies
  const productSnapshot: ProductSnapshot = {
    productId: product.id,
    productName: product.name,
    slug: product.slug,
    category: product.category,
    basePrice: product.basePrice,
    surfaceAdditionalPrice: product.surfaceAdditionalPrice,
    packagingPrice: product.packagingPrice,
    color: selectedColor,
    surfaces: product.surfaces,
    snapshotAt: new Date().toISOString(),
  };

  // 4. Calcula métricas físicas reais em milímetros e DPI para cada elemento
  const processedSurfaces: AdminOrder['item']['surfaces'] = {};

  for (const sDef of product.surfaces) {
    const sState = surfacesState[sDef.id];
    if (sState && sState.elements) {
      const metrics: Record<string, ReturnType<typeof calculateElementMetrics>> = {};
      for (const el of sState.elements) {
        metrics[el.id] = calculateElementMetrics(el, sDef);
      }

      processedSurfaces[sDef.id as SurfaceId] = {
        elementCount: sState.elements.length,
        elements: sState.elements,
        previewUrl: surfacePreviews?.[sDef.id],
        metrics,
      };
    }
  }

  const orderNumber = generateOrderNumber();
  const createdAt = new Date().toISOString();
  let dbOrderId: string | null = null;

  // 5. Persistência real em cascata no PostgreSQL (Supabase Real)
  const db = getDb();

  if (db) {
    try {
      await db.begin(async (tx) => {
        // A. Inserir pedido principal
        const [savedOrder] = await tx`
          INSERT INTO public.orders (
            order_number, customer_name, customer_phone, customer_email,
            customer_cep, customer_address, customer_notes, status,
            product_snapshot, base_price, additional_surfaces_price,
            packaging_price, unit_price, quantity, total_amount,
            packaging_included, created_at, updated_at
          ) VALUES (
            ${orderNumber}, ${customer.name.trim()}, ${customer.phone.trim()},
            ${customer.email?.trim() || null}, ${customer.cep?.trim() || null},
            ${customer.address?.trim() || null}, ${customer.notes?.trim() || null},
            'novo', ${tx.json(productSnapshot as any)}, ${product.basePrice},
            ${additionalSurfacesCost}, ${packagingCost}, ${unitPrice},
            ${validatedQuantity}, ${totalAmount}, ${includePackaging},
            ${createdAt}, ${createdAt}
          ) RETURNING id
        `;
        dbOrderId = savedOrder.id;

        // B. Inserir histórico inicial
        await tx`
          INSERT INTO public.order_status_history (
            order_id, from_status, to_status, notes, created_at
          ) VALUES (
            ${savedOrder.id}, null, 'novo', 'Pedido criado pelo cliente via configurador', ${createdAt}
          )
        `;

        // C. Inserir item do pedido
        const [savedItem] = await tx`
          INSERT INTO public.order_items (
            order_id, product_name, color_selected,
            quantity, unit_price, total_item_price, created_at
          ) VALUES (
            ${savedOrder.id}, ${product.name},
            ${tx.json(selectedColor as any)}, ${validatedQuantity},
            ${unitPrice}, ${totalAmount}, ${createdAt}
          ) RETURNING id
        `;

        // D. Inserir customizações
        const [savedCust] = await tx`
          INSERT INTO public.customizations (
            order_item_id, surfaces_data, preview_front_url, preview_back_url, preview_handle_url, created_at
          ) VALUES (
            ${savedItem.id}, ${tx.json(processedSurfaces as any)},
            ${surfacePreviews?.front || null}, ${surfacePreviews?.back || null},
            ${surfacePreviews?.handle || null}, ${createdAt}
          ) RETURNING id
        `;

        // E. Inserir elementos de customização com métricas físicas e DPI real
        for (const [surfaceKey, sData] of Object.entries(processedSurfaces)) {
          if (!sData || !sData.elements) continue;
          for (const el of sData.elements) {
            const metrics = sData.metrics?.[el.id];
            const content =
              el.type === 'text'
                ? (el as any).text || ''
                : el.type === 'image'
                ? (el as any).src || ''
                : (el as any).clipartId || (el as any).src || '';

            await tx`
              INSERT INTO public.customization_elements (
                customization_id, surface_key, element_type, content,
                pos_x_px, pos_y_px, width_px, height_px,
                pos_x_mm, pos_y_mm, width_mm, height_mm,
                rotation_deg, estimated_dpi, quality_rating, z_index, visual_properties, created_at
              ) VALUES (
                ${savedCust.id}, ${surfaceKey}, ${el.type}, ${content},
                ${el.x}, ${el.y}, ${el.width}, ${el.height},
                ${metrics?.xMm ?? 0},
                ${metrics?.yMm ?? 0},
                ${metrics?.widthMm ?? 0},
                ${metrics?.heightMm ?? 0},
                ${el.rotation || 0}, ${metrics?.estimatedDpi || null},
                ${metrics?.qualityRating || null}, ${el.zIndex || 0},
                ${tx.json(el as any)}, ${createdAt}
              )
            `;
          }
        }
      });
    } catch (dbErr) {
      console.error('Erro crítico ao persistir pedido no PostgreSQL Supabase:', dbErr);
      // REQUISITO 6 E 13: Em produção ou quando o banco estiver ativo, NUNCA falhar silenciosamente
      if (process.env.NODE_ENV === 'production' || isDbConfigured) {
        throw new Error(
          'Não foi possível registrar seu pedido agora. Sua personalização foi preservada. Tente novamente em alguns instantes.'
        );
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    // Em produção, a ausência de banco de dados é um erro de configuração fatal
    throw new Error(
      'Não foi possível registrar seu pedido agora. Sua personalização foi preservada. Tente novamente em alguns instantes.'
    );
  }

  const orderId = dbOrderId || `ord-${Date.now()}`;

  const initialStatusLog: OrderStatusLog = {
    id: `log-${Date.now()}`,
    orderId,
    toStatus: 'novo',
    notes: 'Pedido criado pelo cliente via configurador',
    createdAt,
  };

  const newOrder: AdminOrder = {
    id: orderId,
    orderNumber,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() || undefined,
      cep: customer.cep?.trim() || undefined,
      address: customer.address?.trim() || undefined,
      notes: customer.notes?.trim() || undefined,
    },
    status: 'novo',
    createdAt,
    updatedAt: createdAt,
    productSnapshot,
    statusHistory: [initialStatusLog],
    item: {
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      quantity: validatedQuantity,
      includePackaging,
      basePrice: product.basePrice,
      additionalSurfacesPrice: additionalSurfacesCost,
      packagingPrice: packagingCost,
      unitPrice,
      totalPrice: totalAmount,
      surfaces: processedSurfaces,
      createdAt,
    },
  };

  // Mantém espelho em memória e disco para contingência e testes de reinício
  inMemoryOrders.unshift(newOrder);
  saveOrdersToDisk(inMemoryOrders);

  return newOrder;
}

/**
 * Consulta pedidos com filtros de busca e data.
 * Lê diretamente do PostgreSQL (Supabase Real) quando disponível.
 */
export async function getOrders(params?: {
  search?: string;
  status?: string;
  period?: 'hoje' | '7d' | '30d' | 'todos';
}): Promise<AdminOrder[]> {
  const db = getDb();
  let list: AdminOrder[] = [];

  if (db) {
    try {
      // Consulta todos os pedidos no PostgreSQL
      const dbRows = await db`
        SELECT 
          o.id,
          o.order_number,
          o.customer_name,
          o.customer_phone,
          o.customer_email,
          o.customer_cep,
          o.customer_address,
          o.customer_notes,
          o.status,
          o.product_snapshot,
          o.base_price,
          o.additional_surfaces_price,
          o.packaging_price,
          o.unit_price,
          o.quantity,
          o.total_amount,
          o.packaging_included,
          o.created_at,
          o.updated_at,
          (
            SELECT json_agg(h.* ORDER BY h.created_at ASC)
            FROM public.order_status_history h
            WHERE h.order_id = o.id
          ) as history,
          (
            SELECT json_agg(
              json_build_object(
                'id', i.id,
                'product_name', i.product_name,
                'color_selected', i.color_selected,
                'quantity', i.quantity,
                'unit_price', i.unit_price,
                'total_item_price', i.total_item_price,
                'customizations', (
                  SELECT json_agg(
                    json_build_object(
                      'id', c.id,
                      'surfaces_data', c.surfaces_data,
                      'preview_front_url', c.preview_front_url,
                      'preview_back_url', c.preview_back_url,
                      'preview_handle_url', c.preview_handle_url
                    )
                  )
                  FROM public.customizations c
                  WHERE c.order_item_id = i.id
                )
              )
            )
            FROM public.order_items i
            WHERE i.order_id = o.id
          ) as items
        FROM public.orders o
        WHERE o.order_number IS NOT NULL
        ORDER BY o.created_at DESC
      `;

      list = dbRows.map((r) => {
        const itemData = r.items && r.items[0] ? r.items[0] : null;
        const custData = itemData && itemData.customizations && itemData.customizations[0] ? itemData.customizations[0] : null;

        const rawSurfaces = custData?.surfaces_data || {};
        const surfaces: AdminOrder['item']['surfaces'] = {};

        for (const [sKey, sVal] of Object.entries(rawSurfaces as Record<string, any>)) {
          surfaces[sKey as SurfaceId] = {
            elementCount: sVal.elementCount || (sVal.elements ? sVal.elements.length : 0),
            elements: sVal.elements || [],
            previewUrl: sVal.previewUrl || (sKey === 'front' ? custData?.preview_front_url : sKey === 'back' ? custData?.preview_back_url : custData?.preview_handle_url),
            metrics: sVal.metrics || {},
          };
        }

        const snapshot: ProductSnapshot = r.product_snapshot || {
          productId: 'caneca-ceramica-325ml',
          productName: 'Caneca de Cerâmica 325ml',
          slug: 'caneca',
          category: 'Canecas',
          basePrice: Number(r.base_price || 29.9),
          surfaceAdditionalPrice: Number(r.additional_surfaces_price || 5.0),
          packagingPrice: Number(r.packaging_price || 9.9),
          color: itemData?.color_selected || { id: 'white', name: 'Branca', hex: '#FFFFFF', mockupHex: '#F8FAFC', textColor: '#1E293B' },
          surfaces: PRODUCTS_CATALOG[0].surfaces,
          snapshotAt: new Date(r.created_at).toISOString(),
        };

        const statusHistory: OrderStatusLog[] = Array.isArray(r.history)
          ? r.history.map((h: any) => ({
              id: h.id,
              orderId: h.order_id,
              fromStatus: (h.from_status || h.previous_status) as OrderStatus,
              toStatus: (h.to_status || h.new_status || 'novo') as OrderStatus,
              notes: h.notes || h.note || 'Registro de status',
              createdAt: new Date(h.created_at).toISOString(),
            }))
          : [
              {
                id: `log-${r.id}`,
                orderId: r.id,
                toStatus: r.status as OrderStatus,
                notes: 'Pedido registrado no sistema',
                createdAt: new Date(r.created_at).toISOString(),
              },
            ];

        return {
          id: r.id,
          orderNumber: r.order_number,
          customer: {
            name: r.customer_name,
            phone: r.customer_phone || '',
            email: r.customer_email || undefined,
            cep: r.customer_cep || undefined,
            address: r.customer_address || undefined,
            notes: r.customer_notes || undefined,
          },
          status: (r.status || 'novo') as OrderStatus,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at || r.created_at).toISOString(),
          productSnapshot: snapshot,
          statusHistory,
          item: {
            productId: snapshot.productId,
            productName: itemData?.product_name || snapshot.productName,
            color: itemData?.color_selected || snapshot.color,
            quantity: Number(r.quantity || 1),
            includePackaging: Boolean(r.packaging_included),
            basePrice: Number(r.base_price || 29.9),
            additionalSurfacesPrice: Number(r.additional_surfaces_price || 0),
            packagingPrice: Number(r.packaging_price || 0),
            unitPrice: Number(r.unit_price || 29.9),
            totalPrice: Number(r.total_amount || 29.9),
            surfaces,
            createdAt: new Date(r.created_at).toISOString(),
          },
        };
      });
    } catch (err) {
      console.warn('Falha ao consultar pedidos no PostgreSQL Supabase, usando cache local:', err);
      list = [...inMemoryOrders];
    }
  } else {
    list = [...inMemoryOrders];
  }

  // Aplicação de filtros
  if (params?.status && params.status !== 'todos') {
    list = list.filter((o) => o.status === params.status);
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    );
  }

  if (params?.period && params.period !== 'todos') {
    const now = new Date();
    list = list.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const diffHours = (now.getTime() - orderDate.getTime()) / (1000 * 3600);
      if (params.period === 'hoje') return diffHours <= 24;
      if (params.period === '7d') return diffHours <= 24 * 7;
      if (params.period === '30d') return diffHours <= 24 * 30;
      return true;
    });
  }

  return list;
}

/**
 * Atualiza status do pedido e registra na linha do tempo no PostgreSQL
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<AdminOrder | null> {
  const db = getDb();
  const updatedAt = new Date().toISOString();
  const noteText = notes || `Status alterado para ${newStatus}`;

  if (db) {
    try {
      // Atualiza pedido no PostgreSQL
      const [updatedOrder] = await db`
        UPDATE public.orders
        SET status = ${newStatus}, updated_at = ${updatedAt}
        WHERE id = ${orderId} OR order_number = ${orderId}
        RETURNING id, order_number, status
      `;

      if (updatedOrder) {
        // Insere registro no histórico do banco
        await db`
          INSERT INTO public.order_status_history (
            order_id, from_status, to_status, notes, created_at
          ) VALUES (
            ${updatedOrder.id}, null, ${newStatus}, ${noteText}, ${updatedAt}
          )
        `;
      }
    } catch (err) {
      console.warn('Erro ao atualizar status no PostgreSQL Supabase:', err);
    }
  }

  // Atualiza cache em memória e disco
  const localOrder = inMemoryOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (localOrder) {
    const previousStatus = localOrder.status;
    localOrder.status = newStatus;
    localOrder.updatedAt = updatedAt;
    localOrder.statusHistory.push({
      id: `log-${Date.now()}`,
      orderId: localOrder.id,
      fromStatus: previousStatus,
      toStatus: newStatus,
      notes: noteText,
      createdAt: updatedAt,
    });
    saveOrdersToDisk(inMemoryOrders);
    return localOrder;
  }

  // Se não estava no cache, recarrega do banco
  const refreshedList = await getOrders({ search: orderId });
  return refreshedList.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
}
