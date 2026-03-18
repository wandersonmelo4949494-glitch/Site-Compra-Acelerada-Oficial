import { useState, useEffect, useRef } from "react";
import domtoimage from "dom-to-image-more";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import type { Motorcycle } from "@/data/motorcyclesData";
import type { ConsorcioCard } from "@/types/consorcio";
import { subscribeToConsorcio } from "@/services/consorcioService";
import { getCreditosParaMoto, type ConsorcioCredito } from "@/services/creditoService";
import { getSubdomain } from "@/utils/subdomain";
import { useVendedor } from "@/hooks/useVendedor";
import { useModalHistory } from "@/hooks/useModalHistory";

interface ConsorcioModalProps {
  bike: Motorcycle | null;
  isOpen: boolean;
  onClose: () => void;
  parcelasBloqueadas?: number[];
  tabelasConsorcio?: string[];
}

export const ConsorcioModal = ({
  bike,
  isOpen,
  onClose,
  parcelasBloqueadas = [],
  tabelasConsorcio = [],
}: ConsorcioModalProps) => {
  const [consorcioCards, setConsorcioCards] = useState<ConsorcioCard[]>([]);
  const [creditosMap, setCreditosMap] = useState<Map<string, ConsorcioCredito>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInAppWarning, setShowInAppWarning] = useState(false);
  const [showIosWarning, setShowIosWarning] = useState(false);
  const { vendedor } = useVendedor();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Hook para fechar modal com botão voltar do navegador
  useModalHistory(isOpen, onClose, 'consorcio');

  const instagramIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/instacolorido.png";
  const whatsappIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/whatscolorido.png";

  // Reset estado ao abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      setFirstImageLoaded(false);
      setCurrentImage(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!bike || !isOpen) return;
    setIsLoading(true);

    // Se não há tabelas de consórcio definidas, não busca nada
    if (!tabelasConsorcio || tabelasConsorcio.length === 0) {
      setConsorcioCards([]);
      setCreditosMap(new Map());
      setIsLoading(false);
      return;
    }

    // Buscar créditos da nova tabela consorcio_creditos
    getCreditosParaMoto(bike.name, tabelasConsorcio).then((map) => {
      setCreditosMap(map);
    });

    // Busca consórcio baseado APENAS na moto e suas tabelas (vindas de vendedor_motos)
    const unsubscribe = subscribeToConsorcio(
      bike.name,
      tabelasConsorcio,
      (cards) => {
        setConsorcioCards(cards.slice(0, 2));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bike, isOpen, tabelasConsorcio]);

  useEffect(() => {
    if (!bike?.images?.length) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev + 1 >= bike.images.length ? 0 : prev + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [bike]);

  if (!bike) return null;

  // Detecta navegador interno de redes sociais
  const isInAppBrowser = (): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    return /instagram|fbav|fban|fb_iab|messenger|twitter|tiktok|musical_ly|bytedancewebview|snapchat|linkedin|telegram|tg\//i.test(ua);
  };

  // Detecta dispositivo iOS (iPhone, iPad, iPod)
  const isIOS = (): boolean => {
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  const handlePrintModal = async () => {
    if (!modalRef.current || isSaving) return;

    if (isIOS()) {
      setShowIosWarning(true);
      return;
    }

    if (isInAppBrowser()) {
      setShowInAppWarning(true);
      return;
    }
    
    setIsSaving(true);
    
    try {
      const targetWidth = 2460;
      const targetHeight = 3055;
      const modalElement = modalRef.current;

      // Cria um clone do modal para captura
      const clone = modalElement.cloneNode(true) as HTMLElement;
      
      // Configura o clone com dimensões fixas para PC
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px'; // Largura fixa de PC
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.backgroundColor = '#ffffff';
      clone.style.setProperty('-webkit-font-smoothing', 'antialiased');
      clone.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
      
      // Adiciona ao body para renderizar
      document.body.appendChild(clone);

      // Remove botões e elementos que não devem aparecer
      const hideElements = clone.querySelectorAll('[data-html2canvas-ignore="true"], .print-hide');
      hideElements.forEach(el => el.remove());

      // Força layout PC: esconde mobile, mostra PC
      const mobileElements = clone.querySelectorAll('.md\\:hidden');
      const pcElements = clone.querySelectorAll('.hidden.md\\:flex');
      
      mobileElements.forEach(el => (el as HTMLElement).style.display = 'none');
      pcElements.forEach(el => {
        (el as HTMLElement).style.display = 'flex';
      });

      // Para animações da marca d'água
      const watermarkGrids = clone.querySelectorAll('.watermark-grid');
      watermarkGrids.forEach(el => (el as HTMLElement).style.animation = 'none');

      // REMOVE TODAS AS BORDAS, OUTLINES E SOMBRAS DE TODOS OS ELEMENTOS
      const allElements = clone.querySelectorAll('*');
      allElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // Remove bordas (exceto as tabelas que tem borda vermelha intencional)
        if (!htmlEl.classList.contains('border-red-600')) {
          htmlEl.style.border = 'none';
          htmlEl.style.borderWidth = '0';
          htmlEl.style.borderStyle = 'none';
        }
        
        // Remove outlines sempre
        htmlEl.style.outline = 'none';
        htmlEl.style.outlineWidth = '0';
        htmlEl.style.outlineStyle = 'none';
        
        // Remove box-shadow que pode criar linhas
        if (computedStyle.boxShadow !== 'none' && !htmlEl.classList.contains('shadow-xl') && !htmlEl.classList.contains('shadow-md')) {
          htmlEl.style.boxShadow = 'none';
        }
      });

      // Aguarda fontes e imagens carregarem
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 300));

      // Obtém altura real do clone após renderização
      const cloneHeight = clone.scrollHeight;
      const cloneWidth = clone.offsetWidth;

      // Captura com dom-to-image-more usando pixelRatio para qualidade
      const dataUrl = await domtoimage.toPng(clone, {
        quality: 1,
        width: cloneWidth,
        height: cloneHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        bgcolor: '#ffffff',
        cacheBust: true,
      });

      // Remove o clone
      document.body.removeChild(clone);

      // Carrega a imagem capturada
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Cria canvas final com tamanho exato
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');
      
      if (!ctx) throw new Error('Erro ao criar canvas');

      // Desativa suavização para evitar linhas brancas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fundo branco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calcula escala mantendo proporção e preenchendo sem cortar demais
      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspect > targetAspect) {
        // Imagem mais larga - ajusta pela largura
        drawWidth = targetWidth;
        drawHeight = targetWidth / imgAspect;
        offsetX = 0;
        offsetY = (targetHeight - drawHeight) / 2;
      } else {
        // Imagem mais alta - ajusta pela altura
        drawHeight = targetHeight;
        drawWidth = targetHeight * imgAspect;
        offsetX = (targetWidth - drawWidth) / 2;
        offsetY = 0;
      }

      // Desenha a imagem centralizada
      ctx.drawImage(img, Math.round(offsetX), Math.round(offsetY), Math.round(drawWidth), Math.round(drawHeight));

      // Download
      const link = document.createElement('a');
      link.download = `consorcio-${bike.name}.png`;
      link.href = finalCanvas.toDataURL('image/png', 1.0);
      link.click();
      
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (!vendedor?.whatsapp) return;
    const phone = vendedor.whatsapp.replace(/\D/g, "");
    const message = `Oi, olhei o catálogo online e quero fazer o consórcio da  ${bike.name}!`;
    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const instagramUrl = vendedor?.instagram
    ? vendedor.instagram.startsWith("http")
      ? vendedor.instagram
      : `https://instagram.com/${vendedor.instagram.replace("@", "")}`
    : null;

  // Função SOMENTE para exibição visual
  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, ""); // Remove tudo que não é dígito

    // Remove DDI se vier junto (ex: 5594...)
    let clean = digits;
    if (clean.length > 10 && clean.startsWith("55")) {
      clean = clean.slice(2); // Remove o '55'
    }

    // 10 dígitos (telefone fixo/antigo)
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }

    // 11 dígitos (celular atual)
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }

    return phone;
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{bike.name} - Consórcio</DialogTitle>
        <DialogDescription className="sr-only">Planos de consórcio para {bike.name}</DialogDescription>
        <div ref={modalRef} className="bg-white">
          {/* ===== HEADER MODERNO ===== */}
          {vendedor && (
            <div className="relative bg-[#c41212] text-white rounded-t-xl overflow-hidden">
              {/* Botão Fechar - Canto superior direito */}
              <button
                onClick={onClose}
                className="absolute top-1 right-1 z-50 w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all print-hide"
                data-html2canvas-ignore="true"
              >
                <span className="text-white text-lg font-bold">✕</span>
              </button>

              {/* Container principal do header */}
              {/* Espaçamento Reduzido: py-6 md:py-5 para py-4 md:py-3 */}
              <div className="px-4 py-4 md:px-8 md:py-3"> 
                
                {/* ===== Layout CELULAR: Horizontal alinhado à esquerda/topo (md:hidden) ===== */}
                <div className="flex items-start gap-4 md:hidden">
                  
                  {/* Lado Esquerdo: Foto do Vendedor com Logo (alinhada à esquerda) */}
                  {/* ADICIONADO mt-1 para descer a foto um pouco */}
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
                            /* Ajuste da Foto: w-24 h-24 para w-28 h-28 */
                          src={vendedor.fotoPerfilUrl}
                          alt={vendedor.nome}
                          className="w-28 h-28 rounded-xl object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Nome + Botões (alinhado à direita da foto) */}
                  <div className="flex-1 flex flex-col gap-2">
                    
                    {/* Nome (Mantido 2xl para não diminuir) */}
                    <div className="text-left">
                      <h2 className="text-2xl font-display font-bold tracking-wide">
                        {vendedor.nome}
                      </h2>
                    </div>

                    {/* Botões WhatsApp e Instagram lado a lado */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {vendedor.whatsapp && (
                        <button
                          onClick={handleWhatsApp}
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

                    {/* Botão Salvar - Abaixo dos outros botões (só no mobile, visível aqui) */}
                    <Button
                      onClick={handlePrintModal}
                      disabled={isSaving}
                      className="mt-1 flex items-center gap-2 bg-transparent border border-white/40 text-white hover:bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all print-hide self-start disabled:opacity-50"
                      data-html2canvas-ignore="true"
                    >
                      {isSaving ? '⏳ Salvando...' : '📸 Salvar imagem'}
                    </Button>
                  </div>
                </div>

                {/* ===== Layout PC/TABLET: Horizontal (Modificado o nome) ===== */}
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
                      {/* Aumentado o tamanho do nome para 3xl */}
                      <h2 className="text-3xl font-display font-bold tracking-wide">
                        {vendedor.nome}
                      </h2>
                      <p className="text-white/90 text-sm">Realize Seu Sonho Agora, Faça Seu Consórcio Comigo!</p>
                    </div>

                    {/* Botões WhatsApp, Instagram e Salvar imagem em linha - sempre visíveis */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {vendedor.whatsapp && (
                        <button
                          onClick={handleWhatsApp}
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

                    {/* Botão Salvar - ao lado do Instagram (PC/Tablet) */}
                      <Button
                        onClick={handlePrintModal}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-transparent border border-white/40 text-white hover:bg-white/10 px-4 py-2 rounded-full text-sm font-semibold transition-all print-hide disabled:opacity-50"
                        data-html2canvas-ignore="true"
                      >
                        {isSaving ? '⏳ Salvando...' : '📸 Salvar imagem'}
                      </Button>
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

          {/* ===== TÍTULO (MODIFICADO COM QUEBRA DE LINHA NO MOBILE) ===== */}
          <DialogHeader>
              {/* Espaçamento Reduzido: mt-6 para mt-4 */}
            <DialogTitle className="text-2xl md:text-3xl font-display font-bold tracking-wide text-center mt-4">
              {/* Usa 'block' no mobile e 'inline' no desktop (md:inline) para forçar a quebra */}
              <span className="block md:inline">Planos de Consórcio -</span> {bike.name}
            </DialogTitle>
          </DialogHeader>

          {/* ===== IMAGEM ===== */}
          {/* Espaçamento Reduzido: my-6 para my-4 */}
          <div className="my-4 flex justify-center items-center min-h-[200px]">
            {!firstImageLoaded && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Carregando imagem, aguarde...</p>
              </div>
            )}
            <img
              src={bike.images[currentImage]?.url}
              alt={bike.name}
              className={`w-full max-w-xl object-contain ${!firstImageLoaded ? 'hidden' : ''}`}
              onLoad={() => {
                if (!firstImageLoaded) setFirstImageLoaded(true);
              }}
            />
          </div>

          {/* ===== VALOR DO CRÉDITO (para motos normais, não Pop 110i ES) ===== */}
          {vendedor?.mostrarValorCredito && bike.name !== "Pop 110i ES" && (() => {
            // Buscar crédito da primeira tabela disponível
            const primeiraTabela = tabelasConsorcio[0];
            const credito = primeiraTabela ? creditosMap.get(primeiraTabela) : null;
            if (!credito) return null;
            return (
              <div className="text-center mb-4">
                <span className="text-sm text-gray-600">Valor do Crédito:</span>
                <span className="ml-2 text-xl font-bold text-red-600">
                  {Number(credito.credito_vista).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            );
          })()}

          {/* ===== TABELAS - Sem espaços laterais externos, padding interno no celular ===== */}
          {!isLoading && consorcioCards.length > 0 && (() => {
            // Lógica especial APENAS para Pop 110i ES
            const isPop110iES = bike.name === "Pop 110i ES";
            
            return (
              <div
                className={`grid gap-2 sm:gap-4 md:gap-6 justify-center ${
                  consorcioCards.length === 1
                    ? "grid-cols-1 max-w-xl mx-auto"
                    : "grid-cols-2"
                }`}
              >
                {consorcioCards.map((card, cardIndex) => {
                  // Buscar crédito correspondente a esta tabela
                  const creditoCard = creditosMap.get(card.tabelaId);
                  
                  // Para Pop 110i ES: Tabela 1 usa credito_vista, Tabela 2 usa credito_prazo
                  const creditoParaExibir = isPop110iES && creditoCard
                    ? (cardIndex === 0 
                        ? Number(creditoCard.credito_vista).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : creditoCard.credito_prazo 
                          ? Number(creditoCard.credito_prazo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : null)
                    : null;
                  const isTabela2 = cardIndex === 1;
                  
                    return (
                    <div key={card.tabelaId} className="flex flex-col h-full">
                      {/* Container para Pop 110i ES - mostra frase SEMPRE, crédito só se mostrarValorCredito = true */}
                      {isPop110iES && (
                        <div className="flex flex-col justify-end" style={{ minHeight: isTabela2 ? '48px' : '48px' }}>
                          {/* Crédito exclusivo para Pop 110i ES - SÓ aparece se mostrarValorCredito = true */}
                          {vendedor?.mostrarValorCredito && creditoParaExibir && (
                            <div className="text-center mb-1">
                              <span className="text-[9px] sm:text-xs text-gray-600 block sm:inline">Crédito:</span>
                              <span className="ml-0 sm:ml-1 text-[11px] sm:text-base md:text-lg font-bold text-red-600 whitespace-nowrap">{creditoParaExibir}</span>
                            </div>
                          )}
                          
                          {/* Texto especial APENAS para Tabela 2 da Pop 110i ES - SEMPRE aparece, independente de mostrarValorCredito */}
                          {isTabela2 && (
                            <p className="text-[8px] sm:text-[10px] text-gray-600 text-center mb-1 font-bold leading-tight max-w-full px-0.5" style={{ lineHeight: '1.15' }}>
                              OPÇÃO COM 10% DE CRÉDITO<br className="sm:hidden" /> EXTRA NO CONSÓRCIO
                            </p>
                          )}
                          
                          {/* Placeholder para Tabela 1 manter mesmo espaço que Tabela 2 */}
                          {!isTabela2 && (
                            <div style={{ height: '20px' }}></div>
                          )}
                        </div>
                      )}
                      
                      <div className="relative border border-red-600 rounded-lg overflow-hidden shadow-md bg-white flex-1">
                        {vendedor?.nome && (
                          <div className="absolute inset-0 z-40 pointer-events-none">
                            <div className="watermark-grid">
                              {Array.from({ length: 60 }).map((_, i) => (
                                <span key={i} className="watermark-text">
                                  {vendedor.nome}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="relative z-10">
                          <div className="bg-red-600 text-white text-center py-1.5 sm:py-2 md:py-3 font-semibold text-xs sm:text-sm md:text-base">
                            {card.fraseExibicao}
                          </div>

                          <div className="grid grid-cols-2 bg-red-50 px-3 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-red-700">
                            <span className="text-center">Parcelas</span>
                            <span className="text-center">Valor</span>
                          </div>

                          <RadioGroup>
                            {card.parcelas
                              .filter((parcela) => !parcelasBloqueadas.includes(parcela.meses))
                              .map((parcela, index) => (
                              <div
                                key={index}
                                className={`grid grid-cols-2 items-center px-3 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-3 transition-colors duration-150 cursor-default ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-red-100`}
                              >
                                <div className="text-center text-xs sm:text-sm md:text-lg font-semibold">
                                  {parcela.meses}x
                                </div>
                                <div className="text-center text-sm sm:text-base md:text-xl font-bold text-red-600">
                                  {Number(parcela.valor).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ===== LETRAS MIÚDAS (NOVO TRECHO) ===== */}
          {/* Espaçamento Mantido, mas otimizado para não criar quebra desnecessária */}
          {!isLoading && consorcioCards.length > 0 && (
            <div className="mt-4 px-4">
              <p className="text-xs text-gray-500 text-center">
                *As demais parcelas estão sujeitas a alterações!
              </p>
            </div>
          )}

          {/* ===== BOTÕES FINAIS ===== */}
          {/* Espaçamento Reduzido: mt-8 para mt-6 */}
          <div className="space-y-3 mt-6 px-4 pb-6">
            <Button
              onClick={handleWhatsApp}
              // CLASSE ALTERADA: Adicionado 'text-lg font-bold' para aumentar e negritar o texto
              // CLASSE ALTERADA: Alterado o tamanho do ícone com 'w-6 h-6'
              className="w-full bg-whatsapp-green text-white rounded-full py-6 text-lg font-bold"
            >
              {/* ALTERADO: w-5 h-5 para w-6 h-6 */}
              <img src={whatsappIcon} className="w-6 h-6 mr-2" alt="Ícone WhatsApp" />
              {/* TEXTO ALTERADO: De 'Falar no WhatsApp' para 'Fale comigo no WhatsApp!' */}
              Fale comigo no WhatsApp!
            </Button>

            {/* O BOTÃO. */}
          </div>

          {/* ===== CSS MARCA D'ÁGUA ===== */}
          <style>{`
            .watermark-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); /* MAIS COLUNAS */
              grid-auto-rows: 22px; /* MAIS LINHAS */
              gap: 20px; /* MAIS DENSIDADE */
              padding: 16px;
              animation: watermarkMove 18s linear infinite;
            }

            .watermark-text {
              font-size: 11px;
              font-weight: 600;
              color: black;
              opacity: 0.08;
              text-align: center;
              white-space: nowrap;
              transform: rotate(-18deg); /* INCLINAÇÃO PROFISSIONAL */
            }

            @keyframes watermarkMove {
              0% { transform: translateX(0); }
              50% { transform: translateX(16px); }
              100% { transform: translateX(0); }
            }
          `}</style>

        </div>
      </DialogContent>
    </Dialog>

    {/* Aviso para navegador interno de rede social */}
    <Dialog open={showInAppWarning} onOpenChange={setShowInAppWarning}>
      <DialogContent className="max-w-sm text-center">
        <DialogTitle className="sr-only">Aviso</DialogTitle>
        <DialogDescription className="sr-only">Abra no navegador para baixar</DialogDescription>
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-4xl">⚠️</span>
          <p className="text-base font-semibold text-foreground">
            Você abriu o site por uma rede social.
          </p>
          <p className="text-sm text-muted-foreground">
            Para baixar a imagem, abra o site no navegador do celular (de preferência no Google Chrome).
          </p>
          <Button
            onClick={() => {
              const url = window.location.href;
              window.open(`googlechrome://navigate?url=${encodeURIComponent(url)}`, '_self');
              setTimeout(() => {
                window.open(`intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`, '_self');
              }, 500);
            }}
            className="mt-2 w-full"
          >
            Abrir no Google Chrome
          </Button>
          <Button variant="ghost" onClick={() => setShowInAppWarning(false)} className="w-full text-sm">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    {/* Aviso para dispositivos iOS */}
    <Dialog open={showIosWarning} onOpenChange={setShowIosWarning}>
      <DialogContent className="max-w-sm text-center">
        <DialogTitle className="sr-only">Aviso</DialogTitle>
        <DialogDescription className="sr-only">Download indisponível no iOS</DialogDescription>
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-4xl">⚠️</span>
          <p className="text-base font-semibold text-foreground">
            Vimos que você está acessando pelo iPhone (iOS).
          </p>
          <p className="text-sm text-muted-foreground">
            A função de baixar imagens está disponível apenas para PC (Windows) ou celulares Android. Acesse este site por um desses dispositivos para baixar as imagens.
          </p>
          <Button variant="ghost" onClick={() => setShowIosWarning(false)} className="w-full text-sm">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
