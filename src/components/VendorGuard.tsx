import { ReactNode } from "react";
import { useVendedor } from "@/hooks/useVendedor";
import VendorNotFound from "@/pages/VendorNotFound";
import VendorInactive from "@/pages/VendorInactive";

interface VendorGuardProps {
  children: ReactNode;
}

/**
 * Componente que protege as rotas verificando se o vendor existe no banco.
 * - Se o vendor existe e está ativo: renderiza os filhos (a loja)
 * - Se o vendor existe mas está inativo: renderiza página de catálogo indisponível
 * - Se o vendor não existe: renderiza página de vendedor não encontrado
 * - Durante carregamento: não exibe nada (tela em branco momentânea)
 */
export const VendorGuard = ({ children }: VendorGuardProps) => {
  const { loading, isNotFound, isInactive } = useVendedor();

  // Durante o carregamento, não exibe nada
  if (loading) {
    return null;
  }

  // Se o vendor não foi encontrado, exibe página de erro
  if (isNotFound) {
    return <VendorNotFound />;
  }

  // Se o vendor está inativo, exibe página específica
  if (isInactive) {
    return <VendorInactive />;
  }

  // Vendor encontrado e ativo, renderiza a loja normalmente
  return <>{children}</>;
};
