'use client';

import React, { useState, useEffect } from 'react';
import { Type, Check, RotateCw } from 'lucide-react';
import { TextElement, TextFontFamily, SurfaceDefinition } from '@/types/configurator';

interface TextToolsProps {
  surface: SurfaceDefinition;
  onAddText: (textElement: TextElement) => void;
  onClose?: () => void;
}

const FONTS: { id: TextFontFamily; label: string; fontClass?: string }[] = [
  { id: 'Inter', label: 'Moderna (Inter)' },
  { id: 'Playfair Display', label: 'Elegante (Playfair)' },
  { id: 'Dancing Script', label: 'Cursiva (Dancing Script)' },
  { id: 'Montserrat', label: 'Limpa (Montserrat)' },
  { id: 'Pacifico', label: 'Descontraída (Pacifico)' },
  { id: 'Oswald', label: 'Impacto (Oswald)' },
  { id: 'Caveat', label: 'Manuscrita (Caveat)' },
];

const PRESET_COLORS = [
  { name: 'Preto Intenso', hex: '#1C1917' },
  { name: 'Branco Puro', hex: '#FFFFFF' },
  { name: 'Dourado Metálico', hex: '#D97706' },
  { name: 'Terracota / Rose', hex: '#C25E48' },
  { name: 'Azul Real', hex: '#1D4ED8' },
  { name: 'Verde Esmeralda', hex: '#059669' },
  { name: 'Vinho Bordô', hex: '#881337' },
  { name: 'Prata Nobre', hex: '#64748B' },
];

export const TextTools: React.FC<TextToolsProps> = ({ surface, onAddText, onClose }) => {
  const isHandle = surface.id === 'handle';
  const [text, setText] = useState(isHandle ? 'Seu Nome' : 'Seu Texto Aqui');
  const [fontFamily, setFontFamily] = useState<TextFontFamily>('Playfair Display');
  const [fontSize, setFontSize] = useState<number>(isHandle ? 16 : 22);
  const [fill, setFill] = useState<string>('#1C1917');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isVertical, setIsVertical] = useState<boolean>(false);

  // Update default font size when surface changes
  useEffect(() => {
    if (surface.id === 'handle') {
      setFontSize(16);
    } else {
      setFontSize(22);
    }
  }, [surface.id]);

  const handleAdd = () => {
    if (!text.trim()) return;

    const pArea = surface.printableArea;

    // Calculate initial font size that fits nicely
    let effectiveFontSize = fontSize;
    const charCount = text.trim().length;
    const estimatedWidth = charCount * (effectiveFontSize * 0.6);

    // If text is wider than the surface area, automatically adjust font size
    if (!isVertical && estimatedWidth > pArea.width * 0.95) {
      effectiveFontSize = Math.max(11, Math.floor((pArea.width * 0.9) / (charCount * 0.6)));
    }

    const targetWidth = Math.min(pArea.width * 0.9, 200);
    const initialX = Math.round(pArea.x + (pArea.width - targetWidth) / 2);
    const initialY = Math.round(pArea.y + pArea.height * (isHandle ? 0.4 : 0.35));

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      surfaceId: surface.id,
      type: 'text',
      text: text.trim(),
      x: initialX,
      y: initialY,
      width: targetWidth,
      height: 35,
      rotation: isVertical ? 90 : 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: Date.now(),
      opacity: 1,
      fontSize: effectiveFontSize,
      fontFamily,
      fill,
      fontWeight,
      fontStyle,
      align,
    };

    onAddText(newElement);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
        <div className="w-8 h-8 rounded-lg bg-[#C25E48]/10 flex items-center justify-center text-[#C25E48]">
          <Type className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-stone-800 text-sm">Adicionar Texto</h4>
          <p className="text-xs text-stone-400">Insira nomes, dedicatórias e frases</p>
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Conteúdo</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Matheus, Gratidão, Te Amo..."
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20 focus:border-[#C25E48]"
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Estilo da Fonte</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value as TextFontFamily)}
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20 focus:border-[#C25E48] bg-white"
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size & Orientation */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Tamanho: {fontSize}px
          </label>
          <input
            type="range"
            min={10}
            max={48}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[#C25E48] cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Formatação</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                fontWeight === 'bold'
                  ? 'bg-[#C25E48]/10 border-[#C25E48]/30 text-[#C25E48]'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`flex-1 py-1.5 rounded-lg text-xs italic border transition-colors ${
                fontStyle === 'italic'
                  ? 'bg-[#C25E48]/10 border-[#C25E48]/30 text-[#C25E48]'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              I
            </button>
            {isHandle && (
              <button
                type="button"
                onClick={() => setIsVertical(!isVertical)}
                className={`py-1.5 px-2 rounded-lg text-xs border transition-colors flex items-center gap-1 ${
                  isVertical
                    ? 'bg-[#C25E48]/10 border-[#C25E48]/30 text-[#C25E48] font-bold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
                title="Girar texto na vertical para alça"
              >
                <RotateCw className="w-3 h-3" />
                <span>90°</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Cor da Letra (DTF UV)</label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setFill(c.hex)}
              className={`h-7 rounded-lg flex items-center justify-center border transition-all ${
                fill === c.hex ? 'ring-2 ring-[#C25E48] ring-offset-1 scale-105' : 'hover:opacity-90'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            >
              {fill === c.hex && (
                <Check
                  className={`w-3.5 h-3.5 ${
                    c.hex === '#FFFFFF' ? 'text-stone-800' : 'text-white'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!text.trim()}
        className="w-full py-2.5 px-4 bg-[#C25E48] hover:bg-[#A94A36] text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
      >
        Inserir Texto na {surface.name}
      </button>
    </div>
  );
};
