import { useEffect, useState } from "react";
import { getVendedorWithStatus, VendorResult } from "@/services/supabase";
import { getVendorSlug } from "@/utils/subdomain";
import type { Vendedor } from "@/types/firebase";

export type VendorStatus = 'loading' | 'found' | 'not_found' | 'inactive';

export const useVendedor = () => {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<VendorStatus>('loading');
  const [vendorSlug, setVendorSlug] = useState<string>('');

  useEffect(() => {
    const slug = getVendorSlug();
    setVendorSlug(slug);

    const fetchVendor = async () => {
      const result: VendorResult = await getVendedorWithStatus(slug);
      
      if (result.status === 'found') {
        setVendedor(result.vendedor);
        setStatus('found');
      } else if (result.status === 'inactive') {
        setVendedor(result.vendedor);
        setStatus('inactive');
      } else {
        setVendedor(null);
        setStatus('not_found');
      }
      
      setLoading(false);
    };

    fetchVendor();
  }, []);

  return {
    vendedor,
    loading,
    status,
    vendorSlug,
    isNotFound: status === 'not_found',
    isInactive: status === 'inactive',
    isFound: status === 'found',
  };
};
