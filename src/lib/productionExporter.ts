'use client';

import { SurfaceDefinition, CanvasElement, TextElement, ImageElement, ClipartElement } from '@/types/configurator';

/**
 * Carrega uma imagem de forma assíncrona para desenho no canvas
 */
function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renderiza e exporta a arte da superfície em alta resolução (300 DPI equivalente),
 * com fundo transparente e dimensões físicas exatas para software RIP de impressão DTF UV.
 */
export async function exportSurfaceProductionAsset(
  surface: SurfaceDefinition,
  elements: CanvasElement[],
  orderNumber: string = 'PRODUCAO'
): Promise<{ blob: Blob; dataUrl: string; widthPx: number; heightPx: number; fileName: string }> {
  // Conversão de mm para pixels em 300 DPI: (mm / 25.4) * 300
  const DPI = 300;
  const mmToPrintPx = (mm: number) => Math.round((mm / 25.4) * DPI);

  // Dimensões físicas da área útil de impressão em mm
  const pArea = surface.printableArea;
  const printWidthMm = (pArea.width / surface.canvasWidth) * surface.realWidthMm;
  const printHeightMm = (pArea.height / surface.canvasHeight) * surface.realHeightMm;

  const targetWidthPx = mmToPrintPx(printWidthMm);
  const targetHeightPx = mmToPrintPx(printHeightMm);

  // Fator de escala do canvas digital de tela para o canvas de produção 300 DPI
  const scale = targetWidthPx / pArea.width;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidthPx;
  canvas.height = targetHeightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível inicializar contexto 2D para exportação gráfica.');
  }

  // Fundo transparente (essencial para impressão DTF UV)
  ctx.clearRect(0, 0, targetWidthPx, targetHeightPx);

  // Ordena por zIndex para respeitar as camadas do cliente
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sortedElements) {
    // Coordenada relativa à área imprimível
    const relX = (el.x - pArea.x) * scale;
    const relY = (el.y - pArea.y) * scale;
    const elWidth = el.width * (el.scaleX || 1) * scale;
    const elHeight = el.height * (el.scaleY || 1) * scale;

    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    // Ponto de rotação no centro do elemento
    const centerX = relX + elWidth / 2;
    const centerY = relY + elHeight / 2;
    ctx.translate(centerX, centerY);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }
    ctx.translate(-elWidth / 2, -elHeight / 2);

    if (el.type === 'text') {
      const textEl = el as TextElement;
      const fontSizePx = Math.round(textEl.fontSize * scale);
      ctx.font = `${textEl.fontStyle || 'normal'} ${textEl.fontWeight || 'normal'} ${fontSizePx}px "${textEl.fontFamily || 'Inter'}", sans-serif`;
      ctx.fillStyle = textEl.fill || '#1E293B';
      ctx.textBaseline = 'top';

      if (textEl.align === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(textEl.text, elWidth / 2, 0);
      } else if (textEl.align === 'right') {
        ctx.textAlign = 'right';
        ctx.fillText(textEl.text, elWidth, 0);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(textEl.text, 0, 0);
      }
    } else if (el.type === 'image' || el.type === 'clipart') {
      const mediaEl = el as ImageElement | ClipartElement;
      try {
        const loadedImg = await loadImageAsync(mediaEl.src);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(loadedImg, 0, 0, elWidth, elHeight);
      } catch (err) {
        console.warn(`Falha ao renderizar elemento visual ${el.id} na exportação de produção:`, err);
      }
    }

    ctx.restore();
  }

  const fileName = `${orderNumber}_${surface.id}_DTF_UV_${Math.round(printWidthMm)}x${Math.round(printHeightMm)}mm.png`;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Erro ao gerar blob PNG de alta resolução.'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({
        blob,
        dataUrl,
        widthPx: targetWidthPx,
        heightPx: targetHeightPx,
        fileName,
      });
    }, 'image/png');
  });
}

/**
 * Dispara o download automático do arquivo de produção no navegador
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Renderiza e exporta uma Folha A3 Completa (3508 x 4961 px a 300 DPI) com múltiplos adesivos DTF UV,
 * fundo 100% transparente, marcas de corte e identificação dos pedidos.
 */
