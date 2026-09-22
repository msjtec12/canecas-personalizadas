import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'default' | 'horizontal' | 'compact' | 'white';
  showDescriptor?: boolean;
  className?: string;
  href?: string;
}

/**
 * Componente oficial de logotipo da marca Montuá.
 * Apresenta uma assinatura tipográfica nobre, contemporânea e afetiva.
 * Preparado com fallback estrutural para suportar arquivos SVG dedicados
 * (/brand/logo.svg, /brand/logo-horizontal.svg, /brand/icon.svg) quando fornecidos.
 */
export function BrandLogo({
  variant = 'default',
  showDescriptor = true,
  className = '',
  href = '/',
}: BrandLogoProps) {
  const isWhite = variant === 'white';

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Símbolo / Ícone Tipográfico "M" Nobre */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-serif text-lg font-black transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-xs ${
          isWhite
            ? 'bg-white text-[#1C1917]'
            : 'bg-[#C25E48] text-white shadow-[#C25E48]/25'
        }`}
      >
        <span className="translate-y-[-0.5px]">M</span>
      </div>

      {/* Assinatura Tipográfica */}
      <div className="flex flex-col">
        <span
          className={`text-lg font-black tracking-tight leading-none font-serif ${
            isWhite ? 'text-white' : 'text-[#1C1917]'
          }`}
        >
          Montuá
        </span>
        {showDescriptor && (
          <span
            className={`text-[9.5px] font-semibold tracking-wider uppercase leading-tight mt-0.5 ${
              isWhite ? 'text-stone-300' : 'text-[#C25E48]'
            }`}
          >
            Presentes personalizados
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
