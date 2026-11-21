import { useMemo } from "react";

const vantagens = [
 "Mais Chances De Contemplação",
"Parcelas Que Cabem No Bolso",
"3 Anos De Garantia Honda",
"Grupos Exclusivos",
"Planos Sem Juros",
"É Fácil, Rápido E Funciona",
"Aquisição Planejada",
"Assembleias Mensais",
"Válido Para Todo O Brasil",
];

interface VantagensConsorcioProps {
  show?: boolean;
}

export const VantagensConsorcio = ({ show = true }: VantagensConsorcioProps) => {
  // Duplicar vantagens para loop perfeito
  const duplicatedVantagens = useMemo(
    () => [...vantagens, ...vantagens],
    []
  );

  if (!show) return null;

  return (
    <section className="py-4 md:py-6 overflow-hidden">
      <div className="container mx-auto px-4 mb-3 md:mb-4">
        <h2 className="text-center text-lg md:text-2xl font-bold text-foreground">
          Vantagens Do Consórcio{" "}
          <span className="text-[#c40000]">- Moto 0km!</span>
        </h2>
      </div>

      {/* Container do marquee */}
      <div className="relative overflow-hidden">
        {/* Fade esquerdo */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

        {/* Fade direito */}
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Marquee contínuo */}
        <div
          className="flex w-max"
          style={{
            animation: "marquee-linear 25s linear infinite",
          }}
        >
          {duplicatedVantagens.map((vantagem, index) => (
            <div key={index} className="flex-shrink-0 mx-2 md:mx-3">
              <div className="px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-[#c40000] bg-white/90 shadow-md whitespace-nowrap">
                <span className="text-xs md:text-sm font-medium text-foreground">
                  {vantagem}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes inline (garante que não “trava”) */}
      <style>
        {`
          @keyframes marquee-linear {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </section>
  );
};
