import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook para fechar modal ao pressionar botão/gesto de voltar do navegador
 * Funciona em celular, tablet e desktop
 */
export const useModalHistory = (
  isOpen: boolean,
  onClose: () => void,
  modalId: string
) => {
  // Track whether we pushed a history entry
  const hasPushedState = useRef(false);

  const handlePopState = useCallback(() => {
    if (hasPushedState.current) {
      hasPushedState.current = false;
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Quando o modal abre, adiciona uma entrada no histórico
      window.history.pushState({ modal: modalId }, '', window.location.href);
      hasPushedState.current = true;
      
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, modalId, handlePopState]);

  // Cleanup: quando o modal fecha manualmente (não pelo botão voltar),
  // precisamos remover a entrada do histórico que adicionamos
  useEffect(() => {
    if (!isOpen && hasPushedState.current) {
      hasPushedState.current = false;
      window.history.back();
    }
  }, [isOpen]);
};
