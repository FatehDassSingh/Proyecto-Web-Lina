import React, { useState } from 'react';
import { Phone, Mail, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export default function ContactoPage({ businessConfig }) {
  const [formData, setFormData] = useState({ 
    firstName: '', 
    firstLastName: '', 
    secondLastName: '', 
    email: '', 
    phone: '+56 9 ', 
    message: '' 
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactPhone = businessConfig?.contact_phone || '+56 9 3465 6961';
  const contactEmail = businessConfig?.contact_email || 'contacto@banqueterialina.cl';
  const businessHours = businessConfig?.business_hours || 'Lunes a Domingo de 09:00 a 19:00 hrs';

  const cleanWaNumber = contactPhone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Hola Banquetería Lina, deseo hacer una consulta')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="w-full bg-[#120B07] text-[#FAF6F0] min-h-[calc(100vh-80px)] py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
      
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
          <div className="glass-card p-8 space-y-6 border border-[#D9822B]/30 bg-[#1A120C]">
            <h3 className="font-serif text-2xl font-bold text-[#E5C384]">Banquetería Lina</h3>
          
          <div className="space-y-4 text-xs text-[#FAF6F0]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-[#E5C384]">Horario de Atención</strong>
                <p className="text-[#A6988B] mt-0.5">{businessHours}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm text-[#E5C384]">Correo Electrónico</strong>
                <p className="text-[#A6988B] mt-0.5">{contactEmail}</p>
              </div>
            </div>

            {/* WhatsApp as LAST ITEM rendered as an interactive Button */}
            <div className="pt-2">
              <a 
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/50 p-4 rounded-xl flex items-center justify-between group transition-all shadow-lg text-left block"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm text-[#FAF6F0] group-hover:text-[#25D366] transition-colors font-bold">
                      WhatsApp
                    </strong>
                    <span className="text-xs font-mono text-[#A6988B]">{contactPhone}</span>
                  </div>
                </div>
                <span className="text-xs bg-[#25D366] text-black font-extrabold px-3.5 py-1.5 rounded-lg shadow group-hover:scale-105 transition-transform flex items-center">
                  Chatear
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel p-8 bg-[#1A120C]">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#FAF6F0] mb-2">Envíanos un Mensaje</h3>
              
              {/* Atomized Name Fields */}
              <div>
                <label className="text-xs text-[#A6988B] block mb-1">Nombre *</label>
                <input 
                  type="text" 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Ej: María"
                  className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A6988B] block mb-1">Apellido Paterno *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.firstLastName}
                    onChange={(e) => setFormData({...formData, firstLastName: e.target.value})}
                    placeholder="Ej: González"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1">Apellido Materno</label>
                  <input 
                    type="text" 
                    value={formData.secondLastName}
                    onChange={(e) => setFormData({...formData, secondLastName: e.target.value})}
                    placeholder="Ej: Pérez"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>
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
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0] font-mono"
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
  </div>
);
}
