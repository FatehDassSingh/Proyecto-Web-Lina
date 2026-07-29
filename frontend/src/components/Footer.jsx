import React from 'react';
import { Heart, MapPin } from 'lucide-react';

export default function Footer({ onNavigate }) {
  // Schema.org CateringService structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CateringService",
    "name": "Banquetería Lina",
    "image": "https://banqueterialina.cl/images/logo.jpeg",
    "@id": "https://banqueterialina.cl",
    "url": "https://banqueterialina.cl",
    "telephone": "+56912345678",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Santiago",
      "addressRegion": "Región Metropolitana",
      "addressCountry": "CL"
    },
    "areaServed": "Santiago, Chile",
    "description": "Servicio de banquetería artesanal y catering familiar en Santiago de Chile."
  };

  return (
    <footer className="bg-[#0B0604] border-t border-[#D9822B]/20 pt-10 pb-8 px-4 text-[#A6988B] text-xs mt-auto">
      
      {/* Inject Schema.org structured data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} 
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#D9822B]/15">
        
        {/* Brand Header */}
        <div className="flex items-center gap-4">
          <img src="/images/logo_lina.png" className="h-16 md:h-20 w-auto object-contain" alt="Banquetería Lina Logo" />
          <div>
            <h4 className="font-serif text-lg font-bold text-[#FAF6F0]">Banquetería Lina</h4>
            <div className="flex items-center gap-1.5 text-[11px] text-[#E5C384]">
              <MapPin className="w-3.5 h-3.5 text-[#D9822B]" />
              <span>Santiago de Chile</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-6 font-semibold text-xs text-[#A6988B]">
          <button onClick={() => onNavigate('contacto')} className="hover:text-[#E5C384] transition-colors">Contacto</button>
          <button onClick={() => onNavigate('terminos')} className="hover:text-[#E5C384] transition-colors">Términos y Condiciones</button>
        </nav>

      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
        <p>© 2026 Banquetería Lina. Todos los derechos reservados.</p>
        <p className="font-semibold text-[#E5C384]">
          Diseño Web por Gert Frank A.
        </p>
      </div>

    </footer>
  );
}
