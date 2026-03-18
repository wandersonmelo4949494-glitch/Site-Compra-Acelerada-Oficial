import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { BikeCard } from "@/components/BikeCard";
import { BikeDetailsModal } from "@/components/BikeDetailsModal";
import { ConsorcioModal } from "@/components/ConsorcioModal";
import { FinanciamentoModal } from "@/components/FinanciamentoModal";
import { SearchBar } from "@/components/SearchBar";
import { VantagensConsorcio } from "@/components/VantagensConsorcio";
import { subscribeToConfigGlobal } from "@/services/supabase";
import { useVendedorMotos } from "@/hooks/useVendedorMotos";
import { useVendedor } from "@/hooks/useVendedor";
import { useLancamentos } from "@/hooks/useLancamentos";
import type { MotoFirebase } from "@/types/firebase";
import type { Motorcycle } from "@/data/motorcyclesData";
import type { VendedorMotoConfig } from "@/types/vendorMoto";
import { Button } from "@/components/ui/button";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

// Tipo estendido com config do vendedor
interface MotorcycleWithVendorConfig extends Motorcycle {
  vendorConfig?: VendedorMotoConfig;
}

const Index = () => {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [loadingMotos, setLoadingMotos] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBike, setSelectedBike] = useState<MotorcycleWithVendorConfig | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConsorcioModal, setShowConsorcioModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Hook para configurações do vendedor
  const { configs: vendorConfigs, loading: loadingVendor, hasConfig, getConfigForMoto } = useVendedorMotos();
  
  // Hook para dados do vendedor (inclui mostrarVantagensConsorcio)
  const { vendedor } = useVendedor();

  // Hook para lançamentos do banco de dados
  const { isLancamento } = useLancamentos();
  useEffect(() => {
    const unsubscribe = subscribeToConfigGlobal((config) => {
      if (config?.motos) {
        // Motos vêm apenas do config_global - ficha técnica agora vem da tabela ficha_tecnica_motos
        const motosConvertidas: Motorcycle[] = config.motos.map((moto, index) => {
          return {
            id: moto.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name: moto.nome,
            category: moto.categoria || "Street",
            preco: moto.preco,
            images: [
              { color: "default", url: moto.imagemPrincipal },
              ...(moto.galeria || []).map((url, i) => ({ color: `cor-${i + 1}`, url }))
            ],
            specs: {}, // Specs vazias - ficha técnica vem da tabela separada
            consorcio: {
              parcelas: (moto.consorcioPlanos || []).map(p => ({ 
                meses: p.parcelas, 
                valor: p.valor 
              })),
              creditoAdicional: moto.creditoAdicional || "10%"
            }
          };
        });
        setAllMotorcycles(motosConvertidas);
      }
      setLoadingMotos(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar motos baseado na configuração do vendedor
  const motorcycles = useMemo((): MotorcycleWithVendorConfig[] => {
    console.log('[Index] Estado atual:', { 
      loadingVendor, 
      loadingMotos, 
      hasConfig, 
      allMotorcyclesCount: allMotorcycles.length,
      vendorConfigsCount: vendorConfigs.length
    });

    // Se ainda carregando, retorna vazio
    if (loadingVendor || loadingMotos) {
      console.log('[Index] Ainda carregando...');
      return [];
    }

    // Se não há configuração no banco, não mostrar nenhuma moto
    // (regra: moto sem config não existe para o vendedor)
    if (!hasConfig) {
      console.log('[Index] Sem configuração de vendedor no banco');
      return [];
    }

    // Filtrar apenas motos que têm configuração ativa
    const filtered: MotorcycleWithVendorConfig[] = [];
    
    console.log('[Index] Motos disponíveis:', allMotorcycles.map(m => ({ id: m.id, name: m.name })));
    
    for (const moto of allMotorcycles) {
      // Tentar encontrar config pelo ID gerado ou pelo nome original
      let config = getConfigForMoto(moto.id);
      
      // Se não encontrar pelo ID, tenta pelo nome da moto
      if (!config) {
        config = getConfigForMoto(moto.name);
      }
      
      console.log('[Index] Verificando moto:', moto.name, 'id:', moto.id, 'config encontrada:', !!config, config?.ativo);
      
      if (config && config.ativo) {
        filtered.push({
          ...moto,
          vendorConfig: config,
        });
      }
    }
    
    console.log('[Index] Motos filtradas para exibição:', filtered.length);
    return filtered.sort((a, b) => (a.vendorConfig?.ordem_exibicao || 0) - (b.vendorConfig?.ordem_exibicao || 0));
  }, [allMotorcycles, vendorConfigs, loadingVendor, loadingMotos, hasConfig, getConfigForMoto]);

  const loading = loadingMotos || loadingVendor;

  const handleDetailsClick = (bike: MotorcycleWithVendorConfig) => {
    setSelectedBike(bike);
    setShowDetailsModal(true);
  };

  const handleConsorcioClick = (bike: MotorcycleWithVendorConfig) => {
    setSelectedBike(bike);
    setShowConsorcioModal(true);
  };

  const handleFinanciamentoClick = (bike: MotorcycleWithVendorConfig) => {
    setSelectedBike(bike);
    setShowContactModal(true);
  };

  // Prefixos que devem incluir categoria "Motores e Máquinas"
  const motorPrefixes = ['m', 'mo', 'mot', 'moto', 'motor', 'motores', 'máquina', 'máquinas', 'maquina', 'maquinas'];
  const searchLower = search.toLowerCase().trim();
  const shouldIncludeMotoresCategory = motorPrefixes.some(prefix => 
    searchLower === prefix || prefix.startsWith(searchLower) || searchLower.startsWith(prefix)
  );

  // Separar motos normais de Motores e Máquinas
  const filteredMotorcycles = motorcycles.filter((moto) =>
    moto.name.toLowerCase().includes(searchLower) &&
    moto.category !== "Motores e Máquinas"
  );

  const filteredMotores = motorcycles.filter((moto) =>
    moto.category === "Motores e Máquinas" &&
    (moto.name.toLowerCase().includes(searchLower) || shouldIncludeMotoresCategory)
  );

  // Verifica se existe pelo menos 1 produto que NÃO seja "Motores e Máquinas"
  const hasNonMotoresProduct = useMemo(() => {
    return motorcycles.some((moto) => moto.category !== "Motores e Máquinas");
  }, [motorcycles]);

  // Placeholder dinâmico da busca
  const searchPlaceholder = hasNonMotoresProduct ? "Pesquise sua moto" : "Pesquise seu motor";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SearchBar search={search} setSearch={setSearch} placeholder={searchPlaceholder} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow-md p-4 space-y-4">
                <div className="w-full h-48 bg-muted animate-pulse rounded" />
                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMotorcycles.length === 0 && filteredMotores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              {search 
                ? "Nenhum resultado encontrado para sua busca." 
                : !hasConfig 
                  ? "Nenhum item configurado para este vendedor."
                  : "Nenhum item disponível no momento."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Seção de Motos */}
            {filteredMotorcycles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMotorcycles.map((bike) => (
                  <BikeCard
                    key={bike.id}
                    bike={bike}
                    vendorConfig={bike.vendorConfig}
                    isLancamento={isLancamento(bike.name)}
                    onDetailsClick={handleDetailsClick}
                    onConsorcioClick={handleConsorcioClick}
                    onFinanciamentoClick={handleFinanciamentoClick}
                  />
                ))}
              </div>
            )}

            {/* Seção Vantagens do Consórcio - entre motos e motores */}
            {/* Só mostra se: 1) mostrarVantagensConsorcio === true E 2) não está pesquisando E 3) tem pelo menos 1 produto que NÃO seja "Motores e Máquinas" */}
            <VantagensConsorcio show={vendedor?.mostrarVantagensConsorcio === true && search.trim() === "" && hasNonMotoresProduct} />
            {/* Seção de Motores e Máquinas - só aparece se existir */}
            {filteredMotores.length > 0 && (
              <>
                {/* Separador */}
                <div className="flex items-center gap-4 mt-6 mb-4 md:mt-8 md:mb-6">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-gray-700 font-bold text-xl md:text-3xl tracking-wide uppercase text-center">
                    Motores e Máquinas
                  </span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Grid de Motores - idêntico ao de Motos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMotores.map((motor) => (
                    <BikeCard
                      key={motor.id}
                      bike={motor}
                      vendorConfig={motor.vendorConfig}
                      isLancamento={isLancamento(motor.name)}
                      onDetailsClick={handleDetailsClick}
                      onConsorcioClick={handleConsorcioClick}
                      onFinanciamentoClick={handleFinanciamentoClick}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {/* Espaço extra para o botão "Voltar ao topo" não cobrir o rodapé */}
        <div className="h-20 md:h-0" />
      </main>

      {/* Footer - Compra Acelerada */}
      <footer className="mt-3 md:mt-4 py-2 md:py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground text-[10px] sm:text-xs md:text-sm">
            Site Desenvolvido Por: <span className="text-[#4b4b4b] font-semibold">Compra Acelerada</span>
          </p>
          <p className="text-foreground text-[10px] sm:text-xs md:text-sm mt-0.5">
            Curtiu? Tenha o Seu -{" "}
            <a
              href="https://wa.me/5594991894540?text=Tenho%20interesse%20no%20cat%C3%A1logo%20digital%20da%20Honda!"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 font-semibold hover:underline transition-all"
            >
              Clique Aqui!
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <BikeDetailsModal
        bike={selectedBike}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onConsorcioClick={handleConsorcioClick}
      />

      <ConsorcioModal
        bike={selectedBike}
        isOpen={showConsorcioModal}
        onClose={() => setShowConsorcioModal(false)}
        parcelasBloqueadas={selectedBike?.vendorConfig?.parcelas_bloqueadas}
        tabelasConsorcio={selectedBike?.vendorConfig?.tabelas_consorcio}
      />

      <ScrollToTopButton hidden={search.trim().length > 0} />

      <FinanciamentoModal
        bike={selectedBike}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default Index;
