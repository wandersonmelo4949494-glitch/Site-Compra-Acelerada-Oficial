import { supabase } from '@/config/supabase';

export interface ConsorcioCredito {
  id: string;
  tabela_ids: string[];
  moto_codigo: string;
  regiao: string;
  credito_vista: number;
  credito_prazo: number | null;
}

/**
 * Busca o crédito de consórcio para uma moto e tabela específica
 * @param motoCodigo - Nome exato da moto
 * @param tabelaId - UUID da tabela de consórcio
 */
export const getCreditoParaMoto = async (
  motoCodigo: string,
  tabelaId: string
): Promise<ConsorcioCredito | null> => {
  try {
    const { data, error } = await supabase
      .from('consorcio_creditos')
      .select('*')
      .eq('moto_codigo', motoCodigo)
      .contains('tabela_ids', [tabelaId])
      .limit(1);

    if (error) {
      console.error('Erro ao buscar crédito:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data[0] as ConsorcioCredito;
  } catch (error) {
    console.error('Erro ao buscar crédito:', error);
    return null;
  }
};

/**
 * Busca todos os créditos para uma moto (todas as tabelas)
 * @param motoCodigo - Nome exato da moto
 * @param tabelaIds - UUIDs das tabelas de consórcio
 */
export const getCreditosParaMoto = async (
  motoCodigo: string,
  tabelaIds: string[]
): Promise<Map<string, ConsorcioCredito>> => {
  const creditoMap = new Map<string, ConsorcioCredito>();
  
  if (!tabelaIds || tabelaIds.length === 0) return creditoMap;

  try {
    const { data, error } = await supabase
      .from('consorcio_creditos')
      .select('*')
      .eq('moto_codigo', motoCodigo);

    if (error) {
      console.error('Erro ao buscar créditos:', error);
      return creditoMap;
    }

    if (!data) return creditoMap;

    // Para cada tabela_id, encontrar o crédito correspondente
    for (const tabelaId of tabelaIds) {
      const credito = data.find((c: any) => 
        Array.isArray(c.tabela_ids) && c.tabela_ids.includes(tabelaId)
      );
      if (credito) {
        creditoMap.set(tabelaId, credito as ConsorcioCredito);
      }
    }

    return creditoMap;
  } catch (error) {
    console.error('Erro ao buscar créditos:', error);
    return creditoMap;
  }
};
