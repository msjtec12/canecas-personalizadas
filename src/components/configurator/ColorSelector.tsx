'use client';

import React from 'react';
import { ProductColor } from '@/types/configurator';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelectColor: (color: ProductColor) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelectColor,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Cor da Caneca
        </label>
        <span className="text-xs text-rose-600 font-medium">{selectedColor.name}</span>
      </div>

      <div className="flex items-center gap-2.5">
        {colors.map((color) => {
          const isSelected = color.id === selectedColor.id;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`group relative flex-1 h-9 rounded-xl flex items-center justify-center transition-all border ${
                isSelected
                  ? 'ring-2 ring-rose-500 ring-offset-2 scale-105 shadow-sm'
                  : 'border-slate-200 hover:scale-102'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {isSelected && (
                <Check
                  className={`w-4 h-4 ${
                    color.id === 'white' ? 'text-slate-800' : 'text-white'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
