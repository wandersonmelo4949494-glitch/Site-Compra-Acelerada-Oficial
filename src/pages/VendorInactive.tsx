import { AlertTriangle } from "lucide-react";

const VendorInactive = () => {
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
      </div>
    </div>
  );
};

export default VendorInactive;
