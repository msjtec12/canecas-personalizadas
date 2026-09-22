'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Type, Check, RotateCw, Search, MessageSquareText, PenLine } from 'lucide-react';
import { TextElement, TextFontFamily, SurfaceDefinition } from '@/types/configurator';
import { PHRASE_CATEGORIES, PHRASES_LIBRARY } from '@/data/phrases';

interface TextToolsProps {
  surface: SurfaceDefinition;
  onAddText: (textElement: TextElement) => void;
  onClose?: () => void;
}

const FONTS: { id: TextFontFamily; label: string; description: string }[] = [
  { id: 'Inter', label: 'Inter', description: 'Moderna' },
  { id: 'Montserrat', label: 'Montserrat', description: 'Limpa' },
  { id: 'Playfair Display', label: 'Playfair', description: 'Elegante' },
  { id: 'Dancing Script', label: 'Dancing', description: 'Cursiva' },
  { id: 'Great Vibes', label: 'Great Vibes', description: 'Romântica' },
  { id: 'Pacifico', label: 'Pacifico', description: 'Divertida' },
  { id: 'Caveat', label: 'Caveat', description: 'Manuscrita' },
  { id: 'Lobster', label: 'Lobster', description: 'Retrô' },
  { id: 'Bebas Neue', label: 'Bebas', description: 'Impacto' },
  { id: 'Oswald', label: 'Oswald', description: 'Condensada' },
  { id: 'Cinzel', label: 'Cinzel', description: 'Clássica' },
];

const PRESET_COLORS = [
  { name: 'Preto Intenso', hex: '#1C1917' },
  { name: 'Branco Puro', hex: '#FFFFFF' },
  { name: 'Dourado', hex: '#D97706' },
  { name: 'Terracota', hex: '#C25E48' },
  { name: 'Azul Real', hex: '#1D4ED8' },
  { name: 'Verde Esmeralda', hex: '#059669' },
  { name: 'Vinho Bordô', hex: '#881337' },
  { name: 'Prata', hex: '#64748B' },
];

export const TextTools: React.FC<TextToolsProps> = ({ surface, onAddText, onClose }) => {
  const isHandle = surface.id === 'handle';
  const [mode, setMode] = useState<'write' | 'phrases'>('write');
  const [text, setText] = useState(isHandle ? 'Seu Nome' : 'Seu Texto Aqui');
  const [fontFamily, setFontFamily] = useState<TextFontFamily>('Playfair Display');
  const [fontSize, setFontSize] = useState<number>(isHandle ? 16 : 22);
  const [fill, setFill] = useState<string>('#1C1917');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [phraseCategory, setPhraseCategory] = useState<string>('Todos');
  const [phraseSearch, setPhraseSearch] = useState<string>('');

  useEffect(() => {
    setFontSize(surface.id === 'handle' ? 16 : 22);
  }, [surface.id]);

  const filteredPhrases = useMemo(() => {
    const query = phraseSearch.trim().toLocaleLowerCase('pt-BR');
    return PHRASES_LIBRARY.filter((phrase) => {
      const categoryMatch = phraseCategory === 'Todos' || phrase.category === phraseCategory;
      const searchMatch =
        !query ||
        phrase.text.toLocaleLowerCase('pt-BR').includes(query) ||
        phrase.category.toLocaleLowerCase('pt-BR').includes(query) ||
        phrase.tags?.some((tag) => tag.toLocaleLowerCase('pt-BR').includes(query));
      return categoryMatch && searchMatch;
    });
  }, [phraseCategory, phraseSearch]);

  const applyPhrase = (phrase: (typeof PHRASES_LIBRARY)[number]) => {
    setText(phrase.text);
    if (phrase.suggestedFont && FONTS.some((font) => font.id === phrase.suggestedFont)) {
      setFontFamily(phrase.suggestedFont as TextFontFamily);
    }
    setMode('write');
  };

  const handleAdd = () => {
    if (!text.trim()) return;

    const pArea = surface.printableArea;
    let effectiveFontSize = fontSize;
    const charCount = text.trim().length;
    const estimatedWidth = charCount * (effectiveFontSize * 0.6);

    if (!isVertical && estimatedWidth > pArea.width * 0.95) {
      effectiveFontSize = Math.max(11, Math.floor((pArea.width * 0.9) / (charCount * 0.6)));
    }

    const targetWidth = Math.min(pArea.width * 0.9, 200);
    const estimatedLines = Math.max(1, Math.ceil(estimatedWidth / Math.max(1, targetWidth)));
    const targetHeight = Math.max(35, estimatedLines * effectiveFontSize * 1.35);
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
      height: targetHeight,
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
          <h4 className="font-semibold text-stone-800 text-sm">Texto & Frases</h4>
          <p className="text-xs text-stone-400">Escreva ou escolha uma frase pronta</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => setMode('write')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
            mode === 'write' ? 'bg-white text-[#C25E48] shadow-sm' : 'text-stone-500'
          }`}
        >
          <PenLine className="w-3.5 h-3.5" />
          Escrever
        </button>
        <button
          type="button"
          onClick={() => setMode('phrases')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
            mode === 'phrases' ? 'bg-white text-[#C25E48] shadow-sm' : 'text-stone-500'
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          Frases prontas
        </button>
      </div>

      {mode === 'phrases' ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="Buscar amor, café, mãe, humor..."
              className="w-full rounded-xl border border-stone-200 py-2 pl-8 pr-3 text-xs focus:border-[#C25E48] focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PHRASE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setPhraseCategory(category)}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  phraseCategory === category
                    ? 'bg-[#C25E48] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {filteredPhrases.map((phrase) => (
              <button
                key={phrase.id}
                type="button"
                onClick={() => applyPhrase(phrase)}
                className="w-full rounded-xl border border-stone-100 bg-[#FAF8F5] px-3 py-2.5 text-left transition-all hover:border-[#C25E48]/40 hover:bg-[#C25E48]/5"
              >
                <span
                  className="block text-sm leading-snug text-stone-800"
                  style={{ fontFamily: phrase.suggestedFont || 'inherit' }}
                >
                  {phrase.text}
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-stone-400">
                  {phrase.category}
                </span>
              </button>
            ))}
            {filteredPhrases.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">Nenhuma frase encontrada.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Conteúdo</label>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Matheus, Gratidão, Te Amo..."
              className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-[#C25E48] focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-stone-600">Fonte</label>
              <span className="text-[10px] text-stone-400">{fontFamily}</span>
            </div>
            <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setFontFamily(font.id)}
                  className={`rounded-xl border px-2 py-2 text-left transition-all ${
                    fontFamily === font.id
                      ? 'border-[#C25E48] bg-[#C25E48]/5 ring-1 ring-[#C25E48]/20'
                      : 'border-stone-100 bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <span className="block truncate text-sm text-stone-800" style={{ fontFamily: font.id }}>
                    Montuá
                  </span>
                  <span className="block text-[9px] text-stone-400">{font.description}</span>
                </button>
              ))}
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Cor da letra</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setFill(color.hex)}
                  className={`h-7 rounded-lg flex items-center justify-center border transition-all ${
                    fill === color.hex ? 'ring-2 ring-[#C25E48] ring-offset-1 scale-105' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {fill === color.hex && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        color.hex === '#FFFFFF' ? 'text-stone-800' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!text.trim()}
        className="w-full rounded-xl bg-[#C25E48] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#A94A36] active:scale-[0.99] disabled:opacity-50"
      >
        Inserir na {surface.name}
      </button>
    </div>
  );
};
