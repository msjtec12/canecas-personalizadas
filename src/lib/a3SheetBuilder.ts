import { CanvasElement, SurfaceDefinition } from '@/types/configurator';

export const A3_WIDTH_MM = 297;
export const A3_HEIGHT_MM = 420;
export const DPI_300 = 300;

export const A3_WIDTH_PX_300DPI = Math.round((A3_WIDTH_MM / 25.4) * DPI_300);
export const A3_HEIGHT_PX_300DPI = Math.round((A3_HEIGHT_MM / 25.4) * DPI_300);

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
  sheetUtilizationPercentages: number[];
  wastePercentage: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
}

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Candidate {
  freeIndex: number;
  x: number;
  y: number;
  shortSideFit: number;
  longSideFit: number;
  areaWaste: number;
}

function contains(a: FreeRect, b: FreeRect): boolean {
  return (
    b.x >= a.x &&
    b.y >= a.y &&
    b.x + b.width <= a.x + a.width &&
    b.y + b.height <= a.y + a.height
  );
}

function intersects(a: FreeRect, b: FreeRect): boolean {
  return !(
    b.x >= a.x + a.width ||
    b.x + b.width <= a.x ||
    b.y >= a.y + a.height ||
    b.y + b.height <= a.y
  );
}

function pruneFreeRects(rects: FreeRect[]): FreeRect[] {
  const valid = rects.filter((r) => r.width > 0.1 && r.height > 0.1);
  return valid.filter((rect, i) =>
    !valid.some((other, j) => i !== j && contains(other, rect))
  );
}

function splitFreeRect(free: FreeRect, used: FreeRect): FreeRect[] {
  if (!intersects(free, used)) return [free];

  const result: FreeRect[] = [];

  if (used.x > free.x) {
    result.push({
      x: free.x,
      y: free.y,
      width: used.x - free.x,
      height: free.height,
    });
  }

  if (used.x + used.width < free.x + free.width) {
    result.push({
      x: used.x + used.width,
      y: free.y,
      width: free.x + free.width - (used.x + used.width),
      height: free.height,
    });
  }

  if (used.y > free.y) {
    result.push({
      x: free.x,
      y: free.y,
      width: free.width,
      height: used.y - free.y,
    });
  }

  if (used.y + used.height < free.y + free.height) {
    result.push({
      x: free.x,
      y: used.y + used.height,
      width: free.width,
      height: free.y + free.height - (used.y + used.height),
    });
  }

  return result;
}

function findBestCandidate(
  freeRects: FreeRect[],
  width: number,
  height: number
): Candidate | null {
  let best: Candidate | null = null;

  for (let i = 0; i < freeRects.length; i++) {
    const free = freeRects[i];
    if (width > free.width || height > free.height) continue;

    const leftoverW = free.width - width;
    const leftoverH = free.height - height;
    const candidate: Candidate = {
      freeIndex: i,
      x: free.x,
      y: free.y,
      shortSideFit: Math.min(leftoverW, leftoverH),
      longSideFit: Math.max(leftoverW, leftoverH),
      areaWaste: free.width * free.height - width * height,
    };

    if (
      !best ||
      candidate.shortSideFit < best.shortSideFit ||
      (candidate.shortSideFit === best.shortSideFit &&
        candidate.longSideFit < best.longSideFit) ||
      (candidate.shortSideFit === best.shortSideFit &&
        candidate.longSideFit === best.longSideFit &&
        candidate.areaWaste < best.areaWaste)
    ) {
      best = candidate;
    }
  }

  return best;
}

/**
 * Empacotamento A3 por MaxRects / Best Short Side Fit.
 *
 * Em relação ao antigo Shelf Packing, este método reaproveita vazios laterais
 * e inferiores entre adesivos de tamanhos diferentes. Isso tende a reduzir o
 * número de folhas enviadas à gráfica, principalmente quando a fila mistura
 * frente, verso, alça e fundo de pedidos diferentes.
 *
 * A arte nunca é redimensionada nem rotacionada silenciosamente.
 */
