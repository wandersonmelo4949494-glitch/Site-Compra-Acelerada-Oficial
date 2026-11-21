export interface Vendedor {
  nome: string;
  whatsapp: string;
  instagram: string;
  logoUrl: string;
  fotoPerfilUrl: string;
  ativo: boolean;
  mostrarValorCredito?: boolean;
  mostrarVantagensConsorcio?: boolean;
}

export interface Banner {
  imagem: string;
  link: string;
}

// ConsorcioRow não é mais usado - consórcio vem das tabelas consorcio_tabelas/consorcio_precos
// Mantido apenas para compatibilidade com código legado
export interface ConsorcioRow {
  modelo: string;
  entrada: string;
  parcelas: string;
}

export interface FichaTecnica {
  motor?: string;
  potencia?: string;
  cambio?: string;
  partida?: string;
  [key: string]: string | undefined;
}

export interface MotoFirebase {
  nome: string;
  preco?: string;
  categoria?: string;
  imagemPrincipal: string;
  galeria: string[];
  fichaTecnica?: FichaTecnica; // Opcional - ficha técnica agora vem da tabela ficha_tecnica_motos
  consorcioPlanos?: {
    parcelas: number;
    valor: number;
  }[];
  creditoAdicional?: string;
}

export interface ConfigGlobal {
  banners: Banner[];
  tabelaConsorcio: ConsorcioRow[];
  descricaoGlobal: string;
  motos: MotoFirebase[];
}