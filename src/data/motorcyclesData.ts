export interface Motorcycle {
  id: string;
  name: string;
  category: string;
  preco?: string;
  images: {
    color: string;
    url: string;
  }[];
  specs?: {
    tipo?: string;
    cilindrada?: string;
    potenciaMaxima?: string;
    torqueMaximo?: string;
    sistemaAlimentacao?: string;
    sistemPartida?: string;
    transmissao?: string;
    capacidadeTanque?: string;
    freios?: string;
    pesoSeco?: string;
  };
  consorcio: {
    parcelas: { meses: number; valor: number }[];
    creditoAdicional?: string;
  };
}

export const motorcycles: Motorcycle[] = [
  {
    id: "pop-110i",
    name: "POP 110i +10",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/pop110i-black.png" },
      { color: "Vermelha", url: "/bikes/pop110i-red.png" },
      { color: "Branca", url: "/bikes/pop110i-white.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "109,5 cc",
      potenciaMaxima: "8,43 cv a 7.250 rpm",
      torqueMaximo: "0,92 kgf.m a 5.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "Automática",
      capacidadeTanque: "4,2 litros",
      freios: "Tambor dianteiro e traseiro",
    },
    consorcio: {
      creditoAdicional: "10%",
      parcelas: [
        { meses: 80, valor: 207.57 },
        { meses: 60, valor: 268.84 },
        { meses: 48, valor: 331.14 },
        { meses: 36, valor: 435.31 },
        { meses: 24, valor: 646.43 },
      ],
    },
  },
  {
    id: "biz-125-es",
    name: "BIZ 125 ES",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/biz125es-black.png" },
      { color: "Vermelha", url: "/bikes/biz125es-red.png" },
      { color: "Azul", url: "/bikes/biz125es-blue.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "124,9 cc",
      potenciaMaxima: "9,2 cv a 7.500 rpm",
      torqueMaximo: "1,04 kgf.m a 5.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico e pedal",
      transmissao: "4 marchas",
      capacidadeTanque: "4,2 litros",
      freios: "Tambor dianteiro e traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 238.45 },
        { meses: 60, valor: 309.12 },
        { meses: 48, valor: 381.23 },
        { meses: 36, valor: 501.67 },
      ],
    },
  },
  {
    id: "elite-125",
    name: "ELITE 125",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/elite125-black.png" },
      { color: "Branca", url: "/bikes/elite125-white.png" },
      { color: "Vermelha", url: "/bikes/elite125-red.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "124,9 cc",
      potenciaMaxima: "9,2 cv a 7.500 rpm",
      torqueMaximo: "1,04 kgf.m a 5.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "Automática CVT",
      capacidadeTanque: "5,4 litros",
      freios: "Disco dianteiro e tambor traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 245.89 },
        { meses: 60, valor: 318.76 },
        { meses: 48, valor: 393.12 },
      ],
    },
  },
  {
    id: "biz-125-ex",
    name: "BIZ 125 EX",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/biz125ex-black.png" },
      { color: "Vermelha", url: "/bikes/biz125ex-red.png" },
      { color: "Branca", url: "/bikes/biz125ex-white.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "124,9 cc",
      potenciaMaxima: "9,2 cv a 7.500 rpm",
      torqueMaximo: "1,04 kgf.m a 5.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "4 marchas",
      capacidadeTanque: "4,2 litros",
      freios: "Disco dianteiro e tambor traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 256.34 },
        { meses: 60, valor: 332.29 },
        { meses: 48, valor: 409.78 },
      ],
    },
  },
  {
    id: "cg-160-start",
    name: "CG 160 START",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/cg160start-black.png" },
      { color: "Vermelha", url: "/bikes/cg160start-red.png" },
      { color: "Azul", url: "/bikes/cg160start-blue.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "162,7 cc",
      potenciaMaxima: "13,8 cv a 8.000 rpm",
      torqueMaximo: "1,44 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico e pedal",
      transmissao: "5 marchas",
      capacidadeTanque: "12,4 litros",
      freios: "Tambor dianteiro e traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 289.67 },
        { meses: 60, valor: 375.56 },
        { meses: 48, valor: 463.12 },
      ],
    },
  },
  {
    id: "pcx-cbs",
    name: "PCX CBS",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/pcxcbs-black.png" },
      { color: "Branca", url: "/bikes/pcxcbs-white.png" },
      { color: "Cinza", url: "/bikes/pcxcbs-gray.png" },
    ],
    specs: {
      tipo: "eSP+, Monocilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "156,9 cc",
      potenciaMaxima: "12,5 cv a 8.500 rpm",
      torqueMaximo: "1,27 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "Automática CVT",
      capacidadeTanque: "8,0 litros",
      freios: "Disco dianteiro e traseiro com CBS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 412.89 },
        { meses: 60, valor: 535.23 },
        { meses: 48, valor: 660.12 },
      ],
    },
  },
  {
    id: "cg-160-fan",
    name: "CG 160 FAN",
    category: "Street",
    images: [
      { color: "Vermelha", url: "/bikes/cg160fan-red.png" },
      { color: "Preta", url: "/bikes/cg160fan-black.png" },
      { color: "Azul", url: "/bikes/cg160fan-blue.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "162,7 cc",
      potenciaMaxima: "13,8 cv a 8.000 rpm",
      torqueMaximo: "1,44 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "5 marchas",
      capacidadeTanque: "12,4 litros",
      freios: "Disco dianteiro e tambor traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 302.45 },
        { meses: 60, valor: 392.11 },
        { meses: 48, valor: 483.56 },
      ],
    },
  },
  {
    id: "cg-160-titan",
    name: "CG 160 TITAN",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/cg160titan-black.png" },
      { color: "Vermelha", url: "/bikes/cg160titan-red.png" },
      { color: "Branca", url: "/bikes/cg160titan-white.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "162,7 cc",
      potenciaMaxima: "13,8 cv a 8.000 rpm",
      torqueMaximo: "1,44 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "5 marchas",
      capacidadeTanque: "13,6 litros",
      freios: "Disco dianteiro e tambor traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 315.78 },
        { meses: 60, valor: 409.34 },
        { meses: 48, valor: 504.89 },
      ],
    },
  },
  {
    id: "pcx-abs",
    name: "PCX ABS",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/pcxabs-black.png" },
      { color: "Branca", url: "/bikes/pcxabs-white.png" },
      { color: "Cinza", url: "/bikes/pcxabs-gray.png" },
    ],
    specs: {
      tipo: "eSP+, Monocilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "156,9 cc",
      potenciaMaxima: "12,5 cv a 8.500 rpm",
      torqueMaximo: "1,27 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "Automática CVT",
      capacidadeTanque: "8,0 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 445.67 },
        { meses: 60, valor: 577.89 },
        { meses: 48, valor: 712.34 },
      ],
    },
  },
  {
    id: "nxr-160-bros-cbs",
    name: "NXR 160 BROS CBS",
    category: "Off Road",
    images: [
      { color: "Vermelha", url: "/bikes/nxr160cbs-red.png" },
      { color: "Preta", url: "/bikes/nxr160cbs-black.png" },
      { color: "Branca", url: "/bikes/nxr160cbs-white.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "162,7 cc",
      potenciaMaxima: "14,8 cv a 8.000 rpm",
      torqueMaximo: "1,50 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "5 marchas",
      capacidadeTanque: "11,0 litros",
      freios: "Disco dianteiro e traseiro com CBS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 334.56 },
        { meses: 60, valor: 433.78 },
        { meses: 48, valor: 534.89 },
      ],
    },
  },
  {
    id: "nxr-160-bros-abs",
    name: "NXR 160 BROS ABS",
    category: "Off Road",
    images: [
      { color: "Vermelha", url: "/bikes/nxr160abs-red.png" },
      { color: "Preta", url: "/bikes/nxr160abs-black.png" },
      { color: "Branca", url: "/bikes/nxr160abs-white.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "162,7 cc",
      potenciaMaxima: "14,8 cv a 8.000 rpm",
      torqueMaximo: "1,50 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "5 marchas",
      capacidadeTanque: "11,0 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 367.23 },
        { meses: 60, valor: 476.12 },
        { meses: 48, valor: 587.45 },
      ],
    },
  },
  {
    id: "xre-190",
    name: "XRE 190",
    category: "Adventure",
    images: [
      { color: "Vermelha", url: "/bikes/xre190-red.png" },
      { color: "Preta", url: "/bikes/xre190-black.png" },
      { color: "Branca", url: "/bikes/xre190-white.png" },
    ],
    specs: {
      tipo: "OHC, Monocilíndrico, 4 tempos, arrefecido a ar",
      cilindrada: "184,4 cc",
      potenciaMaxima: "16,1 cv a 8.000 rpm",
      torqueMaximo: "1,63 kgf.m a 6.000 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "5 marchas",
      capacidadeTanque: "12,2 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 389.45 },
        { meses: 60, valor: 505.12 },
        { meses: 48, valor: 622.78 },
      ],
    },
  },
  {
    id: "cb-300f-twister-cbs",
    name: "CB 300F TWISTER CBS",
    category: "Street",
    images: [
      { color: "Vermelha", url: "/bikes/cb300fcbs-red.png" },
      { color: "Preta", url: "/bikes/cb300fcbs-black.png" },
      { color: "Branca", url: "/bikes/cb300fcbs-white.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "286,5 cc",
      potenciaMaxima: "25,5 cv a 8.500 rpm",
      torqueMaximo: "2,38 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "11,0 litros",
      freios: "Disco dianteiro e traseiro com CBS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 512.34 },
        { meses: 60, valor: 664.56 },
        { meses: 48, valor: 819.12 },
      ],
    },
  },
  {
    id: "honda-adv",
    name: "HONDA ADV",
    category: "Adventure",
    images: [
      { color: "Preta", url: "/bikes/adv-black.png" },
      { color: "Cinza", url: "/bikes/adv-gray.png" },
      { color: "Branca", url: "/bikes/adv-white.png" },
    ],
    specs: {
      tipo: "eSP+, Monocilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "156,9 cc",
      potenciaMaxima: "12,5 cv a 8.500 rpm",
      torqueMaximo: "1,27 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "Automática CVT",
      capacidadeTanque: "8,1 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 478.90 },
        { meses: 60, valor: 621.23 },
        { meses: 48, valor: 766.45 },
      ],
    },
  },
  {
    id: "cb-300f-twister-abs",
    name: "CB 300F TWISTER ABS",
    category: "Street",
    images: [
      { color: "Vermelha", url: "/bikes/cb300fabs-red.png" },
      { color: "Preta", url: "/bikes/cb300fabs-black.png" },
      { color: "Azul", url: "/bikes/cb300fabs-blue.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "286,5 cc",
      potenciaMaxima: "25,5 cv a 8.500 rpm",
      torqueMaximo: "2,38 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "11,0 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 545.67 },
        { meses: 60, valor: 707.89 },
        { meses: 48, valor: 872.34 },
      ],
    },
  },
  {
    id: "xr-300l-tornado",
    name: "XR 300L TORNADO",
    category: "Off Road",
    images: [
      { color: "Vermelha", url: "/bikes/xr300l-red.png" },
      { color: "Preta", url: "/bikes/xr300l-black.png" },
      { color: "Amarela", url: "/bikes/xr300l-yellow.png" },
    ],
    specs: {
      tipo: "DOHC, Monocilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "286,5 cc",
      potenciaMaxima: "25,6 cv a 7.250 rpm",
      torqueMaximo: "2,55 kgf.m a 5.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "11,0 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 589.23 },
        { meses: 60, valor: 764.11 },
        { meses: 48, valor: 941.67 },
      ],
    },
  },
  {
    id: "sahara-300",
    name: "SAHARA 300",
    category: "Adventure",
    images: [
      { color: "Vermelha", url: "/bikes/sahara300-red.png" },
      { color: "Preta", url: "/bikes/sahara300-black.png" },
      { color: "Branca", url: "/bikes/sahara300-white.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "286,5 cc",
      potenciaMaxima: "25,5 cv a 8.500 rpm",
      torqueMaximo: "2,38 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "16,0 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 623.45 },
        { meses: 60, valor: 808.56 },
        { meses: 48, valor: 996.78 },
      ],
    },
  },
  {
    id: "sahara-300-adv",
    name: "SAHARA 300 ADV",
    category: "Adventure",
    images: [
      { color: "Preta", url: "/bikes/sahara300adv-black.png" },
      { color: "Branca", url: "/bikes/sahara300adv-white.png" },
      { color: "Vermelha", url: "/bikes/sahara300adv-red.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "286,5 cc",
      potenciaMaxima: "25,5 cv a 8.500 rpm",
      torqueMaximo: "2,38 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "16,0 litros",
      freios: "Disco dianteiro e traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 656.78 },
        { meses: 60, valor: 851.23 },
        { meses: 48, valor: 1049.45 },
      ],
    },
  },
  {
    id: "cb-500-hornet",
    name: "CB 500 HORNET",
    category: "Street",
    images: [
      { color: "Vermelha", url: "/bikes/cb500hornet-red.png" },
      { color: "Preta", url: "/bikes/cb500hornet-black.png" },
      { color: "Branca", url: "/bikes/cb500hornet-white.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "471 cc",
      potenciaMaxima: "47,5 cv a 8.600 rpm",
      torqueMaximo: "4,38 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "15,6 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 1234.56 },
        { meses: 60, valor: 1601.23 },
        { meses: 48, valor: 1973.45 },
      ],
    },
  },
  {
    id: "nx-500",
    name: "NX 500",
    category: "Adventure",
    images: [
      { color: "Vermelha", url: "/bikes/nx500-red.png" },
      { color: "Preta", url: "/bikes/nx500-black.png" },
      { color: "Verde", url: "/bikes/nx500-green.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "471 cc",
      potenciaMaxima: "47,5 cv a 8.600 rpm",
      torqueMaximo: "4,38 kgf.m a 6.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "17,5 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 1345.67 },
        { meses: 60, valor: 1745.89 },
        { meses: 48, valor: 2152.34 },
      ],
    },
  },
  {
    id: "trx-420-fourtrax",
    name: "TRX 420 FOURTRAX FM",
    category: "Off Road",
    images: [
      { color: "Vermelha", url: "/bikes/trx420-red.png" },
      { color: "Verde", url: "/bikes/trx420-green.png" },
      { color: "Preta", url: "/bikes/trx420-black.png" },
    ],
    specs: {
      tipo: "OHV, Monocilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "420 cc",
      potenciaMaxima: "28 cv a 6.500 rpm",
      torqueMaximo: "3,5 kgf.m a 5.000 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "5 marchas + reverso",
      capacidadeTanque: "14,7 litros",
      freios: "Disco hidráulico dianteiro e traseiro",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 1789.23 },
        { meses: 60, valor: 2320.56 },
        { meses: 48, valor: 2861.12 },
      ],
    },
  },
  {
    id: "cb-750-hornet",
    name: "CB 750 HORNET",
    category: "Street",
    images: [
      { color: "Vermelha", url: "/bikes/cb750hornet-red.png" },
      { color: "Preta", url: "/bikes/cb750hornet-black.png" },
      { color: "Azul", url: "/bikes/cb750hornet-blue.png" },
    ],
    specs: {
      tipo: "DOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "755 cc",
      potenciaMaxima: "92 cv a 9.500 rpm",
      torqueMaximo: "7,7 kgf.m a 7.250 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "15,2 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 2456.78 },
        { meses: 60, valor: 3186.45 },
        { meses: 48, valor: 3928.90 },
      ],
    },
  },
  {
    id: "cb-1000r",
    name: "CB 1000R",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/cb1000r-black.png" },
      { color: "Vermelha", url: "/bikes/cb1000r-red.png" },
      { color: "Branca", url: "/bikes/cb1000r-white.png" },
    ],
    specs: {
      tipo: "DOHC, 4 cilindros em linha, 4 tempos, arrefecido a líquido",
      cilindrada: "998 cc",
      potenciaMaxima: "145 cv a 10.500 rpm",
      torqueMaximo: "10,6 kgf.m a 8.250 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "16,2 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 3567.89 },
        { meses: 60, valor: 4626.34 },
        { meses: 48, valor: 5702.45 },
      ],
    },
  },
  {
    id: "crf-1100l-africa-twin",
    name: "CRF 1100L AFRICA TWIN",
    category: "Adventure",
    images: [
      { color: "Vermelha", url: "/bikes/africatwin-red.png" },
      { color: "Preta", url: "/bikes/africatwin-black.png" },
      { color: "Azul", url: "/bikes/africatwin-blue.png" },
    ],
    specs: {
      tipo: "SOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "1084 cc",
      potenciaMaxima: "102 cv a 7.500 rpm",
      torqueMaximo: "10,5 kgf.m a 6.250 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas (DCT opcional)",
      capacidadeTanque: "24,2 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 4234.56 },
        { meses: 60, valor: 5491.23 },
        { meses: 48, valor: 6768.90 },
      ],
    },
  },
  {
    id: "nc-750x-abs",
    name: "NC 750X ABS MT",
    category: "Adventure",
    images: [
      { color: "Preta", url: "/bikes/nc750x-black.png" },
      { color: "Vermelha", url: "/bikes/nc750x-red.png" },
      { color: "Branca", url: "/bikes/nc750x-white.png" },
    ],
    specs: {
      tipo: "SOHC, Bicilíndrico, 4 tempos, arrefecido a líquido",
      cilindrada: "745 cc",
      potenciaMaxima: "58,6 cv a 6.750 rpm",
      torqueMaximo: "6,9 kgf.m a 4.750 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "14,1 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 2789.45 },
        { meses: 60, valor: 3618.23 },
        { meses: 48, valor: 4461.78 },
      ],
    },
  },
  {
    id: "cb-650r",
    name: "CB 650R",
    category: "Street",
    images: [
      { color: "Preta", url: "/bikes/cb650r-black.png" },
      { color: "Vermelha", url: "/bikes/cb650r-red.png" },
      { color: "Azul", url: "/bikes/cb650r-blue.png" },
    ],
    specs: {
      tipo: "DOHC, 4 cilindros em linha, 4 tempos, arrefecido a líquido",
      cilindrada: "649 cc",
      potenciaMaxima: "95 cv a 12.000 rpm",
      torqueMaximo: "6,5 kgf.m a 8.500 rpm",
      sistemaAlimentacao: "Injeção eletrônica PGM-FI",
      sistemPartida: "Elétrico",
      transmissao: "6 marchas",
      capacidadeTanque: "15,4 litros",
      freios: "Disco duplo dianteiro e disco traseiro com ABS",
    },
    consorcio: {
      parcelas: [
        { meses: 80, valor: 2123.45 },
        { meses: 60, valor: 2754.67 },
        { meses: 48, valor: 3396.89 },
      ],
    },
  },
];