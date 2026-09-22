'use client';

import React from 'react';
import { Sparkles, RotateCcw, Trash2, Check } from 'lucide-react';

interface DraftRecoveryBannerProps {
  hasDraft: boolean;
  draftDate?: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export const DraftRecoveryBanner: React.FC<DraftRecoveryBannerProps> = ({
  hasDraft,
  draftDate,
  onRestore,
  onDiscard,
}) => {
  if (!hasDraft) return null;

  return (
    <aside
      aria-label="Aviso de rascunho recuperado"
      className="mb-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-sm backdrop-blur-sm animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950"
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <RotateCcw className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
            <span>Encontramos uma personalização que você estava criando</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600 inline" />
          </h4>
          <p className="text-xs text-amber-700/90 mt-0.5">
            Deseja continuar de onde parou ou iniciar uma nova criação do zero?
            {draftDate && <span className="opacity-75"> (Salvo em {draftDate})</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={onDiscard}
          className="px-3 py-1.5 text-xs font-medium text-amber-800 hover:text-amber-950 hover:bg-amber-100/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Descartar
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Continuar personalização
        </button>
      </div>
    </aside>
  );
};
