import { AlertTriangle } from "lucide-react";

const VendorNotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Vendedor não encontrado
        </h1>
        
        <p className="text-muted-foreground leading-relaxed">
          Seu link está incorreto.
          <br />
          Não foi possível localizar seu vendedor.
          <br />
          Verifique a digitação e utilize o link correto do seu vendedor.
        </p>
      </div>
    </div>
  );
};

export default VendorNotFound;
