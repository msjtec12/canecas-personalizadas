'use client';

import React from 'react';

interface ProductCardFigureProps {
  slug: string;
  className?: string;
}

export const ProductCardFigure: React.FC<ProductCardFigureProps> = ({ slug, className = '' }) => {
  if (slug === 'caneca') {
    return (
      <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 280 220" className="w-full h-full max-h-48 drop-shadow-md" fill="none">
          <defs>
            <radialGradient id="cardMugShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cardMugBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D8D8D8" />
              <stop offset="15%" stopColor="#F5F5F5" />
              <stop offset="35%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#FAFAFA" />
              <stop offset="100%" stopColor="#D4D4D8" />
            </linearGradient>
            <linearGradient id="cardMugGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="goldSample" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="130" cy="198" rx="85" ry="12" fill="url(#cardMugShadow)" />

          {/* Handle */}
          <path
            d="M175 65 C235 65, 240 145, 175 152 C182 140, 218 135, 210 98 C204 68, 180 72, 175 65 Z"
            fill="#E4E4E7"
            stroke="#D4D4D8"
            strokeWidth="1.5"
          />

          {/* Cylinder Body */}
          <path
            d="M70 38 L70 174 C70 190, 185 190, 185 174 L185 38 Z"
            fill="url(#cardMugBody)"
            stroke="#E4E4E7"
            strokeWidth="1"
          />

          {/* Top Rim */}
          <ellipse cx="127.5" cy="38" rx="57.5" ry="12" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1" />
          <ellipse cx="127.5" cy="39" rx="52" ry="9.5" fill="#E2E8F0" opacity="0.4" />
          <ellipse cx="127.5" cy="40" rx="48" ry="7.5" fill="#18181B" opacity="0.3" />

          {/* Specular gloss */}
          <rect x="80" y="44" width="12" height="130" rx="6" fill="url(#cardMugGloss)" />

          {/* Sample DTF UV Graphic printed on Mug */}
          <g transform="translate(108, 92) scale(0.65)">
            <circle cx="30" cy="30" r="28" fill="none" stroke="url(#goldSample)" stroke-width="2.5" stroke-dasharray="3,3" />
            <path d="M30 18 C22 18 18 25 30 35 C42 25 38 18 30 18 Z" fill="#C25E48" />
            <text x="30" y="46" font-size="7" font-family="'Montserrat', sans-serif" font-weight="700" fill="#1C1917" text-anchor="middle" letter-spacing="1">
              FEITO DE NÓS
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (slug === 'pratos') {
    return (
      <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 240 200" className="w-full h-full max-h-48 drop-shadow-md" fill="none">
          <defs>
            <radialGradient id="plateShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="porcelainGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="120" cy="165" rx="80" ry="14" fill="url(#plateShadow)" />

          {/* Outer Porcelain Plate with Gold Rim */}
          <ellipse cx="120" cy="100" rx="90" ry="58" fill="url(#porcelainGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
          <ellipse cx="120" cy="100" rx="85" ry="54" fill="none" stroke="#D97706" strokeWidth="1.5" opacity="0.8" />

          {/* Inner Well */}
          <ellipse cx="120" cy="100" rx="55" ry="34" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

          {/* Sample Monogram */}
          <g transform="translate(100, 85)">
            <text x="20" y="16" font-size="14" font-family="'Playfair Display', serif" font-weight="700" font-style="italic" fill="#B45309" text-anchor="middle">
              M & A
            </text>
            <line x1="8" y1="20" x2="32" y2="20" stroke="#B45309" stroke-width="0.8" />
          </g>
        </svg>
      </div>
    );
  }

  if (slug === 'copos') {
    return (
      <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 200 220" className="w-full h-full max-h-48 drop-shadow-md" fill="none">
          <defs>
            <radialGradient id="cupShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="tumblerMatte" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="steelLip" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="200" rx="55" ry="10" fill="url(#cupShadow)" />

          {/* Steel Lip Rim */}
          <path d="M68 40 L132 40 L134 48 L66 48 Z" fill="url(#steelLip)" stroke="#64748B" strokeWidth="0.8" />

          {/* Acrylic Clear Lid */}
          <ellipse cx="100" cy="38" rx="34" ry="7" fill="#E2E8F0" opacity="0.8" stroke="#94A3B8" strokeWidth="1" />

          {/* Tumbler Body */}
          <path d="M66 48 L76 190 C76 194, 124 194, 124 190 L134 48 Z" fill="url(#tumblerMatte)" />

          {/* Soft Highlight */}
          <path d="M78 50 L84 186" stroke="#FFFFFF" strokeWidth="3" opacity="0.15" strokeLinecap="round" />

          {/* Engraving sample */}
          <text x="100" y="125" font-size="10" font-family="'Oswald', sans-serif" font-weight="600" fill="#F8FAFC" opacity="0.9" text-anchor="middle" letter-spacing="2">
            EXPLORE
          </text>
        </svg>
      </div>
    );
  }

  if (slug === 'garrafas') {
    return (
      <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 180 230" className="w-full h-full max-h-48 drop-shadow-md" fill="none">
          <defs>
            <radialGradient id="bottleShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bottleMatte" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="35%" stopColor="#F8FAFC" />
              <stop offset="75%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="bambooCap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="90" cy="208" rx="45" ry="8" fill="url(#bottleShadow)" />

          {/* Bamboo Cap & Metal Ring */}
          <rect x="76" y="24" width="28" height="18" rx="3" fill="url(#bambooCap)" />
          <rect x="74" y="42" width="32" height="6" rx="2" fill="#64748B" />

          {/* Bottle Neck & Body */}
          <path
            d="M78 48 L78 68 C78 78, 62 88, 62 104 L62 198 C62 204, 118 204, 118 198 L118 104 C118 88, 102 78, 102 68 L102 48 Z"
            fill="url(#bottleMatte)"
            stroke="#CBD5E1"
            strokeWidth="1"
          />

          {/* Minimal line artwork */}
          <path d="M90 120 C85 130 95 140 90 150" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="90" cy="116" r="2" fill="#B45309" />
        </svg>
      </div>
    );
  }

  if (slug === 'chaveiros') {
    return (
      <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full max-h-48 drop-shadow-md" fill="none">
          <defs>
            <radialGradient id="keychainShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="acrylicGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F1F5F9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="170" rx="55" ry="10" fill="url(#keychainShadow)" />

          {/* Keyring Loop */}
          <circle cx="100" cy="40" r="18" fill="none" stroke="url(#goldRing)" strokeWidth="4" />
          <rect x="97" y="58" width="6" height="12" rx="2" fill="url(#goldRing)" />

          {/* Hexagonal Acrylic Tag */}
          <polygon
            points="100,72 142,96 142,144 100,168 58,144 58,96"
            fill="url(#acrylicGlass)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* Facet Reflection */}
          <line x1="100" y1="74" x2="62" y2="142" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />

          {/* DTF UV Initial */}
          <text x="100" y="128" font-size="24" font-family="'Playfair Display', serif" font-weight="700" font-style="italic" fill="#B45309" text-anchor="middle">
            G
          </text>
        </svg>
      </div>
    );
  }

  // caixas
  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 240 200" className="w-full h-full max-h-48 drop-shadow-md" fill="none">
        <defs>
          <radialGradient id="boxShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="kraftWood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="120" cy="170" rx="75" ry="12" fill="url(#boxShadow)" />

        {/* Box Base */}
        <polygon points="50,90 120,130 190,90 190,140 120,175 50,140" fill="#B45309" stroke="#92400E" strokeWidth="1" />

        {/* Box Lid */}
        <polygon points="45,82 120,122 195,82 120,44" fill="url(#kraftWood)" stroke="#92400E" strokeWidth="1" />
        <polygon points="45,82 120,122 120,132 45,92" fill="#92400E" opacity="0.5" />
        <polygon points="120,122 195,82 195,92 120,132" fill="#78350F" opacity="0.5" />

        {/* Satin Ribbon */}
        <path d="M110,48 L110,128 L130,128 L130,48 Z" fill="#C25E48" opacity="0.9" />
        <path d="M50,86 L190,86 L190,98 L50,98 Z" fill="#C25E48" opacity="0.9" />

        {/* Bow */}
        <circle cx="120" cy="85" r="7" fill="#9E432E" />
        <ellipse cx="108" cy="78" rx="8" ry="5" transform="rotate(-30 108 78)" fill="#C25E48" />
        <ellipse cx="132" cy="78" rx="8" ry="5" transform="rotate(30 132 78)" fill="#C25E48" />
      </svg>
    </div>
  );
};
