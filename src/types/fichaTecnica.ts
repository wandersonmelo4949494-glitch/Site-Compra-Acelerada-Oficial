// Tipo da Ficha Técnica da Moto - Nova tabela exclusiva
export interface FichaTecnicaMoto {
  id: string;
  moto_id: string; // Identificação da moto (slug ou nome)
  
  // ===== CAMPOS DOS 4 BLOCOS RESUMIDOS =====
  motor: string | null;
  cilindrada: string | null;
  transmissao: string | null;
  partida: string | null;
  
  // Controle de exibição dos blocos
  mostrar_motor: boolean;
  mostrar_cilindrada: boolean;
  mostrar_transmissao: boolean;
  mostrar_partida: boolean;
  
  // ===== CAMPOS DA TABELA COMPLETA =====
  freio_dianteiro_diametro: string | null;
  freio_traseiro_diametro: string | null;
  potencia_maxima: string | null;
  sistema_alimentacao: string | null;
  combustivel: string | null;
  tanque_combustivel: string | null;
  oleo_motor: string | null;
  
  // Controle de exibição da tabela completa
  mostrar_freio_dianteiro: boolean;
  mostrar_freio_traseiro: boolean;
  mostrar_potencia_maxima: boolean;
  mostrar_sistema_alimentacao: boolean;
  mostrar_combustivel: boolean;
  mostrar_tanque_combustivel: boolean;
  mostrar_oleo_motor: boolean;
  
  // ===== CAMPO DE OBSERVAÇÃO =====
  observacao_texto: string | null;
  mostrar_observacao: boolean;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}
