import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
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
  const savingRef = useRef(false);
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
        setConsorcioCards(cards);
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

  // Detecta dispositivo iOS (iPhone, iPad, iPod), incluindo iPadOS em modo
  // desktop, que se identifica como Macintosh com múltiplos pontos de toque.
  const isIOS = (): boolean => {
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua) || ((navigator.platform === 'MacIntel' || /Macintosh/i.test(ua)) && navigator.maxTouchPoints > 1);
  };

  const handlePrintModal = async () => {
    if (!modalRef.current || isSaving || savingRef.current) return;
    const ios = isIOS();
    const androidPhone = /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent);
    const ipad = /iPad/i.test(navigator.userAgent) ||
      ((navigator.platform === 'MacIntel' || /Macintosh/i.test(navigator.userAgent)) && navigator.maxTouchPoints > 1);
    // All bitmaps stay local; source images retain their original URLs on iOS.
    const localImages = new Map<string, string>();
    let captureCanvas: HTMLCanvasElement | null = null;
    let finalCanvas: HTMLCanvasElement | null = null;
    // iPad WebKit may leave font/decode/toBlob promises pending indefinitely.
    const ipadWait = async <T,>(operation: Promise<T>): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([operation, new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Não foi possível concluir a imagem no iPad. Tente novamente.')), 30000);
        })]);
      } finally { if (timer !== undefined) clearTimeout(timer); }
    };

    if (!ios && isInAppBrowser()) {
      setShowInAppWarning(true);
      return;
    }
    
    savingRef.current = true;
    setIsSaving(true);
    // Reserve a fallback while the original tap still has Safari user activation.
    const preview = ios ? window.open('about:blank', '_blank') : null;
    if (preview) {
      preview.opener = null;
      preview.document.title = 'Gerando imagem do consórcio';
      preview.document.body.textContent = 'Gerando imagem…';
    }
    let exportClone: HTMLElement | null = null;
    let androidViewport: HTMLIFrameElement | null = null;
    let iosCanvas: HTMLCanvasElement | null = null;
    let iosFinalCanvas: HTMLCanvasElement | null = null;
    
    try {
      const targetWidth = 2460;
      const targetHeight = 3055;
      const modalElement = modalRef.current;
      // A captura usa a cor de fundo real do modal, nunca um branco fixo.
      const modalBg = window.getComputedStyle(modalElement).backgroundColor || '#ffffff';

      // Cria um clone do modal para captura
      let clone = modalElement.cloneNode(true) as HTMLElement;
      exportClone = clone;
      
      // Configura o clone com dimensões fixas para PC
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px'; // Largura fixa de PC
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.backgroundColor = modalBg;
      // O próprio clone não é coberto pela limpeza dos descendentes.
      clone.style.border = 'none';
      clone.style.outline = 'none';
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.setProperty('-webkit-font-smoothing', 'antialiased');
      clone.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
      
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

      // Capture-only inline alignment avoids canvas text baselines shifting
      // relative to flex icons. The visible modal remains untouched.
      pcElements.forEach(header => {
        header.querySelectorAll<HTMLImageElement>('img[alt="WhatsApp"], img[alt="Instagram"]').forEach(icon => {
          const contact = icon.parentElement;
          const text = contact?.querySelector('span');
          if (!contact || !text) return;
          if (ios) {
            // Preserve the original flex alignment. Font probe normalization
            // in onclone corrects the renderer, not individual labels.
            return;
          }
          contact.style.display = 'block';
          contact.style.lineHeight = '20px';
          contact.style.textAlign = 'center';
          icon.style.display = 'inline-block';
          icon.style.verticalAlign = 'middle';
          icon.style.marginRight = '8px';
          text.style.display = 'inline-block';
          text.style.verticalAlign = 'middle';
          text.style.lineHeight = '20px';
          // html2canvas includes the font descent below an inline image's
          // midpoint; compensate only in its exported contact labels.
          if (ios) {
            text.style.position = 'relative';
            text.style.top = '-8px';
          }
        });
      });

      // Para animações da marca d'água
      const watermarkGrids = clone.querySelectorAll('.watermark-grid');
      watermarkGrids.forEach(el => (el as HTMLElement).style.animation = 'none');

      if (ios && !ipad) {
        // Keep the existing capture-only watermark preparation.
        watermarkGrids.forEach(el => {
          const grid = el as HTMLElement;
          const layer = grid.parentElement;
          if (layer) { layer.style.overflow = 'hidden'; layer.style.borderRadius = 'inherit'; }
          grid.querySelectorAll<HTMLElement>('.watermark-text').forEach(text => {
            text.style.background = 'transparent';
            text.style.border = '0';
            text.style.boxShadow = 'none';
            text.style.textDecoration = 'none';
          });
        });
      }

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

      // CORS is set in JSX before src. Validate the already loaded originals
      // instead of fetching Storage images again during export.
      const waitImage = async (image: HTMLImageElement) => {
        if (!image.complete) await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => finish(new Error('Não foi possível carregar uma imagem do consórcio.')), 20000);
          const finish = (error?: Error) => {
            clearTimeout(timer);
            image.removeEventListener('load', loaded);
            image.removeEventListener('error', failed);
            if (error) reject(error); else resolve();
          };
          const loaded = () => finish();
          const failed = () => finish(new Error('Não foi possível carregar uma imagem do consórcio.'));
          image.addEventListener('load', loaded, { once: true });
          image.addEventListener('error', failed, { once: true });
        });
        if (!image.naturalWidth || !image.naturalHeight) throw new Error('Uma imagem não carregou. Tente novamente.');
        if (typeof image.decode === 'function') await image.decode();
      };
      await (ipad ? ipadWait(document.fonts.ready) : document.fonts.ready);
      const originals = Array.from(modalElement.querySelectorAll<HTMLImageElement>('img'));
      const prepareImages = Promise.all(originals.map(async image => {
        await waitImage(image);
        const source = image.currentSrc || image.src;
        if (!source || localImages.has(source)) return;
        const bitmap = document.createElement('canvas');
        try {
          // Reading pixels also detects tainted images before either renderer
          // can silently omit them. PNG avoids intermediate JPEG recompression.
          bitmap.width = ios ? 1 : image.naturalWidth;
          bitmap.height = ios ? 1 : image.naturalHeight;
          const context = bitmap.getContext('2d');
          if (!context) throw new Error('Não foi possível preparar uma imagem.');
          context.drawImage(image, 0, 0, bitmap.width, bitmap.height);
          context.getImageData(0, 0, 1, 1);
          if (!ios) localImages.set(source, bitmap.toDataURL('image/png'));
        } catch {
          throw new Error('Não foi possível utilizar uma imagem do consórcio. Verifique a conexão e tente novamente.');
        } finally { bitmap.width = 0; bitmap.height = 0; }
      }));
      await (ipad ? ipadWait(prepareImages) : prepareImages);
      const cloneImages = Promise.all(Array.from(clone.querySelectorAll<HTMLImageElement>('img')).map(async image => {
        const source = image.currentSrc || image.src;
        image.removeAttribute('srcset');
        image.loading = 'eager';
        if (!ios) {
          const local = localImages.get(source);
          if (!local) throw new Error('Não foi possível reutilizar uma imagem do consórcio.');
          image.src = local;
        }
        await waitImage(image);
      }));
      await (ipad ? ipadWait(cloneImages) : cloneImages);

      // An 800px element in the phone document still uses mobile media rules.
      // Resolve the existing layout in a private desktop viewport only after
      // images are local PNGs, so importing it cannot re-download source images.
      if (androidPhone) {
        androidViewport = document.createElement('iframe');
        androidViewport.setAttribute('aria-hidden', 'true');
        androidViewport.tabIndex = -1;
        androidViewport.style.cssText = 'position:absolute;left:-9999px;top:0;width:1280px;height:1800px;border:0;pointer-events:none;';
        document.body.appendChild(androidViewport);
        const captureDocument = androidViewport.contentDocument;
        if (!captureDocument) throw new Error('Não foi possível preparar a imagem.');
        captureDocument.documentElement.className = document.documentElement.className;
        captureDocument.body.className = document.body.className;
        document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(sheet => {
          captureDocument.head.appendChild(sheet.cloneNode(true));
        });
        // Import in the frame's realm for the renderer's element checks.
        const desktopClone = captureDocument.importNode(clone, true);
        clone.remove();
        clone = desktopClone;
        exportClone = clone;
        captureDocument.body.appendChild(clone);
        await captureDocument.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 300));

      // Obtém altura real do clone após renderização
      const cloneHeight = clone.scrollHeight;
      const cloneWidth = clone.offsetWidth;

      // Fit the final resolution, not the CSS layout. Older iOS / low-memory
      // browsers use a conservative budget; unknown modern devices get <=7.5MP.
      const iosVersion = /(?:CPU (?:iPhone )?OS|OS) (\d+)[_\.]/i.exec(navigator.userAgent);
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const conservative = (ios && iosVersion !== null && Number(iosVersion[1]) <= 15) ||
        (memory !== undefined && memory <= 2);
      const pixelBudget = conservative ? 4000000 : 7500000;
      const scale = Math.min(targetWidth / cloneWidth, targetHeight / cloneHeight,
        Math.sqrt(pixelBudget / (cloneWidth * cloneHeight)), 4096 / Math.max(cloneWidth, cloneHeight));
      const scales = Array.from(new Set([scale, Math.min(scale, 1.5), Math.min(scale, 1)]));
      const validateCanvas = (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        if (!context || !canvas.width || !canvas.height) throw new Error('Não foi possível gerar a imagem.');
        let hasContent = false;
        for (let y = 0; y < canvas.height && !hasContent; y += 8) {
          const row = context.getImageData(0, y, canvas.width, 1).data;
          for (let x = 0; x < row.length; x += 16) {
            if (row[x + 3] > 0 && (row[x] < 245 || row[x + 1] < 245 || row[x + 2] < 245)) { hasContent = true; break; }
          }
        }
        if (!hasContent) throw new Error('A captura ficou vazia. Tente salvar a imagem novamente.');
      };

      if (ios) {
        const module = import('html2canvas');
        const { default: html2canvas } = await (ipad ? ipadWait(module) : module);
        // CanvasRenderer's FontMetrics uses the caller's document, NOT the
        // private clone. Normalize its invisible probe during iPhone capture
        // as well, without touching any modal/product/contact image.
        const metricsStyle = document.createElement('style');
        if (metricsStyle) {
          metricsStyle.textContent = 'img[src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"] { display: inline-block !important; }';
          document.head.appendChild(metricsStyle);
        }
        try {
          for (const attemptScale of scales) {
            let captureExpired = false;
            const captureOptions: Parameters<typeof html2canvas>[1] = {
              backgroundColor: modalBg, useCORS: true, allowTaint: false,
              foreignObjectRendering: false, logging: false, imageTimeout: 20000,
              scale: attemptScale, width: cloneWidth, height: ipad ? cloneHeight : undefined,
              windowWidth: 1280,
              windowHeight: cloneHeight, scrollX: 0, scrollY: 0,
              onclone: async (captureDocument, element) => {
                element.style.left = '0';
                element.style.top = '0';
                element.style.transform = 'none';
                element.style.opacity = '1';
                {
                  // html2canvas measures its alphabetic baseline with a 1px GIF.
                  // Tailwind's img { display: block } moves that probe onto a new
                  // line, inflating the baseline for EVERY text node. Normalize
                  // only the renderer's probe in its private document; leave all
                  // product/contact images and the original grid untouched.
                  const metricsStyle = captureDocument.createElement('style');
                  metricsStyle.textContent = 'img[src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"] { display: inline-block !important; }';
                  captureDocument.head.appendChild(metricsStyle);
                  captureDocument.documentElement.style.setProperty('-webkit-text-size-adjust', '100%');
                  await captureDocument.fonts.ready;
                }
                // Responsive fonts can change height in the private desktop
                // viewport. Recheck the bitmap budget before CanvasRenderer runs.
                const captureHeight = ipad ? cloneHeight : element.getBoundingClientRect().height;
                captureOptions.scale = Math.min(attemptScale, targetWidth / cloneWidth,
                  targetHeight / captureHeight, Math.sqrt(pixelBudget / (cloneWidth * captureHeight)),
                  4096 / Math.max(cloneWidth, captureHeight));
              },
            };
            const capture = html2canvas(clone, captureOptions);
            try {
              if (ipad) {
                // A timed-out renderer may still be working: never overlap a retry.
                void capture.then(canvas => { if (captureExpired) { canvas.width = 0; canvas.height = 0; } }, () => {});
                try { iosCanvas = await ipadWait(capture); }
                catch (error) { captureExpired = true; throw error; }
              } else iosCanvas = await capture;
              validateCanvas(iosCanvas);
              break;
            } catch (error) {
              if (iosCanvas) { iosCanvas.width = 0; iosCanvas.height = 0; iosCanvas = null; }
              if (captureExpired || attemptScale === scales[scales.length - 1]) throw error;
            }
          }
        } finally { metricsStyle.remove(); }
        if (!iosCanvas) throw new Error('Não foi possível gerar a imagem.');
        iosFinalCanvas = document.createElement('canvas');
        iosFinalCanvas.width = targetWidth;
        iosFinalCanvas.height = targetHeight;
        const context = iosFinalCanvas.getContext('2d');
        if (!context) throw new Error('Não foi possível preparar a imagem.');
        context.fillStyle = modalBg;
        context.fillRect(0, 0, targetWidth, targetHeight);
        const ratio = Math.min(targetWidth / iosCanvas.width, targetHeight / iosCanvas.height);
        const width = iosCanvas.width * ratio;
        const height = iosCanvas.height * ratio;
        context.drawImage(iosCanvas, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
        iosCanvas.width = 0; iosCanvas.height = 0;
        const encode = new Promise<Blob>((resolve, reject) => {
          iosFinalCanvas?.toBlob(value => value ? resolve(value) : reject(new Error('Não foi possível gerar o JPEG.')), 'image/jpeg', 0.95);
        });
        const blob = await (ipad ? ipadWait(encode) : encode);
        const file = new File([blob], `consorcio-${bike.name}.jpg`, { type: 'image/jpeg' });
        const shareData = { files: [file] };
        // Chrome no iOS (CriOS) trava o navigator.share sem gesto do usuário:
        // nesse navegador a imagem vai direto para a aba reservada.
        const chromeIOS = /CriOS/i.test(navigator.userAgent);
        const canShare = !chromeIOS && typeof navigator.canShare === 'function' && navigator.canShare(shareData);
        if (!ipad && canShare && typeof navigator.share === 'function') {
          try {
            // Older iPhone Safari can leave share() pending forever without a
            // fresh tap; fall back to the reserved preview instead of hanging.
            let shareTimer: ReturnType<typeof setTimeout> | undefined;
            const shared = await Promise.race([
              navigator.share(shareData).then(() => true),
              new Promise<false>(resolve => { shareTimer = setTimeout(() => resolve(false), 8000); }),
            ]).finally(() => { if (shareTimer !== undefined) clearTimeout(shareTimer); });
            if (shared) { preview?.close(); return; }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') { preview?.close(); return; }
            // Safari may require a new tap after the asynchronous capture.
          }
        }
        const imageUrl = URL.createObjectURL(blob);
        if (preview && !preview.closed) {
          try {
          const doc = preview.document;
          doc.title = 'Imagem do consórcio';
          doc.body.replaceChildren();
          const image = doc.createElement('img');
          image.src = imageUrl;
          image.alt = `Consórcio ${bike.name}`;
          image.style.width = '100%';
          image.style.height = 'auto';
          doc.body.appendChild(image);
          if (canShare && typeof navigator.share === 'function') {
            const share = doc.createElement('button');
            share.textContent = 'Compartilhar imagem';
            share.onclick = async () => {
              try { await preview.navigator.share(shareData); }
              catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) preview.alert('Toque e segure a imagem para salvá-la.'); }
            };
            doc.body.prepend(share);
          }
          const hint = doc.createElement('p');
          hint.textContent = 'Toque e segure a imagem para salvar nas Fotos.';
          doc.body.prepend(hint);
          const release = window.setInterval(() => {
            if (preview.closed) { URL.revokeObjectURL(imageUrl); window.clearInterval(release); }
          }, 1000);
          preview.addEventListener('pagehide', () => { URL.revokeObjectURL(imageUrl); window.clearInterval(release); }, { once: true });
          } catch (previewError) {
            // Chrome no iOS pode negar a escrita no documento da aba reservada:
            // navega a aba diretamente para a imagem gerada.
            console.warn('Pré-visualização indisponível, abrindo a imagem diretamente:', previewError);
            preview.location.assign(imageUrl);
            const release = window.setInterval(() => {
              if (preview.closed) { URL.revokeObjectURL(imageUrl); window.clearInterval(release); }
            }, 1000);
          }
        } else {
          // Popup blocked: navigate directly to the JPEG, without depending on download.
          window.location.assign(imageUrl);
          window.addEventListener('pagehide', () => URL.revokeObjectURL(imageUrl), { once: true });
        }
        return;
      }

      // dom-to-image-more scales its canvas context, keeping the SVG / clone
      // at 800 CSS px. The images are local PNGs from the loaded DOM pixels.
      for (const attemptScale of scales) {
        try {
          captureCanvas = await domtoimage.toCanvas(clone, {
            width: cloneWidth, height: cloneHeight, scale: attemptScale,
            style: { transform: 'scale(1)', transformOrigin: 'top left' },
            bgcolor: modalBg, cacheBust: false,
          });
          validateCanvas(captureCanvas);
          break;
        } catch (error) {
          if (captureCanvas) { captureCanvas.width = 0; captureCanvas.height = 0; captureCanvas = null; }
          if (attemptScale === scales[scales.length - 1]) throw error;
        }
      }
      if (!captureCanvas) throw new Error('Não foi possível gerar a imagem.');
      const img = captureCanvas;

      // Cria canvas final com tamanho exato
      finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');
      
      if (!ctx) throw new Error('Erro ao criar canvas');

      // Desativa suavização para evitar linhas brancas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fundo na cor real do modal
      ctx.fillStyle = modalBg;
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
      link.download = `consorcio-${bike.name}.jpg`;
      const blob = await new Promise<Blob>((resolve, reject) => {
        finalCanvas?.toBlob(value => value ? resolve(value) : reject(new Error('Não foi possível gerar o JPEG.')), 'image/jpeg', 0.95);
      });
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      // Allow the browser to consume the URL before releasing it.
      const release = () => URL.revokeObjectURL(url);
      window.setTimeout(release, 60000);
      window.addEventListener('pagehide', release, { once: true });
      
    } catch (error) {
      preview?.close();
      window.alert(error instanceof Error ? error.message : 'Não foi possível salvar a imagem. Tente novamente.');
      console.error('Erro ao gerar imagem:', error);
    } finally {
      exportClone?.remove();
      androidViewport?.remove();
      localImages.clear();
      if (captureCanvas) { captureCanvas.width = 0; captureCanvas.height = 0; }
      if (finalCanvas) { finalCanvas.width = 0; finalCanvas.height = 0; }
      if (iosCanvas) { iosCanvas.width = 0; iosCanvas.height = 0; }
      if (iosFinalCanvas) { iosFinalCanvas.width = 0; iosFinalCanvas.height = 0; }
      savingRef.current = false;
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
        <div ref={modalRef} className="bg-[#FFF2B3]">
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
                            crossOrigin="anonymous"
                            src={vendedor.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="bg-white p-1 rounded-2xl shadow-xl">
                        <img
                            crossOrigin="anonymous"
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
                          <img crossOrigin="anonymous" src={whatsappIcon} className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
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
                          <img crossOrigin="anonymous" src={instagramIcon} className="w-4 h-4 flex-shrink-0" alt="Instagram" />
                          <span className="truncate max-w-[140px]">@{vendedor.instagram.replace("@", "")}</span>
                        </a>
                      )}
                    </div>

                    {/* Botão Salvar - Abaixo dos outros botões (só no mobile, visível aqui) */}
                    <Button
                      onClick={handlePrintModal}
                      disabled={isSaving}
                      variant="saveImage"
                      aria-label={isSaving ? '⏳ Salvando...' : '📸 Salvar imagem'}
                      className="mt-1 flex items-center gap-2 border border-export-action-foreground/40 px-4 py-1.5 rounded-full text-xs font-semibold transition-all print-hide self-start disabled:opacity-50 [&_svg]:size-4"
                      data-html2canvas-ignore="true"
                    >
                      {isSaving ? '⏳ Salvando...' : <span><span className="relative inline-block" aria-hidden="true"><span className="invisible">📸</span><Camera className="absolute inset-0 m-auto" /></span>{' '}Salvar imagem</span>}
                    </Button>
                  </div>
                </div>

                {/* ===== Layout PC/TABLET: Horizontal (Modificado o nome) ===== */}
                <div className="hidden md:flex items-center justify-between gap-6">
                  {/* Lado esquerdo: Foto com moldura branca */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-1 rounded-2xl shadow-xl">
                      <img
                            crossOrigin="anonymous"
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
                          <img crossOrigin="anonymous" src={whatsappIcon} className="w-5 h-5 flex-shrink-0" alt="WhatsApp" />
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
                          <img crossOrigin="anonymous" src={instagramIcon} className="w-5 h-5 flex-shrink-0" alt="Instagram" />
                          <span className="whitespace-nowrap">@{vendedor.instagram.replace("@", "")}</span>
                        </a>
                      )}

                    {/* Botão Salvar - ao lado do Instagram (PC/Tablet) */}
                      <Button
                        onClick={handlePrintModal}
                        disabled={isSaving}
                        variant="saveImage"
                        aria-label={isSaving ? '⏳ Salvando...' : '📸 Salvar imagem'}
                        className="flex items-center gap-2 border border-export-action-foreground/40 px-4 py-2 rounded-full text-sm font-semibold transition-all print-hide disabled:opacity-50 [&_svg]:size-4"
                        data-html2canvas-ignore="true"
                      >
                        {isSaving ? '⏳ Salvando...' : <span><span className="relative inline-block" aria-hidden="true"><span className="invisible">📸</span><Camera className="absolute inset-0 m-auto" /></span>{' '}Salvar imagem</span>}
                      </Button>
                    </div>
                  </div>

                  {/* Lado direito: Logo em card branco */}
                  {vendedor.logoUrl && (
                    <div className="flex-shrink-0 bg-white rounded-xl p-2 shadow-xl mt-4 overflow-hidden">
                      <img
                            crossOrigin="anonymous"
                        src={vendedor.logoUrl}
                        alt="Logo Concessionária"
                        className="w-16 h-16 lg:w-20 lg:h-20 object-cover"
                      />
                    </div>
                  )}
                </div>
                <div
                  className="mx-auto mt-2 max-w-[360px] text-center text-[9px] min-[375px]:text-[10px] font-normal leading-4 [text-wrap:balance] md:max-w-none md:text-[11px] text-export-action-foreground print-hide"
                  data-html2canvas-ignore="true"
                >
                  <span className="inline-block align-baseline rounded-sm bg-export-notice-badge px-1.5 text-xs text-export-notice-badge-foreground">NOVIDADE:</span>{' '}
                  Agora com download no iPhone e iPad, além de Android e computador. Imagens em Full HD!
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
                            crossOrigin="anonymous"
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
                className={`flex flex-wrap gap-2 sm:gap-4 md:gap-6 justify-center ${
                  consorcioCards.length === 1 ? "flex-col items-center" : ""
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
                    <div
                      key={card.tabelaId}
                      className={`flex flex-col h-full ${
                        consorcioCards.length === 1
                          ? "w-full max-w-xl"
                          : "w-[calc(50%-0.25rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)]"
                      }`}
                    >
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
              <img crossOrigin="anonymous" src={whatsappIcon} className="w-6 h-6 mr-2" alt="Ícone WhatsApp" />
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
    </>
  );
};