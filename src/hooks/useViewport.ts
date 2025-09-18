import { useState, useEffect } from 'react';
import { getViewportScale } from '../constants/game';

export const useViewport = () => {
  const [viewportScale, setViewportScale] = useState(getViewportScale());

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewportScale(getViewportScale());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update CSS custom property for background grid scaling
  useEffect(() => {
    const scaledGridSize = Math.round(25 * viewportScale);
    document.documentElement.style.setProperty('--grid-size', `${scaledGridSize}px`);
  }, [viewportScale]);

  return {
    viewportScale,
  };
};