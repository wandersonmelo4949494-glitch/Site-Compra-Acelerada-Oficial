import { supabase } from '@/config/supabase';
import type { VendedorMotoConfig } from '@/types/vendorMoto';

/**
 * Busca as configurações de motos para um vendedor específico
 * Retorna array vazio se a tabela não existir ou houver erro
 */
export const getVendedorMotos = async (
  vendedorId: string
): Promise<VendedorMotoConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('vendedor_motos')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .eq('ativo', true)
      .order('ordem_exibicao', { ascending: true });

    if (error) {
      // Se a tabela não existe, retorna vazio (fallback)
      console.warn('Tabela vendedor_motos não encontrada ou erro:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Erro ao buscar configurações de motos do vendedor:', error);
    return [];
  }
};

/**
 * Escuta mudanças em tempo real nas configurações de motos do vendedor
 */
export const subscribeToVendedorMotos = (
  vendedorId: string,
  callback: (configs: VendedorMotoConfig[]) => void
): (() => void) => {
  // Busca inicial
  getVendedorMotos(vendedorId).then(callback);

  // Escutar mudanças em tempo real
  const channel = supabase
    .channel(`vendedor_motos_${vendedorId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vendedor_motos',
        filter: `vendedor_id=eq.${vendedorId}`,
      },
      async () => {
        const configs = await getVendedorMotos(vendedorId);
        callback(configs);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
