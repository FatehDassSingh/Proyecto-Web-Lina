import React, { useState } from 'react';
import { X, QrCode, Camera, Play, Pause, Star, ExternalLink, ShieldAlert } from 'lucide-react';

export default function MarketingModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ad_static'); // ad_static | ad_animated | qr | reviews
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl overflow-hidden shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="bg-[#1A120C] px-6 py-4 border-b border-[#D9822B]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#E5C384]" />
            <h3 className="font-serif text-lg font-bold text-[#FAF6F0]">Piezas de Marketing & QR Code</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#A6988B] hover:text-[#FAF6F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#120B07] px-6 py-3 border-b border-[#D9822B]/20 flex items-center gap-3 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('ad_static')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ad_static' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
            }`}
          >
            Ad Story 9:16 Estático
          </button>
          <button 
            onClick={() => setActiveTab('ad_animated')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ad_animated' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
            }`}
          >
            Ad Reel 6s Animado
          </button>
          <button 
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'qr' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
            }`}
          >
            Generador QR Web
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'reviews' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
            }`}
          >
            Módulo Reseñas (Google)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">

          {/* STATIC AD 9:16 */}
          {activeTab === 'ad_static' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* 9:16 Story Frame Container */}
              <div className="w-[280px] h-[500px] rounded-2xl overflow-hidden relative shadow-2xl border-4 border-[#D9822B]/40 shrink-0 group">
                <img 
                  src="/images/instagram_story.jpg" 
                  alt="Story Ad" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120B07] via-transparent to-black/60 p-5 flex flex-col justify-between">
                  {/* Top Bar with Logo */}
                  <div className="flex items-center gap-2">
                    <img src="/images/logo.jpeg" className="w-8 h-8 rounded-full border border-[#E5C384]" alt="Logo" />
                    <div>
                      <h6 className="font-serif text-xs font-bold text-white">Banquetería Lina</h6>
                      <span className="text-[9px] text-[#E5C384]">Santiago, Chile</span>
                    </div>
                  </div>

                  {/* Bottom Copy & CTA */}
                  <div className="bg-[#1A120C]/90 backdrop-blur-md p-4 rounded-xl border border-[#E5C384]/40 text-center space-y-2">
                    <p className="font-serif text-xs font-bold text-[#FAF6F0] leading-snug">
                      Disfruta con nosotros como un invitado en tu propia fiesta.
                    </p>
                    <p className="text-[11px] text-[#E5C384] font-semibold">
                      + Escanea y obtén un 5% de descuento hoy ✨
                    </p>
                    <div className="w-16 h-16 mx-auto bg-white p-1.5 rounded-lg shadow-lg">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://banqueterialina.cl" alt="QR Code" className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs & Description */}
              <div className="space-y-4 max-w-md">
                <h4 className="font-serif text-xl font-bold text-[#E5C384]">Pieza Publicitaria Instagram Stories (9:16)</h4>
                <p className="text-xs text-[#A6988B] leading-relaxed">
                  Diseño de alto impacto visual con la fotografía editorial maestrizada del plato estrella y la llamada a la acción en 3 líneas directas.
                </p>
                <div className="bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/20 text-xs space-y-2">
                  <p><span className="text-[#E5C384]">Formato:</span> 1080 x 1920 px (9:16 Vertical)</p>
                  <p><span className="text-[#E5C384]">Copy:</span> "Disfruta con nosotros + Escanea y obtén un 5% de descuento hoy"</p>
                  <p><span className="text-[#E5C384]">Uso:</span> Publicidad pagada en Instagram Ads o Historias orgánicas.</p>
                </div>
              </div>
            </div>
          )}

          {/* ANIMATED AD 6s */}
          {activeTab === 'ad_animated' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* 9:16 Animated Canvas Reel Container */}
              <div className="w-[280px] h-[500px] rounded-2xl overflow-hidden relative shadow-2xl border-4 border-[#D9822B]/40 shrink-0">
                <div className={`w-full h-full relative overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
                  <img 
                    src="/images/instagram_story.jpg" 
                    alt="Story Ad Reel" 
                    className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${isPlaying ? 'scale-125' : 'scale-100'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120B07] via-transparent to-black/60 p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/images/logo.jpeg" className="w-8 h-8 rounded-full border border-[#E5C384]" alt="Logo" />
                      <div>
                        <h6 className="font-serif text-xs font-bold text-white">Banquetería Lina</h6>
                        <span className="text-[9px] text-[#E5C384]">Reel 6s Animado</span>
                      </div>
                    </div>

                    <div className={`bg-[#1A120C]/90 backdrop-blur-md p-4 rounded-xl border border-[#E5C384]/40 text-center space-y-2 transition-all duration-700 ${isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-90'}`}>
                      <span className="badge-gold text-[9px] uppercase tracking-wider block mb-1">Oferta Exclusiva</span>
                      <p className="font-serif text-xs font-bold text-[#FAF6F0]">
                        ¿Tu próximo banquete en Santiago?
                      </p>
                      <p className="text-[11px] text-[#E5C384] font-bold">
                        5% OFF + Servicio de Garzones
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D9822B] text-white flex items-center justify-center shadow-xl">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </div>
                </button>
              </div>

              <div className="space-y-4 max-w-md">
                <h4 className="font-serif text-xl font-bold text-[#E5C384]">Anuncio Animado de 6 Segundos (CSS/JS Reel)</h4>
                <p className="text-xs text-[#A6988B] leading-relaxed">
                  Haz clic en reproducir para previsualizar el efecto de cámara lenta (zoom dinámico) y la entrada suave del mensaje de 5% de descuento.
                </p>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pausar Simulación' : 'Reproducir Anuncio (6 Seg)'}
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC QR GENERATOR */}
          {activeTab === 'qr' && (
            <div className="text-center py-6 space-y-6 max-w-md mx-auto">
              <h4 className="font-serif text-xl font-bold text-[#E5C384]">Código QR para la Carta Digital</h4>
              <p className="text-xs text-[#A6988B]">Imprime este código QR para colocarlo en servilletas, tarjetas o pendones del evento.</p>
              
              <div className="bg-white p-6 rounded-2xl shadow-2xl w-56 h-56 mx-auto flex items-center justify-center border-4 border-[#D9822B]">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://127.0.0.1:5173" 
                  alt="QR Code Banqueteria Lina"
                  className="w-full h-full"
                />
              </div>

              <a 
                href="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=http://127.0.0.1:5173" 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary inline-flex text-xs py-2.5 px-6 items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Descargar QR Alta Resolución (PNG)
              </a>
            </div>
          )}

          {/* GOOGLE REVIEWS MODULE */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex items-center gap-2 text-yellow-400">
                <Star className="w-5 h-5 fill-yellow-400" />
                <h4 className="font-serif text-lg font-bold text-[#FAF6F0]">Módulo de Reseñas Google (Inactivo por Defecto)</h4>
              </div>
              <p className="text-xs text-[#A6988B] leading-relaxed">
                Este módulo incluye la variante del QR post-visita para invitar a los clientes satisfechos a dejar una opinión en Google My Business tras su banquete.
              </p>

              <div className="bg-[#120B07] p-5 rounded-xl border border-[#D9822B]/20 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#E5C384]">Estado del Módulo:</span>
                  <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded font-bold uppercase text-[10px]">Apagado por Defecto (Fase 2)</span>
                </div>
                <p className="text-[#A6988B]">Se activará automáticamente al enrolar la estrategia de 30 días de reputación online en Google Maps.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
