'use client';

import React from 'react';
import { ProductColor, SurfaceId } from '@/types/configurator';

interface MugMockupProps {
  color: ProductColor;
  surfaceId: SurfaceId;
  children?: React.ReactNode;
}

export const MugMockup: React.FC<MugMockupProps> = ({ color, surfaceId, children }) => {
  const isDarkColor = color.id === 'black';

  return (
    <div className="relative w-full max-w-[460px] aspect-[4/5] flex items-center justify-center select-none">
      {/* Soft Studio Ambient Glow */}
      <div
        className="absolute inset-0 rounded-full opacity-35 blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(circle, ${color.hex}50 0%, transparent 70%)`,
        }}
      />

      {/* Surface 1: FRENTE */}
      {surfaceId === 'front' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 500 580"
            className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition-all duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Studio Cylindrical Multi-stop Gradient */}
              <linearGradient id="mugStudioGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
                <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <stop offset="25%" stopColor={color.hex} stopOpacity="1" />
                <stop offset="60%" stopColor={color.mockupHex} stopOpacity="1" />
                <stop offset="85%" stopColor="#FFFFFF" stopOpacity={isDarkColor ? '0.08' : '0.28'} />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </linearGradient>

              {/* Specular Ceramic Highlight */}
              <linearGradient id="ceramicGlossSpec" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
              </linearGradient>

              {/* Handle 3D Curvature Gradient */}
              <linearGradient id="handle3DGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color.mockupHex} />
                <stop offset="45%" stopColor={color.hex} />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
              </linearGradient>

              {/* Realistic Contact Shadow */}
              <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
                <stop offset="45%" stopColor="#000000" stopOpacity="0.18" />
                <stop offset="85%" stopColor="#000000" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Studio Floor Contact Shadow */}
            <ellipse cx="230" cy="535" rx="195" ry="24" fill="url(#contactShadow)" />

            {/* Mug Handle (Attached on Right) with Smooth Ceramic Ergonomics */}
            <path
              d="M340 180 C465 180, 475 385, 340 395 C355 368, 430 360, 415 282 C400 206, 355 200, 340 180 Z"
              fill="url(#handle3DGrad)"
              stroke="#000000"
              strokeOpacity="0.06"
              strokeWidth="1.5"
            />
            {/* Handle Inner Occlusion Creep */}
            <path
              d="M348 206 C418 214, 428 344, 345 374"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="2.5"
            />

            {/* Main Ceramic Body */}
            <path
              d="M100 110 L100 480 C100 522, 360 522, 360 480 L360 110 Z"
              fill={color.hex}
            />
            <path
              d="M100 110 L100 480 C100 522, 360 522, 360 480 L360 110 Z"
              fill="url(#mugStudioGrad)"
            />

            {/* Ceramic Rim Opening with Soft Interior Shadow */}
            <ellipse cx="230" cy="110" rx="130" ry="26" fill={color.mockupHex} stroke="#000000" strokeOpacity="0.08" strokeWidth="1.5" />
            <ellipse cx="230" cy="113" rx="122" ry="21" fill="#262626" opacity="0.25" />
            <ellipse cx="230" cy="115" rx="116" ry="18" fill="#171717" opacity="0.45" />

            {/* Glaze Light Reflection Line */}
            <rect x="122" y="118" width="22" height="365" fill="url(#ceramicGlossSpec)" opacity="0.5" rx="11" />

            {/* Bottom Rounded Base Creep */}
            <path
              d="M100 480 C100 522, 360 522, 360 480 C360 514, 100 514, 100 480 Z"
              fill="#000000"
              opacity="0.15"
            />
          </svg>

          {/* Interactive Canvas Overlay Area */}
          <div className="absolute top-[20%] left-[23%] w-[51%] h-[63%] z-10 flex items-center justify-center">
            {children}
          </div>
        </div>
      )}

      {/* Surface 2: VERSO */}
      {surfaceId === 'back' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 500 580"
            className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition-all duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mugStudioGradBack" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
                <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <stop offset="25%" stopColor={color.hex} stopOpacity="1" />
                <stop offset="60%" stopColor={color.mockupHex} stopOpacity="1" />
                <stop offset="85%" stopColor="#FFFFFF" stopOpacity={isDarkColor ? '0.08' : '0.28'} />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </linearGradient>

              <linearGradient id="handle3DGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={color.mockupHex} />
                <stop offset="45%" stopColor={color.hex} />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Contact Shadow */}
            <ellipse cx="270" cy="535" rx="195" ry="24" fill="url(#contactShadow)" />

            {/* Handle on Left */}
            <path
              d="M160 180 C35 180, 25 385, 160 395 C145 368, 70 360, 85 282 C100 206, 145 200, 160 180 Z"
              fill="url(#handle3DGradLeft)"
              stroke="#000000"
              strokeOpacity="0.06"
              strokeWidth="1.5"
            />
            <path
              d="M152 206 C82 214, 72 344, 155 374"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="2.5"
            />

            {/* Body */}
            <path
              d="M140 110 L140 480 C140 522, 400 522, 400 480 L400 110 Z"
              fill={color.hex}
            />
            <path
              d="M140 110 L140 480 C140 522, 400 522, 400 480 L400 110 Z"
              fill="url(#mugStudioGradBack)"
            />

            {/* Top Rim */}
            <ellipse cx="270" cy="110" rx="130" ry="26" fill={color.mockupHex} stroke="#000000" strokeOpacity="0.08" strokeWidth="1.5" />
            <ellipse cx="270" cy="113" rx="122" ry="21" fill="#262626" opacity="0.25" />
            <ellipse cx="270" cy="115" rx="116" ry="18" fill="#171717" opacity="0.45" />

            {/* Glaze reflection */}
            <rect x="356" y="118" width="22" height="365" fill="url(#ceramicGlossSpec)" opacity="0.45" rx="11" />

            {/* Base shadow */}
            <path
              d="M140 480 C140 522, 400 522, 400 480 C400 514, 140 514, 140 480 Z"
              fill="#000000"
              opacity="0.15"
            />
          </svg>

          {/* Interactive Canvas Overlay Area */}
          <div className="absolute top-[20%] left-[30%] w-[51%] h-[63%] z-10 flex items-center justify-center">
            {children}
          </div>
        </div>
      )}

      {/* Surface 3: ALÇA (Macro close-up da alça) */}
      {surfaceId === 'handle' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 500 580"
            className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition-all duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="handleMacroCyl" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                <stop offset="18%" stopColor={color.hex} />
                <stop offset="50%" stopColor={color.mockupHex} />
                <stop offset="82%" stopColor={color.hex} />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* Soft Studio Card Backing */}
            <rect x="45" y="45" width="410" height="490" rx="28" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

            {/* Macro Handle Ceramic Spine */}
            <path
              d="M170 55 C240 46, 260 46, 330 55 L340 525 C260 534, 240 534, 160 525 Z"
              fill="url(#handleMacroCyl)"
              stroke="#000000"
              strokeOpacity="0.08"
              strokeWidth="2"
            />

            {/* Gloss Center Sheen */}
            <rect x="235" y="65" width="30" height="450" fill="#FFFFFF" opacity={isDarkColor ? '0.12' : '0.35'} rx="15" />

            <text x="250" y="32" textAnchor="middle" fill="#94A3B8" fontSize="12" fontWeight="700" letterSpacing="2">
              SUPERFÍCIE EXTERNA DA ALÇA
            </text>
          </svg>

          {/* Interactive Canvas Area */}
          <div className="absolute top-[12%] left-[34%] w-[32%] h-[74%] z-10 flex items-center justify-center">
            {children}
          </div>
        </div>
      )}

      {/* Surface 4: INFERIOR (Fundo Cerâmico) */}
      {surfaceId === 'bottom' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 500 580"
            className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition-all duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="basePlateCeramic" cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor={color.hex} />
                <stop offset="88%" stopColor={color.mockupHex} />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
              </radialGradient>
              <radialGradient id="footRingMatte" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </radialGradient>
            </defs>

            {/* Shadow */}
            <circle cx="250" cy="290" r="215" fill="#000000" opacity="0.08" />

            {/* Ceramic Outer Base */}
            <circle cx="250" cy="285" r="205" fill="url(#basePlateCeramic)" stroke="#000000" strokeOpacity="0.08" strokeWidth="2" />

            {/* Unenameled Ceramic Foot Ring */}
            <circle cx="250" cy="285" r="165" fill="none" stroke="url(#footRingMatte)" strokeWidth="15" />

            {/* Recessed Center */}
            <circle cx="250" cy="285" r="150" fill={color.hex} />
            <circle cx="250" cy="285" r="150" fill="#000000" opacity="0.05" />

            <text x="250" y="525" textAnchor="middle" fill="#94A3B8" fontSize="12" fontWeight="700" letterSpacing="2">
              FUNDO EXTERNO DA CANECA
            </text>
          </svg>

          {/* Interactive Canvas Area */}
          <div className="absolute top-[20%] left-[23%] w-[54%] h-[47%] z-10 flex items-center justify-center">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
