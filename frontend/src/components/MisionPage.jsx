import React from 'react';
import { Target, Eye, Heart, Award } from 'lucide-react';

export default function MisionPage({ onNavigateToCarta }) {
  return (
    <div className="py-16 px-4 max-w-5xl mx-auto space-y-16">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="badge-gold">Nuestra Esencia</span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#FAF6F0]">
          Misión y Visión
        </h1>
        <p className="text-sm text-[#A6988B] max-w-2xl mx-auto">
          Banquetería Lina es un proyecto familiar en Santiago de Chile dedicado a la gastronomía artesanal y el servicio personalizado para celebraciones inolvidables.
        </p>
      </div>

      {/* Mision & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Misión */}
        <div className="glass-card p-8 space-y-4 border border-[#D9822B]/30 hover:border-[#D9822B]">
          <div className="w-12 h-12 rounded-xl bg-[#D9822B]/20 border border-[#D9822B] flex items-center justify-center text-[#E5C384]">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#E5C384]">Nuestra Misión</h2>
          <p className="text-xs text-[#FAF6F0]/90 leading-relaxed font-serif italic text-base border-l-2 border-[#D9822B] pl-4 py-1">
            "Queremos liberar a los anfitriones del estrés y permitirles ser invitados en su propia fiesta. Creemos en el arte de cuidar cada detalle invisible para que tú solo tengas que preocuparte de lo más importante: estar presente, conectar con los tuyos y disfrutar de la compañía."
          </p>
          <p className="text-xs text-[#A6988B] leading-relaxed">
            Nos dedicamos a preparar y montar propuestas gastronómicas artesanales con dedicación de hogar, entregando un servicio confiable, puntual y libre de fricciones.
          </p>
        </div>

        {/* Visión */}
        <div className="glass-card p-8 space-y-4 border border-[#D9822B]/30 hover:border-[#D9822B]">
          <div className="w-12 h-12 rounded-xl bg-[#D9822B]/20 border border-[#D9822B] flex items-center justify-center text-[#E5C384]">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#E5C384]">Nuestra Visión</h2>
          <p className="text-xs text-[#FAF6F0]/90 leading-relaxed">
            Consolidarnos en Santiago como el servicio de banquetería y catering familiar de referencia, reconocido por la calidad excepcional de nuestras preparaciones, el cuidado estético de nuestros montajes y la calidez en la atención.
          </p>
          <p className="text-xs text-[#A6988B] leading-relaxed">
            Aspiramos a automatizar y facilitar cada paso del proceso de compra para nuestros clientes sin perder jamás la cercanía ni el toque artesanal que nos distingue.
          </p>
        </div>

      </div>

      {/* Values Banner */}
      <div className="glass-panel p-8 text-center space-y-6">
        <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">Valores de la Familia Lina</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <h4 className="font-serif font-semibold text-[#E5C384] text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#D9822B]" /> Calidez Familiar
            </h4>
            <p className="text-xs text-[#A6988B]">Cada plato se elabora con el mismo esmero y cariño con el que recibimos en nuestro propio hogar.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif font-semibold text-[#E5C384] text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D9822B]" /> Calidad Artesanal
            </h4>
            <p className="text-xs text-[#A6988B]">Ingredientes frescos y seleccionados, manteniendo recetas tradicionales con toque gourmet.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif font-semibold text-[#E5C384] text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D9822B]" /> Puntualidad & Confianza
            </h4>
            <p className="text-xs text-[#A6988B]">Respeto riguroso por las fechas, bloques horarios y compromisos pactados con nuestros anfitriones.</p>
          </div>
        </div>

        <button 
          onClick={onNavigateToCarta}
          className="btn-primary text-xs py-3 px-8 mt-4"
        >
          Ir a la Carta
        </button>
      </div>

    </div>
  );
}
