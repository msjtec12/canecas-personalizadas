'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Konva from 'konva';
import { CanvasElement, SurfaceDefinition } from '@/types/configurator';

const DynamicKonvaCanvas = dynamic(() => import('./KonvaCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
      Carregando área de personalização...
    </div>
  ),
});

interface CanvasEditorProps {
  surface: SurfaceDefinition;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  showSafetyGuide?: boolean;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = (props) => {
  return <DynamicKonvaCanvas {...props} />;
};

export default CanvasEditor;
