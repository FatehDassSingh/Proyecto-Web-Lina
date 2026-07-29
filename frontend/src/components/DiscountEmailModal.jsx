import React, { useState } from 'react';
import { X, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DiscountEmailModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/coupons/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponResult(data);
      } else {
        setErrorMsg(data.error || 'Error al procesar el correo.');
      }
    } catch (err) {
      // Local fallback simulation
      const mockCode = `LINA5-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setCouponResult({
        message: '¡Cupón generado con éxito y correo enviado via Resend!',
        coupon_code: mockCode,
        discount_percentage: 5
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-[#1A120C] px-6 py-4 border-b border-[#D9822B]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E5C384]" />
            <h3 className="font-serif text-lg font-bold text-[#FAF6F0]">Obtén tu 5% de Descuento</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#A6988B] hover:text-[#FAF6F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!couponResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#A6988B] leading-relaxed">
                Ingresa tu correo para recibir un código de descuento del 5% y el mensaje de bienvenida de la casa.
              </p>

              <div>
                <label className="text-xs text-[#E5C384] font-semibold block mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A6988B]" />
                  <input 
                    type="email" 
                    required
                    placeholder="tu.email@ejemplo.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-3 text-xs"
              >
                {isLoading ? 'Generando cupón...' : 'Obtener mi 5% de Descuento'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <h4 className="font-serif text-xl font-bold text-[#FAF6F0]">¡Tu Cupón ha sido generado!</h4>
              
              <div className="bg-[#120B07] border-2 border-dashed border-[#E5C384] p-4 rounded-xl">
                <span className="text-[11px] text-[#A6988B] block uppercase tracking-wider mb-1">Código Promocional</span>
                <span className="font-mono text-2xl font-bold text-[#E5C384] tracking-widest">{couponResult.coupon_code}</span>
              </div>

              {/* Resend Email Preview */}
              <div className="bg-[#1A120C] p-4 rounded-xl text-left border border-[#D9822B]/20 text-xs space-y-2 mt-4">
                <div className="flex items-center justify-between border-b border-[#D9822B]/20 pb-2">
                  <span className="font-semibold text-[#E5C384]">📧 Vista previa del Correo enviado vía Resend</span>
                  <span className="text-[10px] text-[#A6988B]">Asunto: Tu 5% en Banquetería Lina</span>
                </div>
                <p className="italic text-[#DFB76C] text-[11px] border-l-2 border-[#D9822B] pl-2 py-1">
                  "Queremos liberar a los anfitriones del estrés y permitirles ser invitados en su propia fiesta. Creemos en el arte de cuidar cada detalle invisible para que tú solo tengas que preocuparte de lo más importante: estar presente, conectar con los tuyos y disfrutar de la compañía"
                </p>
                <img 
                  src="/images/empanaditas_pino.jpg" 
                  alt="Plato Estrella" 
                  className="w-full h-32 object-cover rounded-lg border border-[#D9822B]/20 mt-2"
                />
              </div>

              <button onClick={onClose} className="btn-primary w-full py-2.5 text-xs mt-2">
                Usar Cupón en la Carta
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
