import { supabase } from "@/config/supabase";

export interface Lancamento {
  id: number;
  nome_item: string;
  tipo?: string; // 'moto' | 'motor' | null
  ativo: boolean;
}

/**
 * Busca todos os lançamentos ativos da tabela lancamentos
 */
export async function getLancamentos(): Promise<Lancamento[]> {
  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("ativo", true);

  if (error) {
    console.error("[lancamentosService] Erro ao buscar lançamentos:", error);
    return [];
  }

  return data || [];
}

/**
 * Inscreve-se para atualizações em tempo real da tabela lancamentos
 */
export function subscribeToLancamentos(
  callback: (lancamentos: Lancamento[]) => void
): () => void {
  // Busca inicial
  getLancamentos().then(callback);

  // Inscrição para atualizações em tempo real
  const channel = supabase
    .channel("lancamentos-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "lancamentos",
      },
      () => {
        // Quando houver qualquer mudança, recarrega a lista
        getLancamentos().then(callback);
      }
    )
    .subscribe();

  // Retorna função de cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}
