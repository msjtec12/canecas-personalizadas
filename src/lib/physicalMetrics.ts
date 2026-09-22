import { CanvasElement, SurfaceDefinition, ElementPhysicalMetrics } from '@/types/configurator';

/**
 * Converte pixels do canvas digital para milímetros reais da peça.
 */
export function pxToMm(px: number, canvasPx: number, realMm: number): number {
  if (!canvasPx || canvasPx === 0) return 0;
  return Number(((px / canvasPx) * realMm).toFixed(2));
}

/**
 * Converte milímetros reais da peça para pixels do canvas digital.
 */
export function mmToPx(mm: number, canvasPx: number, realMm: number): number {
  if (!realMm || realMm === 0) return 0;
  return Number(((mm / realMm) * canvasPx).toFixed(2));
}

/**
 * Calcula a densidade de pixels por polegada (PPI/DPI) de uma imagem colocada sobre uma superfície física.
 * @param pixelWidth Largura nativa da imagem em pixels
 * @param physicalWidthMm Largura física em milímetros que a imagem ocupará na peça
 */
export function calculateDpi(pixelWidth: number, physicalWidthMm: number): number {
  if (!physicalWidthMm || physicalWidthMm <= 0 || !pixelWidth) return 0;
  const inches = physicalWidthMm / 25.4;
  return Math.round(pixelWidth / inches);
}

/**
 * Classifica a qualidade de impressão com base no PPI estimado.
 */
export function getDpiQuality(dpi: number): 'excelente' | 'boa' | 'baixa' {
  if (dpi >= 250) return 'excelente';
  if (dpi >= 150) return 'boa';
  return 'baixa';
}

/**
 * Calcula as métricas físicas reais (em mm e DPI) de um elemento sobre a superfície.
 */
export function calculateElementMetrics(
  element: CanvasElement,
  surface: SurfaceDefinition
): ElementPhysicalMetrics {
  const xMm = pxToMm(element.x, surface.canvasWidth, surface.realWidthMm);
  const yMm = pxToMm(element.y, surface.canvasHeight, surface.realHeightMm);
  const widthMm = pxToMm(element.width * (element.scaleX || 1), surface.canvasWidth, surface.realWidthMm);
  const heightMm = pxToMm(element.height * (element.scaleY || 1), surface.canvasHeight, surface.realHeightMm);
  const rotation = Math.round((element.rotation || 0) % 360);

  if (element.type === 'image' && element.originalWidth) {
    const dpi = calculateDpi(element.originalWidth, widthMm);
    const quality = getDpiQuality(dpi);
    return {
      xMm,
      yMm,
      widthMm,
      heightMm,
      rotation,
      estimatedDpi: dpi,
      qualityRating: quality,
    };
  }

  // Textos e cliparts vetoriais têm alta definição
  return {
    xMm,
    yMm,
    widthMm,
    heightMm,
    rotation,
    estimatedDpi: 300,
    qualityRating: 'excelente',
  };
}
