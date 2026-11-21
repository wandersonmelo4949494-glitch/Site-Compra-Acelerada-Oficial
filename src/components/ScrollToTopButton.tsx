import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const ScrollToTopButton = ({ hidden = false }: { hidden?: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      setVisible(docHeight > 0 && scrollTop / docHeight >= 0.7);

      // Detecta proximidade com o rodapé
      const footer = document.querySelector("footer");

      if (footer) {
        const footerTop = footer.offsetTop;
        const scrollBottom = window.scrollY + window.innerHeight;

        if (scrollBottom >= footerTop - 40) {
          // Para antes do rodapé
          setBottomOffset(80);
        } else {
          // posição normal
          setBottomOffset(24);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMobile || !visible || hidden) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{ bottom: `${bottomOffset}px` }}
      className="fixed right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg transition-all duration-300"
    >
      <ArrowUp size={18} />
      <span className="text-sm font-semibold">Voltar ao topo</span>
    </button>
  );
};
