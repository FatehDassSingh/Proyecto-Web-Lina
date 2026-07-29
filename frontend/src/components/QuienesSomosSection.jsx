import React from 'react';
import { Heart, Utensils } from 'lucide-react';

export default function QuienesSomosSection({ onNavigateToCarta }) {
  return (
    <section id="quienes-somos" className="py-20 px-4 bg-[#160F0C] border-t border-[#D9822B]/20 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D9822B]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Showcase Photo Only */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D9822B]/40 shadow-2xl group">
              <img 
                src="/images/estacion_coffee.jpg" 
                alt="Familia Quilodrán - Banquetería Lina" 
                className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Storytelling Text */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9822B]/15 border border-[#D9822B]/30">
              <Heart className="w-3.5 h-3.5 text-[#E5C384]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#E5C384]">
                Nuestra Historia & Familia
              </span>
            </div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#FAF6F0] leading-tight">
              ¿Quiénes Somos?
            </h2>

            <div className="space-y-4 text-sm md:text-base text-[#FAF6F0]/90 leading-relaxed">
              <p className="text-base md:text-lg font-serif text-[#E5C384] italic">
                "Somos la familia Quilodrán y nos encanta dar una experiencia gastronómica acogedora. Orgullosamente de San Bernardo."
              </p>
              
              <p className="text-[#A6988B]">
                Lo que comenzó en nuestra propia cocina como el amor por reunir a nuestros seres queridos en torno a la mesa, hoy se transforma en <strong className="text-[#FAF6F0]">Banquetería Lina</strong>. Creemos firmemente que la buena mesa no es solo comida: es empatía, calidez y momentos inolvidables compartidos con las personas que más quieres.
              </p>

              <p className="text-[#A6988B]">
                Cada empanadita horneada al punto, cada tabla gourmet montada a mano y cada estación de café lleva el sello de dedicación de nuestra familia. Nos encargamos personalmente de cada banquete para que tú solo te dediques a disfrutar como un anfitrión radiante.
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={onNavigateToCarta}
                className="btn-primary text-xs py-3 px-6 font-semibold"
              >
                <Utensils className="w-4 h-4" />
                Conoce Nuestra Carta
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
