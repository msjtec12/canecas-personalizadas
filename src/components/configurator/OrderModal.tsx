'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Gift,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  MapPin,
  Mail,
  User,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ProductDefinition,
  ProductColor,
  CustomizationMap,
  SurfaceId,
  AdminOrder,
} from '@/types/configurator';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDefinition;
  selectedColor: ProductColor;
  surfacesState: CustomizationMap;
  surfacePreviews: Record<SurfaceId, string | undefined>;
  pricing: {
    basePrice: number;
    customizedSurfacesCount: number;
    additionalSurfacesCount: number;
    additionalSurfacesCost: number;
    packagingPrice: number;
    getUnitPrice: (includePackaging: boolean) => number;
    getTotalPrice: (quantity: number, includePackaging: boolean) => number;
  };
  onOrderSuccess?: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor,
  surfacesState,
  surfacePreviews,
  pricing,
  onOrderSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [includePackaging, setIncludePackaging] = useState<boolean>(true);

  // Dados do cliente (Sem cadastro obrigatório)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerCep, setCustomerCep] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Estados de submissão e confirmação
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<AdminOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const estimatedUnitPrice = pricing.getUnitPrice(includePackaging);
  const estimatedTotalPrice = pricing.getTotalPrice(quantity, includePackaging);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor, informe um WhatsApp válido com DDD (ex: 11 98765-4321).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Chamada para a API com RECÁLCULO OBRIGATÓRIO no servidor
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          colorId: selectedColor.id,
          quantity,
          includePackaging,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || undefined,
            cep: customerCep.trim() || undefined,
            address: customerAddress.trim() || undefined,
            notes: notes.trim() || undefined,
          },
          surfacesState,
          surfacePreviews,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível registrar seu pedido.');
      }

      // Sucesso na criação do pedido
      setConfirmedOrder(data.order);

      // Dispara confetes de comemoração
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      if (onOrderSuccess) onOrderSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar pedido. Tente novamente.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!confirmedOrder) return;

    const formattedTotal = confirmedOrder.item.totalPrice.toFixed(2).replace('.', ',');
    const messageLines = [
      `Olá! Acabei de criar um presente personalizado pelo site da Montuá.`,
      ``,
      `Pedido: ${confirmedOrder.orderNumber}`,
      `Produto: ${confirmedOrder.item.productName}`,
      `Quantidade: ${confirmedOrder.item.quantity}`,
      `Valor: R$ ${formattedTotal}`,
      ``,
      `Gostaria de finalizar meu pedido.`,
    ];

    const encoded = encodeURIComponent(messageLines.join('\n'));
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5511999999999&text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyCode = () => {
    if (!confirmedOrder) return;
    navigator.clipboard.writeText(confirmedOrder.orderNumber);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* TELA DE PEDIDO RECEBIDO */}
        {confirmedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Pedido recebido com sucesso
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-serif">
                Pedido recebido!
              </h3>
              <p className="text-base font-semibold text-[#C25E48]">
                Agora sua criação está com a Montuá.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Salvamos sua personalização com máxima precisão milimétrica para nossa equipe produzir com carinho.
              </p>
            </div>

            {/* Card com Código e Resumo */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Código do Pedido
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{confirmedOrder.orderNumber}</span>
                </button>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Produto:</span>
                  <span className="font-semibold text-slate-900">{confirmedOrder.item.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cor:</span>
                  <span className="font-semibold text-slate-900">{confirmedOrder.item.color.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span className="font-semibold text-slate-900">{confirmedOrder.item.quantity} un.</span>
                </div>
                <div className="flex justify-between">
                  <span>Embalagem Especial:</span>
                  <span className="font-semibold text-slate-900">
                    {confirmedOrder.item.includePackaging ? 'Sim (Caixa Kraft + Laço)' : 'Padrão'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Valor Total:</span>
                  <span className="text-rose-600 text-base">
                    R$ {confirmedOrder.item.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Miniaturas das Faces Salvas */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
              {Object.entries(confirmedOrder.item.surfaces).map(([sKey, sData]) => {
                if (!sData?.previewUrl) return null;
                return (
                  <div
                    key={sKey}
                    className="w-14 h-16 rounded-lg border border-slate-200 overflow-hidden bg-white p-0.5 shrink-0 shadow-xs"
                    title={`Face: ${sKey}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sData.previewUrl} alt={sKey} className="w-full h-full object-contain" />
                  </div>
                );
              })}
            </div>

            {/* Ações Finais */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full max-w-md mx-auto py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Enviar pelo WhatsApp para Confirmar</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="block mx-auto text-xs font-semibold text-slate-500 hover:text-slate-700 py-1 transition-colors cursor-pointer"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE CHECKOUT E REVISÃO */
          <form onSubmit={handleSubmitOrder}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-xs font-semibold text-[#C25E48] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Seu presente está quase pronto
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Confira os detalhes da sua criação antes de finalizar.
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {product.name} — {selectedColor.name}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Surface Previews Grid */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                  Superfícies Personalizadas (DTF UV)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.surfaces.map((surf) => {
                    const elements = surfacesState[surf.id]?.elements || [];
                    const isCustomized = elements.length > 0;
                    const previewImg = surfacePreviews[surf.id];

                    return (
                      <div
                        key={surf.id}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCustomized ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50'
                        }`}
                      >
                        <div className="aspect-[4/5] rounded-xl bg-white border border-slate-200/80 mb-2 flex items-center justify-center overflow-hidden relative">
                          {previewImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewImg} alt={surf.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {isCustomized ? 'Preview' : 'Sem arte'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-800 block truncate">
                          {surf.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            isCustomized ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {isCustomized ? `${elements.length} elemento(s)` : 'Sem arte'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity and Packaging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                {/* Quantity Selector */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Quantidade</span>
                    <span className="text-sm font-bold text-slate-800">
                      {quantity} {quantity === 1 ? 'caneca' : 'canecas'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Packaging Add-on */}
                <div
                  onClick={() => setIncludePackaging(!includePackaging)}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                    includePackaging
                      ? 'border-rose-300 bg-rose-50/40 text-rose-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        includePackaging ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Embalagem Presente Especial</span>
                      <span className="text-[11px] text-slate-500">Caixa decorada + laço de cetim</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-600">+ R$ 9,90</span>
                </div>
              </div>

              {/* Customer Details Form */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    Seus Dados para o Pedido
                  </h4>
                  <span className="text-[11px] text-slate-400">Sem necessidade de criar conta</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Ana Silva"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      WhatsApp com DDD <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ex: (11) 98765-4321"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      E-mail (opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Ex: ana@exemplo.com"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      CEP para Entrega (opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerCep}
                        onChange={(e) => setCustomerCep(e.target.value)}
                        placeholder="Ex: 01310-100"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Endereço de Entrega (opcional)
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Rua, número, complemento e bairro"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Observações Especiais (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ex: Gostaria de entrega rápida para presente de aniversário..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Caneca Cerâmica Base (inclui 1 superfície)</span>
                  <span className="font-medium text-slate-800">
                    R$ {product.basePrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {pricing.additionalSurfacesCount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>
                      Superfícies adicionais ({pricing.additionalSurfacesCount}x R${' '}
                      {product.surfaceAdditionalPrice.toFixed(2).replace('.', ',')})
                    </span>
                    <span className="font-medium">
                      + R$ {pricing.additionalSurfacesCost.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                {includePackaging && (
                  <div className="flex justify-between">
                    <span>Embalagem Especial de Presente</span>
                    <span className="font-medium text-slate-800">
                      + R$ {product.packagingPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-900">
                  <span>Valor Total Previsto ({quantity} un.)</span>
                  <span className="text-xl text-rose-600">
                    R$ {estimatedTotalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  * O valor final é formalmente validado e recalculado pelo servidor no fechamento.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Voltar e Continuar Editando
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando Pedido...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirmar e Gerar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
