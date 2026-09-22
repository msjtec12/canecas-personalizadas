'use client';

import React from 'react';
import {
  Trash2,
  Copy,
  Layers,
  Sliders,
  MoveUp,
  MoveDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
} from 'lucide-react';
import {
  CanvasElement,
  SurfaceDefinition,
  TextElement,
  TextFontFamily,
} from '@/types/configurator';

interface PropertiesPanelProps {
  surface: SurfaceDefinition;
  selectedElement: CanvasElement | null;
  elements: CanvasElement[];
  onUpdateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  onRemoveElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down') => void;
  onSelectElement: (id: string | null) => void;
}

const FONTS: { id: TextFontFamily; label: string }[] = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Playfair Display', label: 'Playfair' },
  { id: 'Dancing Script', label: 'Dancing Script' },
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Pacifico', label: 'Pacifico' },
  { id: 'Oswald', label: 'Oswald' },
  { id: 'Caveat', label: 'Caveat' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  surface,
  selectedElement,
  elements,
  onUpdateElement,
  onRemoveElement,
  onDuplicateElement,
  onReorderLayer,
  onSelectElement,
}) => {
  const isText = selectedElement?.type === 'text';
  const textEl = isText ? (selectedElement as TextElement) : null;
  const pArea = surface.printableArea;

  // Nudge position adjustments
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      x: Math.round(selectedElement.x + dx),
      y: Math.round(selectedElement.y + dy),
    });
  };

  // Center horizontally
  const handleCenterHorizontal = () => {
    if (!selectedElement) return;
    const currentW = (selectedElement.width || 100) * (selectedElement.scaleX || 1);
    onUpdateElement(selectedElement.id, {
      x: Math.round(pArea.x + (pArea.width - currentW) / 2),
    });
  };

  // Center vertically
  const handleCenterVertical = () => {
    if (!selectedElement) return;
    const currentH = (selectedElement.height || 40) * (selectedElement.scaleY || 1);
    onUpdateElement(selectedElement.id, {
      y: Math.round(pArea.y + (pArea.height - currentH) / 2),
    });
  };

  // Rotate by 90 degrees
  const handleRotate90 = () => {
    if (!selectedElement) return;
    const nextRotation = ((selectedElement.rotation || 0) + 90) % 360;
    onUpdateElement(selectedElement.id, {
      rotation: nextRotation,
    });
  };

  // Auto-fit to printable width (especially useful for long names on handle)
  const handleFitToArea = () => {
    if (!selectedElement) return;
    if (isText && textEl) {
      // Calculate smaller font size to fit inside printable width
      const charCount = Math.max(1, textEl.text.length);
      const estimatedCharWidthRatio = 0.6;
      const targetFontSize = Math.max(12, Math.floor(pArea.width / (charCount * estimatedCharWidthRatio)));

      onUpdateElement(textEl.id, {
        fontSize: Math.min(targetFontSize, textEl.fontSize),
        x: pArea.x + 5,
      });
    } else {
      // For images / cliparts, reset scale to fit
      const maxAllowedW = pArea.width * 0.9;
      onUpdateElement(selectedElement.id, {
        width: Math.min(selectedElement.width, maxAllowedW),
        x: pArea.x + (pArea.width - Math.min(selectedElement.width, maxAllowedW)) / 2,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. ELEMENT PROPERTIES */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-stone-500" />
            <h4 className="font-semibold text-stone-800 text-xs uppercase tracking-wider">
              {selectedElement ? 'Ajustes do Elemento' : 'Nenhum Elemento Selecionado'}
            </h4>
          </div>
        </div>

        {selectedElement ? (
          <div className="space-y-3.5">
            {/* If Text: Live Text Content */}
            {isText && textEl && (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Conteúdo do Texto
                  </label>
                  <input
                    type="text"
                    value={textEl.text}
                    onChange={(e) =>
                      onUpdateElement(textEl.id, { text: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20 focus:border-[#C25E48]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Fonte
                    </label>
                    <select
                      value={textEl.fontFamily}
                      onChange={(e) =>
                        onUpdateElement(textEl.id, {
                          fontFamily: e.target.value as TextFontFamily,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs border border-stone-200 rounded-xl bg-white"
                    >
                      {FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-medium text-stone-600">
                        Tamanho: {textEl.fontSize}px
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateElement(textEl.id, {
                              fontSize: Math.max(10, textEl.fontSize - 2),
                            })
                          }
                          className="p-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
                          title="Diminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateElement(textEl.id, {
                              fontSize: Math.min(60, textEl.fontSize + 2),
                            })
                          }
                          className="p-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
                          title="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={textEl.fontSize}
                      onChange={(e) =>
                        onUpdateElement(textEl.id, {
                          fontSize: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#C25E48] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Alignment & Color */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateElement(textEl.id, { align: 'left' })}
                      className={`p-1.5 rounded ${
                        textEl.align === 'left' ? 'bg-stone-200 text-stone-800' : 'text-stone-500'
                      }`}
                      title="Alinhar à Esquerda"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement(textEl.id, { align: 'center' })}
                      className={`p-1.5 rounded ${
                        textEl.align === 'center' ? 'bg-stone-200 text-stone-800' : 'text-stone-500'
                      }`}
                      title="Centralizar"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement(textEl.id, { align: 'right' })}
                      className={`p-1.5 rounded ${
                        textEl.align === 'right' ? 'bg-stone-200 text-stone-800' : 'text-stone-500'
                      }`}
                      title="Alinhar à Direita"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-stone-500">Cor:</label>
                    <input
                      type="color"
                      value={textEl.fill}
                      onChange={(e) =>
                        onUpdateElement(textEl.id, { fill: e.target.value })
                      }
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                    />
                  </div>
                </div>
              </>
            )}

            {/* CONTROLES DE POSIÇÃO (NUDGE / SETAS) */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 text-center">
                Mover & Ajustar Posição
              </label>

              <div className="flex items-center justify-center gap-2">
                <div className="grid grid-cols-3 gap-1 w-28">
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudge(0, -10)}
                    className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shadow-xs active:scale-95"
                    title="Mover 10px para Cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={() => handleNudge(-10, 0)}
                    className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shadow-xs active:scale-95"
                    title="Mover 10px para Esquerda"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCenterHorizontal}
                    className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 text-[10px] font-bold shadow-xs active:scale-95"
                    title="Centralizar Horizontalmente"
                  >
                    Centro
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudge(10, 0)}
                    className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shadow-xs active:scale-95"
                    title="Mover 10px para Direita"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudge(0, 10)}
                    className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shadow-xs active:scale-95"
                    title="Mover 10px para Baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div />
                </div>

                <div className="flex-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={handleRotate90}
                    className="w-full py-1.5 px-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 shadow-xs"
                    title="Girar 90 graus (ideal para alça na vertical)"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#C25E48]" />
                    <span>Girar 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFitToArea}
                    className="w-full py-1.5 px-2 bg-[#C25E48]/10 hover:bg-[#C25E48]/20 border border-[#C25E48]/20 rounded-lg text-[11px] font-bold text-[#C25E48] flex items-center justify-center gap-1 shadow-xs"
                    title="Reduzir tamanho para caber com segurança"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Encaixar na Área</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions (Duplicar, Excluir) */}
            <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDuplicateElement(selectedElement.id)}
                className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar</span>
              </button>

              <button
                type="button"
                onClick={() => onRemoveElement(selectedElement.id)}
                className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-400 text-center py-4">
            Clique em um elemento no produto para ajustar posição, girar ou editar.
          </p>
        )}
      </div>

      {/* 2. LAYERS PANEL (CAMADAS) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-500" />
            <h4 className="font-semibold text-stone-800 text-xs uppercase tracking-wider">
              Camadas ({elements.length})
            </h4>
          </div>
          <span className="text-[10px] text-stone-400">{surface.name}</span>
        </div>

        {elements.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-3">
            Nenhuma camada nesta superfície.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {elements
              .slice()
              .reverse()
              .map((el, index) => {
                const isSelected = el.id === selectedElement?.id;
                let label = 'Elemento';
                if (el.type === 'text') label = `"${(el as TextElement).text}"`;
                if (el.type === 'image') label = 'Foto / Imagem';
                if (el.type === 'clipart') label = `Arte: ${el.title || 'Vetor'}`;

                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                      isSelected
                        ? 'bg-[#C25E48]/10 border-[#C25E48]/30 text-[#C25E48] font-bold'
                        : 'bg-stone-50 hover:bg-stone-100 border-transparent text-stone-700'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{label}</span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderLayer(el.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                        title="Subir"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderLayer(el.id, 'down');
                        }}
                        disabled={index === elements.length - 1}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                        title="Descer"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveElement(el.id);
                        }}
                        className="p-1 text-rose-400 hover:text-rose-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
