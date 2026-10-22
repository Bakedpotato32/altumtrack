import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck } from 'lucide-react';

export default function VerificationQRCode({
  value,
  size = 64,
  label = "SCAN TO VERIFY",
  subtitle = "ALTUMTRACK SECURE"
}) {
  return (
    <div className="inline-flex flex-col items-center p-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm print:border-slate-300">
      <div className="bg-white p-1 rounded-lg">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#0f172a"
          includeMargin={false}
        />
      </div>
      {label && (
        <div className="text-center mt-1">
          <p className="text-[7px] font-black tracking-wider text-slate-800 uppercase flex items-center justify-center gap-0.5">
            <ShieldCheck className="w-2 h-2 text-violet-600 inline" /> {label}
          </p>
          {subtitle && (
            <p className="text-[6px] font-bold text-slate-400 tracking-tight uppercase">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
