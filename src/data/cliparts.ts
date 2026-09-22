export interface ClipartItem {
  id: string;
  title: string;
  category: string;
  svgDataUri: string;
  isActive?: boolean;
  fileType?: string;
  createdAt?: string;
}

// Helper to encode clean, scalable SVGs as Data URIs
const createSvgUri = (svgInner: string, viewBox = '0 0 120 120'): string => {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="120" height="120">${svgInner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
};

export const CLIPART_CATEGORIES = [
  'Todos',
  'Amor',
  'Família',
  'Aniversário',
  'Casamento',
  'Bebê',
  'Profissões',
  'Datas comemorativas',
  'Frases',
  'Religioso',
  'Animais',
  'Outros',
] as const;

export const CLIPARTS_LIBRARY: ClipartItem[] = [
  // ==========================================
  // AMOR (Minimalist fine-line & luxury aesthetic)
  // ==========================================
  {
    id: 'amor-linework-coracao',
    title: 'Coração Traço Fino',
    category: 'Amor',
    svgDataUri: createSvgUri(
      `<path d="M60 98 C35 75 16 56 16 38 A22 22 0 0 1 60 28 A22 22 0 0 1 104 38 C104 56 85 75 60 98 Z" fill="none" stroke="#1C1917" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M72 36 A10 10 0 0 1 82 46" fill="none" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'amor-coracoes-minimalistas',
    title: 'Corações Duplos Delicados',
    category: 'Amor',
    svgDataUri: createSvgUri(
      `<path d="M48 85 C28 68 14 52 14 38 A18 18 0 0 1 50 29 A18 18 0 0 1 86 38 C86 52 72 68 48 85 Z" fill="none" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>
       <path d="M72 95 C56 82 46 70 46 58 A14 14 0 0 1 74 51 A14 14 0 0 1 102 58 C102 70 90 82 72 95 Z" fill="none" stroke="#C25E48" stroke-width="4" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'amor-infinito-botanico',
    title: 'Infinito Floral',
    category: 'Amor',
    svgDataUri: createSvgUri(
      `<path d="M38 48 C20 48 20 72 38 72 C56 72 64 48 82 48 C100 48 100 72 82 72 C64 72 56 48 38 48 Z" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
       <path d="M38 40 C36 44 38 48 42 48 C42 44 40 40 38 40 Z" fill="#1C1917"/>
       <path d="M82 80 C84 76 82 72 78 72 C78 76 80 80 82 80 Z" fill="#1C1917"/>
       <circle cx="60" cy="60" r="3" fill="#B45309"/>`
    ),
  },
  {
    id: 'amor-casal-linework',
    title: 'Casal Traço Contínuo',
    category: 'Amor',
    svgDataUri: createSvgUri(
      `<path d="M42 35 C42 22 55 20 58 32 C60 40 50 48 42 55 C38 58 35 65 35 75 M58 32 C65 24 78 26 78 38 C78 50 68 58 60 65 C58 72 62 82 68 92" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
       <path d="M60 48 Q68 42 74 46" fill="none" stroke="#C25E48" stroke-width="3" stroke-linecap="round"/>`
    ),
  },

  // ==========================================
  // FAMÍLIA (Warm, refined organic designs)
  // ==========================================
  {
    id: 'familia-lar-botanico',
    title: 'Nosso Doce Lar',
    category: 'Família',
    svgDataUri: createSvgUri(
      `<path d="M60 22 L22 54 L32 54 L32 96 L88 96 L88 54 L98 54 Z" fill="none" stroke="#1C1917" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
       <path d="M50 96 L50 68 C50 62 70 62 70 68 L70 96" fill="none" stroke="#1C1917" stroke-width="4"/>
       <path d="M60 40 C56 36 52 36 50 40 C48 44 54 48 60 52 C66 48 72 44 70 40 C68 36 64 36 60 40 Z" fill="#C25E48"/>`
    ),
  },
  {
    id: 'familia-arvore-genealogica',
    title: 'Árvore da Família',
    category: 'Família',
    svgDataUri: createSvgUri(
      `<path d="M60 98 L60 65 M60 65 C48 55 35 52 28 38 C38 36 48 42 56 52 M60 65 C72 55 85 52 92 38 C82 36 72 42 64 52 M60 52 C54 36 60 22 60 20 C60 22 66 36 60 52" fill="none" stroke="#1C1917" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="28" cy="38" r="4" fill="#B45309"/>
       <circle cx="92" cy="38" r="4" fill="#B45309"/>
       <circle cx="60" cy="20" r="4" fill="#C25E48"/>`
    ),
  },

  // ==========================================
  // ANIVERSÁRIO (Celebration elegance)
  // ==========================================
  {
    id: 'aniversario-bolo-elegante',
    title: 'Bolo Minimalista com Vela',
    category: 'Aniversário',
    svgDataUri: createSvgUri(
      `<rect x="25" y="60" width="70" height="38" rx="8" fill="none" stroke="#1C1917" stroke-width="4.5"/>
       <line x1="25" y1="78" x2="95" y2="78" stroke="#1C1917" stroke-width="3" stroke-dasharray="4,4"/>
       <line x1="60" y1="60" x2="60" y2="38" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
       <path d="M60 22 C64 28 64 32 60 36 C56 32 56 28 60 22 Z" fill="#B45309"/>
       <line x1="18" y1="98" x2="102" y2="98" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'aniversario-taca-brinde',
    title: 'Taças de Celebração',
    category: 'Aniversário',
    svgDataUri: createSvgUri(
      `<path d="M42 25 L54 52 C54 62 46 68 42 70 L42 92 M32 92 L52 92 M78 25 L66 52 C66 62 74 68 78 70 L78 92 M68 92 L88 92" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="60" cy="32" r="3" fill="#B45309"/>
       <circle cx="56" cy="24" r="2" fill="#B45309"/>
       <circle cx="64" cy="22" r="2" fill="#B45309"/>`
    ),
  },

  // ==========================================
  // CASAMENTO (Luxury bridal elegance)
  // ==========================================
  {
    id: 'casamento-aliancas-botanicas',
    title: 'Alianças com Ramo Floral',
    category: 'Casamento',
    svgDataUri: createSvgUri(
      `<circle cx="48" cy="62" r="26" fill="none" stroke="#B45309" stroke-width="5"/>
       <circle cx="72" cy="62" r="26" fill="none" stroke="#D97706" stroke-width="5"/>
       <polygon points="72,32 77,38 72,43 67,38" fill="#B45309"/>
       <path d="M30 85 C40 92 80 92 90 85" fill="none" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>
       <circle cx="60" cy="89" r="2.5" fill="#1C1917"/>`
    ),
  },
  {
    id: 'casamento-guirlanda-floral',
    title: 'Guirlanda Botânica Nupcial',
    category: 'Casamento',
    svgDataUri: createSvgUri(
      `<circle cx="60" cy="60" r="46" fill="none" stroke="#1C1917" stroke-width="3" stroke-dasharray="8,5"/>
       <path d="M22 60 C20 50 26 42 34 40 C32 48 28 54 22 60 Z" fill="#1C1917"/>
       <path d="M98 60 C100 70 94 78 86 80 C88 72 92 66 98 60 Z" fill="#1C1917"/>
       <path d="M60 14 C70 16 76 22 74 30 C68 26 64 20 60 14 Z" fill="#1C1917"/>
       <circle cx="60" cy="60" r="6" fill="#C25E48"/>`
    ),
  },

  // ==========================================
  // BEBÊ (Gentle nursery minimalist)
  // ==========================================
  {
    id: 'bebe-pezinhos-traco',
    title: 'Pezinhos Delicados',
    category: 'Bebê',
    svgDataUri: createSvgUri(
      `<path d="M42 62 C32 62 26 78 36 86 C46 94 54 78 48 68 C46 63 44 62 42 62 Z" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
       <circle cx="34" cy="52" r="3.5" fill="#1C1917"/>
       <circle cx="42" cy="48" r="3.5" fill="#1C1917"/>
       <circle cx="50" cy="50" r="3" fill="#1C1917"/>
       <path d="M74 62 C64 62 58 78 68 86 C78 94 86 78 80 68 C78 63 76 62 74 62 Z" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
       <circle cx="66" cy="50" r="3" fill="#1C1917"/>
       <circle cx="74" cy="48" r="3.5" fill="#1C1917"/>
       <circle cx="82" cy="52" r="3.5" fill="#1C1917"/>`
    ),
  },
  {
    id: 'bebe-cegonha-minimal',
    title: 'Chupeta Delicada com Laço',
    category: 'Bebê',
    svgDataUri: createSvgUri(
      `<circle cx="60" cy="56" r="18" fill="none" stroke="#1C1917" stroke-width="4.5"/>
       <circle cx="60" cy="56" r="8" fill="#1C1917"/>
       <path d="M60 74 C50 74 46 88 60 92 C74 88 70 74 60 74 Z" fill="none" stroke="#1C1917" stroke-width="4"/>
       <path d="M60 38 C52 38 48 24 60 22 C72 24 68 38 60 38 Z" fill="none" stroke="#B45309" stroke-width="4"/>`
    ),
  },

  // ==========================================
  // PROFISSÕES (Sophisticated emblems)
  // ==========================================
  {
    id: 'profissoes-medicina-linha',
    title: 'Medicina & Enfermagem',
    category: 'Profissões',
    svgDataUri: createSvgUri(
      `<path d="M38 24 L38 52 C38 72 82 72 82 52 L82 24" fill="none" stroke="#1C1917" stroke-width="5" stroke-linecap="round"/>
       <path d="M60 66 L60 84" stroke="#1C1917" stroke-width="5"/>
       <circle cx="60" cy="92" r="10" fill="none" stroke="#1C1917" stroke-width="4.5"/>
       <circle cx="36" cy="22" r="5" fill="#1C1917"/>
       <circle cx="84" cy="22" r="5" fill="#1C1917"/>`
    ),
  },
  {
    id: 'profissoes-direito-balanca',
    title: 'Balança da Justiça Minimal',
    category: 'Profissões',
    svgDataUri: createSvgUri(
      `<line x1="60" y1="20" x2="60" y2="96" stroke="#1C1917" stroke-width="5" stroke-linecap="round"/>
       <line x1="24" y1="36" x2="96" y2="36" stroke="#1C1917" stroke-width="5" stroke-linecap="round"/>
       <path d="M18 62 Q30 72 42 62 Z" fill="none" stroke="#1C1917" stroke-width="4"/>
       <line x1="24" y1="36" x2="18" y2="62" stroke="#1C1917" stroke-width="2"/>
       <line x1="36" y1="36" x2="42" y2="62" stroke="#1C1917" stroke-width="2"/>
       <path d="M78 62 Q90 72 102 62 Z" fill="none" stroke="#1C1917" stroke-width="4"/>
       <line x1="84" y1="36" x2="78" y2="62" stroke="#1C1917" stroke-width="2"/>
       <line x1="96" y1="36" x2="102" y2="62" stroke="#1C1917" stroke-width="2"/>
       <line x1="42" y1="96" x2="78" y2="96" stroke="#1C1917" stroke-width="5" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'profissoes-pedagogia-coruja',
    title: 'Coruja da Sabedoria',
    category: 'Profissões',
    svgDataUri: createSvgUri(
      `<circle cx="44" cy="46" r="14" fill="none" stroke="#1C1917" stroke-width="4"/>
       <circle cx="44" cy="46" r="5" fill="#1C1917"/>
       <circle cx="76" cy="46" r="14" fill="none" stroke="#1C1917" stroke-width="4"/>
       <circle cx="76" cy="46" r="5" fill="#1C1917"/>
       <polygon points="60,54 54,64 66,64" fill="#B45309"/>
       <path d="M30 46 C30 80 90 80 90 46 C80 32 40 32 30 46 Z" fill="none" stroke="#1C1917" stroke-width="4"/>
       <path d="M34 26 L44 36 M86 26 L76 36" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>`
    ),
  },

  // ==========================================
  // DATAS COMEMORATIVAS
  // ==========================================
  {
    id: 'datas-natal-pinheiro-traco',
    title: 'Pinheiro de Natal Traço Moderno',
    category: 'Datas comemorativas',
    svgDataUri: createSvgUri(
      `<path d="M60 16 L34 46 L46 46 L26 74 L42 74 L20 98 L100 98 L78 74 L94 74 L74 46 L86 46 Z" fill="none" stroke="#1C1917" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
       <line x1="60" y1="98" x2="60" y2="108" stroke="#1C1917" stroke-width="5" stroke-linecap="round"/>
       <polygon points="60,8 63,15 70,15 64,19 66,26 60,21 54,26 56,19 50,15 57,15" fill="#B45309"/>`
    ),
  },

  // ==========================================
  // FRASES (Caligrafia e badges de ateliê)
  // ==========================================
  {
    id: 'frase-gratidao-caligrafica',
    title: 'Gratidão com Raminho',
    category: 'Frases',
    svgDataUri: createSvgUri(
      `<text x="60" y="58" font-size="22" font-family="'Dancing Script', cursive, serif" font-weight="700" fill="#1C1917" text-anchor="middle">Gratidão</text>
       <path d="M28 72 C42 66 78 66 92 72 M60 68 C58 74 62 76 60 80" stroke="#B45309" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'frase-selo-melhor-mae',
    title: 'Selo Amor de Mãe',
    category: 'Frases',
    svgDataUri: createSvgUri(
      `<circle cx="60" cy="60" r="50" fill="none" stroke="#1C1917" stroke-width="2" stroke-dasharray="4,4"/>
       <circle cx="60" cy="60" r="44" fill="none" stroke="#B45309" stroke-width="1.5"/>
       <text x="60" y="46" font-size="11" font-family="'Montserrat', sans-serif" font-weight="700" fill="#1C1917" letter-spacing="2" text-anchor="middle">MELHOR</text>
       <text x="60" y="66" font-size="22" font-family="'Playfair Display', serif" font-style="italic" font-weight="700" fill="#C25E48" text-anchor="middle">Mãe</text>
       <text x="60" y="80" font-size="9" font-family="'Montserrat', sans-serif" font-weight="600" fill="#78716C" letter-spacing="2" text-anchor="middle">DO MUNDO</text>`
    ),
  },
  {
    id: 'frase-amor-que-multiplica',
    title: 'O Amor Mora Aqui',
    category: 'Frases',
    svgDataUri: createSvgUri(
      `<text x="60" y="52" font-size="14" font-family="'Playfair Display', serif" font-weight="600" fill="#1C1917" text-anchor="middle">O amor</text>
       <text x="60" y="72" font-size="18" font-family="'Dancing Script', cursive" font-weight="700" fill="#B45309" text-anchor="middle">mora aqui</text>
       <circle cx="60" cy="84" r="3" fill="#C25E48"/>`
    ),
  },

  // ==========================================
  // RELIGIOSO (Fine-line spiritual art)
  // ==========================================
  {
    id: 'religioso-cruz-floral',
    title: 'Cruz Sagrada Floral',
    category: 'Religioso',
    svgDataUri: createSvgUri(
      `<line x1="60" y1="18" x2="60" y2="102" stroke="#1C1917" stroke-width="4.5" stroke-linecap="round"/>
       <line x1="32" y1="44" x2="88" y2="44" stroke="#1C1917" stroke-width="4.5" stroke-linecap="round"/>
       <circle cx="60" cy="44" r="14" fill="none" stroke="#B45309" stroke-width="2.5" stroke-dasharray="3,3"/>
       <path d="M50 56 Q60 52 70 56" fill="none" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'religioso-pomba-paz',
    title: 'Pomba da Paz Minimal',
    category: 'Religioso',
    svgDataUri: createSvgUri(
      `<path d="M34 68 C34 52 48 46 62 40 C68 24 84 30 84 40 C94 36 100 46 94 56 C88 66 74 72 58 72 C46 72 34 82 24 82 C28 75 32 72 34 68 Z" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M94 50 L104 46" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>
       <circle cx="86" cy="44" r="2.5" fill="#1C1917"/>`
    ),
  },

  // ==========================================
  // ANIMAIS (Minimalist pet silhouettes)
  // ==========================================
  {
    id: 'animais-patinha-delicada',
    title: 'Patinha Pet com Coração',
    category: 'Animais',
    svgDataUri: createSvgUri(
      `<path d="M60 62 C50 62 42 74 48 84 C54 94 66 94 72 84 C78 74 70 62 60 62 Z" fill="none" stroke="#1C1917" stroke-width="4.5" stroke-linejoin="round"/>
       <ellipse cx="36" cy="52" rx="7" ry="10" fill="none" stroke="#1C1917" stroke-width="4"/>
       <ellipse cx="52" cy="42" rx="7" ry="10" fill="none" stroke="#1C1917" stroke-width="4"/>
       <ellipse cx="68" cy="42" rx="7" ry="10" fill="none" stroke="#1C1917" stroke-width="4"/>
       <ellipse cx="84" cy="52" rx="7" ry="10" fill="none" stroke="#1C1917" stroke-width="4"/>
       <path d="M60 74 C58 72 56 72 55 74 C54 76 57 78 60 80 C63 78 66 76 65 74 C64 72 62 72 60 74 Z" fill="#C25E48"/>`
    ),
  },
  {
    id: 'animais-gato-linework',
    title: 'Gatinho Traço Contínuo',
    category: 'Animais',
    svgDataUri: createSvgUri(
      `<path d="M38 90 C36 74 42 62 48 56 L42 36 L56 46 C64 42 74 44 80 50 L92 38 L88 58 C96 68 96 82 92 90" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="54" cy="62" r="2.5" fill="#1C1917"/>
       <circle cx="74" cy="62" r="2.5" fill="#1C1917"/>
       <path d="M64 68 L64 72" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>`
    ),
  },

  // ==========================================
  // OUTROS (Botanicals, crowns, luxury frames)
  // ==========================================
  {
    id: 'outros-ramo-botanico',
    title: 'Ramo Botânico Eucalipto',
    category: 'Outros',
    svgDataUri: createSvgUri(
      `<path d="M30 102 C42 82 60 52 78 22" fill="none" stroke="#1C1917" stroke-width="4" stroke-linecap="round"/>
       <ellipse cx="44" cy="74" rx="10" ry="6" transform="rotate(-30 44 74)" fill="none" stroke="#1C1917" stroke-width="3.5"/>
       <ellipse cx="60" cy="54" rx="10" ry="6" transform="rotate(30 60 54)" fill="none" stroke="#1C1917" stroke-width="3.5"/>
       <ellipse cx="68" cy="36" rx="8" ry="5" transform="rotate(-20 68 36)" fill="none" stroke="#1C1917" stroke-width="3.5"/>
       <ellipse cx="78" cy="22" rx="6" ry="4" fill="#B45309"/>`
    ),
  },
  {
    id: 'outros-coroa-monograma',
    title: 'Coroa Imperial de Ateliê',
    category: 'Outros',
    svgDataUri: createSvgUri(
      `<path d="M25 78 L25 45 L42 60 L60 32 L78 60 L95 45 L95 78 Z" fill="none" stroke="#1C1917" stroke-width="4.5" stroke-linejoin="round"/>
       <line x1="20" y1="84" x2="100" y2="84" stroke="#1C1917" stroke-width="5" stroke-linecap="round"/>
       <circle cx="25" cy="40" r="4" fill="#B45309"/>
       <circle cx="60" cy="26" r="4.5" fill="#B45309"/>
       <circle cx="95" cy="40" r="4" fill="#B45309"/>`
    ),
  },
  {
    id: 'outros-moldura-geometrica',
    title: 'Moldura Octogonal Minimal',
    category: 'Outros',
    svgDataUri: createSvgUri(
      `<polygon points="40,16 80,16 104,40 104,80 80,104 40,104 16,80 16,40" fill="none" stroke="#1C1917" stroke-width="3.5"/>
       <polygon points="42,22 78,22 98,42 98,78 78,98 42,98 22,78 22,42" fill="none" stroke="#B45309" stroke-width="1.5" stroke-dasharray="4,4"/>`
    ),
  },
];
