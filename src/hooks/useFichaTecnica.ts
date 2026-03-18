import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import type { FichaTecnicaMoto } from '@/types/fichaTecnica';

export const useFichaTecnica = (nomeDaMoto: string | undefined) => {
  const [fichaTecnica, setFichaTecnica] = useState<FichaTecnicaMoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFichaTecnica = async () => {
      if (!nomeDaMoto) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('ficha_tecnica_motos')
          .select('*')
          .eq('moto_codigo', nomeDaMoto) // 👈 AQUI MUDA
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar ficha técnica:', fetchError);
          setError(fetchError.message);
          setFichaTecnica(null);
        } else {
          setFichaTecnica(data);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro ao carregar ficha técnica');
      } finally {
        setLoading(false);
      }
    };

    fetchFichaTecnica();
  }, [nomeDaMoto]);

  return { fichaTecnica, loading, error };
};
