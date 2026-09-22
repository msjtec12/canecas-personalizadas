'use client';

import { useState, useEffect } from 'react';

export function useImageLoader(url: string | undefined): [HTMLImageElement | null, 'loading' | 'loaded' | 'failed'] {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  useEffect(() => {
    if (!url) {
      setImage(null);
      setStatus('failed');
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';

    const handleLoad = () => {
      setImage(img);
      setStatus('loaded');
    };

    const handleError = () => {
      setImage(null);
      setStatus('failed');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = url;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [url]);

  return [image, status];
}
