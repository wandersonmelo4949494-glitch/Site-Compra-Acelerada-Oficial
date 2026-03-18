import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVendedor } from "@/hooks/useVendedor";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { useIsMobile } from "@/hooks/use-mobile";
import { useModalHistory } from "@/hooks/useModalHistory";
import { User, DollarSign, Send, Check } from "lucide-react";
import type { Motorcycle } from "@/data/motorcyclesData";

interface FinanciamentoModalProps {
  bike: Motorcycle | null;
  isOpen: boolean;
  onClose: () => void;
}

const FRASES_DINAMICAS = [
  "Seu sonho mais perto de você.",
  "Preencha e receba sua proposta.",
  "Dê o primeiro passo pro seu sonho.",
];

export const FinanciamentoModal = ({ bike, isOpen, onClose }: FinanciamentoModalProps) => {
  const { vendedor } = useVendedor();
  const { isKeyboardOpen } = useVisualViewport();
  const isMobile = useIsMobile();
  
  // Hook para fechar modal com botão voltar do navegador
  useModalHistory(isOpen, onClose, 'financiamento');
  
  // Estado da galeria de imagens
  const [currentImage, setCurrentImage] = useState(0);
  const [currentFrase, setCurrentFrase] = useState(0);
  
  // Estado do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [situacaoHabilitacao, setSituacaoHabilitacao] = useState("");
  const [enviado, setEnviado] = useState(false);

  const instagramIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/instacolorido.png";
  const whatsappIcon =
    "https://ftdrizgpingochpxghmg.supabase.co/storage/v1/object/public/images/logos/whatscolorido.png";

  // Auto-troca de imagens
  useEffect(() => {
    if (!bike?.images?.length || !isOpen) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bike.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bike, isOpen]);

  // Auto-troca de frases
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentFrase((prev) => (prev + 1) % FRASES_DINAMICAS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setNome("");
      setCpf("");
      setDataNascimento("");
      setValorEntrada("");
      setValorParcela("");
      setSituacaoHabilitacao("");
      setEnviado(false);
      setCurrentImage(0);
      setCurrentFrase(0);
    }
  }, [isOpen]);

  // Determinar passo atual
  const passoAtual = useMemo(() => {
    const temDadosPessoais = nome.trim() || cpf.trim() || dataNascimento.trim();
    const temDadosValores = valorEntrada.trim() || valorParcela.trim();
    const dadosPessoaisCompletos = nome.trim() && cpf.trim() && dataNascimento.trim();
    const dadosValoresCompletos = valorEntrada.trim() && valorParcela.trim();

    if (dadosPessoaisCompletos && dadosValoresCompletos && situacaoHabilitacao) return 3;
    if (temDadosValores || dadosPessoaisCompletos) return 2;
    if (temDadosPessoais) return 1;
    return 0;
  }, [nome, cpf, dataNascimento, valorEntrada, valorParcela, situacaoHabilitacao]);

  // Verificar se formulário está completo
  const formularioCompleto = useMemo(() => {
    return nome.trim() && cpf.trim() && dataNascimento.trim() && valorEntrada.trim() && valorParcela.trim() && situacaoHabilitacao;
  }, [nome, cpf, dataNascimento, valorEntrada, valorParcela, situacaoHabilitacao]);

  // Formatação de CPF
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Formatação de data
  const formatData = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  // Formatação de moeda
  const formatMoeda = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const numero = parseInt(digits, 10) / 100;
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Função para exibição do telefone
  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    let clean = digits;
    if (clean.length > 10 && clean.startsWith("55")) {
      clean = clean.slice(2);
    }
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    return phone;
  };

  const handleWhatsAppDirect = () => {
    if (!vendedor?.whatsapp || !bike) return;
    const phone = vendedor.whatsapp.replace(/\D/g, "");
    const mensagem = `Oi, olhei o catálogo online e não preenchi o formulário de financiamento, mas quero fazer o financiamento da ${bike.name}`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(mensagem)}`, "_blank");
  };

  const instagramUrl = vendedor?.instagram
    ? vendedor.instagram.startsWith("http")
      ? vendedor.instagram
      : `https://instagram.com/${vendedor.instagram.replace("@", "")}`
    : null;

  // Enviar formulário
  const handleEnviar = () => {
    if (!formularioCompleto || !vendedor?.whatsapp || !bike) return;

    // Emojis removidos e frase final alterada conforme solicitado
    const mensagem = `*SOLICITAÇÃO DE FINANCIAMENTO*

*Moto:* ${bike.name}

*Dados do Cliente:*
• Nome: ${nome}
• CPF: ${cpf}
• Data de Nascimento: ${dataNascimento}
• Situação da habilitação: ${situacaoHabilitacao || "Não informado"}

*Valores:*
• Entrada: ${valorEntrada}
• Parcela Desejada: ${valorParcela}

Enviado Pelo Site Compra Acelerada`;

    const phone = vendedor.whatsapp.replace(/\D/g, "");
    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
    setEnviado(true);
  };

  // Texto e estilo do botão
  const getBotaoConfig = () => {
    if (enviado) {
      return {
        texto: "Enviado ✓",
        className: "bg-green-600 hover:bg-green-700 text-white cursor-default",
        disabled: true,
      };
    }
    if (formularioCompleto) {
      return {
        texto: "Enviar agora",
        className: "bg-green-600 hover:bg-green-700 text-white",
        disabled: false,
      };
    }
    return {
      texto: "Falta pouco…",
      className: "bg-gray-400 text-gray-200 cursor-not-allowed",
      disabled: true,
    };
  };

  const botaoConfig = getBotaoConfig();

  if (!bike) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{bike.name} - Financiamento</DialogTitle>
        <DialogDescription className="sr-only">Formulário de financiamento para {bike.name}</DialogDescription>
        {/* ===== FAIXA VERMELHA DO VENDEDOR ===== */}
        {vendedor && (
          <div className="relative bg-[#c41212] text-white rounded-t-xl overflow-hidden">
            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="absolute top-1 right-1 z-50 w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            >
              <span className="text-white text-lg font-bold">✕</span>
            </button>

            <div className="px-4 py-4 md:px-8 md:py-3">
              {/* Layout CELULAR */}
              <div className="flex items-start gap-4 md:hidden">
                <div className="flex-shrink-0 mt-1">
                  <div className="relative">
                    {vendedor.logoUrl && (
                      <div className="absolute -top-2 -right-2 w-12 aspect-square rounded-full shadow-xl overflow-hidden z-10">
                        <img src={vendedor.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="bg-white p-1 rounded-2xl shadow-xl">
                      <img src={vendedor.fotoPerfilUrl} alt={vendedor.nome} className="w-28 h-28 rounded-xl object-cover" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <h2 className="text-2xl font-display font-bold tracking-wide">{vendedor.nome}</h2>
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {vendedor.whatsapp && (
                      <button onClick={handleWhatsAppDirect} className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-gray-50 transition-all">
                        <img src={whatsappIcon} className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
                        <span className="whitespace-nowrap">{formatPhoneDisplay(vendedor.whatsapp)}</span>
                      </button>
                    )}
                    {instagramUrl && (
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-gray-50 transition-all max-w-full overflow-hidden">
                        <img src={instagramIcon} className="w-4 h-4 flex-shrink-0" alt="Instagram" />
                        <span className="truncate max-w-[140px]">@{vendedor.instagram.replace("@", "")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Layout PC/TABLET */}
              <div className="hidden md:flex items-center justify-between gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-white p-1 rounded-2xl shadow-xl">
                    <img src={vendedor.fotoPerfilUrl} alt={vendedor.nome} className="w-28 h-28 lg:w-32 lg:h-32 rounded-xl object-cover" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <h2 className="text-3xl font-display font-bold tracking-wide">{vendedor.nome}</h2>
                    <p className="text-white/90 text-sm">Realize Seu Sonho — Financie Sua Honda, Rápido e Fácil!</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {vendedor.whatsapp && (
                      <button onClick={handleWhatsAppDirect} className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 hover:scale-105 transition-all">
                        <img src={whatsappIcon} className="w-5 h-5 flex-shrink-0" alt="WhatsApp" />
                        <span className="whitespace-nowrap">{formatPhoneDisplay(vendedor.whatsapp)}</span>
                      </button>
                    )}
                    {instagramUrl && (
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-gray-50 hover:scale-105 transition-all">
                        <img src={instagramIcon} className="w-5 h-5 flex-shrink-0" alt="Instagram" />
                        <span className="whitespace-nowrap">@{vendedor.instagram.replace("@", "")}</span>
                      </a>
                    )}
                  </div>
                </div>

                {vendedor.logoUrl && (
                  <div className="flex-shrink-0 bg-white rounded-xl p-2 shadow-xl overflow-hidden">
                    <img src={vendedor.logoUrl} alt="Logo Concessionária" className="w-16 h-16 lg:w-20 lg:h-20 object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTEÚDO PRINCIPAL ===== */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Seção da Imagem da Moto + Frase */}
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
          {/* Imagem com transição suave */}
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            {bike.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${bike.name} - ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

              {/* Indicadores de imagem */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                {bike.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImage ? "bg-white scale-125" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
          </div>
          
          {/* Nome da moto e frase dinâmica - área reservada abaixo da imagem */}
          <div className="px-4 py-3">
            <h3 className="text-xl md:text-2xl font-display font-bold mb-1 text-gray-700">{bike.name}</h3>
            <p className="text-sm md:text-base font-semibold italic transition-opacity duration-500 text-gray-700">
              "{FRASES_DINAMICAS[currentFrase]}"
            </p>
          </div>
          </div>

          {/* Barra de Passos */}
          <div 
            className={`flex items-center justify-between gap-2 md:gap-4 z-10 bg-white py-3 -mx-4 px-4 md:static md:z-auto md:bg-transparent md:py-0 md:mx-0 md:px-0 [&:not(:first-child)]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] md:shadow-none ${
              isMobile && isKeyboardOpen ? 'relative' : 'sticky top-0'
            }`}
          >
            {/* Passo 1 */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  passoAtual >= 1
                    ? "bg-[#c41212] text-white shadow-lg"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className={`mt-2 text-xs md:text-sm font-semibold text-center transition-colors ${
                passoAtual >= 1 ? "text-[#c41212]" : "text-gray-400"
              }`}>
                Dados Pessoais
              </span>
            </div>

            {/* Linha conectora 1-2 */}
            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              passoAtual >= 2 ? "bg-[#c41212]" : "bg-gray-200"
            }`} />

            {/* Passo 2 */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  passoAtual >= 2
                    ? "bg-[#c41212] text-white shadow-lg"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className={`mt-2 text-xs md:text-sm font-semibold text-center transition-colors ${
                passoAtual >= 2 ? "text-[#c41212]" : "text-gray-400"
              }`}>
                Valores
              </span>
            </div>

            {/* Linha conectora 2-3 */}
            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              passoAtual >= 3 ? "bg-[#c41212]" : "bg-gray-200"
            }`} />

            {/* Passo 3 */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  passoAtual >= 3
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {passoAtual >= 3 ? (
                  <Check className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Send className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <span className={`mt-2 text-xs md:text-sm font-semibold text-center transition-colors ${
                passoAtual >= 3 ? "text-green-600" : "text-gray-400"
              }`}>
                Envie no WhatsApp
              </span>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-6 space-y-4 shadow-inner">
            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-semibold text-gray-700">
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-12 text-base rounded-xl border-gray-300 focus:border-[#c41212] focus:ring-[#c41212]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-semibold text-gray-700">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  className="h-12 text-base rounded-xl border-gray-300 focus:border-[#c41212] focus:ring-[#c41212]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-sm font-semibold text-gray-700">
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  placeholder="DD/MM/AAAA"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(formatData(e.target.value))}
                  className="h-12 text-base rounded-xl border-gray-300 focus:border-[#c41212] focus:ring-[#c41212]"
                />
              </div>
            </div>

            {/* Dados de Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="valorEntrada" className="text-sm font-semibold text-gray-700">
                  Valor da Entrada
                </Label>
                <Input
                  id="valorEntrada"
                  placeholder="R$ 0,00"
                  value={valorEntrada}
                  onChange={(e) => setValorEntrada(formatMoeda(e.target.value))}
                  className="h-12 text-base rounded-xl border-gray-300 focus:border-[#c41212] focus:ring-[#c41212]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorParcela" className="text-sm font-semibold text-gray-700">
                  Valor da Parcela Desejada
                </Label>
                <Input
                  id="valorParcela"
                  placeholder="R$ 0,00"
                  value={valorParcela}
                  onChange={(e) => setValorParcela(formatMoeda(e.target.value))}
                  className="h-12 text-base rounded-xl border-gray-300 focus:border-[#c41212] focus:ring-[#c41212]"
                />
              </div>
            </div>

            {/* Situação da Habilitação */}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-semibold text-gray-700">
                Situação da sua habilitação
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {["Tenho CNH", "Estou tirando", "Não tenho"].map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => setSituacaoHabilitacao(opcao)}
                    className={`h-12 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                      situacaoHabilitacao === opcao
                        ? "border-[#c41212] bg-[#c41212]/10 text-[#c41212]"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <Button
            onClick={handleEnviar}
            disabled={botaoConfig.disabled}
            className={`w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 ${botaoConfig.className}`}
          >
            {enviado ? (
              <Check className="w-6 h-6 mr-2" />
            ) : (
              <Send className="w-6 h-6 mr-2" />
            )}
            {botaoConfig.texto}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
