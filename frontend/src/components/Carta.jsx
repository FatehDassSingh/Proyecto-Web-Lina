import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function Carta({ categories, items, cartItems, onUpdateQuantity, onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = items.filter(item => {
    return activeCategory === 'all' || item.category === activeCategory;
  });

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto space-y-10">

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#FAF6F0]">
          Carta
        </h1>
        <p className="text-sm text-[#A6988B]">
          Selecciona tus boxes colectivos, estaciones de café o repostería fina. Agrega productos al carrito para solicitar tu servicio.
        </p>
      </div>

      {/* Category Tabs Bar with generous spacing */}
      <div className="glass-panel p-4 mb-8 sticky top-20 z-30 shadow-2xl">
        <div className="flex items-center gap-3 overflow-x-auto w-full pb-3 scrollbar-thin">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all' 
                ? 'bg-[#D9822B] text-white shadow-md' 
                : 'bg-[#1A120C] text-[#A6988B] hover:text-[#FAF6F0] border border-[#D9822B]/20'
            }`}
          >
            Ver Todo ({items.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id 
                  ? 'bg-[#D9822B] text-white shadow-md' 
                  : 'bg-[#1A120C] text-[#A6988B] hover:text-[#FAF6F0] border border-[#D9822B]/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {filteredItems.map(item => {
          const qty = getItemQuantity(item.id);
          return (
            <div 
              key={item.id} 
              className="glass-card p-5 flex flex-col sm:flex-row gap-5 items-stretch border border-[#D9822B]/20 hover:border-[#D9822B]/60"
            >
              {/* Item Thumbnail */}
              <div className="relative w-full sm:w-48 h-44 rounded-lg overflow-hidden shrink-0 bg-[#120B07]">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {item.badge && (
                  <span className="absolute top-2 left-2 z-10 badge-gold text-[11px] py-1 px-2.5 shadow-2xl flex items-center gap-1">
                    <span className="text-[#FFC107]">★</span>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Details & Action */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h3 className="font-serif text-lg font-bold text-[#FAF6F0]">
                      {item.name}
                    </h3>
                    <span className="text-xs font-semibold text-[#E5C384] bg-[#D9822B]/10 px-2 py-0.5 rounded border border-[#D9822B]/20 shrink-0">
                      {item.units} Unid.
                    </span>
                  </div>

                  <p className="text-xs text-[#A6988B] line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D9822B]/15">
                  <span className="font-serif text-xl font-bold text-[#E5C384]">
                    ${item.price.toLocaleString('es-CL')} <span className="text-xs font-sans text-[#A6988B]">CLP</span>
                  </span>

                  {/* Quantity Controls */}
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-[#120B07] p-1 rounded-lg border border-[#D9822B]/40">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, qty - 1)}
                        className="w-7 h-7 rounded bg-[#2A1D13] text-[#FAF6F0] flex items-center justify-center hover:bg-[#D9822B]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-[#E5C384] w-6 text-center">{qty}</span>
                      <button 
                        onClick={() => onAddToCart(item)}
                        className="w-7 h-7 rounded bg-[#D9822B] text-white flex items-center justify-center hover:bg-[#E59A3A]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onAddToCart(item)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar al Carrito
                    </button>
                  )}

                </div>

              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
