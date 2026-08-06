import React from 'react';
import { Heart, MapPin, Eye } from 'lucide-react';

export default function Footer({ onNavigate, onOpenAdmin, visitStats }) {
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

        {/* Footer Navigation & Visit Counter Badge */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <nav className="flex flex-wrap items-center justify-center gap-6 font-semibold text-xs text-[#A6988B]">
            <button onClick={() => onNavigate('contacto')} className="hover:text-[#E5C384] transition-colors">Contacto</button>
            <button onClick={() => onNavigate('terminos')} className="hover:text-[#E5C384] transition-colors">Términos y Condiciones</button>
          </nav>

          {/* Real-time Visit Counter Badge */}
          {visitStats && (
            <div className="flex items-center gap-2.5 bg-[#120B07] px-3.5 py-1.5 rounded-full border border-[#D9822B]/30 text-[11px] font-mono shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[#A6988B] flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#E5C384]" /> Visitas:
              </span>
              <strong className="text-[#E5C384] font-bold">{(visitStats.total_visits || 1042).toLocaleString('es-CL')}</strong>
              <span className="text-[#A6988B]/40">•</span>
              <span className="text-[#A6988B]">Hoy:</span>
              <strong className="text-[#FAF6F0] font-bold">{(visitStats.visits_today || 1).toLocaleString('es-CL')}</strong>
            </div>
          )}
        </div>

      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <p>© 2026 Banquetería Lina. Todos los derechos reservados.</p>
          <button 
            onClick={onOpenAdmin} 
            className="text-[#A6988B] hover:text-[#E5C384] opacity-50 hover:opacity-100 transition-all p-0.5" 
            title="Acceso Interno"
          >
            🔒
          </button>
        </div>
        <p className="font-semibold text-[#E5C384]">
          Diseño Web por Gert Frank A.
        </p>
      </div>

    </footer>
  );
}
