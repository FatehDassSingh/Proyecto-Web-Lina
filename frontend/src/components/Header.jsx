import React from 'react';
import { ShoppingBag, ShieldCheck, QrCode } from 'lucide-react';

export default function Header({ 
  cartCount, 
  activePage,
  onNavigate,
  onOpenCart,
  onOpenAdmin,
  onOpenMarketing
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#120B07]/95 backdrop-blur-md border-b border-[#D9822B]/20 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Solo el Logo dorado transparente en tamaño destacado */}
        <div 
          className="flex items-center cursor-pointer group py-1" 
          onClick={() => onNavigate('home')}
          title="Banquetería Lina - Inicio"
        >
          <img 
            src="/images/logo_lina.png" 
            alt="Banquetería Lina Logo" 
            className="h-20 md:h-24 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
          />
        </div>

        {/* Navigation Links: Inicio, Carta, ¿Quiénes Somos?, Misión y Visión, Contacto */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <button 
            onClick={() => onNavigate('home')}
            className={`transition-colors ${activePage === 'home' ? 'text-[#E5C384] border-b-2 border-[#D9822B] pb-0.5' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Inicio
          </button>

          <button 
            onClick={() => onNavigate('carta')}
            className={`transition-colors ${activePage === 'carta' ? 'text-[#E5C384] border-b-2 border-[#D9822B] pb-0.5' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Carta
          </button>

          <button 
            onClick={() => onNavigate('quienes')}
            className={`transition-colors ${activePage === 'quienes' ? 'text-[#E5C384] border-b-2 border-[#D9822B] pb-0.5' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            ¿Quiénes Somos?
          </button>
          
          <button 
            onClick={() => onNavigate('mision')}
            className={`transition-colors ${activePage === 'mision' ? 'text-[#E5C384] border-b-2 border-[#D9822B] pb-0.5' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Misión y Visión
          </button>
          
          <button 
            onClick={() => onNavigate('contacto')}
            className={`transition-colors ${activePage === 'contacto' ? 'text-[#E5C384] border-b-2 border-[#D9822B] pb-0.5' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Contacto
          </button>
        </nav>

        {/* Right Action Icons & Cart */}
        <div className="flex items-center gap-3">
          
          {/* Quick triggers for Admin & QR marketing */}
          <button 
            onClick={onOpenMarketing} 
            title="Piezas Publicitarias & QR"
            className="p-2 text-[#A6988B] hover:text-[#E5C384] rounded-lg hover:bg-[#1A120C] transition-colors hidden sm:flex"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button 
            onClick={onOpenAdmin} 
            title="Panel de Administración"
            className="p-2 text-[#A6988B] hover:text-[#E5C384] rounded-lg hover:bg-[#1A120C] transition-colors hidden sm:flex"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="bg-[#120B07] text-[#E5C384] font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-[#E5C384]">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
