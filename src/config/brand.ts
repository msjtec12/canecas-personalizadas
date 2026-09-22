/**
 * Configuração centralizada da identidade de marca Montuá.
 * Centraliza nomes, slogans, chamadas e descrições para manter coerência
 * visual e comercial sem dispersar textos por múltiplos componentes.
 */

export const brand = {
  name: 'Montuá',
  fullName: 'Montuá Presentes',
  descriptor: 'Presentes personalizados',
  segment: 'Presentes personalizados',
  concept: 'O cliente cria e monta visualmente seu próprio presente antes de fazer o pedido.',
  tagline: 'Você imagina. Você monta. A gente faz.',
  secondaryTagline: 'Crie do seu jeito.',

  // Hero da página inicial
  hero: {
    badge: 'Configurador Visual Interativo em Tempo Real',
    headline: 'Você imagina. Você monta. A gente faz.',
    subheadline: 'Crie presentes personalizados do seu jeito e veja como vão ficar antes de fazer o pedido.',
    ctaPrimary: 'Criar meu presente',
    ctaSecondary: 'Ver produtos',
  },

  // Etapas da experiência "Como Funciona"
  howItWorks: {
    sectionTitle: 'Do seu jeito, do começo ao fim.',
    sectionSubtitle: 'Sem burocracia ou formulários genéricos. Você tem total liberdade para montar e conferir cada detalhe em tempo real.',
    steps: [
      {
        number: 1,
        title: 'Escolha',
        description: 'Escolha o presente que deseja personalizar.',
      },
      {
        number: 2,
        title: 'Crie',
        description: 'Adicione fotos, nomes, frases e artes.',
      },
      {
        number: 3,
        title: 'Monte',
        description: 'Posicione cada detalhe exatamente onde quiser.',
      },
      {
        number: 4,
        title: 'Veja',
        description: 'Confira como seu presente ficará.',
      },
      {
        number: 5,
        title: 'Peça',
        description: 'Finalize seu pedido e nós cuidamos da produção.',
      },
    ],
  },

  // Textos do configurador
  configurator: {
    pageTitle: 'Crie seu presente',
    pageSubtitle: 'Personalize cada detalhe do seu jeito.',
    saveAlert: 'Sua personalização foi salva com sucesso.',
  },

  // Textos do checkout
  checkout: {
    reviewTitle: 'Seu presente está quase pronto.',
    reviewSubtitle: 'Confira os detalhes da sua criação antes de finalizar.',
    successTitle: 'Pedido recebido!',
    successHighlight: 'Agora sua criação está com a Montuá.',
    successSubtitle: 'Salvamos sua personalização com máxima precisão milimétrica para nossa equipe produzir.',
  },

  // Links e contatos
  contact: {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999',
    formattedPhone: '(11) 99999-9999',
  },
} as const;

export type BrandConfig = typeof brand;
