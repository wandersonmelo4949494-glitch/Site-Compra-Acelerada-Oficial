/**
 * Rotas reservadas que NÃO devem ser tratadas como vendor
 * "admin" NÃO está aqui pois é um vendor válido
 */
const RESERVED_ROUTES = ['login', 'checkout', 'api'];

/**
 * Detecta o slug do vendedor a partir da URL
 * Prioridade:
 * 1. Subdomínio (ex: joao.compraacelerada.com.br)
 * 2. Primeiro segmento do path (ex: compraacelerada.com.br/joao)
 * 3. Domínio raiz (sem subdomínio e sem path) → "admin"
 * 4. Fallback para VITE_DEFAULT_VENDOR
 */
export const getVendorSlug = (): string => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const defaultVendor = import.meta.env.VITE_DEFAULT_VENDOR || 'admin';

  // 1. Tentar subdomínio primeiro
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    return subdomain;
  }

  // 2. Se não há subdomínio, tentar o primeiro segmento do path
  const pathVendor = extractPathVendor(pathname);
  if (pathVendor) {
    // Verificar se é uma rota reservada
    if (RESERVED_ROUTES.includes(pathVendor.toLowerCase())) {
      return defaultVendor;
    }
    return pathVendor;
  }

  // 3. Domínio raiz (sem subdomínio e sem path válido) → retorna "admin"
  return 'admin';
};

/**
 * Verifica se o path atual é uma rota reservada
 */
export const isReservedRoute = (): boolean => {
  const pathname = window.location.pathname;
  const segments = pathname.replace(/^\//, '').split('/');
  const firstSegment = segments[0]?.trim().toLowerCase();
  
  return firstSegment ? RESERVED_ROUTES.includes(firstSegment) : false;
};

/**
 * Retorna a rota reservada atual, se houver
 */
export const getReservedRoute = (): string | null => {
  const pathname = window.location.pathname;
  const segments = pathname.replace(/^\//, '').split('/');
  const firstSegment = segments[0]?.trim().toLowerCase();
  
  if (firstSegment && RESERVED_ROUTES.includes(firstSegment)) {
    return firstSegment;
  }
  return null;
};

/**
 * Extrai o subdomínio do hostname
 * Retorna null se não houver subdomínio válido
 */
const extractSubdomain = (hostname: string): string | null => {
  // Suporte a subdomínios em dev: ex "joao.localhost"
  if (hostname.endsWith('.localhost')) {
    const [sub] = hostname.split('.');
    return sub || null;
  }

  // Em desenvolvimento sem subdomínio (localhost/127.0.0.1) - sem subdomínio
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  // URLs do Lovable preview (ex: id-preview--xxx.lovable.app)
  if (hostname.includes('lovable.app')) {
    return null;
  }

  // Pegar o primeiro segmento do hostname
  const parts = hostname.split('.');

  // Se tiver mais de 2 partes (ex: joao.compraacelerada.com.br)
  if (parts.length >= 3) {
    // Ignorar www como subdomínio - www é tratado como domínio raiz
    if (parts[0].toLowerCase() === 'www') {
      return null;
    }
    return parts[0];
  }

  // Não há subdomínio
  return null;
};

/**
 * Extrai o vendor do primeiro segmento do path
 * Retorna null se não houver vendor válido no path
 */
const extractPathVendor = (pathname: string): string | null => {
  // Remove a barra inicial e divide por "/"
  const segments = pathname.replace(/^\//, '').split('/');
  
  // Pega o primeiro segmento se existir e não for vazio
  const firstSegment = segments[0]?.trim();
  
  if (firstSegment && firstSegment.length > 0) {
    return firstSegment;
  }
  
  return null;
};

/**
 * @deprecated Use getVendorSlug() em vez disso
 * Mantido para compatibilidade temporária
 */
export const getSubdomain = (): string => {
  return getVendorSlug();
};

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export const isDevelopment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Verifica se o vendor atual foi detectado via path (não subdomínio)
 */
export const isVendorFromPath = (): boolean => {
  const hostname = window.location.hostname;
  const subdomain = extractSubdomain(hostname);
  return subdomain === null;
};

/**
 * Retorna o base path para links internos
 * Se o vendor foi detectado via path, retorna "/vendor"
 * Se foi via subdomínio, retorna ""
 */
export const getBasePath = (): string => {
  if (!isVendorFromPath()) {
    return '';
  }
  
  const pathname = window.location.pathname;
  const segments = pathname.replace(/^\//, '').split('/');
  const firstSegment = segments[0]?.trim();
  
  // Não incluir rotas reservadas no basePath
  if (firstSegment && firstSegment.length > 0 && !RESERVED_ROUTES.includes(firstSegment.toLowerCase())) {
    return `/${firstSegment}`;
  }
  
  return '';
};