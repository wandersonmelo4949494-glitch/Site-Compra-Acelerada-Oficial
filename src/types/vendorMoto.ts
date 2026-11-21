// Configuração de moto por vendedor
export interface VendedorMotoConfig {
  id: string;
  vendedor_id: string;
  moto_codigo: string;
  mostrar_consorcio: boolean;
  mostrar_financiamento: boolean;
  mostrar_informacoes: boolean;
  parcelas_bloqueadas: number[];
  tabelas_consorcio: string[];
  ordem_exibicao: number;
  ativo: boolean;
}

// Moto com configuração do vendedor aplicada
export interface MotorcycleWithConfig {
  id: string;
  name: string;
  category: string;
  preco?: string;
  images: { color: string; url: string }[];
  specs: {
    tipo: string;
    cilindrada: string;
    potenciaMaxima: string;
    torqueMaximo: string;
    sistemaAlimentacao: string;
    sistemPartida: string;
    transmissao: string;
    capacidadeTanque: string;
    freios: string;
    pesoSeco?: string;
  };
  consorcio: {
    parcelas: { meses: number; valor: number }[];
    creditoAdicional?: string;
  };
  // Configurações do vendedor
  config: {
    mostrarConsorcio: boolean;
    mostrarFinanciamento: boolean;
    mostrarInformacoes: boolean;
    parcelasBloqueadas: number[];
    tabelasConsorcio: string[];
  };
}