export async function exportA3GangSheet(
  items: Array<{
    id: string;
    orderNumber: string;
    surfaceName: string;
    elements: CanvasElement[];
    surfaceDef: SurfaceDefinition;
    xMm: number;
    yMm: number;
    widthMm: number;
    heightMm: number;
  }>,
  config: {
    orientation: 'portrait' | 'landscape';
    showCutMarks: boolean;
    showLabels: boolean;
  },
  sheetNumber: number = 1
): Promise<{ blob: Blob; dataUrl: string; widthPx: number; heightPx: number; fileName: string }> {
  const DPI = 300;
  const sheetWidthMm = config.orientation === 'portrait' ? 297 : 420;
  const sheetHeightMm = config.orientation === 'portrait' ? 420 : 297;

  const targetWidthPx = Math.round((sheetWidthMm / 25.4) * DPI);
  const targetHeightPx = Math.round((sheetHeightMm / 25.4) * DPI);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidthPx;
  canvas.height = targetHeightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível inicializar contexto 2D para a folha A3.');
  }

  // Fundo 100% transparente para filme DTF UV
  ctx.clearRect(0, 0, targetWidthPx, targetHeightPx);

  for (const item of items) {
    const itemOriginX = Math.round((item.xMm / 25.4) * DPI);
    const itemOriginY = Math.round((item.yMm / 25.4) * DPI);
    const itemWidthPx = Math.round((item.widthMm / 25.4) * DPI);
    const itemHeightPx = Math.round((item.heightMm / 25.4) * DPI);

    const pArea = item.surfaceDef.printableArea;
    const scale = itemWidthPx / pArea.width;

    const sortedElements = [...item.elements].sort((a, b) => a.zIndex - b.zIndex);

    // Desenha cada elemento dentro das coordenadas do adesivo na folha A3
    for (const el of sortedElements) {
      const relX = itemOriginX + (el.x - pArea.x) * scale;
      const relY = itemOriginY + (el.y - pArea.y) * scale;
      const elWidth = el.width * (el.scaleX || 1) * scale;
      const elHeight = el.height * (el.scaleY || 1) * scale;

      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      const centerX = relX + elWidth / 2;
      const centerY = relY + elHeight / 2;
      ctx.translate(centerX, centerY);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      ctx.translate(-elWidth / 2, -elHeight / 2);

      if (el.type === 'text') {
        const textEl = el as TextElement;
        const fontSizePx = Math.round(textEl.fontSize * scale);
        ctx.font = `${textEl.fontStyle || 'normal'} ${textEl.fontWeight || 'normal'} ${fontSizePx}px "${textEl.fontFamily || 'Inter'}", sans-serif`;
        ctx.fillStyle = textEl.fill || '#1E293B';
        ctx.textBaseline = 'top';

        if (textEl.align === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(textEl.text, elWidth / 2, 0);
        } else if (textEl.align === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(textEl.text, elWidth, 0);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(textEl.text, 0, 0);
        }
      } else if (el.type === 'image' || el.type === 'clipart') {
        const mediaEl = el as ImageElement | ClipartElement;
        try {
          const loadedImg = await loadImageAsync(mediaEl.src);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(loadedImg, 0, 0, elWidth, elHeight);
        } catch (err) {
          console.warn(`Erro ao carregar imagem para folha A3:`, err);
        }
      }

      ctx.restore();
    }

    // Marcas de corte sutis (Cruzetas de 12px)
    if (config.showCutMarks) {
      ctx.save();
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
      ctx.lineWidth = 1.5;
      const arm = 14;

      // Canto Superior Esquerdo
      ctx.beginPath();
      ctx.moveTo(itemOriginX - 4, itemOriginY);
      ctx.lineTo(itemOriginX - 4 - arm, itemOriginY);
      ctx.moveTo(itemOriginX, itemOriginY - 4);
      ctx.lineTo(itemOriginX, itemOriginY - 4 - arm);
      ctx.stroke();

      // Canto Superior Direito
      ctx.beginPath();
      ctx.moveTo(itemOriginX + itemWidthPx + 4, itemOriginY);
      ctx.lineTo(itemOriginX + itemWidthPx + 4 + arm, itemOriginY);
      ctx.moveTo(itemOriginX + itemWidthPx, itemOriginY - 4);
      ctx.lineTo(itemOriginX + itemWidthPx, itemOriginY - 4 - arm);
      ctx.stroke();

      // Canto Inferior Esquerdo
      ctx.beginPath();
      ctx.moveTo(itemOriginX - 4, itemOriginY + itemHeightPx);
      ctx.lineTo(itemOriginX - 4 - arm, itemOriginY + itemHeightPx);
      ctx.moveTo(itemOriginX, itemOriginY + itemHeightPx + 4);
      ctx.lineTo(itemOriginX, itemOriginY + itemHeightPx + 4 + arm);
      ctx.stroke();

      // Canto Inferior Direito
      ctx.beginPath();
      ctx.moveTo(itemOriginX + itemWidthPx + 4, itemOriginY + itemHeightPx);
      ctx.lineTo(itemOriginX + itemWidthPx + 4 + arm, itemOriginY + itemHeightPx);
      ctx.moveTo(itemOriginX + itemWidthPx, itemOriginY + itemHeightPx + 4);
      ctx.lineTo(itemOriginX + itemWidthPx, itemOriginY + itemHeightPx + 4 + arm);
      ctx.stroke();

      ctx.restore();
    }

    // Identificação discreta do pedido na folha
    if (config.showLabels) {
      ctx.save();
      ctx.fillStyle = '#78716C';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `${item.orderNumber} • ${item.surfaceName} (${Math.round(item.widthMm)}x${Math.round(item.heightMm)}mm)`,
        itemOriginX,
        itemOriginY + itemHeightPx + 6
      );
      ctx.restore();
    }
  }

  const fileName = `Folha_A3_DTF_UV_Folha${sheetNumber}_${targetWidthPx}x${targetHeightPx}px.png`;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao gerar blob PNG da folha A3.'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({
        blob,
        dataUrl,
        widthPx: targetWidthPx,
        heightPx: targetHeightPx,
        fileName,
      });
    }, 'image/png');
  });
}

