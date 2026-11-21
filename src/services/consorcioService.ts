import { supabase } from '@/config/supabase';
import type { ConsorcioCard } from '@/types/consorcio';

/**
 * Busca as tabelas de consórcio para uma moto específica
 * A lógica é baseada SOMENTE em vendedor_motos (tabelas_consorcio da moto)
 * @param motoCodigo - Código/nome da moto
 * @param tabelasEspecificas - IDs das tabelas de consórcio vinculadas à moto em vendedor_motos
 */
export const getConsorcioParaMoto = async (
  motoCodigo: string,
  tabelasEspecificas: string[]
): Promise<ConsorcioCard[]> => {
  try {
    // Se não há tabelas específicas, não há consórcio para mostrar
    if (!tabelasEspecificas || tabelasEspecificas.length === 0) {
      return [];
    }

    // Buscar as tabelas de consórcio diretamente
    const { data: tabelas, error: tabelasError } = await supabase
      .from('consorcio_tabelas')
      .select('id, nome_exibicao, frase_exibicao, ordem')
      .in('id', tabelasEspecificas)
      .eq('ativo', true);

    if (tabelasError) {
      console.error('Erro ao buscar tabelas de consórcio:', tabelasError);
      return [];
    }

    if (!tabelas || tabelas.length === 0) {
      return [];
    }

    // Buscar preços para essas tabelas e moto
    const { data: precos, error: precosError } = await supabase
      .from('consorcio_precos')
      .select('*')
      .in('tabela_id', tabelasEspecificas)
      .eq('moto_codigo', motoCodigo)
      .eq('ativo', true);

    if (precosError) {
      console.error('Erro ao buscar preços:', precosError);
      return [];
    }

    if (!precos || precos.length === 0) {
      return [];
    }

    // Combinar dados e formatar
    const resultado: ConsorcioCard[] = [];

    for (const tabela of tabelas) {
      const precoTabela = precos.find((p: any) => p.tabela_id === tabela.id);
      
      if (precoTabela) {
        // Converter parcelas JSON para array ordenado
        const parcelasObj = precoTabela.parcelas as Record<string, number>;
        const parcelasArray = Object.entries(parcelasObj)
          .map(([meses, valor]) => ({
            meses: parseInt(meses),
            valor: valor as number
          }))
          .sort((a, b) => b.meses - a.meses); // Ordenar por meses decrescente

        resultado.push({
          tabelaId: tabela.id,
          nomeExibicao: tabela.nome_exibicao,
          fraseExibicao: tabela.frase_exibicao,
          parcelas: parcelasArray
        });
      }
    }

    // Ordenar pela ordem definida em consorcio_tabelas
    return resultado.sort((a, b) => {
      const ordemA = tabelas.find((t: any) => t.id === a.tabelaId)?.ordem || 0;
      const ordemB = tabelas.find((t: any) => t.id === b.tabelaId)?.ordem || 0;
      return ordemA - ordemB;
    });

  } catch (error) {
    console.error('Erro ao buscar consórcio:', error);
    return [];
  }
};

/**
 * Escuta mudanças em tempo real nas tabelas de consórcio
 * @param motoCodigo - Código da moto
 * @param tabelasEspecificas - IDs das tabelas de consórcio vinculadas à moto
 */
export const subscribeToConsorcio = (
  motoCodigo: string,
  tabelasEspecificas: string[],
  callback: (cards: ConsorcioCard[]) => void
): (() => void) => {
  // Busca inicial
  getConsorcioParaMoto(motoCodigo, tabelasEspecificas).then(callback);

  // Escutar mudanças em tempo real (apenas consorcio_precos e consorcio_tabelas)
  const channel = supabase
    .channel(`consorcio_${motoCodigo}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'consorcio_precos'
      },
      async () => {
        const cards = await getConsorcioParaMoto(motoCodigo, tabelasEspecificas);
        callback(cards);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'consorcio_tabelas'
      },
      async () => {
        const cards = await getConsorcioParaMoto(motoCodigo, tabelasEspecificas);
        callback(cards);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Manter compatibilidade com imports antigos (deprecated)
export const getConsorcioParaVendedor = async (
  _vendedorId: string,
  motoCodigo: string,
  tabelasEspecificas?: string[]
): Promise<ConsorcioCard[]> => {
  return getConsorcioParaMoto(motoCodigo, tabelasEspecificas || []);
};