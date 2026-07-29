import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function DiscountBanner({ onOpenModal }) {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 z-30 max-w-md bg-gradient-to-r from-[#1A120C] via-[#2A1D13] to-[#1A120C] border border-[#E5C384]/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#D9822B]/20 border border-[#D9822B] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#E5C384]" />
        </div>
        <div>
          <h5 className="font-serif text-xs font-bold text-[#FAF6F0]">Obtén un 5% de Descuento</h5>
          <p className="text-[11px] text-[#A6988B]">Deja tu correo y recibe tu cupón directo.</p>
        </div>
      </div>

      <button 
        onClick={onOpenModal}
        className="btn-primary text-xs py-2 px-3 shrink-0 flex items-center gap-1"
      >
        Reclamar 5%
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
