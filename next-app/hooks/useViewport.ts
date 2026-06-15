import { useState, useEffect } from 'react';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export function useViewport() {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewport('mobile');
      } else if (window.innerWidth < 1024) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
