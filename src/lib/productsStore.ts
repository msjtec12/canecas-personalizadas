'use client';

import { useState, useEffect, useCallback } from 'react';
import { PRODUCTS_CATALOG } from '@/data/products';
import { ProductDefinition, SurfaceDefinition, ProductColor } from '@/types/configurator';

const STORAGE_KEY = 'feito_de_nos_products_catalog_v1';
const EVENT_NAME = 'feito_de_nos_products_updated';

export function useProductsStore() {
  const [products, setProducts] = useState<ProductDefinition[]>(() => {
    if (typeof window === 'undefined') return PRODUCTS_CATALOG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load stored products', e);
    }
    return PRODUCTS_CATALOG;
  });

  // Sync state across components & tabs
  useEffect(() => {
    const handleStorageOrCustomEvent = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to re-sync products', e);
      }
    };

    window.addEventListener(EVENT_NAME, handleStorageOrCustomEvent);
    window.addEventListener('storage', handleStorageOrCustomEvent);
    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageOrCustomEvent);
      window.removeEventListener('storage', handleStorageOrCustomEvent);
    };
  }, []);

  // Save to localStorage & notify
  const saveAndNotify = useCallback((newList: ProductDefinition[]) => {
    setProducts(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (e) {
      console.warn('Failed to persist products', e);
    }
  }, []);

  // 1. Update product base fields (prices, name, description, etc.)
  const updateProduct = useCallback(
    (id: string, updates: Partial<ProductDefinition>) => {
      const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 2. Toggle active status (Disponível vs Em breve)
  const toggleProductActive = useCallback(
    (id: string) => {
      const updated = products.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      );
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 3. Add new product
  const addProduct = useCallback(
    (newProd: Omit<ProductDefinition, 'id'>) => {
      const item: ProductDefinition = {
        ...newProd,
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      const updated = [...products, item];
      saveAndNotify(updated);
      return item;
    },
    [products, saveAndNotify]
  );

  // 4. Delete product
  const deleteProduct = useCallback(
    (id: string) => {
      const updated = products.filter((p) => p.id !== id);
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 5. Add surface to product
  const addSurface = useCallback(
    (productId: string, surface: SurfaceDefinition) => {
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          surfaces: [...p.surfaces, surface],
        };
      });
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 6. Update surface of product
  const updateSurface = useCallback(
    (productId: string, surfaceId: string, updates: Partial<SurfaceDefinition>) => {
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          surfaces: p.surfaces.map((s) =>
            s.id === surfaceId ? { ...s, ...updates } : s
          ),
        };
      });
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 7. Delete surface of product
  const deleteSurface = useCallback(
    (productId: string, surfaceId: string) => {
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          surfaces: p.surfaces.filter((s) => s.id !== surfaceId),
        };
      });
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 8. Add color to product
  const addColor = useCallback(
    (productId: string, newColor: ProductColor) => {
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          availableColors: [...p.availableColors, newColor],
        };
      });
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 9. Remove color from product
  const removeColor = useCallback(
    (productId: string, colorId: string) => {
      const updated = products.map((p) => {
        if (p.id !== productId) return p;
        if (p.availableColors.length <= 1) return p; // Keep at least one color
        return {
          ...p,
          availableColors: p.availableColors.filter((c) => c.id !== colorId),
        };
      });
      saveAndNotify(updated);
    },
    [products, saveAndNotify]
  );

  // 10. Reset products catalog to defaults
  const resetToDefaults = useCallback(() => {
    saveAndNotify(PRODUCTS_CATALOG);
  }, [saveAndNotify]);

  return {
    products,
    activeProducts: products.filter((p) => p.isActive),
    updateProduct,
    toggleProductActive,
    addProduct,
    deleteProduct,
    addSurface,
    updateSurface,
    deleteSurface,
    addColor,
    removeColor,
    resetToDefaults,
  };
}
