'use client';

import React, { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { ClipartElement, SurfaceDefinition } from '@/types/configurator';
import { CLIPART_CATEGORIES, ClipartItem } from '@/data/cliparts';
import { useArtworks } from '@/lib/artworksStore';

interface ClipartToolsProps {
  surface: SurfaceDefinition;
  onAddClipart: (clipartElement: ClipartElement) => void;
  onClose?: () => void;
}

export const ClipartTools: React.FC<ClipartToolsProps> = ({
  surface,
  onAddClipart,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Read dynamically managed active artworks
  const { activeArtworks } = useArtworks();

  const filteredCliparts = activeArtworks.filter((item) => {
    const matchCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSelectClipart = (item: ClipartItem) => {
    const pArea = surface.printableArea;

    // Default size for cliparts
    const targetWidth = Math.min(100, pArea.width * 0.5);
    const targetHeight = targetWidth;

    const initialX = pArea.x + (pArea.width - targetWidth) / 2;
    const initialY = pArea.y + (pArea.height - targetHeight) / 2;

    const newElement: ClipartElement = {
      id: `clipart-${Date.now()}`,
      surfaceId: surface.id,
      type: 'clipart',
      src: item.svgDataUri,
      title: item.title,
      category: item.category,
      x: initialX,
      y: initialY,
      width: targetWidth,
      height: targetHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: Date.now(),
      opacity: 1,
    };

    onAddClipart(newElement);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col max-h-[500px]">
      <div className="flex items-center gap-2 pb-2 border-b border-stone-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-stone-800 text-sm">Biblioteca de Artes</h4>
          <p className="text-xs text-stone-400">Elementos e ilustrações ativas para DTF UV</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar artes, temas ou categorias..."
          className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20 focus:border-[#C25E48]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {CLIPART_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#C25E48] text-white font-bold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Active Cliparts */}
      <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 flex-1 min-h-[220px]">
        {filteredCliparts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectClipart(item)}
            className="group relative flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-100 hover:border-[#C25E48]/40 hover:bg-[#FAF8F5] transition-all text-center"
            title={item.title}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.svgDataUri} alt={item.title} className="max-w-full max-h-full" />
            </div>
            <span className="text-[10px] text-stone-700 truncate w-full font-medium">
              {item.title}
            </span>
          </button>
        ))}

        {filteredCliparts.length === 0 && (
          <div className="col-span-3 text-center py-8 text-xs text-stone-400">
            Nenhuma arte ativa encontrada nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
};
