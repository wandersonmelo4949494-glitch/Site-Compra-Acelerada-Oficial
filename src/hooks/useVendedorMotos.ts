import { useEffect, useState } from "react";
import { subscribeToVendedorMotos } from "@/services/vendorMotosService";
import { getSubdomain } from "@/utils/subdomain";
import type { VendedorMotoConfig } from "@/types/vendorMoto";

export const useVendedorMotos = () => {
  const [configs, setConfigs] = useState<VendedorMotoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    const subdominio = getSubdomain();
    console.log('[useVendedorMotos] Subdomínio detectado:', subdominio);

    const unsubscribe = subscribeToVendedorMotos(subdominio, (data) => {
      console.log('[useVendedorMotos] Configs recebidas:', data.length, data.map(c => c.moto_codigo));
      setConfigs(data);
      setHasConfig(data.length > 0);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Retorna a configuração para uma moto específica
  // Compara tanto pelo código exato quanto pelo nome normalizado
  const getConfigForMoto = (motoCodigo: string): VendedorMotoConfig | null => {
    const config = configs.find((c) => {
      // Comparação exata
      if (c.moto_codigo === motoCodigo) return true;
      // Comparação normalizada (lowercase, sem espaços extras)
      const normalizedConfig = c.moto_codigo.toLowerCase().trim();
      const normalizedMoto = motoCodigo.toLowerCase().trim();
      return normalizedConfig === normalizedMoto;
    });
    return config || null;
  };

  // Verifica se uma moto deve ser exibida
  const shouldShowMoto = (motoCodigo: string): boolean => {
    // Se não há configuração no banco, não mostrar nenhuma moto
    // (regra: moto sem config não existe para o vendedor)
    if (!hasConfig) return false;
    
    const config = getConfigForMoto(motoCodigo);
    return config !== null && config.ativo;
  };

  return {
    configs,
    loading,
    hasConfig,
    getConfigForMoto,
    shouldShowMoto,
  };
};
