/**
 * Sanitizador de segurança para arquivos SVG.
 * Previne ataques de XSS (Cross-Site Scripting) e injeção maliciosa em arquivos vetoriais.
 */

const DANGEROUS_TAGS = [
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'meta',
  'link',
  'base',
];

const DANGEROUS_ATTRIBUTES = [
  /^on\w+/i, // onload, onerror, onclick, etc.
  /^formaction$/i,
  /^xlink:href$/i, // when containing javascript:
  /^href$/i, // when containing javascript:
];

export function sanitizeSvg(svgContent: string): { sanitized: string; isValid: boolean; error?: string } {
  if (!svgContent || typeof svgContent !== 'string') {
    return { sanitized: '', isValid: false, error: 'Conteúdo SVG vazio ou inválido.' };
  }

  // Verificar se é de fato um SVG
  if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
    return { sanitized: '', isValid: false, error: 'O arquivo não contém tags <svg> válidas.' };
  }

  let cleaned = svgContent;

  // Remove XML comments that could hide payloads
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove dangerous tags and their contents
  for (const tag of DANGEROUS_TAGS) {
    const tagRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>|<${tag}[^>]*\\/?>`, 'gi');
    cleaned = cleaned.replace(tagRegex, '');
  }

  // Remove dangerous attributes (on*, javascript: in href, etc.)
  cleaned = cleaned.replace(/(\s+)(on\w+)\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');
  cleaned = cleaned.replace(/(\s+)(href|xlink:href)\s*=\s*["']\s*javascript:[^"']*["']/gi, '');
  cleaned = cleaned.replace(/(\s+)(href|xlink:href)\s*=\s*["']\s*data:text\/html[^"']*["']/gi, '');

  // Final validation check for any residual script or javascript:
  if (/script/i.test(cleaned) && /<[^>]*script/i.test(cleaned)) {
    return { sanitized: '', isValid: false, error: 'O arquivo SVG contém scripts maliciosos não permitidos.' };
  }

  if (/javascript:/i.test(cleaned)) {
    return { sanitized: '', isValid: false, error: 'O arquivo SVG contém protocolos javascript: inseguros.' };
  }

  return { sanitized: cleaned.trim(), isValid: true };
}
