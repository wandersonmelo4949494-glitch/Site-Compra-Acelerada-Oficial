// Tipos para o novo sistema de consórcio

export interface ConsorcioTabela {
  id: string;
  nome_exibicao: string;
  frase_exibicao: string;
  ordem: number;
  ativo: boolean;
}

export interface ConsorcioPreco {
  id: string;
  tabela_id: string;
  moto_codigo: string;
  parcelas: Record<string, number>; // { "80": 207.57, "60": 268.84 }
  vigencia?: string;
  ativo: boolean;
}

export interface VendedorTabela {
  id: string;
  vendedor_id: string;
  tabela_id: string;
  ordem_exibicao: number;
  ativo: boolean;
}

// Interface para dados combinados retornados pela query
export interface ConsorcioCompletoData {
  tabela_id: string;
  nome_exibicao: string;
  frase_exibicao: string;
  ordem: number;
  moto_codigo: string;
  parcelas: Record<string, number>;
}

// Interface formatada para o modal
export interface ConsorcioCard {
  tabelaId: string;
  nomeExibicao: string;
  fraseExibicao: string;
  parcelas: { meses: number; valor: number }[];
}
