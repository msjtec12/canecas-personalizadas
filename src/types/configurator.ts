export type SurfaceId = 'front' | 'back' | 'handle' | 'bottom' | (string & {});

export type ProductColorId = 'white' | 'black' | 'red' | 'blue' | 'pink' | (string & {});

export interface ProductColor {
  id: ProductColorId;
  name: string;
  hex: string;
  mockupHex: string;
  textColor: string;
}

export interface PrintableArea {
  x: number; // offset X from canvas origin
  y: number; // offset Y from canvas origin
  width: number;
  height: number;
  borderRadius?: number;
  isCircle?: boolean;
}

export interface SurfaceDefinition {
  id: SurfaceId;
  name: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  realWidthMm: number;
  realHeightMm: number;
  printableArea: PrintableArea;
  maxElements?: number;
}

export interface ProductDefinition {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  basePrice: number;
  surfaceAdditionalPrice: number;
  packagingPrice: number;
  availableColors: ProductColor[];
  defaultColor: ProductColorId;
  surfaces: SurfaceDefinition[];
  isActive: boolean;
}

export type ElementType = 'text' | 'image' | 'clipart';

export interface BaseElement {
  id: string;
  surfaceId: SurfaceId;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  opacity: number;
}

export type TextFontFamily =
  | 'Inter'
  | 'Playfair Display'
  | 'Dancing Script'
  | 'Montserrat'
  | 'Pacifico'
  | 'Oswald'
  | 'Caveat'
  | 'Great Vibes'
  | 'Bebas Neue'
  | 'Cinzel'
  | 'Lobster';

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: TextFontFamily;
  fill: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  align: 'left' | 'center' | 'right';
  letterSpacing?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
}

export interface ClipartElement extends BaseElement {
  type: 'clipart';
  src: string;
  title: string;
  category: string;
  fillColor?: string;
}

export type CanvasElement = TextElement | ImageElement | ClipartElement;

export interface SurfaceState {
  elements: CanvasElement[];
}

export type CustomizationMap = Record<SurfaceId, SurfaceState>;

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  cep?: string;
  address?: string;
  notes?: string;
}

export interface ElementPhysicalMetrics {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotation: number;
  estimatedDpi?: number;
  qualityRating?: 'excelente' | 'boa' | 'baixa';
}

export interface ProductSnapshot {
  productId: string;
  productName: string;
  slug: string;
  category: string;
  basePrice: number;
  surfaceAdditionalPrice: number;
  packagingPrice: number;
  color: ProductColor;
  surfaces: SurfaceDefinition[];
  snapshotAt: string;
}

export interface OrderItemCustomization {
  productId: string;
  productName: string;
  color: ProductColor;
  quantity: number;
  includePackaging: boolean;
  basePrice: number;
  additionalSurfacesPrice: number;
  packagingPrice: number;
  unitPrice: number;
  totalPrice: number;
  surfaces: {
    [key in SurfaceId]?: {
      elementCount: number;
      elements: CanvasElement[];
      previewUrl?: string;
      metrics?: Record<string, ElementPhysicalMetrics>;
    };
  };
  createdAt: string;
}

export type OrderStatus =
  | 'novo'
  | 'aguardando_pagamento'
  | 'pago'
  | 'arte_aprovada'
  | 'em_producao'
  | 'pronto'
  | 'entregue'
  | 'cancelado';

export interface OrderStatusLog {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string; // e.g. PED-A82F31
  customer: OrderCustomer;
  item: OrderItemCustomization;
  productSnapshot?: ProductSnapshot;
  status: OrderStatus;
  statusHistory: OrderStatusLog[];
  createdAt: string;
  updatedAt?: string;
}

