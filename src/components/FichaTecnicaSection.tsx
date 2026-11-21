import type { FichaTecnicaMoto } from '@/types/fichaTecnica';
import React from 'react';

// ===== PARSER DE OBSERVAÇÃO =====
// Regras:
// 1. Linha 1 com texto = título vermelho (semibold)
// 2. Texto normal = cinza padrão
// 3. *palavra* no meio = destaque cinza escuro
// 4. Linha inteira *texto* = subtítulo cinza forte (semibold)
// 5. Quebras de linha respeitadas

interface ParsedLine {
  type: 'title' | 'subtitle' | 'normal';
  content: React.ReactNode;
}

const parseInlineHighlights = (text: string): React.ReactNode => {
  // Regex para encontrar *texto* no meio da linha (não linha inteira)
  const parts = text.split(/(\*[^*]+\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      // Remove os asteriscos e aplica destaque
      const highlighted = part.slice(1, -1);
      return (
        <span key={index} className="text-gray-800 font-medium">
          {highlighted}
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const parseObservacaoText = (text: string): ParsedLine[] => {
  const lines = text.split('\n');
  const result: ParsedLine[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Linha vazia - mantém quebra
    if (trimmedLine === '') {
      result.push({ type: 'normal', content: '\u00A0' }); // Non-breaking space para manter a linha
      return;
    }
    
    // Linha 1 com texto = título vermelho
    if (index === 0 && trimmedLine !== '') {
      result.push({
        type: 'title',
        content: parseInlineHighlights(trimmedLine)
      });
      return;
    }
    
    // Linha inteira entre asteriscos = subtítulo
    if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*') && trimmedLine.length > 2) {
      // Verifica se é linha inteira (não apenas uma palavra)
      const innerText = trimmedLine.slice(1, -1);
      // Se não tem mais asteriscos internos, é subtítulo
      if (!innerText.includes('*')) {
        result.push({
          type: 'subtitle',
          content: innerText
        });
        return;
      }
    }
    
    // Texto normal com possíveis destaques inline
    result.push({
      type: 'normal',
      content: parseInlineHighlights(trimmedLine)
    });
  });
  
  return result;
};

const ObservacaoRenderer = ({ text }: { text: string }) => {
  const parsedLines = parseObservacaoText(text);
  
  return (
    <div className="space-y-1">
      {parsedLines.map((line, index) => {
        if (line.type === 'title') {
          return (
            <p key={index} className="text-sm font-semibold text-primary">
              {line.content}
            </p>
          );
        }
        
        if (line.type === 'subtitle') {
          return (
            <p key={index} className="text-sm font-semibold text-primary mt-2">
              {line.content}
            </p>
          );
        }
        
        return (
          <p key={index} className="text-sm text-gray-600">
            {line.content}
          </p>
        );
      })}
    </div>
  );
};

// ===== ÍCONES GLOBAIS - PLACEHOLDERS =====
// Substitua pelos links corretos do Supabase Storage após a entrega
const ICON_MOTOR = "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/iconeCombustivel.webp";
const ICON_CILINDRADA = "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/iconeCilindrada.webp";
const ICON_TRANSMISSAO = "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/iconeTransmissao.webp";
const ICON_PARTIDA = "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/iconePartida.webp";

interface FichaTecnicaSectionProps {
  fichaTecnica: FichaTecnicaMoto | null;
  loading?: boolean;
}

interface SpecBlock {
  icon: string;
  title: string;
  value: string | null;
  show: boolean;
}

export const FichaTecnicaSection = ({ fichaTecnica, loading }: FichaTecnicaSectionProps) => {
  // Se não há dados ou ainda está carregando, não exibe nada
  if (loading || !fichaTecnica) {
    return null;
  }

  // ===== 4 BLOCOS RESUMIDOS =====
  const specBlocks: SpecBlock[] = [
    {
      icon: ICON_CILINDRADA,
      title: "Cilindrada:",
      value: fichaTecnica.cilindrada,
      show: fichaTecnica.mostrar_cilindrada && !!fichaTecnica.cilindrada,
    },
    {
      icon: ICON_TRANSMISSAO,
      title: "Transmissão:",
      value: fichaTecnica.transmissao,
      show: fichaTecnica.mostrar_transmissao && !!fichaTecnica.transmissao,
    },
    {
      icon: ICON_PARTIDA,
      title: "Partida:",
      value: fichaTecnica.partida,
      show: fichaTecnica.mostrar_partida && !!fichaTecnica.partida,
    },
    {
      icon: ICON_MOTOR,
      title: "Combustível:",
      value: fichaTecnica.combustivel,
      show: fichaTecnica.mostrar_combustivel && !!fichaTecnica.combustivel,
    },
  ];

  // Filtra apenas os blocos que devem aparecer
  const visibleBlocks = specBlocks.filter((block) => block.show);

  // ===== ITENS DA TABELA COMPLETA =====
  const tableItems = [
    {
      label: "Motor:",
      value: fichaTecnica.motor,
      show: fichaTecnica.mostrar_motor && !!fichaTecnica.motor,
    },
    {
      label: "Potência Máxima:",
      value: fichaTecnica.potencia_maxima,
      show: fichaTecnica.mostrar_potencia_maxima && !!fichaTecnica.potencia_maxima,
    },
    {
      label: "Sistema de Alimentação:",
      value: fichaTecnica.sistema_alimentacao,
      show: fichaTecnica.mostrar_sistema_alimentacao && !!fichaTecnica.sistema_alimentacao,
    },
    {
      label: "Freio Dianteiro (Diâmetro):",
      value: fichaTecnica.freio_dianteiro_diametro,
      show: fichaTecnica.mostrar_freio_dianteiro && !!fichaTecnica.freio_dianteiro_diametro,
    },
    {
      label: "Freio Traseiro (Diâmetro):",
      value: fichaTecnica.freio_traseiro_diametro,
      show: fichaTecnica.mostrar_freio_traseiro && !!fichaTecnica.freio_traseiro_diametro,
    },
    {
      label: "Tanque de Combustível:",
      value: fichaTecnica.tanque_combustivel,
      show: fichaTecnica.mostrar_tanque_combustivel && !!fichaTecnica.tanque_combustivel,
    },
    {
      label: "Óleo do Motor:",
      value: fichaTecnica.oleo_motor,
      show: fichaTecnica.mostrar_oleo_motor && !!fichaTecnica.oleo_motor,
    },
  ];

  // Filtra apenas os itens que devem aparecer
  const visibleTableItems = tableItems.filter((item) => item.show);

  // Verifica se deve mostrar a observação
  const showObservacao = fichaTecnica.mostrar_observacao && !!fichaTecnica.observacao_texto;

  // Verifica se há conteúdo técnico (blocos ou tabela)
  const hasTechnicalContent = visibleBlocks.length > 0 || visibleTableItems.length > 0;

  // Se não há conteúdo técnico E não há observação, não exibe nada
  if (!hasTechnicalContent && !showObservacao) {
    return null;
  }

  // REGRA: Se SOMENTE mostrar_observacao = true e todos os outros estão false
  // Mostra apenas a observação SEM o título "Informações Técnicas"
  const onlyObservacao = showObservacao && !hasTechnicalContent;

  // Se só tem observação, renderiza sem título
  if (onlyObservacao && fichaTecnica.observacao_texto) {
    return (
      <div className="mt-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <ObservacaoRenderer text={fichaTecnica.observacao_texto} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* ===== TÍTULO DA SEÇÃO ===== */}
      <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-foreground mb-4 text-center">
        Informações Técnicas
      </h3>

      {/* ===== 4 BLOCOS RESUMIDOS - Reorganização automática ===== */}
      {visibleBlocks.length > 0 && (
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 mb-6 md:justify-center">
          {visibleBlocks.map((block, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100 md:min-w-0 md:flex-1"
            >
              {/* Ícone à esquerda */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-honda-red/10 rounded-lg">
                <img
                  src={block.icon}
                  alt={block.title}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Texto à direita - palavras nunca quebram */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap">
                  {block.title}
                </span>
              <span className="text-sm font-semibold text-foreground break-words">
                  {block.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== TABELA COMPLETA - Altura automática com quebra de linha ===== */}
      {visibleTableItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <tbody>
              {visibleTableItems.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border-b border-gray-100 last:border-b-0`}
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 w-1/2 align-top break-words whitespace-normal">
                    {item.label}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-600 align-top break-words whitespace-normal">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== OBSERVAÇÃO ===== */}
      {showObservacao && fichaTecnica.observacao_texto && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <ObservacaoRenderer text={fichaTecnica.observacao_texto} />
        </div>
      )}
    </div>
  );
};