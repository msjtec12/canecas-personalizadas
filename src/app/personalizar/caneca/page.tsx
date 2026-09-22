'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Konva from 'konva';
import {
  Type,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Undo2,
  Redo2,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_PRODUCT } from '@/data/products';
import { useConfiguratorState } from '@/hooks/useConfiguratorState';
import { MugMockup } from '@/components/configurator/MugMockup';
import { CanvasEditor } from '@/components/configurator/CanvasEditor';
import { SurfaceSwitcher } from '@/components/configurator/SurfaceSwitcher';
import { TextTools } from '@/components/configurator/TextTools';
import { ImageTools } from '@/components/configurator/ImageTools';
import { ClipartTools } from '@/components/configurator/ClipartTools';
import { ColorSelector } from '@/components/configurator/ColorSelector';
import { PropertiesPanel } from '@/components/configurator/PropertiesPanel';
import { OrderModal } from '@/components/configurator/OrderModal';
import { DraftRecoveryBanner } from '@/components/configurator/DraftRecoveryBanner';
import { SurfaceId } from '@/types/configurator';

type ActiveToolTab = 'none' | 'text' | 'image' | 'clipart' | 'colors';

export default function MugConfiguratorPage() {
  const product = DEFAULT_PRODUCT;
  const stageRef = useRef<Konva.Stage | null>(null);

  const {
    selectedColor,
    setSelectedColor,
    activeSurfaceId,
    setActiveSurfaceId,
    activeSurface,
    surfacesState,
    activeElements,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    reorderLayer,
    clearSurface,
    undo,
    redo,
    canUndo,
    canRedo,
    pricing,
    hasPendingDraft,
    draftSavedAt,
    restoreDraft,
    discardDraft,
    clearDraft,
  } = useConfiguratorState(product);

  const [activeToolTab, setActiveToolTab] = useState<ActiveToolTab>('text');
  const [showSafetyGuide, setShowSafetyGuide] = useState<boolean>(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [surfacePreviews, setSurfacePreviews] = useState<Record<SurfaceId, string | undefined>>({
    front: undefined,
    back: undefined,
    handle: undefined,
    bottom: undefined,
  });

  // Capture preview snapshot of the current surface canvas
  const handleCapturePreview = () => {
    if (stageRef.current) {
      try {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
        setSurfacePreviews((prev) => ({
          ...prev,
          [activeSurfaceId]: dataUrl,
        }));
      } catch (e) {
        console.warn('Could not generate canvas thumbnail', e);
      }
    }
  };

  const handleOpenOrder = () => {
    handleCapturePreview();
    setIsOrderModalOpen(true);
  };

  const handleSurfaceChange = (newSurfaceId: SurfaceId) => {
    handleCapturePreview();
    setActiveSurfaceId(newSurfaceId);
    setSelectedElementId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Product Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Voltar ao Início"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[#C25E48] text-sm tracking-tight font-serif">MONTUÁ</span>
                <span className="text-slate-300">|</span>
                <h1 className="font-semibold text-slate-900 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                  {product.name}
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Crie seu presente — Personalize cada detalhe do seu jeito. Superfície: <strong className="text-slate-700">{activeSurface.name}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions (Undo/Redo, Guide, Price & Order Button) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Undo / Redo Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
                title="Refazer (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Safety Line Toggle */}
            <button
              type="button"
              onClick={() => setShowSafetyGuide(!showSafetyGuide)}
              className={`p-2 rounded-xl text-xs font-medium border hidden md:flex items-center gap-1.5 transition-colors ${
                showSafetyGuide
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Mostrar/Ocultar Linha de Limite de Impressão"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Limites DTF</span>
            </button>

            {/* Live Price Tag */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Estimado
              </span>
              <span className="text-sm sm:text-base font-black text-rose-600">
                R$ {pricing.getTotalPrice(1, false).toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Order CTA */}
            <button
              type="button"
              onClick={handleOpenOrder}
              className="flex items-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Meu Pedido</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 pt-4">
        <DraftRecoveryBanner
          hasDraft={hasPendingDraft}
          draftDate={draftSavedAt}
          onRestore={restoreDraft}
          onDiscard={discardDraft}
        />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* LEFT COLUMN: TOOLS (FERRAMENTAS) */}
        <section className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          {/* Tool Selection Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveToolTab('text')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeToolTab === 'text'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Type className="w-4 h-4 mb-1" />
              <span>+ Texto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('image')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeToolTab === 'image'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 mb-1" />
              <span>+ Imagem</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('clipart')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeToolTab === 'clipart'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 mb-1" />
              <span>+ Arte</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('colors')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeToolTab === 'colors'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Palette className="w-4 h-4 mb-1" />
              <span>Cores</span>
            </button>
          </div>

          {/* Active Tool Sub-Panel */}
          <div>
            {activeToolTab === 'text' && (
              <TextTools
                surface={activeSurface}
                onAddText={(el) => addElement(activeSurfaceId, el)}
              />
            )}

            {activeToolTab === 'image' && (
              <ImageTools
                surface={activeSurface}
                onAddImage={(el) => addElement(activeSurfaceId, el)}
              />
            )}

            {activeToolTab === 'clipart' && (
              <ClipartTools
                surface={activeSurface}
                onAddClipart={(el) => addElement(activeSurfaceId, el)}
              />
            )}

            {activeToolTab === 'colors' && (
              <ColorSelector
                colors={product.availableColors}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            )}
          </div>

          {/* Quick Color bar when in other tabs */}
          {activeToolTab !== 'colors' && (
            <ColorSelector
              colors={product.availableColors}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />
          )}
        </section>

        {/* CENTER COLUMN: INTERACTIVE VISUALIZATION (VISUALIZAÇÃO DA CANECA) */}
        <section className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2 space-y-4">
          {/* Surface Navigator Bar */}
          <div className="w-full">
            <SurfaceSwitcher
              surfaces={product.surfaces}
              activeSurfaceId={activeSurfaceId}
              onSelectSurface={handleSurfaceChange}
              surfacesState={surfacesState}
            />
          </div>

          {/* Realistic Mug Mockup with Canvas Area */}
          <div className="w-full bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[440px] sm:min-h-[520px]">
            {/* Surface Description Indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-600 border border-slate-200">
                {activeSurface.name} ({activeSurface.realWidthMm}x{activeSurface.realHeightMm}mm)
              </span>
            </div>

            {/* Clear surface button */}
            {activeElements.length > 0 && (
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => clearSurface(activeSurfaceId)}
                  className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center gap-1 transition-colors"
                  title="Limpar todos os elementos desta superfície"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar {activeSurface.name}</span>
                </button>
              </div>
            )}

            {/* The Mug Mockup containing the Konva Canvas */}
            <MugMockup color={selectedColor} surfaceId={activeSurfaceId}>
              <CanvasEditor
                surface={activeSurface}
                elements={activeElements}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={(id, attrs) => updateElement(activeSurfaceId, id, attrs)}
                stageRef={stageRef}
                showSafetyGuide={showSafetyGuide}
              />
            </MugMockup>

            {/* Helper Caption */}
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-400">
                💡 Clique sobre os elementos para arrastar, girar ou redimensionar. Limites de segurança ativos para impressão DTF UV.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: PROPERTIES & LAYERS (PROPRIEDADES) */}
        <section className="lg:col-span-3 space-y-4 order-3">
          <PropertiesPanel
            surface={activeSurface}
            selectedElement={selectedElement}
            elements={activeElements}
            onUpdateElement={(id, attrs) => updateElement(activeSurfaceId, id, attrs)}
            onRemoveElement={(id) => removeElement(activeSurfaceId, id)}
            onDuplicateElement={(id) => duplicateElement(activeSurfaceId, id)}
            onReorderLayer={(id, dir) => reorderLayer(activeSurfaceId, id, dir)}
            onSelectElement={setSelectedElementId}
          />
        </section>
      </main>

      {/* 3. ORDER REVIEW MODAL */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
        selectedColor={selectedColor}
        surfacesState={surfacesState}
        surfacePreviews={surfacePreviews}
        pricing={pricing}
        onOrderSuccess={clearDraft}
      />
    </div>
  );
}
