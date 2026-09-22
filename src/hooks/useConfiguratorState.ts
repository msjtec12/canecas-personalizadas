'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ProductDefinition,
  ProductColor,
  SurfaceId,
  CanvasElement,
  CustomizationMap,
} from '@/types/configurator';

const STORAGE_KEY = 'montua_customization_draft_v1';

const initialSurfacesState: CustomizationMap = {
  front: { elements: [] },
  back: { elements: [] },
  handle: { elements: [] },
  bottom: { elements: [] },
};

export function useConfiguratorState(product: ProductDefinition) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.availableColors.find((c) => c.id === product.defaultColor) || product.availableColors[0]
  );
  const [activeSurfaceId, setActiveSurfaceId] = useState<SurfaceId>('front');
  const [surfacesState, setSurfacesState] = useState<CustomizationMap>(initialSurfacesState);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Undo / Redo History
  const [historyPast, setHistoryPast] = useState<CustomizationMap[]>([]);
  const [historyFuture, setHistoryFuture] = useState<CustomizationMap[]>([]);

  const [pendingDraft, setPendingDraft] = useState<{
    surfacesState: CustomizationMap;
    colorId?: string;
    savedAt?: string;
  } | null>(null);
  const [hasPendingDraft, setHasPendingDraft] = useState<boolean>(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | undefined>(undefined);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.productId === product.id && parsed.surfacesState) {
          const totalElements = Object.values(parsed.surfacesState as CustomizationMap).reduce(
            (acc, s) => acc + (s.elements?.length || 0),
            0
          );
          if (totalElements > 0) {
            setPendingDraft(parsed);
            setHasPendingDraft(true);
            if (parsed.savedAt) {
              const d = new Date(parsed.savedAt);
              setDraftSavedAt(
                d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              );
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to inspect customization draft', e);
    }
  }, [product.id]);

  const restoreDraft = useCallback(() => {
    if (!pendingDraft) return;
    setSurfacesState(pendingDraft.surfacesState);
    if (pendingDraft.colorId) {
      const matchedColor = product.availableColors.find((c) => c.id === pendingDraft.colorId);
      if (matchedColor) setSelectedColor(matchedColor);
    }
    setHasPendingDraft(false);
    setPendingDraft(null);
  }, [pendingDraft, product.availableColors]);

  const discardDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setHasPendingDraft(false);
    setPendingDraft(null);
    setSurfacesState(initialSurfacesState);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setHasPendingDraft(false);
    setPendingDraft(null);
  }, []);

  // Auto-save to LocalStorage
  useEffect(() => {
    // Only auto-save if we don't have a pending unaccepted draft banner
    if (hasPendingDraft) return;

    try {
      const totalElements = Object.values(surfacesState).reduce(
        (acc, s) => acc + (s.elements?.length || 0),
        0
      );
      if (totalElements > 0) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            productId: product.id,
            colorId: selectedColor.id,
            surfacesState,
            savedAt: new Date().toISOString(),
          })
        );
      }
    } catch (e) {
      console.warn('Failed to save customization draft', e);
    }
  }, [product.id, selectedColor.id, surfacesState, hasPendingDraft]);

  // Helper to commit state changes to history
  const commitNewState = useCallback(
    (newSurfaces: CustomizationMap) => {
      setHistoryPast((past) => [...past.slice(-25), surfacesState]);
      setHistoryFuture([]);
      setSurfacesState(newSurfaces);
    },
    [surfacesState]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((past) => past.slice(0, past.length - 1));
    setHistoryFuture((future) => [surfacesState, ...future]);
    setSurfacesState(previous);
    setSelectedElementId(null);
  }, [historyPast, surfacesState]);

  // Redo
  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((future) => future.slice(1));
    setHistoryPast((past) => [...past, surfacesState]);
    setSurfacesState(next);
    setSelectedElementId(null);
  }, [historyFuture, surfacesState]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          removeElement(activeSurfaceId, selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedElementId, activeSurfaceId]);

  // Add Element
  const addElement = useCallback(
    (surfaceId: SurfaceId, element: CanvasElement) => {
      const currentList = surfacesState[surfaceId].elements;
      const nextList = [...currentList, element];
      commitNewState({
        ...surfacesState,
        [surfaceId]: { elements: nextList },
      });
      setSelectedElementId(element.id);
    },
    [surfacesState, commitNewState]
  );

  // Update Element
  const updateElement = useCallback(
    (surfaceId: SurfaceId, id: string, attrs: Partial<CanvasElement>) => {
      const currentList = surfacesState[surfaceId].elements;
      const nextList = currentList.map((el) => (el.id === id ? ({ ...el, ...attrs } as CanvasElement) : el));
      commitNewState({
        ...surfacesState,
        [surfaceId]: { elements: nextList },
      });
    },
    [surfacesState, commitNewState]
  );

  // Remove Element
  const removeElement = useCallback(
    (surfaceId: SurfaceId, id: string) => {
      const currentList = surfacesState[surfaceId].elements;
      const nextList = currentList.filter((el) => el.id !== id);
      commitNewState({
        ...surfacesState,
        [surfaceId]: { elements: nextList },
      });
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [surfacesState, selectedElementId, commitNewState]
  );

  // Duplicate Element
  const duplicateElement = useCallback(
    (surfaceId: SurfaceId, id: string) => {
      const currentList = surfacesState[surfaceId].elements;
      const target = currentList.find((el) => el.id === id);
      if (!target) return;

      const duplicated: CanvasElement = {
        ...target,
        id: `${target.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        x: Math.min(target.x + 15, 200),
        y: Math.min(target.y + 15, 250),
        zIndex: currentList.length + 1,
      };

      addElement(surfaceId, duplicated);
    },
    [surfacesState, addElement]
  );

  // Layer Reordering: Bring Forward / Send Backward
  const reorderLayer = useCallback(
    (surfaceId: SurfaceId, id: string, direction: 'up' | 'down') => {
      const currentList = [...surfacesState[surfaceId].elements];
      const index = currentList.findIndex((el) => el.id === id);
      if (index === -1) return;

      if (direction === 'up' && index < currentList.length - 1) {
        const temp = currentList[index];
        currentList[index] = currentList[index + 1];
        currentList[index + 1] = temp;
      } else if (direction === 'down' && index > 0) {
        const temp = currentList[index];
        currentList[index] = currentList[index - 1];
        currentList[index - 1] = temp;
      }

      // Update z-indexes accordingly
      const reindexed = currentList.map((el, i) => ({ ...el, zIndex: i }));
      commitNewState({
        ...surfacesState,
        [surfaceId]: { elements: reindexed },
      });
    },
    [surfacesState, commitNewState]
  );

  // Clear Surface
  const clearSurface = useCallback(
    (surfaceId: SurfaceId) => {
      commitNewState({
        ...surfacesState,
        [surfaceId]: { elements: [] },
      });
      setSelectedElementId(null);
    },
    [surfacesState, commitNewState]
  );

  // Reset entire design
  const resetAllSurfaces = useCallback(() => {
    commitNewState(initialSurfacesState);
    setSelectedElementId(null);
  }, [commitNewState]);

  // Dynamic Pricing Calculation
  const pricing = useMemo(() => {
    // Count surfaces that contain at least 1 element
    const customizedSurfacesCount = Object.values(surfacesState).filter(
      (surface) => surface.elements.length > 0
    ).length;

    // 1st customized surface is covered by base price; each additional surface is +surfaceAdditionalPrice
    const additionalSurfacesCount = Math.max(0, customizedSurfacesCount - 1);
    const additionalSurfacesCost = additionalSurfacesCount * product.surfaceAdditionalPrice;

    return {
      basePrice: product.basePrice,
      customizedSurfacesCount,
      additionalSurfacesCount,
      additionalSurfacesCost,
      packagingPrice: product.packagingPrice,
      getUnitPrice: (includePackaging: boolean) =>
        product.basePrice + additionalSurfacesCost + (includePackaging ? product.packagingPrice : 0),
      getTotalPrice: (quantity: number, includePackaging: boolean) => {
        const unit = product.basePrice + additionalSurfacesCost + (includePackaging ? product.packagingPrice : 0);
        return unit * Math.max(1, quantity);
      },
    };
  }, [surfacesState, product]);

  const activeSurface = useMemo(
    () => product.surfaces.find((s) => s.id === activeSurfaceId) || product.surfaces[0],
    [product.surfaces, activeSurfaceId]
  );

  const activeElements = useMemo(
    () => surfacesState[activeSurfaceId]?.elements || [],
    [surfacesState, activeSurfaceId]
  );

  const selectedElement = useMemo(
    () => activeElements.find((el) => el.id === selectedElementId) || null,
    [activeElements, selectedElementId]
  );

  return {
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
    resetAllSurfaces,
    undo,
    redo,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
    pricing,
    hasPendingDraft,
    draftSavedAt,
    restoreDraft,
    discardDraft,
    clearDraft,
  };
}
