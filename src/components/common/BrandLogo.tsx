import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'default' | 'horizontal' | 'compact' | 'white';
  showDescriptor?: boolean;
  className?: string;
  href?: string;
}

export function BrandLogo({
  variant = 'default',
  showDescriptor = true,
  className = '',
  href = '/',
}: BrandLogoProps) {
  const isCompact = variant === 'compact';
  const isWhite = variant === 'white';
  const asset = isCompact ? '/brand/icon.svg' : '/brand/logo-horizontal.svg';

  const content = (
    <div className={`flex items-center select-none ${isWhite ? 'rounded-2xl bg-[#FAF8F5] px-3 py-2' : ''} ${className}`}>
      <img
        src={asset}
        alt={isCompact ? 'Montuá' : 'Montuá Presentes Personalizados'}
        className={
          isCompact
            ? 'h-10 w-10 sm:h-11 sm:w-11 object-contain'
            : showDescriptor
              ? 'h-12 sm:h-14 w-auto max-w-[230px] sm:max-w-[280px] object-contain'
              : 'h-10 sm:h-12 w-auto max-w-[210px] sm:max-w-[250px] object-contain'
        }
        draggable={false}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center" aria-label="Montuá - início">
        {content}
      </Link>
    );
  }

  return content;
}
