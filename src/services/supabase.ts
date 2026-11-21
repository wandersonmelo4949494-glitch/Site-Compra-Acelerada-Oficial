import { supabase } from '@/config/supabase';
import type { Vendedor, ConfigGlobal } from '@/types/firebase';

export type VendorResult = 
  | { status: 'found'; vendedor: Vendedor }
  | { status: 'not_found' }
  | { status: 'inactive'; vendedor: Vendedor };

/**
 * Busca os dados de um vendedor específico pelo subdomínio
 * Retorna status diferenciado: found, not_found, ou inactive
 */
export const getVendedorWithStatus = async (subdominio: string): Promise<VendorResult> => {
  try {
    // Busca vendedor SEM filtro de ativo para detectar inativos
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', subdominio)
      .single();

    if (error || !data) {
      return { status: 'not_found' };
    }

    // Busca configuração do vendedor
    let mostrarValorCredito = false;
    let mostrarVantagensConsorcio = false;
    const { data: configData } = await supabase
      .from('vendedor_config')
      .select('mostrar_valor_credito, mostrar_vantagens_consorcio')
      .eq('vendedor_id', subdominio)
      .single();

    if (configData) {
      mostrarValorCredito = configData.mostrar_valor_credito ?? false;
      mostrarVantagensConsorcio = configData.mostrar_vantagens_consorcio === true;
    }

    const vendedor: Vendedor = {
      nome: data.nome,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      logoUrl: data.logo_url,
      fotoPerfilUrl: data.foto_perfil_url,
      ativo: data.ativo,
      mostrarValorCredito,
      mostrarVantagensConsorcio,
    };

    // Verifica se está inativo
    if (!data.ativo) {
      return { status: 'inactive', vendedor };
    }

    return { status: 'found', vendedor };
  } catch (error) {
    console.error('Erro ao buscar vendedor:', error);
    return { status: 'not_found' };
  }
};

/**
 * Busca os dados de um vendedor específico pelo subdomínio (legacy)
 */
export const getVendedor = async (subdominio: string): Promise<Vendedor | null> => {
  const result = await getVendedorWithStatus(subdominio);
  if (result.status === 'found') {
    return result.vendedor;
  }
  return null;
};

/**
 * Busca a configuração global do site
 */
export const getConfigGlobal = async (): Promise<ConfigGlobal | null> => {
  try {
    const { data, error } = await supabase
      .from('config_global')
      .select('*')
      .eq('id', 'site')
      .single();

    if (error) {
      console.error('Erro ao buscar configuração global:', error);
      return null;
    }

    if (!data) return null;

    return {
      banners: data.banners,
      tabelaConsorcio: data.tabela_consorcio,
      descricaoGlobal: data.descricao_global,
      motos: data.motos,
    };
  } catch (error) {
    console.error('Erro ao buscar configuração global:', error);
    return null;
  }
};

/**
 * Escuta mudanças em tempo real dos dados do vendedor
 */
export const subscribeToVendedor = (
  subdominio: string,
  callback: (vendedor: Vendedor | null) => void
): (() => void) => {
  const channel = supabase
    .channel(`vendor_${subdominio}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vendors',
        filter: `id=eq.${subdominio}`,
      },
      async () => {
        const vendedor = await getVendedor(subdominio);
        callback(vendedor);
      }
    )
    .subscribe();

  // Busca inicial
  getVendedor(subdominio).then(callback);

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Escuta mudanças em tempo real da configuração global
 */
export const subscribeToConfigGlobal = (
  callback: (config: ConfigGlobal | null) => void
): (() => void) => {
  const channel = supabase
    .channel('config_global')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'config_global',
        filter: 'id=eq.site',
      },
      async () => {
        const config = await getConfigGlobal();
        callback(config);
      }
    )
    .subscribe();

  // Busca inicial
  getConfigGlobal().then(callback);

  return () => {
    supabase.removeChannel(channel);
  };
};