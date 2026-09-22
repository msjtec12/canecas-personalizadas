export interface PhrasePreset {
  id: string;
  text: string;
  category: string;
  suggestedFont?: string;
  tags?: string[];
}

export const PHRASE_CATEGORIES = [
  'Todos',
  'Amor',
  'Família',
  'Mãe',
  'Pai',
  'Amizade',
  'Aniversário',
  'Humor',
  'Café',
  'Motivacional',
  'Religioso',
  'Pet',
  'Trabalho',
] as const;

export const PHRASES_LIBRARY: PhrasePreset[] = [
  { id: 'amor-01', text: 'Você é meu lugar favorito.', category: 'Amor', suggestedFont: 'Dancing Script', tags: ['casal', 'romântico'] },
  { id: 'amor-02', text: 'Te amo mais a cada café.', category: 'Amor', suggestedFont: 'Pacifico', tags: ['casal', 'café'] },
  { id: 'amor-03', text: 'Meu melhor acaso foi encontrar você.', category: 'Amor', suggestedFont: 'Playfair Display', tags: ['casal'] },
  { id: 'amor-04', text: 'Onde você estiver, é meu lar.', category: 'Amor', suggestedFont: 'Great Vibes', tags: ['romântico'] },
  { id: 'amor-05', text: 'Nós dois, sempre.', category: 'Amor', suggestedFont: 'Montserrat', tags: ['casal', 'minimalista'] },

  { id: 'familia-01', text: 'Família: onde a vida começa e o amor nunca termina.', category: 'Família', suggestedFont: 'Playfair Display', tags: ['lar'] },
  { id: 'familia-02', text: 'Nosso lar, nossa história.', category: 'Família', suggestedFont: 'Dancing Script', tags: ['lar'] },
  { id: 'familia-03', text: 'Juntos é o nosso lugar favorito.', category: 'Família', suggestedFont: 'Montserrat', tags: ['lar'] },
  { id: 'familia-04', text: 'Amor que atravessa gerações.', category: 'Família', suggestedFont: 'Cinzel', tags: ['avós', 'família'] },

  { id: 'mae-01', text: 'Mãe, meu primeiro amor.', category: 'Mãe', suggestedFont: 'Great Vibes', tags: ['dia das mães'] },
  { id: 'mae-02', text: 'Mãe: amor que não cabe em palavras.', category: 'Mãe', suggestedFont: 'Playfair Display', tags: ['dia das mães'] },
  { id: 'mae-03', text: 'Minha mãe, minha força.', category: 'Mãe', suggestedFont: 'Montserrat', tags: ['mãe'] },
  { id: 'mae-04', text: 'Café da melhor mãe do mundo.', category: 'Mãe', suggestedFont: 'Pacifico', tags: ['café', 'mãe'] },

  { id: 'pai-01', text: 'Pai, meu exemplo para a vida.', category: 'Pai', suggestedFont: 'Montserrat', tags: ['dia dos pais'] },
  { id: 'pai-02', text: 'Meu herói sempre foi você, pai.', category: 'Pai', suggestedFont: 'Playfair Display', tags: ['dia dos pais'] },
  { id: 'pai-03', text: 'Pai: parceiro para todas as horas.', category: 'Pai', suggestedFont: 'Oswald', tags: ['pai'] },

  { id: 'amizade-01', text: 'Amizade boa é aquela que vira família.', category: 'Amizade', suggestedFont: 'Dancing Script', tags: ['amigos'] },
  { id: 'amizade-02', text: 'Café, conversa e boas risadas.', category: 'Amizade', suggestedFont: 'Pacifico', tags: ['amigos', 'café'] },
  { id: 'amizade-03', text: 'Amigas por escolha, irmãs de coração.', category: 'Amizade', suggestedFont: 'Great Vibes', tags: ['amigas'] },

  { id: 'aniv-01', text: 'A melhor idade é a que a gente vive feliz.', category: 'Aniversário', suggestedFont: 'Montserrat', tags: ['festa'] },
  { id: 'aniv-02', text: 'Colecionando histórias, risadas e aniversários.', category: 'Aniversário', suggestedFont: 'Playfair Display', tags: ['festa'] },
  { id: 'aniv-03', text: 'Mais um ano incrível começa agora.', category: 'Aniversário', suggestedFont: 'Pacifico', tags: ['festa'] },
  { id: 'aniv-04', text: 'Nível desbloqueado: +1 ano.', category: 'Aniversário', suggestedFont: 'Bebas Neue', tags: ['gamer', 'humor'] },

  { id: 'humor-01', text: 'Não sou eu sem café.', category: 'Humor', suggestedFont: 'Bebas Neue', tags: ['meme', 'café'] },
  { id: 'humor-02', text: 'Hoje não, produção.', category: 'Humor', suggestedFont: 'Montserrat', tags: ['meme', 'trabalho'] },
  { id: 'humor-03', text: 'Surtei, mas passo bem.', category: 'Humor', suggestedFont: 'Pacifico', tags: ['meme'] },
  { id: 'humor-04', text: 'A diva está off.', category: 'Humor', suggestedFont: 'Bebas Neue', tags: ['meme'] },
  { id: 'humor-05', text: 'Fofoqueira? Eu prefiro bem informada.', category: 'Humor', suggestedFont: 'Montserrat', tags: ['meme'] },
  { id: 'humor-06', text: 'Minha bateria social acabou.', category: 'Humor', suggestedFont: 'Oswald', tags: ['meme'] },
  { id: 'humor-07', text: 'Eu tentei ser normal. Não gostei.', category: 'Humor', suggestedFont: 'Caveat', tags: ['meme'] },
  { id: 'humor-08', text: 'Sem condições antes do café.', category: 'Humor', suggestedFont: 'Bebas Neue', tags: ['meme', 'café'] },

  { id: 'cafe-01', text: 'Primeiro o café. Depois a gente conversa.', category: 'Café', suggestedFont: 'Oswald', tags: ['café'] },
  { id: 'cafe-02', text: 'Movida a café e sonhos.', category: 'Café', suggestedFont: 'Dancing Script', tags: ['café'] },
  { id: 'cafe-03', text: 'Café: meu combustível oficial.', category: 'Café', suggestedFont: 'Bebas Neue', tags: ['café'] },
  { id: 'cafe-04', text: 'Um café e tudo se resolve.', category: 'Café', suggestedFont: 'Pacifico', tags: ['café'] },

  { id: 'motiv-01', text: 'Vai dar certo. Continue.', category: 'Motivacional', suggestedFont: 'Montserrat', tags: ['força'] },
  { id: 'motiv-02', text: 'Um passo de cada vez.', category: 'Motivacional', suggestedFont: 'Playfair Display', tags: ['força'] },
  { id: 'motiv-03', text: 'Você é mais forte do que imagina.', category: 'Motivacional', suggestedFont: 'Dancing Script', tags: ['força'] },
  { id: 'motiv-04', text: 'Faça hoje valer a pena.', category: 'Motivacional', suggestedFont: 'Bebas Neue', tags: ['motivação'] },

  { id: 'relig-01', text: 'Deus cuida de cada detalhe.', category: 'Religioso', suggestedFont: 'Great Vibes', tags: ['fé'] },
  { id: 'relig-02', text: 'Tudo posso naquele que me fortalece.', category: 'Religioso', suggestedFont: 'Playfair Display', tags: ['fé'] },
  { id: 'relig-03', text: 'Grandes coisas fez o Senhor por nós.', category: 'Religioso', suggestedFont: 'Cinzel', tags: ['fé'] },
  { id: 'relig-04', text: 'Fé para todos os dias.', category: 'Religioso', suggestedFont: 'Dancing Script', tags: ['fé'] },

  { id: 'pet-01', text: 'Minha casa tem pelos e muito amor.', category: 'Pet', suggestedFont: 'Caveat', tags: ['cachorro', 'gato'] },
  { id: 'pet-02', text: 'Melhor amigo de quatro patas.', category: 'Pet', suggestedFont: 'Montserrat', tags: ['pet'] },
  { id: 'pet-03', text: 'Lar é onde meu pet está.', category: 'Pet', suggestedFont: 'Dancing Script', tags: ['pet'] },
  { id: 'pet-04', text: 'Aqui quem manda é o pet.', category: 'Pet', suggestedFont: 'Bebas Neue', tags: ['humor', 'pet'] },

  { id: 'trab-01', text: 'Foco, café e resultado.', category: 'Trabalho', suggestedFont: 'Oswald', tags: ['profissão'] },
  { id: 'trab-02', text: 'Reunião que poderia ser um e-mail.', category: 'Trabalho', suggestedFont: 'Montserrat', tags: ['humor', 'escritório'] },
  { id: 'trab-03', text: 'Em modo produtividade.', category: 'Trabalho', suggestedFont: 'Bebas Neue', tags: ['trabalho'] },
  { id: 'trab-04', text: 'Profissional em resolver problemas.', category: 'Trabalho', suggestedFont: 'Montserrat', tags: ['profissão'] },
];
