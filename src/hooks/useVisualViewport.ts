import { useState, useEffect } from 'react';

/**
 * Hook para monitorar o visualViewport e detectar quando o teclado virtual está aberto
 * Retorna se o teclado está aberto baseado na mudança de altura do viewport
 */
export const useVisualViewport = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = viewport.height;
      
      // Considera teclado aberto se a altura do viewport diminuiu significativamente (> 150px)
      const heightDifference = initialHeight - currentHeight;
      setIsKeyboardOpen(heightDifference > 150);
    };

    viewport.addEventListener('resize', handleResize);

    // Inicializar
    handleResize();

    return () => {
      viewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isKeyboardOpen };
};
