import React from 'react';

export default function BrandLogo({ size = "md", showSubtitle = true, light = false }) {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* 3D Poppy Gradient Emblem Badge */}
      <div className={`relative shrink-0 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/35 ${
        isSmall ? 'w-9 h-9' : isLarge ? 'w-14 h-14 rounded-3xl' : 'w-11 h-11'
      }`}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5" fill="none">
          <!-- Diamond Cap -->
          <path d="M50 22 L80 38 L50 54 L20 38 Z" fill="#ffffff" />
          <!-- Under Cap -->
          <path d="M32 46 L32 62 C32 72 68 72 68 62 L68 46 L50 56 Z" fill="#ffffff" fillOpacity="0.85" />
          <!-- Gold Chevron Ribbon -->
          <path d="M50 65 L64 57 L68 63 L50 73 L32 63 L36 57 Z" fill="url(#goldLinear)" />
          <!-- Tassel -->
          <circle cx="74" cy="42" r="3.5" fill="url(#goldLinear)" />
          <path d="M74 44 L76 56" stroke="url(#goldLinear)" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="goldLinear" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Top Glass Glare */}
        <div className="absolute inset-x-1.5 top-1 h-2 rounded-full bg-white/25 pointer-events-none" />
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${
            isSmall ? 'text-sm' : isLarge ? 'text-2xl' : 'text-lg'
          } ${light ? 'text-white' : 'text-slate-900'}`}>
            ALTUM<span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">TRACK</span>
          </span>
          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
            ERP
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
            light ? 'text-white/70' : 'text-slate-400'
          }`}>
            Smart School Operating System
          </p>
        )}
      </div>
    </div>
  );
}
