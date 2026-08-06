import React from 'react';
import { Plus, Star, ArrowRight } from 'lucide-react';

export default function FeaturedGrid({ featuredItems, onAddToCart, onNavigateToCarta }) {
  return (
    <section className="py-16 px-4 bg-[#120B07] border-y border-[#D9822B]/20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D9822B]">
            Selección Destacada
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#FAF6F0] mt-2 mb-4">
            Especialidades de la Casa Lina
          </h2>
          <p className="text-sm text-[#A6988B]">
            Fotografía editorial fiel a las porciones reales de nuestros banquetes artesanales.
          </p>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <div 
              key={item.id} 
              className="glass-card overflow-hidden group flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-[#1A120C]">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A120C] via-transparent to-transparent opacity-80" />
                
                {item.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="badge-gold shadow-2xl flex items-center gap-1.5 border-[#D9822B] text-[#FAF6F0]">
                      <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107] shrink-0" />
                      {item.badge}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 z-10 bg-[#120B07]/95 px-3 py-1.5 rounded-lg border border-[#E5C384]/60 text-[#E5C384] font-bold text-xs shadow-2xl backdrop-blur-md">
                  {item.units} Unidades
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#FAF6F0] mb-2 group-hover:text-[#E5C384] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#A6988B] line-clamp-3 mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#D9822B]/20">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#A6988B] block">Precio Neto</span>
                    <span className="font-serif text-2xl font-bold text-[#E5C384]">
                      ${item.price.toLocaleString('es-CL')} <span className="text-xs font-sans text-[#A6988B]">CLP</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => onAddToCart(item)}
                    className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* View Full Carta Button at the bottom of Especialidades */}
        {onNavigateToCarta && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => {
                onNavigateToCarta();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold shadow-xl hover:scale-105 transition-all group"
            >
              <span>Ver Carta Completa</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
