import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Motorcycle } from "@/data/motorcyclesData";
import type { VendedorMotoConfig } from "@/types/vendorMoto";

interface BikeCardProps {
  bike: Motorcycle;
  vendorConfig?: VendedorMotoConfig;
  isLancamento?: boolean;
  onDetailsClick: (bike: Motorcycle) => void;
  onConsorcioClick: (bike: Motorcycle) => void;
  onFinanciamentoClick: (bike: Motorcycle) => void;
}

export const BikeCard = ({
  bike,
  vendorConfig,
  isLancamento = false,
  onDetailsClick,
  onConsorcioClick,
  onFinanciamentoClick,
}: BikeCardProps) => {
  
  const iconDetalhes =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/icone---Detalhes.png";
  const iconConsorcio =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/icone-de-consorcio.png";
  const iconFinanciamento =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/icone-financiamento.png";

  // Determinar quais botões mostrar (se não há config, mostra todos - fallback)
  const showInformacoes = vendorConfig?.mostrar_informacoes ?? true;
  const showConsorcio = vendorConfig?.mostrar_consorcio ?? true;
  const showFinanciamento = vendorConfig?.mostrar_financiamento ?? true;

  return (
    <div className="flex flex-col items-center text-center group">
      {/* Imagem do produto - foco principal */}
      <div className="w-full mb-3 relative">
        {/* Tag LANÇAMENTO - só aparece se isLancamento for true */}
        {isLancamento && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wide transition-transform duration-300 group-hover:scale-105">
            Lançamento
          </span>
        )}
        <img
          src={bike.images[0]?.url}
          alt={bike.name}
          className="w-full h-[200px] sm:h-[220px] object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/300x200?text=Moto";
          }}
        />
      </div>

      {/* Nome do produto (AUMENTADO) */}
      <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-foreground mb-1">
        {bike.name}
      </h3>

      {/* Categoria (AUMENTADA) */}
      <span className="text-sm text-muted-foreground mb-3">
        {bike.category}
      </span>

      {/* Botões de ação - centralizados */}
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {showInformacoes && (
          <Button
            onClick={() => onDetailsClick(bike)}
            variant="detalhes"
            className="w-full font-semibold flex items-center p-0 h-10 rounded-full overflow-hidden"
          >
            <span className="bg-black/25 w-10 h-full flex items-center justify-center">
              <img src={iconDetalhes} alt="Detalhes" className="w-5 h-5" />
            </span>
            <span className="flex-1 text-center text-sm">
              Informações
            </span>
          </Button>
        )}

        {showConsorcio && (
          <Button
            onClick={() => onConsorcioClick(bike)}
            variant="consorcio"
            className="w-full font-semibold flex items-center p-0 h-10 rounded-full overflow-hidden"
          >
            <span className="bg-black/25 w-10 h-full flex items-center justify-center">
              <img src={iconConsorcio} alt="Consórcio" className="w-6 h-6" />
            </span>
            <span className="flex-1 text-center text-sm">
              Consórcio
            </span>
          </Button>
        )}

        {showFinanciamento && (
          <Button
            onClick={() => onFinanciamentoClick(bike)}
            variant="financiamento"
            className="w-full font-semibold flex items-center p-0 h-10 rounded-full overflow-hidden"
          >
            <span className="bg-black/25 w-10 h-full flex items-center justify-center">
              <img
                src={iconFinanciamento}
                alt="Financiamento"
                className="w-6 h-6"
              />
            </span>
            <span className="flex-1 text-center text-sm">
              Financiamento
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};