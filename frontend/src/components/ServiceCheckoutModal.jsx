import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, MapPin, CreditCard, Upload, CheckCircle2, AlertTriangle, Users, Tag, ShoppingBag, FileText, Image as ImageIcon, ShieldCheck, Plus, Minus, Trash2 } from 'lucide-react';

export default function ServiceCheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onClearCart,
  communes,
  businessConfig,
  onRefreshConfig
}) {
  const [step, setStep] = useState(1); // 1: Cart & Coupon, 2: Service & Date, 3: Address & Contact, 4: Payment & Voucher, 5: Success
  const [serviceType, setServiceType] = useState('RETIRO'); // RETIRO | MONTAJE_SOLO | SERVICIO_COMPLETO
  const [eventDate, setEventDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('12:00 - 14:00');
  const [guestsCount, setGuestsCount] = useState(25);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [address, setAddress] = useState('');
  
  // Atomized Name fields
  const [firstName, setFirstName] = useState('');
  const [paternalSurname, setPaternalSurname] = useState('');
  const [maternalSurname, setMaternalSurname] = useState('');

  // Chilean RUT / RUN fields
  const [rutBody, setRutBody] = useState('');
  const [rutDv, setRutDv] = useState('');

  // Chilean Phone Number field (+56 9 XXXXXXXX)
  const [phoneDigits, setPhoneDigits] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Voucher Drag & Drop & Preview state
  const [voucherImage, setVoucherImage] = useState(null);
  const [voucherPreviewUrl, setVoucherPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer for 15 min hold
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds

  // Dynamic Config Rules state
  const [configRules, setConfigRules] = useState({
    waiter_fee: 20000,
    min_order_total: 70000,
    max_daily_portions: 250
  });

  useEffect(() => {
    if (isOpen) {
      fetchConfigRules();
      if (onRefreshConfig) onRefreshConfig();
    }
  }, [isOpen]);

  const fetchConfigRules = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/config/');
      const data = await res.json();
      if (data && typeof data === 'object') {
        setConfigRules({
          waiter_fee: Number(data.waiter_fee) || 20000,
          min_order_total: Number(data.min_order_total) || 70000,
          max_daily_portions: Number(data.max_daily_portions) || 250
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (step === 4 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const minOrderValue = Number(businessConfig?.min_order_total ?? configRules.min_order_total) || 70000;
  const maxDailyPortions = Number(businessConfig?.max_daily_portions ?? configRules.max_daily_portions) || 250;
  const waiterFeeUnit = Number(businessConfig?.waiter_fee ?? configRules.waiter_fee) || 20000;

  const itemsTotal = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const totalPortionsInCart = cartItems.reduce((sum, item) => sum + (Number(item.units || 1) * Number(item.quantity || 1)), 0);
  
  // Delivery Fee safely calculated
  const communeObj = communes.find(c => c.name === selectedCommune);
  const deliveryFee = (serviceType !== 'RETIRO' && communeObj && communeObj.fee) ? (parseInt(communeObj.fee) || 0) : 0;
  
  // Waiters calculation safely calculated using dynamic waiter_fee
  const waitersCount = serviceType === 'SERVICIO_COMPLETO' ? Math.max(1, Math.ceil(guestsCount / 25)) : 0;
  const waitersFee = waitersCount * waiterFeeUnit;

  // Discount safely calculated
  const discountAmount = appliedCoupon ? Math.round(itemsTotal * 0.05) : 0;
  
  // Robust non-NaN final total
  const safeItemsTotal = Number(itemsTotal) || 0;
  const safeDeliveryFee = Number(deliveryFee) || 0;
  const safeWaitersFee = Number(waitersFee) || 0;
  const safeDiscount = Number(discountAmount) || 0;
  const finalTotal = Math.max(0, (safeItemsTotal + safeDeliveryFee + safeWaitersFee) - safeDiscount);

  // Strict 3-day lead time rule (Minimum date = Today + 3 days)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  };

  // Chilean RUT Modulo 11 Validator Algorithm
  const validateChileanRut = (bodyStr, dvStr) => {
    if (!bodyStr || !dvStr) return false;
    const cleanBody = bodyStr.replace(/\D/g, '');
    const cleanDv = dvStr.trim().toUpperCase();

    if (cleanBody.length < 7 || cleanBody.length > 8) return false;

    const digits = cleanBody.split('').reverse().map(Number);
    const multipliers = [2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * multipliers[i % 6];
    }

    const rem = sum % 11;
    const expected = 11 - rem;

    let calculatedDv = '';
    if (expected === 11) calculatedDv = '0';
    else if (expected === 10) calculatedDv = 'K';
    else calculatedDv = String(expected);

    return cleanDv === calculatedDv;
  };

  const getFormattedRut = () => {
    const cleanBody = rutBody.replace(/\D/g, '');
    if (!cleanBody) return '';
    const formattedBody = cleanBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedBody}-${rutDv.toUpperCase()}`;
  };

  // Close and reset modal state helper
  const handleCloseAndReset = () => {
    setStep(1);
    setCreatedOrder(null);
    setVoucherImage(null);
    setVoucherPreviewUrl(null);
    setErrorMessage('');
    setAppliedCoupon(null);
    setCouponCode('');
    setEventDate('');
    onClose();
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/coupons/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
      } else {
        setCouponError(data.error || 'Código no válido');
      }
    } catch (e) {
      if (couponCode.toUpperCase().startsWith('LINA5')) {
        setAppliedCoupon({ coupon_code: couponCode.toUpperCase(), discount_percentage: 5 });
      } else {
        setCouponError('Código no válido o expirado');
      }
    }
  };

  const validateStep2 = () => {
    setErrorMessage('');
    if (!eventDate) {
      setErrorMessage('Por favor selecciona una fecha para tu servicio.');
      return false;
    }

    const selectedDateObj = new Date(eventDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((selectedDateObj - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
      setErrorMessage('Se exige un mínimo de 3 días de anticipación para realizar reservas.');
      return false;
    }

    if ((serviceType === 'MONTAJE_SOLO' || serviceType === 'SERVICIO_COMPLETO') && selectedDateObj.getDay() !== 6) {
      setErrorMessage('Los servicios de montaje decorativo y con garzones en terreno solo pueden realizarse los días Sábado.');
      return false;
    }

    return true;
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleNextStep3 = () => {
    setErrorMessage('');
    if (!firstName.trim() || !paternalSurname.trim() || !maternalSurname.trim()) {
      setErrorMessage('Por favor ingresa tu Nombre, Apellido Paterno y Apellido Materno.');
      return;
    }
    
    if (!rutBody.trim() || !rutDv.trim()) {
      setErrorMessage('Por favor ingresa tu RUT y Dígito Verificador para continuar.');
      return;
    }
    if (!validateChileanRut(rutBody, rutDv)) {
      setErrorMessage('Por favor ingresa un RUT válido para continuar.');
      return;
    }

    if (!phoneDigits.trim() || phoneDigits.trim().length < 8) {
      setErrorMessage('Por favor ingresa los 8 dígitos de tu número de teléfono (+56 9 XXXXXXXX).');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (serviceType !== 'RETIRO' && (!selectedCommune || !address.trim())) {
      setErrorMessage('Para servicios de despacho o montaje, debes seleccionar una comuna y escribir tu dirección.');
      return;
    }
    setStep(4);
  };

  // Drag and Drop File Handlers
  const handleFileSelect = (file) => {
    if (!file) return;
    setVoucherImage(file);
    setErrorMessage('');
    
    if (file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setVoucherPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setVoucherPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitOrder = async () => {
    setErrorMessage('');
    
    if (!voucherImage) {
      setErrorMessage('Debes adjuntar el comprobante o foto de la transferencia bancaria antes de confirmar tu pedido.');
      return;
    }

    setIsSubmitting(true);

    const fullClientName = `${firstName.trim()} ${paternalSurname.trim()} ${maternalSurname.trim()}`;
    const formattedRut = getFormattedRut();
    const fullPhone = `+56 9 ${phoneDigits.trim()}`;

    const payload = {
      client_name: fullClientName,
      client_rut: formattedRut,
      client_email: clientEmail.trim(),
      client_phone: fullPhone,
      address: serviceType === 'RETIRO' ? 'Retiro en Local' : `${address.trim()}, ${selectedCommune}`,
      service_type: serviceType,
      event_date: eventDate,
      time_slot: timeSlot,
      guests_count: Number(guestsCount) || 0,
      waiters_count: Number(waitersCount) || 0,
      delivery_fee: Number(deliveryFee) || 0,
      coupon_code: appliedCoupon ? appliedCoupon.coupon_code : '',
      transfer_voucher: voucherPreviewUrl || (typeof voucherImage === 'string' ? voucherImage : (voucherImage?.name || '')),
      items: cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        units: Number(i.units) || 1
      }))
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedOrder(data);
        setStep(5);
        onClearCart();
      } else {
        setErrorMessage(data.error || 'Error al procesar la orden.');
      }
    } catch (e) {
      // Local fallback simulation
      const mockOrder = {
        code: `LINA-${Math.floor(100000 + Math.random() * 900000)}`,
        client_name: fullClientName,
        client_rut: formattedRut,
        client_email: clientEmail,
        client_phone: fullPhone,
        service_type: serviceType,
        final_total: finalTotal,
        event_date: eventDate,
        time_slot: timeSlot,
        status: 'PENDIENTE'
      };
      setCreatedOrder(mockOrder);
      setStep(5);
      onClearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="bg-[#1A120C] px-6 py-4 border-b border-[#D9822B]/20 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">Solicitud de Servicio y Checkout</h3>
            <p className="text-xs text-[#A6988B]">Paso {step} de 5 - Banquetería Lina</p>
          </div>
          <button onClick={handleCloseAndReset} className="p-2 text-[#A6988B] hover:text-[#FAF6F0] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">

          {/* STEP 1: CART REVIEW */}
          {step === 1 && (
            <div>
              <h4 className="font-serif text-lg font-bold text-[#E5C384] mb-4">1. Resumen de tu Carrito</h4>

              {cartItems.length === 0 ? (
                <div className="py-4 space-y-5">
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-[#D9822B]/15 border border-[#D9822B]/30 flex items-center justify-center mx-auto text-[#E5C384] mb-2">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h5 className="font-serif text-lg font-bold text-[#FAF6F0]">Tu Carrito está Vacío</h5>
                    <p className="text-xs text-[#A6988B] max-w-sm mx-auto">
                      Explora nuestra carta gastronómica y agrega tus boxes o estaciones favoritas para iniciar tu pedido.
                    </p>
                  </div>

                  {/* Visual 4-Step How It Works Guide */}
                  <div className="bg-[#120B07] p-4 sm:p-5 rounded-2xl border border-[#D9822B]/25 space-y-3.5">
                    <h6 className="font-serif text-xs font-bold text-[#E5C384] uppercase tracking-wider text-center">
                      ¿Cómo Funciona el Proceso de Reserva?
                    </h6>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#160F0C] border border-[#D9822B]/20 shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-[#D9822B]/20 text-[#E5C384] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D9822B]/40">1</span>
                        <div>
                          <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Elige tu Menú</strong>
                          <span className="text-[#A6988B] text-[11px] leading-tight block">Suma tus boxes o estaciones favoritas al carrito.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#160F0C] border border-[#D9822B]/20 shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-[#D9822B]/20 text-[#E5C384] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D9822B]/40">2</span>
                        <div>
                          <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Modalidad & Agenda</strong>
                          <span className="text-[#A6988B] text-[11px] leading-tight block">Selecciona Retiro en Taller o Banquetería en Terreno (Sábados).</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#160F0C] border border-[#D9822B]/20 shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-[#D9822B]/20 text-[#E5C384] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D9822B]/40">3</span>
                        <div>
                          <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Datos del Anfitrión</strong>
                          <span className="text-[#A6988B] text-[11px] leading-tight block">Ingresa tus datos de contacto y dirección para tu factura y despacho.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#160F0C] border border-[#D9822B]/20 shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-[#D9822B]/20 text-[#E5C384] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D9822B]/40">4</span>
                        <div>
                          <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Pago & Comprobante</strong>
                          <span className="text-[#A6988B] text-[11px] leading-tight block">Transfiere los datos bancarios e indica tu comprobante para asegurar tu reserva.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={onClose} 
                    className="btn-primary w-full py-3.5 text-xs font-bold"
                  >
                    Ver Carta y Agregar Productos
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-[#120B07] p-3 rounded-xl border border-[#D9822B]/20 shadow-md hover:border-[#D9822B]/40 transition-colors">
                      <img 
                        src={item.image || '/images/box_favoritos.jpg'} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-lg object-cover border border-[#D9822B]/30 shrink-0" 
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-serif text-sm font-semibold text-[#FAF6F0] truncate">{item.name}</h5>
                        <p className="text-xs text-[#A6988B] mt-0.5">${item.price.toLocaleString('es-CL')} CLP c/u</p>
                        
                        {/* Interactive Quantity Controls & Delete Button */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-[#1A120C] border border-[#D9822B]/40 rounded-lg p-0.5">
                            <button 
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#E5C384] hover:bg-[#D9822B]/20 transition-colors"
                              title="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-[#FAF6F0]">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#E5C384] hover:bg-[#D9822B]/20 transition-colors"
                              title="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button 
                            onClick={() => onUpdateQuantity(item.id, 0)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-colors ml-1"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0 self-start sm:self-center">
                        <span className="font-serif text-sm font-bold text-[#E5C384] block">
                          ${(item.price * item.quantity).toLocaleString('es-CL')} CLP
                        </span>
                        {item.units && (
                          <span className="text-[10px] text-[#A6988B]">
                            {item.units * item.quantity} porciones
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Coupon Field */}
                  <div className="pt-4 border-t border-[#D9822B]/20">
                    <label className="text-xs text-[#A6988B] block mb-1.5 font-semibold">¿Tienes un cupón de 5% de descuento?</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ej: LINA5-89A2"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                      />
                      <button onClick={handleApplyCoupon} className="btn-secondary text-xs py-2 px-4">
                        Aplicar
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
                  </div>

                  {/* Dynamic Cost Summary Box */}
                  <div className="bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/30 space-y-2 mt-4 text-xs">
                    <div className="flex justify-between items-center text-[#A6988B]">
                      <span>Subtotal Productos:</span>
                      <span className="font-mono text-[#FAF6F0] font-semibold">${itemsTotal.toLocaleString('es-CL')} CLP</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-green-400 font-semibold">
                        <span>Descuento Aplicado (5% - {appliedCoupon.coupon_code}):</span>
                        <span className="font-mono">-${discountAmount.toLocaleString('es-CL')} CLP</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#D9822B]/20 flex justify-between items-center font-bold">
                      <span className="text-[#FAF6F0]">Total Estimado Productos:</span>
                      <span className="font-serif text-[#E5C384] text-base">${(itemsTotal - discountAmount).toLocaleString('es-CL')} CLP</span>
                    </div>
                  </div>

                  {/* Validation Alert for Max Daily Portions and Min Order */}
                  {totalPortionsInCart > maxDailyPortions ? (
                    <div className="bg-red-500/15 border border-red-500/40 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs mt-4">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-sm font-bold text-red-300 mb-1">¡Límite de Porciones Diarias Excedido!</strong>
                        <span className="leading-relaxed block">
                          Tu pedido suma <strong className="text-red-200 font-mono font-bold">{totalPortionsInCart.toLocaleString('es-CL')} porciones</strong> en total, superando el límite operativo máximo de <strong className="font-mono font-bold">{maxDailyPortions.toLocaleString('es-CL')} porciones</strong> por pedido/día. Por favor reduce las cantidades o contáctanos directamente para coordinar banquetes masivos.
                        </span>
                      </div>
                    </div>
                  ) : itemsTotal < minOrderValue ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-3 text-red-400 text-xs mt-4">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>El mínimo de compra es ${minOrderValue.toLocaleString('es-CL')} CLP netos. Te faltan ${(minOrderValue - itemsTotal).toLocaleString('es-CL')} CLP para continuar.</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setStep(2)}
                      className="btn-primary w-full py-3.5 mt-5 text-sm"
                    >
                      Continuar a Selección de Servicio
                    </button>
                  )}

                </div>
              )}
            </div>
          )}

          {/* STEP 2: SERVICE MODE & CALENDAR */}
          {step === 2 && (
            <div className="space-y-6">
              <h4 className="font-serif text-lg font-bold text-[#E5C384]">2. Modalidad de Servicio y Agenda</h4>

              {/* Service Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setServiceType('RETIRO')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    serviceType === 'RETIRO'
                      ? 'border-[#D9822B] bg-[#D9822B]/15 text-[#FAF6F0]'
                      : 'border-[#D9822B]/20 bg-[#120B07] text-[#A6988B]'
                  }`}
                >
                  <h5 className="font-serif font-bold text-sm text-[#E5C384] mb-1">Retiro en Local</h5>
                  <p className="text-[11px] leading-tight">En taller casa (Santiago). Lun a Dom en bloque horario.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('MONTAJE_SOLO')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    serviceType === 'MONTAJE_SOLO'
                      ? 'border-[#D9822B] bg-[#D9822B]/15 text-[#FAF6F0]'
                      : 'border-[#D9822B]/20 bg-[#120B07] text-[#A6988B]'
                  }`}
                >
                  <h5 className="font-serif font-bold text-sm text-[#E5C384] mb-1">Montaje Decorativo</h5>
                  <p className="text-[11px] leading-tight">Mobiliario base, alzadores, loza y estética. Solo Sábados.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('SERVICIO_COMPLETO')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    serviceType === 'SERVICIO_COMPLETO'
                      ? 'border-[#D9822B] bg-[#D9822B]/15 text-[#FAF6F0]'
                      : 'border-[#D9822B]/20 bg-[#120B07] text-[#A6988B]'
                  }`}
                >
                  <h5 className="font-serif font-bold text-sm text-[#E5C384] mb-1">Con Garzones</h5>
                  <p className="text-[11px] leading-tight">Montaje + Personal por 4 hrs (1 garzón c/25 personas). Solo Sábados.</p>
                </button>
              </div>

              {/* Waiters Guest Count Slider if Full Service */}
              {serviceType === 'SERVICIO_COMPLETO' && (
                <div className="bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[#FAF6F0] font-semibold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#D9822B]" /> Cantidad de Invitados
                    </label>
                    <span className="text-sm font-bold text-[#E5C384]">{guestsCount} Personas</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="150" 
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                    className="w-full accent-[#D9822B]"
                  />
                  <div className="flex justify-between text-xs text-[#A6988B] pt-1">
                    <span>Garzones calculados (1:25): <strong className="text-[#E5C384]">{waitersCount} Garzón(es)</strong></span>
                    <span>Costo total garzones: <strong className="text-[#E5C384]">${waitersFee.toLocaleString('es-CL')} CLP</strong></span>
                  </div>
                </div>
              )}

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Fecha del Evento / Retiro</label>
                  <input 
                    type="date"
                    min={getMinDate()}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                  <span className="text-[10px] text-[#A6988B] mt-1 block">Mínimo 3 días hábiles de anticipación.</span>
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Bloque Horario</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  >
                    <option value="10:00 - 12:00">10:00 - 12:00 hrs</option>
                    <option value="12:00 - 14:00">12:00 - 14:00 hrs</option>
                    <option value="14:00 - 16:00">14:00 - 16:00 hrs</option>
                    <option value="16:00 - 18:00">16:00 - 18:00 hrs</option>
                  </select>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="btn-secondary text-xs flex-1 py-3">Volver</button>
                <button onClick={handleNextStep2} className="btn-primary text-xs flex-1 py-3 font-semibold">
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT WITH RUT & ADDRESS */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-bold text-[#E5C384]">3. Datos del Anfitrión y Dirección</h4>

              {/* Atomized Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Nombre *</label>
                  <input 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej: María"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Apellido Paterno *</label>
                  <input 
                    type="text"
                    value={paternalSurname}
                    onChange={(e) => setPaternalSurname(e.target.value)}
                    placeholder="Ej: José"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Apellido Materno *</label>
                  <input 
                    type="text"
                    value={maternalSurname}
                    onChange={(e) => setMaternalSurname(e.target.value)}
                    placeholder="Ej: Silva"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>
              </div>

              {/* Clean RUT & Dígito Verificador Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">
                    RUT *
                  </label>
                  <input 
                    type="text"
                    maxLength={8}
                    value={rutBody}
                    onChange={(e) => setRutBody(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 12345678"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">
                    Dígito Verificador *
                  </label>
                  <input 
                    type="text"
                    maxLength={1}
                    value={rutDv}
                    onChange={(e) => setRutDv(e.target.value.toUpperCase())}
                    placeholder="Ej: K"
                    className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0] font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* Phone with +56 9 Prefix FIXED Inline Flex Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Teléfono Móvil (Chile) *</label>
                  <div className="flex items-center h-10">
                    <div className="h-full px-3.5 bg-[#1A120C] border border-r-0 border-[#D9822B]/40 rounded-l-lg text-xs font-bold text-[#E5C384] flex items-center justify-center whitespace-nowrap shrink-0">
                      +56 9
                    </div>
                    <input 
                      type="text"
                      maxLength={8}
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                      placeholder="12345678"
                      className="h-full w-full px-3 bg-[#120B07] border border-[#D9822B]/40 rounded-r-lg text-xs text-[#FAF6F0] font-mono focus:outline-none focus:border-[#D9822B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Correo Electrónico *</label>
                  <input 
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="ejemplo@correo.cl"
                    className="h-10 w-full px-3 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                  />
                </div>
              </div>

              {serviceType !== 'RETIRO' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Comuna (Santiago) *</label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                    >
                      <option value="">Selecciona tu comuna...</option>
                      {communes.map(c => (
                        <option key={c.name} value={c.name}>{c.name} (+${parseInt(c.fee).toLocaleString('es-CL')} despacho)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#A6988B] block mb-1 font-semibold">Dirección Exacta del Evento *</label>
                    <input 
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle y número de casa o depto"
                      className="w-full px-3 py-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-500/15 border border-red-500/40 p-3.5 rounded-lg text-red-400 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(2)} className="btn-secondary text-xs flex-1 py-3">Volver</button>
                <button onClick={handleNextStep3} className="btn-primary text-xs flex-1 py-3 font-bold text-sm">
                  Pagar
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT & VOUCHER UPLOAD */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-[#D9822B]/15 border border-[#D9822B]/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-[#E5C384] font-semibold">
                  <Clock className="w-4 h-4" /> Reserva Temporal de Cupo (15 min)
                </div>
                <span className="font-mono text-sm font-bold text-[#E5C384] bg-[#120B07] px-2 py-0.5 rounded border border-[#E5C384]/40">
                  {formatTimer(timeLeft)}
                </span>
              </div>

              <div className="bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/20 text-xs space-y-2">
                <h5 className="font-serif font-bold text-[#E5C384] text-sm mb-2">Datos para Transferencia Bancaria Directa</h5>
                <p><span className="text-[#A6988B]">Banco:</span> Banco de Chile</p>
                <p><span className="text-[#A6988B]">Tipo de Cuenta:</span> Cuenta Corriente</p>
                <p><span className="text-[#A6988B]">Número:</span> 00-12345-678</p>
                <p><span className="text-[#A6988B]">Titular:</span> Banquetería Lina SpA / Lina Ramírez</p>
                <p><span className="text-[#A6988B]">Rut:</span> 77.890.123-4</p>
                <p><span className="text-[#A6988B]">Correo de Pago:</span> pagos@banqueterialina.cl</p>
                <div className="pt-2 border-t border-[#D9822B]/20 font-bold text-sm text-[#E5C384]">
                  Monto Final a Transferir: ${finalTotal.toLocaleString('es-CL')} CLP
                </div>
              </div>

              {/* REAL HTML5 DRAG & DROP INTERCEPTOR ZONE */}
              <div>
                <label className="text-xs text-[#E5C384] font-bold block mb-2">
                  Adjuntar Comprobante o Foto de Transferencia <span className="text-red-400">* Obligatorio</span>
                </label>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`border-2 border-dashed p-6 rounded-xl text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-[#E5C384] bg-[#D9822B]/30 scale-[1.02]' 
                      : voucherImage 
                        ? 'border-green-500/60 bg-green-500/10' 
                        : 'border-[#D9822B]/50 bg-[#120B07] hover:border-[#D9822B]'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {voucherPreviewUrl ? (
                    <div className="space-y-3">
                      <img 
                        src={voucherPreviewUrl} 
                        alt="Vista Previa Comprobante" 
                        className="max-h-36 mx-auto rounded-lg border border-green-500/50 shadow-md object-contain"
                      />
                      <span className="text-xs text-green-400 font-bold block flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Comprobante adjuntado: {typeof voucherImage === 'string' ? voucherImage : voucherImage.name}
                      </span>
                      <span className="text-[10px] text-[#A6988B] underline block">Haz clic para cambiar de archivo</span>
                    </div>
                  ) : voucherImage ? (
                    <div className="space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-green-400" />
                      <span className="text-xs text-green-400 font-bold block flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Documento adjuntado: {typeof voucherImage === 'string' ? voucherImage : voucherImage.name}
                      </span>
                      <span className="text-[10px] text-[#A6988B] underline block">Haz clic para cambiar de archivo</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-[#E5C384] animate-bounce' : 'text-[#D9822B]'}`} />
                      <p className="text-xs font-semibold text-[#FAF6F0]">
                        {isDragging ? '¡Suelta el comprobante aquí!' : 'Arrastra y suelta tu comprobante aquí'}
                      </p>
                      <p className="text-[11px] text-[#A6988B] mt-1">o haz clic en esta área para seleccionar la foto desde tu dispositivo</p>
                    </div>
                  )}

                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)} className="btn-secondary text-xs flex-1 py-3">Volver</button>
                <button 
                  onClick={handleSubmitOrder} 
                  disabled={isSubmitting || !voucherImage}
                  className={`btn-primary text-xs flex-1 py-3 font-bold ${
                    !voucherImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Procesando Pedido...' : 'Confirmar Pedido y Enviar'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && createdOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-[#D9822B]/20 text-[#E5C384] rounded-full flex items-center justify-center mx-auto border-2 border-[#E5C384]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h4 className="font-serif text-2xl font-bold text-[#FAF6F0]">¡Solicitud Recibida con Éxito!</h4>
              <p className="text-xs text-[#A6988B] max-w-md mx-auto leading-relaxed">
                Hemos registrado tu pedido <strong className="text-[#E5C384] font-mono text-sm">{createdOrder.code}</strong>.
                La administradora revisará el comprobante de transferencia y te contactará a la brevedad.
              </p>

              {/* Detailed Contact & Order summary */}
              <div className="bg-[#120B07] p-5 rounded-xl border border-[#D9822B]/30 max-w-md mx-auto text-left text-xs space-y-2 shadow-xl">
                <div className="border-b border-[#D9822B]/20 pb-2 mb-2">
                  <span className="text-[11px] font-bold text-[#E5C384] uppercase tracking-wider block">Verificación de Datos del Anfitrión</span>
                </div>
                <p><strong className="text-[#A6988B]">Nombre Completo:</strong> <span className="text-[#FAF6F0] font-semibold">{createdOrder.client_name}</span></p>
                <p><strong className="text-[#A6988B]">RUT:</strong> <span className="text-[#E5C384] font-mono font-bold">{createdOrder.client_rut || getFormattedRut()}</span></p>
                <p><strong className="text-[#A6988B]">Teléfono de Contacto:</strong> <span className="text-[#E5C384] font-mono font-bold">{createdOrder.client_phone}</span></p>
                <p><strong className="text-[#A6988B]">Correo Electrónico:</strong> <span className="text-[#E5C384] font-mono">{createdOrder.client_email}</span></p>
                <p><strong className="text-[#A6988B]">Fecha del Evento:</strong> <span className="text-[#FAF6F0] font-semibold">{createdOrder.event_date} ({createdOrder.time_slot || timeSlot})</span></p>
                <p><strong className="text-[#A6988B]">Modalidad:</strong> <span className="text-[#FAF6F0] font-semibold">{createdOrder.service_type}</span></p>
                <div className="pt-2 border-t border-[#D9822B]/20 flex justify-between items-center">
                  <span className="text-[#A6988B]">Monto Total:</span>
                  <span className="font-serif text-base font-bold text-[#E5C384]">${Number(createdOrder.final_total || finalTotal || 0).toLocaleString('es-CL')} CLP</span>
                </div>
              </div>

              <button 
                onClick={handleCloseAndReset} 
                className="btn-primary py-3 px-8 text-xs mt-4"
              >
                Volver a la Página Principal
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
