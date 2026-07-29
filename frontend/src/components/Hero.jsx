import React from 'react';
import { Calendar, Clock, Users, Award, UtensilsCrossed, ArrowRight, Flame } from 'lucide-react';

export default function Hero({ onNavigateToCarta }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 px-4">
      
      {/* High-Motion Background Layer with Slow Panning Camera Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        <div className="w-full h-full animate-subtle-zoom relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/box_favoritos.jpg"
            className="w-full h-full object-cover opacity-95 filter contrast-105 saturate-115"
          >
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-gourmet-dish-41548-large.mp4" 
              type="video/mp4" 
            />
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-gourmet-dishes-41549-large.mp4" 
              type="video/mp4" 
            />
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-waiter-serving-food-in-a-restaurant-41551-large.mp4" 
              type="video/mp4" 
            />
          </video>

          {/* Realistic Rising Steam & Heat Effects over the Food */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Steam plume 1 */}
            <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-t from-white/30 via-white/10 to-transparent rounded-full blur-2xl animate-steam-1" />
            {/* Steam plume 2 */}
            <div className="absolute bottom-1/4 right-1/3 w-52 h-52 bg-gradient-to-t from-[#E5C384]/25 via-white/10 to-transparent rounded-full blur-3xl animate-steam-2" />
            {/* Steam plume 3 */}
            <div className="absolute bottom-1/2 left-1/2 w-44 h-44 bg-gradient-to-t from-white/20 via-white/5 to-transparent rounded-full blur-2xl animate-steam-3" />
          </div>
        </div>

        {/* Soft Vignette Overlay to frame content while keeping 100% video clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120B07] via-transparent to-black/40 z-1" />
        
        {/* Subtle Ambient Amber Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#D9822B]/10 rounded-full blur-[160px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Badge Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#160F0C]/85 border border-[#D9822B]/50 backdrop-blur-md mb-2 shadow-2xl">
          <Award className="w-4 h-4 text-[#E5C384]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E5C384]">
            Banquetería Familiar en Santiago de Chile
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#FAF6F0] leading-[1.1] drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <span className="bg-gradient-to-r from-[#FFF5E6] via-[#E5C384] to-[#D9822B] bg-clip-text text-transparent">
            El arte de comer rico
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-xl text-[#FAF6F0] max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] bg-[#160F0C]/50 p-3.5 rounded-2xl backdrop-blur-md border border-[#D9822B]/30">
          Presentaciones gourmet artesanales, montajes decorativos y garzones para tus momentos inolvidables.
        </p>

        {/* Single CTA Button */}
        <div className="pt-4 pb-8 flex justify-center">
          <button 
            onClick={onNavigateToCarta}
            className="btn-primary text-base py-4 px-10 shadow-[0_10px_30px_rgba(217,130,43,0.6)] hover:scale-105 transition-all duration-300 font-bold"
          >
            <UtensilsCrossed className="w-5 h-5" />
            Solicitar Servicio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Operating Conditions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          
          <div className="glass-card p-4 flex items-start gap-3 backdrop-blur-md bg-[#160F0C]/90 border border-[#D9822B]/40 hover:border-[#D9822B] shadow-2xl transition-all">
            <div className="p-2 rounded-lg bg-[#D9822B]/20 border border-[#D9822B]/40 text-[#E5C384] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF6F0]">3 Días de Anticipación</h4>
              <p className="text-[11px] text-[#A6988B] mt-0.5">Elaboración artesanal fresca con reserva previa.</p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-start gap-3 backdrop-blur-md bg-[#160F0C]/90 border border-[#D9822B]/40 hover:border-[#D9822B] shadow-2xl transition-all">
            <div className="p-2 rounded-lg bg-[#D9822B]/20 border border-[#D9822B]/40 text-[#E5C384] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF6F0]">Retiro o Montaje Sábados</h4>
              <p className="text-[11px] text-[#A6988B] mt-0.5">Retiro presencial Lun-Dom; montajes los Sábados.</p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-start gap-3 backdrop-blur-md bg-[#160F0C]/90 border border-[#D9822B]/40 hover:border-[#D9822B] shadow-2xl transition-all">
            <div className="p-2 rounded-lg bg-[#D9822B]/20 border border-[#D9822B]/40 text-[#E5C384] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF6F0]">Opción Garzones</h4>
              <p className="text-[11px] text-[#A6988B] mt-0.5">Cálculo automático de personal (1 cada 25 personas).</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
