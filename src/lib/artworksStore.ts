'use client';

import { useState, useEffect, useCallback } from 'react';
import { CLIPARTS_LIBRARY, ClipartItem } from '@/data/cliparts';

const STORAGE_KEY = 'montua_custom_artworks_v1';
const EVENT_NAME = 'montua_artworks_updated';

// Helper to get initial artworks with isActive defaulted to true
const getInitialArtworks = (): ClipartItem[] => {
  return CLIPARTS_LIBRARY.map((item) => ({
    ...item,
    isActive: item.isActive !== undefined ? item.isActive : true,
    createdAt: item.createdAt || new Date().toISOString(),
  }));
};

export function useArtworks() {
  const [artworks, setArtworks] = useState<ClipartItem[]>(() => {
    if (typeof window === 'undefined') return getInitialArtworks();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load stored artworks', e);
    }
    return getInitialArtworks();
  });

  // Sync state across components & tabs
  useEffect(() => {
    const handleStorageOrCustomEvent = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setArtworks(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to re-sync artworks', e);
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
  const saveAndNotify = useCallback((newList: ClipartItem[]) => {
    setArtworks(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (e) {
      console.warn('Failed to persist artworks', e);
    }
  }, []);

  // 1. Add new artwork (from uploaded file)
  const addArtwork = useCallback(
    (newArt: Omit<ClipartItem, 'id' | 'createdAt'>) => {
      const item: ClipartItem = {
        ...newArt,
        id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [item, ...artworks];
      saveAndNotify(updated);
      return item;
    },
    [artworks, saveAndNotify]
  );

  // 2. Toggle active status
  const toggleArtworkStatus = useCallback(
    (id: string) => {
      const updated = artworks.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      );
      saveAndNotify(updated);
    },
    [artworks, saveAndNotify]
  );

  // 3. Update artwork attributes
  const updateArtwork = useCallback(
    (id: string, updates: Partial<ClipartItem>) => {
      const updated = artworks.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      saveAndNotify(updated);
    },
    [artworks, saveAndNotify]
  );

  // 4. Delete artwork
  const deleteArtwork = useCallback(
    (id: string) => {
      const updated = artworks.filter((item) => item.id !== id);
      saveAndNotify(updated);
    },
    [artworks, saveAndNotify]
  );

  // 5. Reset to original catalog
  const resetToDefaults = useCallback(() => {
    const defaults = getInitialArtworks();
    saveAndNotify(defaults);
  }, [saveAndNotify]);

  // Customer facing: only ACTIVE artworks
  const activeArtworks = artworks.filter((item) => item.isActive);

  return {
    artworks, // for admin: all artworks with active/inactive tags
    activeArtworks, // for configurator: only active artworks
    addArtwork,
    toggleArtworkStatus,
    updateArtwork,
    deleteArtwork,
    resetToDefaults,
    totalCount: artworks.length,
    activeCount: activeArtworks.length,
    inactiveCount: artworks.length - activeArtworks.length,
  };
}
