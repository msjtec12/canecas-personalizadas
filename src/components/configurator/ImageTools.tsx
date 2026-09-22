'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageElement, SurfaceDefinition } from '@/types/configurator';

interface ImageToolsProps {
  surface: SurfaceDefinition;
  onAddImage: (imageElement: ImageElement) => void;
  onClose?: () => void;
}

export const ImageTools: React.FC<ImageToolsProps> = ({ surface, onAddImage, onClose }) => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Formato inválido. Por favor envie imagens em PNG, JPG, JPEG ou WEBP.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Arquivo muito grande. O tamanho máximo permitido é 10MB.');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setPreviewSrc(result);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setErrorMsg('Erro ao ler a imagem. Tente outro arquivo.');
        setIsProcessing(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAdd = () => {
    if (!previewSrc || !naturalSize) return;

    const pArea = surface.printableArea;
    const aspect = naturalSize.width / naturalSize.height;

    // Scale initial element to comfortably fit inside the printable area
    let targetWidth = Math.min(150, pArea.width * 0.7);
    let targetHeight = targetWidth / aspect;

    if (targetHeight > pArea.height * 0.7) {
      targetHeight = pArea.height * 0.7;
      targetWidth = targetHeight * aspect;
    }

    // Center in printable area
    const initialX = pArea.x + (pArea.width - targetWidth) / 2;
    const initialY = pArea.y + (pArea.height - targetHeight) / 2;

    const newElement: ImageElement = {
      id: `img-${Date.now()}`,
      surfaceId: surface.id,
      type: 'image',
      src: previewSrc,
      alt: fileName,
      x: initialX,
      y: initialY,
      width: targetWidth,
      height: targetHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: Date.now(),
      opacity: 1,
      originalWidth: naturalSize.width,
      originalHeight: naturalSize.height,
      aspectRatio: aspect,
    };

    onAddImage(newElement);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">Upload de Imagem</h4>
          <p className="text-xs text-slate-400">Adicione fotos, logos e artes pessoais</p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100/60 flex items-center justify-center text-blue-600">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-700">Clique para enviar ou arraste aqui</p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG ou WEBP (até 10MB)</p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {isProcessing && (
        <div className="text-center py-2 text-xs text-slate-500 animate-pulse">
          Processando imagem...
        </div>
      )}

      {/* Preview Section */}
      {previewSrc && !isProcessing && (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="text-xs text-slate-500 flex justify-between">
            <span className="truncate max-w-[180px]">{fileName}</span>
            <span>
              {naturalSize?.width}x{naturalSize?.height}px
            </span>
          </div>

          {/* Análise de Resolução e Qualidade de Impressão DTF UV */}
          {naturalSize && (() => {
            const pArea = surface.printableArea;
            const aspect = naturalSize.width / naturalSize.height;
            let targetWidth = Math.min(150, pArea.width * 0.7);
            let targetHeight = targetWidth / aspect;
            if (targetHeight > pArea.height * 0.7) {
              targetHeight = pArea.height * 0.7;
              targetWidth = targetHeight * aspect;
            }
            const physicalWidthMm = (targetWidth / surface.canvasWidth) * surface.realWidthMm;
            const dpi = Math.round(naturalSize.width / (physicalWidthMm / 25.4));
            const isExcellent = dpi >= 250;
            const isGood = dpi >= 150 && dpi < 250;
            const isLow = dpi < 150;

            return (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Qualidade da imagem:</span>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isExcellent && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Excelente ({dpi} PPI)
                      </span>
                    )}
                    {isGood && (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Boa ({dpi} PPI)
                      </span>
                    )}
                    {isLow && (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Baixa ({dpi} PPI)
                      </span>
                    )}
                  </div>
                </div>

                {isLow && (
                  <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      A imagem pode perder nitidez ou granular quando impressa neste tamanho.
                      Para melhor resultado, use fotos com boa iluminação e resolução original.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            Inserir Imagem na {surface.name}
          </button>
        </div>
      )}
    </div>
  );
};
