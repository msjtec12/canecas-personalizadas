/**
 * Gerador da Folha de Calibração DTF UV (Escala 1:1 em 300 DPI)
 * Permite ao operador aferir fisicamente com régua ou paquímetro a fidelidade
 * de impressão do equipamento e software RIP.
 */

export function generateCalibrationSheetBlob(): Promise<{ blob: Blob; fileName: string }> {
  return new Promise((resolve, reject) => {
    try {
      const DPI = 300;
      const mmToPx = (mm: number) => Math.round((mm / 25.4) * DPI);

      // Folha A4 padrão para calibração rápida (210 × 297 mm)
      const widthMm = 210;
      const heightMm = 297;
      const canvasWidth = mmToPx(widthMm); // 2480 px
      const canvasHeight = mmToPx(heightMm); // 3508 px

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Falha ao obter contexto 2D para a folha de calibração.');
      }

      // Fundo branco de papel para contraste na impressão/leitura visual
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Margem externa de corte e segurança (15 mm)
      const margin = mmToPx(15);

      // 1. Cabeçalho
      ctx.fillStyle = '#1C1917';
      ctx.font = `bold ${mmToPx(6)}px "Inter", sans-serif`;
      ctx.fillText('MONTUÁ — FOLHA DE CALIBRAÇÃO DTF UV', margin, margin + mmToPx(6));

      ctx.fillStyle = '#C25E48';
      ctx.font = `bold ${mmToPx(3.8)}px "Inter", sans-serif`;
      ctx.fillText('AVISO OBRIGATÓRIO: Imprima em escala 100%, sem "Ajustar à Página".', margin, margin + mmToPx(13));

      ctx.fillStyle = '#78716C';
      ctx.font = `${mmToPx(3)}px "Inter", sans-serif`;
      ctx.fillText(
        `Padrão: 300 DPI • 1 mm = ${(300 / 25.4).toFixed(3)} px • Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
        margin,
        margin + mmToPx(18)
      );

      // Linha divisória de cabeçalho
      ctx.strokeStyle = '#D6D3D1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(margin, margin + mmToPx(22));
      ctx.lineTo(canvasWidth - margin, margin + mmToPx(22));
      ctx.stroke();

      // 2. Linha de 100 mm (1181 px)
      const lineY = margin + mmToPx(40);
      const lineLengthPx = mmToPx(100);

      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(margin, lineY);
      ctx.lineTo(margin + lineLengthPx, lineY);
      ctx.stroke();

      // Ticks verticais nos extremos da linha
      const tickH = mmToPx(5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(margin, lineY - tickH / 2);
      ctx.lineTo(margin, lineY + tickH / 2);
      ctx.moveTo(margin + lineLengthPx, lineY - tickH / 2);
      ctx.lineTo(margin + lineLengthPx, lineY + tickH / 2);
      ctx.stroke();

      // Marcações a cada 10 mm na linha
      for (let i = 1; i < 10; i++) {
        const subTickX = margin + mmToPx(i * 10);
        ctx.beginPath();
        ctx.moveTo(subTickX, lineY - tickH / 4);
        ctx.lineTo(subTickX, lineY + tickH / 4);
        ctx.stroke();
      }

      ctx.fillStyle = '#1C1917';
      ctx.font = `bold ${mmToPx(3.2)}px "Inter", sans-serif`;
      ctx.fillText(`LINHA DE CALIBRAÇÃO: EXATAMENTE 100 mm (${lineLengthPx} px)`, margin, lineY - mmToPx(5));
      ctx.font = `${mmToPx(2.6)}px "Inter", sans-serif`;
      ctx.fillStyle = '#57534E';
      ctx.fillText('Meça de ponta a ponta com régua ou paquímetro. Deve medir exatamente 10,0 cm.', margin, lineY + mmToPx(7));

      // 3. Quadrados de Calibração: 10×10 mm, 25×25 mm, 50×50 mm
      const startBoxesY = lineY + mmToPx(25);

      // Caixa 10 × 10 mm
      const b10Size = mmToPx(10);
      const b10X = margin;
      const b10Y = startBoxesY;

      ctx.fillStyle = '#1C1917';
      ctx.fillRect(b10X, b10Y, b10Size, b10Size);
      ctx.font = `bold ${mmToPx(3)}px "Inter", sans-serif`;
      ctx.fillText(`Quadrado 10 × 10 mm`, b10X + b10Size + mmToPx(4), b10Y + mmToPx(4));
      ctx.font = `${mmToPx(2.4)}px "Inter", sans-serif`;
      ctx.fillStyle = '#78716C';
      ctx.fillText(`${b10Size} × ${b10Size} px`, b10X + b10Size + mmToPx(4), b10Y + mmToPx(8));

      // Caixa 25 × 25 mm
      const b25Size = mmToPx(25);
      const b25X = margin;
      const b25Y = b10Y + b10Size + mmToPx(15);

      ctx.fillStyle = '#C25E48';
      ctx.fillRect(b25X, b25Y, b25Size, b25Size);
      ctx.fillStyle = '#1C1917';
      ctx.font = `bold ${mmToPx(3)}px "Inter", sans-serif`;
      ctx.fillText(`Quadrado 25 × 25 mm`, b25X + b25Size + mmToPx(4), b25Y + mmToPx(10));
      ctx.font = `${mmToPx(2.4)}px "Inter", sans-serif`;
      ctx.fillStyle = '#78716C';
      ctx.fillText(`${b25Size} × ${b25Size} px`, b25X + b25Size + mmToPx(4), b25Y + mmToPx(16));

      // Caixa 50 × 50 mm
      const b50Size = mmToPx(50);
      const b50X = margin;
      const b50Y = b25Y + b25Size + mmToPx(15);

      ctx.fillStyle = '#292524';
      ctx.fillRect(b50X, b50Y, b50Size, b50Size);
      ctx.fillStyle = '#1C1917';
      ctx.font = `bold ${mmToPx(3.2)}px "Inter", sans-serif`;
      ctx.fillText(`Quadrado 50 × 50 mm`, b50X + b50Size + mmToPx(5), b50Y + mmToPx(20));
      ctx.font = `${mmToPx(2.6)}px "Inter", sans-serif`;
      ctx.fillStyle = '#78716C';
      ctx.fillText(`${b50Size} × ${b50Size} px (tolerância recomendada: ±0.3 mm)`, b50X + b50Size + mmToPx(5), b50Y + mmToPx(27));

      // 4. Rodapé e Instruções de Uso
      const footerY = canvasHeight - margin - mmToPx(25);
      ctx.strokeStyle = '#D6D3D1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin, footerY);
      ctx.lineTo(canvasWidth - margin, footerY);
      ctx.stroke();

      ctx.fillStyle = '#44403C';
      ctx.font = `bold ${mmToPx(2.8)}px "Inter", sans-serif`;
      ctx.fillText('INSTRUÇÕES DO OPERADOR:', margin, footerY + mmToPx(6));
      ctx.font = `${mmToPx(2.5)}px "Inter", sans-serif`;
      ctx.fillText(
        '1. Envie este arquivo diretamente ao software RIP DTF UV com resolução de 300 DPI.',
        margin,
        footerY + mmToPx(11)
      );
      ctx.fillText(
        '2. Certifique-se de que a escala de saída esteja em exatamente 100% (1:1). Não use proporções de ajuste.',
        margin,
        footerY + mmToPx(16)
      );
      ctx.fillText(
        '3. Após a cura do adesivo, meça o quadrado de 50mm e a linha de 100mm. Se houver desvio, calibre o avanço de passos da impressora.',
        margin,
        footerY + mmToPx(21)
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Erro ao converter canvas da calibração em Blob.'));
          return;
        }
        resolve({
          blob,
          fileName: `Folha-Calibracao-DTF-UV-300DPI-${Date.now()}.png`,
        });
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}
