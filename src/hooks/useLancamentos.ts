import { useState, useEffect, useCallback } from "react";
import { subscribeToLancamentos, type Lancamento } from "@/services/lancamentosService";

/**
 * Hook para gerenciar lançamentos do banco de dados
 * Retorna função para verificar se um item é lançamento
 */
export function useLancamentos() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLancamentos((data) => {
      setLancamentos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Verifica se um item (moto ou motor) é lançamento
   * Compara pelo nome exato (case-insensitive)
   */
  const isLancamento = useCallback(
    (nomeItem: string): boolean => {
      const nomeLower = nomeItem.toLowerCase().trim();
      return lancamentos.some(
        (l) => l.nome_item.toLowerCase().trim() === nomeLower && l.ativo
      );
    },
    [lancamentos]
  );

  return {
    lancamentos,
    loading,
    isLancamento,
  };
}
