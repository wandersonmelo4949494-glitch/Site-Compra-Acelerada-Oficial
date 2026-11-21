import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToConfigGlobal } from "@/services/supabase";
import type { Banner } from "@/types/firebase";
import { useVendedor } from "@/hooks/useVendedor";

export const Header = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const { vendedor } = useVendedor();

  // Touch/Swipe state para mobile e tablet
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const instagramIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/insta.png";
  const whatsappIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/whats.png";

  useEffect(() => {
    const unsubscribeConfig = subscribeToConfigGlobal((config) => {
      if (config?.banners) setBanners(config.banners);
    });
    return () => unsubscribeConfig();
  }, []);

  // Handlers para swipe (mobile/tablet apenas)
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

    if (isLeftSwipe && banners.length > 0) {
      // Swipe para esquerda → próximo banner
      setCurrentBanner((prev) => (prev + 1) % banners.length);
      setAutoplayKey((prev) => prev + 1);
    } else if (isRightSwipe && banners.length > 0) {
      // Swipe para direita → banner anterior
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      setAutoplayKey((prev) => prev + 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length, autoplayKey]);

  const handleWhatsApp = () => {
    if (vendedor?.whatsapp) {
      const phone = vendedor.whatsapp.replace(/\D/g, "");
      window.open(
        `https://wa.me/55${phone}?text=Oi! Olhei O Catálogo Online E Quero Saber Mais Sobre As Motos Honda!`,
        "_blank"
      );
    }
  };

  const handleInstagram = () => {
    if (vendedor?.instagram) {
      const username = vendedor.instagram.replace("@", "");
      window.open(`https://instagram.com/${username}`, "_blank");
    }
  };

  if (!vendedor) {
    return (
      <header className="relative w-full">
        <div className="w-full h-64 md:h-80 lg:h-96 bg-muted animate-pulse" />
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="w-20 aspect-square rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-64 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative w-full">
      {banners.length > 0 && (
        <div className="relative w-full h-44 min-[481px]:h-64 md:h-80 lg:h-96 overflow-hidden">
          {/* Banners - clique avança (sempre) + swipe (mobile/tablet) */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              setCurrentBanner((prev) => (prev + 1) % banners.length);
              setAutoplayKey((prev) => prev + 1);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBanner ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={banner.imagem}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Indicadores (bolinhas) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentBanner(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentBanner
                    ? "bg-white scale-110 shadow-lg"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#c41212] shadow-sm">
        <div className="container mx-auto px-4 py-6 lg:py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* FOTO DO VENDEDOR — maior no celular */}
                <img
                  src={vendedor.fotoPerfilUrl}
                  alt={vendedor.nome}
                  className="w-44 md:w-44 aspect-square object-cover border-4 border-white rounded-lg shadow-xl"
                />

                {vendedor.logoUrl && (
                  <div className="absolute -top-2 -right-2 w-12 md:w-14 aspect-square rounded-full shadow-xl overflow-hidden">
                    <img
                      src={vendedor.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {vendedor.nome}
                </h1>
                <p className="text-sm md:text-base text-white/90">
                  Realize Agora O Sonho Da Sua Honda — Fale Comigo!
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <Button
                onClick={handleWhatsApp}
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-full px-6 flex items-center gap-2 animate-pulse-soft"
              >
                <img src={whatsappIcon} className="w-5 h-5" />
                WhatsApp
              </Button>

              <Button
                onClick={handleInstagram}
                className="text-white font-semibold rounded-full px-6 flex items-center gap-2 animate-pulse-soft"
                style={{
                  background:
                    "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
                }}
              >
                <img src={instagramIcon} className="w-5 h-5" />
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
