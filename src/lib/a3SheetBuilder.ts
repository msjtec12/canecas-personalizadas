import { CanvasElement, SurfaceDefinition } from '@/types/configurator';

export const A3_WIDTH_MM = 297;
export const A3_HEIGHT_MM = 420;
export const DPI_300 = 300;

export const A3_WIDTH_PX_300DPI = Math.round((A3_WIDTH_MM / 25.4) * DPI_300); // 3508 px
export const A3_HEIGHT_PX_300DPI = Math.round((A3_HEIGHT_MM / 25.4) * DPI_300); // 4961 px

export interface A3DecalItem {
  id: string;
  orderNumber: string;
  surfaceId: string;
  surfaceName: string;
  realWidthMm: number;
  realHeightMm: number;
  elements: CanvasElement[];
  surfaceDef: SurfaceDefinition;
  previewUrl?: string;
  // Posição física na folha A3 em milímetros
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  sheetIndex: number;
}

export interface A3SheetConfig {
  orientation: 'portrait' | 'landscape';
  marginMm: number;
  spacingMm: number;
  showCutMarks: boolean;
  showLabels: boolean;
}

export interface PackingResult {
  placedItems: A3DecalItem[];
  unplacedCount: number;
  totalSheets: number;
  utilizationPercentage: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
}

/**
 * Organiza e empacota automaticamente os adesivos na folha A3 (Algoritmo 2D Shelf Packing)
 * para maximizar a economia de filme DTF UV e tinta branca/verniz.
 */
export function packDecalsOnA3(
  items: Omit<A3DecalItem, 'xMm' | 'yMm' | 'sheetIndex'>[],
  config: A3SheetConfig = {
    orientation: 'portrait',
    marginMm: 5,
    spacingMm: 5,
    showCutMarks: true,
    showLabels: true,
  }
): PackingResult {
  const sheetWidthMm = config.orientation === 'portrait' ? A3_WIDTH_MM : A3_HEIGHT_MM;
  const sheetHeightMm = config.orientation === 'portrait' ? A3_HEIGHT_MM : A3_WIDTH_MM;

  const usableWidth = sheetWidthMm - config.marginMm * 2;
  const usableHeight = sheetHeightMm - config.marginMm * 2;

  // Ordena itens por altura decrescente para otimizar preenchimento de fileiras (Best-Fit Decreasing)
  const sorted = [...items].sort((a, b) => b.heightMm - a.heightMm);

  const placedItems: A3DecalItem[] = [];
  let currentSheet = 0;
  let currentX = config.marginMm;
  let currentY = config.marginMm;
  let currentRowHeight = 0;

  for (const item of sorted) {
    // Se não couber na linha atual, pula para a próxima fileira
    if (currentX + item.widthMm > sheetWidthMm - config.marginMm) {
      currentX = config.marginMm;
      currentY += currentRowHeight + config.spacingMm;
      currentRowHeight = 0;
    }

    // Se ultrapassar a altura da folha atual, inicia nova folha A3
    if (currentY + item.heightMm > sheetHeightMm - config.marginMm) {
      currentSheet += 1;
      currentX = config.marginMm;
      currentY = config.marginMm;
      currentRowHeight = 0;
    }

    placedItems.push({
      ...item,
      xMm: Number(currentX.toFixed(1)),
      yMm: Number(currentY.toFixed(1)),
      sheetIndex: currentSheet,
    });

    currentX += item.widthMm + config.spacingMm;
    if (item.heightMm > currentRowHeight) {
      currentRowHeight = item.heightMm;
    }
  }

  // Cálculo da taxa de aproveitamento da folha principal (Sheet 0)
  const sheet0Items = placedItems.filter((i) => i.sheetIndex === 0);
  const totalDecalAreaMm2 = sheet0Items.reduce((acc, i) => acc + i.widthMm * i.heightMm, 0);
  const totalUsableAreaMm2 = usableWidth * usableHeight;
  const utilizationPercentage = Math.min(100, Math.round((totalDecalAreaMm2 / totalUsableAreaMm2) * 100));

  return {
    placedItems,
    unplacedCount: 0,
    totalSheets: currentSheet + 1,
    utilizationPercentage,
    sheetWidthMm,
    sheetHeightMm,
  };
}
