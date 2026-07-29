import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

export default function TerminosPage({ onNavigateHome }) {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto space-y-10 text-xs text-[#A6988B] leading-relaxed">
      
      <button onClick={onNavigateHome} className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </button>

      <div className="border-b border-[#D9822B]/20 pb-6 space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#FAF6F0]">
          Términos y Condiciones de Servicio
        </h1>
        <p className="text-[#E5C384]">Banquetería Lina - Última actualización: Julio 2026</p>
      </div>

      <div className="space-y-6 bg-[#1A120C] p-8 rounded-2xl border border-[#D9822B]/20">
        
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#E5C384]">1. Políticas de Reserva y Anticipación</h3>
          <p>
            Todos los pedidos y reservas de servicios de banquetería requieren una anticipación mínima estricta de <strong>3 días hábiles</strong> antes de la fecha del evento o retiro. Cualquier modificación o anulación de menú debe realizarse con al menos <strong>7 días hábiles</strong> de antelación.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#E5C384]">2. Modalidades de Servicio y Horarios</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Retiro en Taller:</strong> Disponible de Lunes a Domingo en los bloques horarios acordados al momento del checkout.</li>
            <li><strong>Montaje Decorativo & Servicio con Garzones:</strong> Realizados exclusivamente los días <strong>Sábado</strong>.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#E5C384]">3. Mínimo de Compra</h3>
          <p>
            Se exige un mínimo de compra de <strong>$70.000 CLP netos</strong> en productos dentro del carrito de compras para habilitar la solicitud de servicio y despliegue operativo.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#E5C384]">4. Pagos y Validación</h3>
          <p>
            El único medio de pago habilitado en la fase actual es Transferencia Bancaria Directa. El cliente debe adjuntar la imagen o comprobante de la transferencia en la plataforma. La reserva queda confirmada una vez que la administradora valida y aprueba el comprobante.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#E5C384]">5. Protección de Datos (Ley N° 19.628)</h3>
          <p>
            Banquetería Lina garantiza la confidencialidad absoluta de los datos de contacto y correos capturados. Estos serán utilizados únicamente para el procesamiento de pedidos y el envío de beneficios exclusivos.
          </p>
        </section>

      </div>

    </div>
  );
}