export function packDecalsOnA3(
  items: Omit<A3DecalItem, 'xMm' | 'yMm' | 'sheetIndex'>[],
  config: A3SheetConfig = {
    orientation: 'portrait',
    marginMm: 3,
    spacingMm: 3,
    showCutMarks: false,
    showLabels: false,
  }
): PackingResult {
  const sheetWidthMm = config.orientation === 'portrait' ? A3_WIDTH_MM : A3_HEIGHT_MM;
  const sheetHeightMm = config.orientation === 'portrait' ? A3_HEIGHT_MM : A3_WIDTH_MM;

  const usableWidth = Math.max(0, sheetWidthMm - config.marginMm * 2);
  const usableHeight = Math.max(0, sheetHeightMm - config.marginMm * 2);
  const usableArea = usableWidth * usableHeight;

  const sorted = [...items].sort((a, b) => {
    const areaDiff = b.widthMm * b.heightMm - a.widthMm * a.heightMm;
    if (areaDiff !== 0) return areaDiff;
    return Math.max(b.widthMm, b.heightMm) - Math.max(a.widthMm, a.heightMm);
  });

  const sheets: Array<{ freeRects: FreeRect[]; items: A3DecalItem[] }> = [];
  let unplacedCount = 0;

  const createSheet = () => {
    const sheet = {
      freeRects: [
        {
          x: config.marginMm,
          y: config.marginMm,
          width: usableWidth,
          height: usableHeight,
        },
      ],
      items: [] as A3DecalItem[],
    };
    sheets.push(sheet);
    return sheet;
  };

  if (sorted.length > 0) createSheet();

  for (const item of sorted) {
    if (
      item.widthMm <= 0 ||
      item.heightMm <= 0 ||
      item.widthMm > usableWidth ||
      item.heightMm > usableHeight
    ) {
      unplacedCount += 1;
      continue;
    }

    const packedWidth = item.widthMm + config.spacingMm;
    const packedHeight = item.heightMm + config.spacingMm;

    let selectedSheetIndex = -1;
    let selectedCandidate: Candidate | null = null;
    let selectedPackedWidth = packedWidth;
    let selectedPackedHeight = packedHeight;

    for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
      const sheet = sheets[sheetIndex];

      // Primeiro tenta reservar o espaçamento completo.
      let candidate = findBestCandidate(sheet.freeRects, packedWidth, packedHeight);
      let candidateW = packedWidth;
      let candidateH = packedHeight;

      // Perto das bordas, permite usar apenas o tamanho real da arte.
      if (!candidate) {
        candidate = findBestCandidate(sheet.freeRects, item.widthMm, item.heightMm);
        candidateW = item.widthMm;
        candidateH = item.heightMm;
      }

      if (
        candidate &&
        (!selectedCandidate ||
          candidate.shortSideFit < selectedCandidate.shortSideFit ||
          (candidate.shortSideFit === selectedCandidate.shortSideFit &&
            candidate.areaWaste < selectedCandidate.areaWaste))
      ) {
        selectedSheetIndex = sheetIndex;
        selectedCandidate = candidate;
        selectedPackedWidth = candidateW;
        selectedPackedHeight = candidateH;
      }
    }

    if (!selectedCandidate) {
      const newSheet = createSheet();
      let candidate = findBestCandidate(newSheet.freeRects, packedWidth, packedHeight);
      let candidateW = packedWidth;
      let candidateH = packedHeight;

      if (!candidate) {
        candidate = findBestCandidate(newSheet.freeRects, item.widthMm, item.heightMm);
        candidateW = item.widthMm;
        candidateH = item.heightMm;
      }

      if (!candidate) {
        unplacedCount += 1;
        continue;
      }

      selectedSheetIndex = sheets.length - 1;
      selectedCandidate = candidate;
      selectedPackedWidth = candidateW;
      selectedPackedHeight = candidateH;
    }

    const sheet = sheets[selectedSheetIndex];
    const placed: A3DecalItem = {
      ...item,
      xMm: Number(selectedCandidate.x.toFixed(2)),
      yMm: Number(selectedCandidate.y.toFixed(2)),
      sheetIndex: selectedSheetIndex,
    };
    sheet.items.push(placed);

    const reserved: FreeRect = {
      x: selectedCandidate.x,
      y: selectedCandidate.y,
      width: selectedPackedWidth,
      height: selectedPackedHeight,
    };

    sheet.freeRects = pruneFreeRects(
      sheet.freeRects.flatMap((free) => splitFreeRect(free, reserved))
    );
  }

  const placedItems = sheets.flatMap((sheet) => sheet.items);

  const sheetUtilizationPercentages = sheets.map((sheet) => {
    if (usableArea <= 0) return 0;
    const usedArea = sheet.items.reduce(
      (sum, item) => sum + item.widthMm * item.heightMm,
      0
    );
    return Math.min(100, Math.round((usedArea / usableArea) * 100));
  });

  const totalSheets = sheets.length;
  const totalUsedArea = placedItems.reduce(
    (sum, item) => sum + item.widthMm * item.heightMm,
    0
  );
  const totalAvailableArea = usableArea * Math.max(1, totalSheets);
  const utilizationPercentage =
    totalSheets > 0 && totalAvailableArea > 0
      ? Math.min(100, Math.round((totalUsedArea / totalAvailableArea) * 100))
      : 0;

  return {
    placedItems,
    unplacedCount,
    totalSheets,
    utilizationPercentage,
    sheetUtilizationPercentages,
    wastePercentage: Math.max(0, 100 - utilizationPercentage),
    sheetWidthMm,
    sheetHeightMm,
  };
}
