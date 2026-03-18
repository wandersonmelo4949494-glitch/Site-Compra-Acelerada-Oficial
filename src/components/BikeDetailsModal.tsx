import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Motorcycle } from "@/data/motorcyclesData";
import { useVendedor } from "@/hooks/useVendedor";
import { useFichaTecnica } from "@/hooks/useFichaTecnica";
import { FichaTecnicaSection } from "@/components/FichaTecnicaSection";
import { useModalHistory } from "@/hooks/useModalHistory";

interface BikeDetailsModalProps {
  bike: Motorcycle | null;
  isOpen: boolean;
  onClose: () => void;
  onConsorcioClick: (bike: Motorcycle) => void;
}

export const BikeDetailsModal = ({
  bike,
  isOpen,
  onClose,
  onConsorcioClick,
}: BikeDetailsModalProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const { vendedor } = useVendedor();
  const { fichaTecnica, loading: fichaTecnicaLoading } = useFichaTecnica(bike?.name);
  
  // Hook para fechar modal com botão voltar do navegador
  useModalHistory(isOpen, onClose, 'bike-details');

  // Touch/Swipe state para mobile e tablet (imagem principal)
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const instagramIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/instacolorido.png";
  const whatsappIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/whatscolorido.png";

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    let clean = digits;
    if (clean.length > 10 && clean.startsWith("55")) {
      clean = clean.slice(2);
    }
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    return phone;
  };

  // Autoplay - troca automática a cada 10 segundos
  const [autoplayKey, setAutoplayKey] = useState(0);

  const goToNextImage = useCallback(() => {
    if (bike) {
      setSelectedImage((prev) => (prev + 1) % bike.images.length);
    }
  }, [bike]);

  const goToPrevImage = useCallback(() => {
    if (bike) {
      setSelectedImage((prev) => (prev - 1 + bike.images.length) % bike.images.length);
    }
  }, [bike]);

  // Reset autoplay timer quando usuário interage
  const resetAutoplay = useCallback(() => {
    setAutoplayKey((prev) => prev + 1);
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (!isOpen || !bike) return;

    const timer = setTimeout(() => {
      goToNextImage();
    }, 10000);

    return () => clearTimeout(timer);
  }, [isOpen, bike, selectedImage, autoplayKey, goToNextImage]);

  // Reset selectedImage quando modal abre
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(0);
      setAutoplayKey(0);
    }
  }, [isOpen]);

  if (!bike || !bike.images || bike.images.length === 0) return null;

  // Garantir que selectedImage nunca ultrapasse o array de imagens
  const safeSelectedImage = Math.min(selectedImage, bike.images.length - 1);
  const currentImage = bike.images[safeSelectedImage];

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
    resetAutoplay();
  };

  const handlePrevClick = () => {
    goToPrevImage();
    resetAutoplay();
  };

  const handleNextClick = () => {
    goToNextImage();
    resetAutoplay();
  };

  const handleWhatsAppDirect = () => {
    if (vendedor?.whatsapp) {
      const phone = vendedor.whatsapp.replace(/\D/g, "");
      const message = `Oi, olhei o catálogo online e tenho interesse na ${bike.name}!`;
      window.open(
        `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }
  };

  // Handlers para swipe na imagem principal (mobile/tablet apenas)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe para esquerda → próxima imagem
      goToNextImage();
      resetAutoplay();
    } else if (isRightSwipe) {
      // Swipe para direita → imagem anterior
      goToPrevImage();
      resetAutoplay();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const instagramUrl = vendedor?.instagram
    ? vendedor.instagram.startsWith("http")
      ? vendedor.instagram
      : `https://instagram.com/${vendedor.instagram.replace("@", "")}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{bike.name} - Detalhes</DialogTitle>
        <DialogDescription className="sr-only">Informações detalhadas sobre {bike.name}</DialogDescription>
        {/* ===== BARRA VERMELHA DO VENDEDOR - Igual ao ConsorcioModal ===== */}
        {vendedor && (
          <div className="relative bg-[#c41212] text-white rounded-t-xl overflow-hidden">
            {/* Botão Fechar - Canto superior direito */}
            <button
              onClick={onClose}
              className="absolute top-1 right-1 z-50 w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            >
              <span className="text-white text-lg font-bold">✕</span>
            </button>

            {/* Container principal do header */}
            <div className="px-4 py-4 md:px-8 md:py-3">
              
              {/* ===== Layout CELULAR: Horizontal alinhado à esquerda/topo (md:hidden) ===== */}
              <div className="flex items-start gap-4 md:hidden">
                
                {/* Lado Esquerdo: Foto do Vendedor com Logo */}
                <div className="flex-shrink-0 mt-1">
                  <div className="relative">
                    {vendedor.logoUrl && (
                      <div className="absolute -top-2 -right-2 w-12 md:w-14 aspect-square rounded-full shadow-xl overflow-hidden z-10">
                        <img
                          src={vendedor.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="bg-white p-1 rounded-2xl shadow-xl">
                      <img
                        src={vendedor.fotoPerfilUrl}
                        alt={vendedor.nome}
                        className="w-28 h-28 rounded-xl object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Nome + Botões */}
                <div className="flex-1 flex flex-col gap-2">
                  
                  {/* Nome */}
                  <div className="text-left">
                    <h2 className="text-2xl font-display font-bold tracking-wide">
                      {vendedor.nome}
                    </h2>
                  </div>

                  {/* Botões WhatsApp e Instagram lado a lado */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {vendedor.whatsapp && (
                      <button
                        onClick={handleWhatsAppDirect}
                        className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-gray-50 transition-all"
                      >
                        <img src={whatsappIcon} className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
                        <span className="whitespace-nowrap">{formatPhoneDisplay(vendedor.whatsapp)}</span>
                      </button>
                    )}

                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-gray-50 transition-all max-w-full overflow-hidden"
                      >
                        <img src={instagramIcon} className="w-4 h-4 flex-shrink-0" alt="Instagram" />
                        <span className="truncate max-w-[140px]">@{vendedor.instagram.replace("@", "")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== Layout PC/TABLET: Horizontal ===== */}
              <div className="hidden md:flex items-center justify-between gap-6">
                {/* Lado esquerdo: Foto com moldura branca */}
                <div className="flex-shrink-0">
                  <div className="bg-white p-1 rounded-2xl shadow-xl">
                    <img
                      src={vendedor.fotoPerfilUrl}
                      alt={vendedor.nome}
                      className="w-28 h-28 lg:w-32 lg:h-32 rounded-xl object-cover"
                    />
                  </div>
                </div>

                {/* Centro: Nome + Consultor + Botões */}
                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <h2 className="text-3xl font-display font-bold tracking-wide">
                      {vendedor.nome}
                    </h2>
                    <p className="text-white/90 text-sm">Realize Seu Sonho Agora — Fale Comigo!</p>
                  </div>

                  {/* Botões WhatsApp e Instagram em linha */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {vendedor.whatsapp && (
                      <button
                        onClick={handleWhatsAppDirect}
                        className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
                      >
                        <img src={whatsappIcon} className="w-5 h-5 flex-shrink-0" alt="WhatsApp" />
                        <span className="whitespace-nowrap">{formatPhoneDisplay(vendedor.whatsapp)}</span>
                      </button>
                    )}

                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
                      >
                        <img src={instagramIcon} className="w-5 h-5 flex-shrink-0" alt="Instagram" />
                        <span className="whitespace-nowrap">@{vendedor.instagram.replace("@", "")}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Lado direito: Logo em card branco */}
                {vendedor.logoUrl && (
                  <div className="flex-shrink-0 bg-white rounded-xl p-2 shadow-xl mt-4 overflow-hidden">
                    <img
                      src={vendedor.logoUrl}
                      alt="Logo Concessionária"
                      className="w-16 h-16 lg:w-20 lg:h-20 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo interno do modal */}
        <div className="p-4 md:p-6 bg-white">
          
          {/* ===== TÍTULO GALERIA DE FOTOS ===== */}
          <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-foreground mb-4 text-center">
            Galeria De Fotos - {bike.name}
          </h3>

          {/* ===== NOVA GALERIA DE FOTOS - Layout profissional ===== */}
          {/* PC/Tablet: Imagem principal à esquerda + miniaturas à direita */}
          <div className="hidden md:grid md:grid-cols-[1fr_auto] gap-4 items-center">
            {/* Imagem Principal */}
            <div className="relative bg-white rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
              <img
                src={currentImage?.url}
                alt={`${bike.name} - ${currentImage?.color || ''}`}
                className="w-full h-full object-contain max-h-[400px] cursor-pointer"
                onClick={handleNextClick}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Moto";
                }}
              />
              
              {/* Setas de navegação sobre a imagem principal */}
              <button
                onClick={handlePrevClick}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Coluna de Miniaturas com setas - centralizada verticalmente */}
            <div className="flex flex-col items-center gap-2 justify-center">
              {/* Seta para cima */}
              <button
                onClick={handlePrevClick}
                className="w-full py-1 bg-honda-red hover:bg-red-700 rounded-lg flex items-center justify-center transition-all"
              >
                <ChevronUp className="w-5 h-5 text-white" />
              </button>

              {/* Miniaturas empilhadas verticalmente */}
              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto scrollbar-hide">
                {bike.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      safeSelectedImage === index
                        ? "border-honda-red ring-2 ring-honda-red/30"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.color}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/80?text=Moto";
                      }}
                    />
                    {/* Overlay escurecimento para não selecionados */}
                    {safeSelectedImage !== index && (
                      <div className="absolute inset-0 bg-black/30" />
                    )}
                  </button>
                ))}
              </div>

              {/* Seta para baixo */}
              <button
                onClick={handleNextClick}
                className="w-full py-1 bg-honda-red hover:bg-red-700 rounded-lg flex items-center justify-center transition-all"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* ===== GALERIA MOBILE ===== */}
          <div className="md:hidden">
            {/* Imagem Principal Mobile - COM swipe + clique */}
            <div 
              className="relative bg-white rounded-xl overflow-hidden flex items-center justify-center min-h-[250px]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={currentImage?.url}
                alt={`${bike.name} - ${currentImage?.color || ''}`}
                className="w-full h-full object-contain max-h-[300px] cursor-pointer"
                onClick={handleNextClick}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Moto";
                }}
              />
            </div>

            {/* Miniaturas Mobile - Horizontal com setas vermelhas - centralizadas */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={handlePrevClick}
                className="flex-shrink-0 w-8 h-8 bg-honda-red hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 justify-center">
                {bike.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      safeSelectedImage === index
                        ? "border-honda-red ring-2 ring-honda-red/30"
                        : "border-transparent opacity-50"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.color}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/80?text=Moto";
                      }}
                    />
                    {safeSelectedImage !== index && (
                      <div className="absolute inset-0 bg-black/30" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextClick}
                className="flex-shrink-0 w-8 h-8 bg-honda-red hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* ===== NOVA FICHA TÉCNICA - Dados da tabela ficha_tecnica_motos ===== */}
          <FichaTecnicaSection 
            fichaTecnica={fichaTecnica} 
            loading={fichaTecnicaLoading} 
          />

          {/* ===== BOTÃO WHATSAPP NO RODAPÉ - Igual ao ConsorcioModal ===== */}
          <div className="mt-6">
            <Button
              onClick={handleWhatsAppDirect}
              className="w-full bg-whatsapp-green text-white rounded-full py-6 text-lg font-bold"
            >
              <img src={whatsappIcon} className="w-6 h-6 mr-2" alt="Ícone WhatsApp" />
              Fale comigo no WhatsApp!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
