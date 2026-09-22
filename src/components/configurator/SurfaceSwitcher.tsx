'use client';

import React from 'react';
import { SurfaceDefinition, SurfaceId, CustomizationMap } from '@/types/configurator';
import { Layers } from 'lucide-react';

interface SurfaceSwitcherProps {
  surfaces: SurfaceDefinition[];
  activeSurfaceId: SurfaceId;
  onSelectSurface: (id: SurfaceId) => void;
  surfacesState: CustomizationMap;
}

export const SurfaceSwitcher: React.FC<SurfaceSwitcherProps> = ({
  surfaces,
  activeSurfaceId,
  onSelectSurface,
  surfacesState,
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/80 max-w-fit mx-auto shadow-sm">
      {surfaces.map((s) => {
        const isActive = s.id === activeSurfaceId;
        const elementCount = surfacesState[s.id]?.elements.length || 0;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectSurface(s.id)}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>{s.name}</span>

            {/* Badge indicating number of customized elements */}
            {elementCount > 0 && (
              <span
                className={`flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                  isActive ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {elementCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
