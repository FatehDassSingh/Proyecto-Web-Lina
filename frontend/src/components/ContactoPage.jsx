import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="badge-gold">Estamos para Atenderte</span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#FAF6F0]">
          Contacto
        </h1>
        <p className="text-sm text-[#A6988B] max-w-xl mx-auto">
          ¿Tienes consultas sobre tu banquete, disponibilidad o cotizaciones especiales? Escríbenos o llámanos directamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Contact Info Box */}
        <div className="glass-card p-8 space-y-6 border border-[#D9822B]/30">
          <h3 className="font-serif text-2xl font-bold text-[#E5C384]">Banquetería Lina</h3>
          
          <div className="space-y-4 text-xs text-[#FAF6F0]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded.lg bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-[#E5C384]">Ubicación & Cobertura</strong>
                <p className="text-[#A6988B] mt-0.5">Santiago de Chile (Despacho a 32 comunas urbanas)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-[#E5C384]">Horario de Atención</strong>
                <p className="text-[#A6988B] mt-0.5">Lunes a Domingo de 09:00 a 19:00 hrs</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-[#E5C384]">Teléfono / WhatsApp</strong>
                <p className="text-[#A6988B] mt-0.5">+56 9 1234 5678</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-[#E5C384]">Correo Electrónico</strong>
                <p className="text-[#A6988B] mt-0.5">contacto@banqueterialina.cl</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#FAF6F0] mb-2">Envíanos un Mensaje</h3>
              
              <div>
                <label className="text-xs text-[#A6988B] block mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A6988B] block mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="tu@email.cl"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+56 9 ..."
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A6988B] block mb-1">Mensaje o Consulta *</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Describe tu evento, número estimado de personas o fecha deseada..."
                  className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Consulta
              </button>
            </form>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#FAF6F0]">¡Mensaje Enviado!</h4>
              <p className="text-xs text-[#A6988B]">Gracias por escribirnos. Te responderemos a la brevedad.</p>
              <button onClick={() => setIsSubmitted(false)} className="btn-secondary text-xs py-2 px-6">Enviar otra consulta</button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
