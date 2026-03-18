import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const VendorInactive = () => {
  const handleContact = () => {
    window.open(
      "https://wa.me/5594991894540?text=Oi,%20vi%20que%20o%20Catálogo%20Digital%20está%20desativado%20e%20gostaria%20de%20reativá-lo.",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Catálogo Digital indisponível no momento!
        </h1>
        
        <p className="text-foreground/80 mb-2">
          Este catálogo digital não está ativo no momento.
        </p>
        
        <p className="text-muted-foreground mb-6">
          Se você for o responsável, entre em contato com nossa equipe para reativar o acesso.
        </p>
        
        <Button
          onClick={handleContact}
          className="bg-primary hover:bg-primary/90"
        >
          Entrar em contato
        </Button>
      </div>
    </div>
  );
};

export default VendorInactive;
