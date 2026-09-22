import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Eye,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Gift,
  Layers,
  Sparkle,
} from 'lucide-react';
import { PRODUCTS_CATALOG } from '@/data/products';
import { ProductCardFigure } from '@/components/common/ProductCardFigure';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col selection:bg-[#C25E48] selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1C1917] text-white/90 text-center py-2 px-4 text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Personalização profissional com acabamento nobre em adesivo DTF UV em alto relevo</span>
      </div>

      {/* 2. HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C25E48] flex items-center justify-center text-white shadow-sm shadow-[#C25E48]/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#1C1917] block leading-tight font-serif">
                Feito de Nós
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#C25E48] block">
                Ateliê de Presentes
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#como-funciona" className="hover:text-[#C25E48] transition-colors">
              Como Funciona
            </a>
            <a href="#produtos" className="hover:text-[#C25E48] transition-colors">
              Produtos
            </a>
            <a href="#diferenciais" className="hover:text-[#C25E48] transition-colors">
              Tecnologia DTF UV
            </a>
            <Link
              href="/admin"
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              Painel Admin
            </Link>
          </nav>

          <Link
            href="/personalizar/caneca"
            className="px-5 py-2.5 sm:py-3 bg-[#C25E48] hover:bg-[#A94A36] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#C25E48]/20 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>Personalizar Caneca</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-[#FAF8F5] via-[#F5F2EC] to-[#FAF8F5] border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold">
                <Sparkle className="w-3.5 h-3.5 text-[#C25E48]" />
                <span>Configurador Visual Interativo em Tempo Real</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight leading-[1.1] font-serif">
                Crie um presente que é{' '}
                <span className="text-[#C25E48] italic font-serif">
                  só seu.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Monte seu presente do seu jeito. Escolha o produto, personalize com fotos, nomes e mensagens e veja exatamente como ele ficará antes de pedir.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/personalizar/caneca"
                  className="w-full sm:w-auto px-8 py-4 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-base rounded-xl shadow-lg shadow-[#C25E48]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Montar meu presente</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#como-funciona"
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-base rounded-xl border border-stone-200 shadow-xs transition-colors flex items-center justify-center"
                >
                  Ver como funciona
                </a>
              </div>

              {/* Guarantees */}
              <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Adesivo DTF UV Alta Fixação</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C25E48]" />
                  <span>Preview Realista das 4 Superfícies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Acabamento Artesanal de Ateliê</span>
                </div>
              </div>
            </div>

            {/* Right Showcase: Real Studio Mockup Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/60 border border-stone-200/80">
                {/* Ribbon Tag */}
                <div className="absolute -top-3 right-6 bg-[#1C1917] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                  PERSONALIZAÇÃO EXCLUSIVA
                </div>

                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#F9F7F4] to-[#F0EDE6] border border-stone-100 flex items-center justify-center overflow-hidden mb-5">
                  <ProductCardFigure slug="caneca" className="scale-110" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">Caneca Cerâmica 325ml</h3>
                      <p className="text-xs text-stone-500">Impressão direta em relevo DTF UV</p>
                    </div>
                    <span className="text-lg font-black text-[#C25E48]">R$ 29,90</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100 text-center">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">Frente</span>
                      <span className="text-xs font-semibold text-stone-700">Foto / Nome</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">Verso</span>
                      <span className="text-xs font-semibold text-stone-700">Dedicatória</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">Alça</span>
                      <span className="text-xs font-semibold text-stone-700">Data / Símbolo</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">Fundo</span>
                      <span className="text-xs font-semibold text-stone-700">Assinatura</span>
                    </div>
                  </div>

                  <Link
                    href="/personalizar/caneca"
                    className="w-full py-3 bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#C25E48] font-bold text-xs rounded-xl border border-[#E7E5E4] flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    <span>Abrir no Configurador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 bg-white border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E48] block mb-2">
              Passo a Passo
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif">
              Como funciona?
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              Sem formulários burocráticos. Você experimenta as artes na peça em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 hover:border-[#C25E48]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#C25E48] text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-[#C25E48]/20">
                1
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Escolha o produto</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Selecione a caneca e sua cor (branca, preta, vermelha, azul ou rosa).
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 hover:border-[#C25E48]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-amber-600/20">
                2
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Personalize</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Insira textos com tipografias de ateliê, envie suas fotos ou escolha ilustrações prontas.
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 hover:border-[#C25E48]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-stone-800/20">
                3
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Veja como ficará</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Gire o produto e visualize frente, verso, alça e fundo em proporção exata.
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 hover:border-[#C25E48]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-emerald-700/20">
                4
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Finalize seu pedido</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Conclua via WhatsApp com a ficha completa e receba seu presente perfeito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CATÁLOGO DE PRODUTOS */}
      <section id="produtos" className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E48] block mb-2">
              Coleção de Presentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif">
              Escolha a base para criar
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              Produtos nobres preparados para receber adesivos DTF UV de alta durabilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS_CATALOG.map((item) => {
              const isAvailable = item.isActive;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                    isAvailable
                      ? 'border-[#C25E48]/30 shadow-md shadow-stone-200/50 hover:shadow-xl hover:shadow-stone-200/80 hover:-translate-y-1'
                      : 'border-stone-200/80 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[11px] font-bold rounded-full uppercase tracking-wider">
                        {item.category}
                      </span>
                      {isAvailable ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disponível
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-500 border border-stone-200 text-[11px] font-semibold rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Em breve
                        </span>
                      )}
                    </div>

                    {/* Realistic Product Render */}
                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#FAF8F5] to-[#F2EFE9] border border-stone-100 mb-4 flex items-center justify-center p-3">
                      <ProductCardFigure slug={item.slug} />
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 mb-1">{item.name}</h3>
                    <p className="text-xs text-stone-500 mb-4 line-clamp-2">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">A partir de</span>
                      <span className="text-lg font-black text-stone-900">
                        R$ {item.basePrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {isAvailable ? (
                      <Link
                        href="/personalizar/caneca"
                        className="px-4 py-2 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <span>Personalizar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-stone-100 text-stone-400 font-medium text-xs rounded-xl cursor-not-allowed"
                      >
                        Em breve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DIFERENCIAL DTF UV */}
      <section id="diferenciais" className="py-20 bg-white border-y border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-700" /> Tecnologia Premium DTF UV
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight font-serif">
                Você cria. <br />
                <span className="text-[#C25E48] italic">A gente transforma em presente.</span>
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Diferente de estampas tradicionais que desbotam ou craquelam, os adesivos DTF UV proporcionam relevo tátil sofisticado, cores fiéis e verniz protetor ultrabrilhante.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                  <div className="w-8 h-8 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Toque em Relevo Acetinado</h4>
                    <p className="text-xs text-stone-500">
                      Verniz UV multicamada com textura sensorial perceptível ao passar a mão.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                  <div className="w-8 h-8 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Alta Resistência a Lavagens</h4>
                    <p className="text-xs text-stone-500">
                      Cura ultravioleta com cola de alta aderência que suporta água fria e uso cotidiano.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                  <div className="w-8 h-8 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Cores Vibrantes em Qualquer Base</h4>
                    <p className="text-xs text-stone-500">
                      Camada base de branco nobre garantindo contraste total, mesmo em canecas pretas ou coloridas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  href="/personalizar/caneca"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1C1917] hover:bg-stone-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
                >
                  <span>Experimentar o Configurador Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Studio Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#FAF8F5] via-[#F3EFE9] to-[#EBE6DC] rounded-3xl p-8 border border-stone-200 flex flex-col items-center justify-center text-center shadow-md">
              <div className="w-full max-w-sm aspect-[4/3] rounded-2xl bg-white/80 backdrop-blur p-4 border border-stone-200/60 shadow-sm flex items-center justify-center mb-6">
                <ProductCardFigure slug="caneca" />
              </div>

              <span className="text-xs font-bold text-[#C25E48] uppercase tracking-widest mb-1">
                Ateliê Feito de Nós
              </span>
              <h3 className="text-2xl font-black text-stone-900 font-serif mb-2">
                Mais do que um produto, um afeto eterno.
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mb-4">
                Personalize com o nome de quem você ama, aquela foto inesquecível de viagem ou uma dedicatória que só vocês entendem.
              </p>

              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                Avaliação 5 estrelas em presentes artesanais
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto bg-[#1C1917] text-stone-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C25E48] text-white flex items-center justify-center font-black">
              FN
            </div>
            <div>
              <span className="font-bold text-white block">Feito de Nós — Personalize seu Presente</span>
              <span className="text-[11px] text-stone-500">
                Adesivos DTF UV em alto relevo com acabamento de ateliê
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/personalizar/caneca" className="hover:text-white transition-colors">
              Configurador Caneca
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Painel Administrativo
            </Link>
          </div>

          <p className="text-stone-500 text-center sm:text-right">
            © {new Date().getFullYear()} Feito de Nós. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
