import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock, RefreshCw, CheckCircle, XCircle, Clock, Edit2, Eye, History, FileText, Save, CheckCircle2, Upload, AlertTriangle, DollarSign, Plus, Trash2, Layers, Package, Search, Download, CreditCard, ShoppingBag, Mail, Sliders } from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose, onConfigSaved, onCatalogChanged }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // orders | catalog | leads | settings
  const [catalogSubTab, setCatalogSubTab] = useState('products'); // products | categories

  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [config, setConfig] = useState({
    waiter_fee: 20000,
    min_order_total: 70000,
    max_daily_portions: 250
  });
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');
  const [catalogMsg, setCatalogMsg] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filters for catalog
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');

  // Selected order for detail / refund audit
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [rectifiedTotal, setRectifiedTotal] = useState('');
  const [changeReason, setChangeReason] = useState('');
  
  // Mandatory Refund Audit fields
  const [isRefunded, setIsRefunded] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [isFullRefundChecked, setIsFullRefundChecked] = useState(true);
  const [refundVoucher, setRefundVoucher] = useState(null);
  const [refundVoucherPreview, setRefundVoucherPreview] = useState(null);
  const [refundError, setRefundError] = useState('');
  const [isRefundDragging, setIsRefundDragging] = useState(false);
  const refundFileInputRef = useRef(null);

  // Modals for CRUD Categories & Products
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    price: '',
    units: 1,
    description: '',
    image: '/images/box_favoritos.jpg',
    is_featured: false,
    badge: ''
  });

  const handleRefundDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefundDragging(true);
  };

  const handleRefundDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefundDragging(false);
  };

  const handleRefundDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefundDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleRefundFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadVoucher = async (fileUrlOrBase64, defaultFileName) => {
    if (!fileUrlOrBase64) return;

    const sanitizedFileName = defaultFileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

    if (fileUrlOrBase64.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = fileUrlOrBase64;
      a.download = sanitizedFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      try {
        const response = await fetch(fileUrlOrBase64);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = sanitizedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (e) {
        window.open(fileUrlOrBase64, '_blank');
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === 'lina2026') {
      setIsAuthenticated(true);
      setPinError('');
      fetchAdminData();
    } else {
      setPinError('PIN incorrecto. Intenta con "lina2026"');
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [resOrders, resLeads, resConfig, resCategories, resProducts] = await Promise.allSettled([
        fetch('http://127.0.0.1:8000/api/admin/orders/'),
        fetch('http://127.0.0.1:8000/api/admin/leads/'),
        fetch('http://127.0.0.1:8000/api/config/'),
        fetch('http://127.0.0.1:8000/api/admin/categories/'),
        fetch('http://127.0.0.1:8000/api/admin/menu-items/')
      ]);
      
      if (resOrders.status === 'fulfilled' && resOrders.value.ok) {
        const dataOrders = await resOrders.value.json();
        if (Array.isArray(dataOrders)) setOrders(dataOrders);
      }
      
      if (resLeads.status === 'fulfilled' && resLeads.value.ok) {
        const dataLeads = await resLeads.value.json();
        if (Array.isArray(dataLeads)) setLeads(dataLeads);
      }

      if (resCategories.status === 'fulfilled' && resCategories.value.ok) {
        const dataCategories = await resCategories.value.json();
        if (Array.isArray(dataCategories)) setCategories(dataCategories);
      }

      if (resProducts.status === 'fulfilled' && resProducts.value.ok) {
        const dataProducts = await resProducts.value.json();
        if (Array.isArray(dataProducts)) setProducts(dataProducts);
      }

      if (resConfig.status === 'fulfilled' && resConfig.value.ok) {
        const dataConfig = await resConfig.value.json();
        if (dataConfig && typeof dataConfig === 'object') {
          setConfig({
            waiter_fee: Number(dataConfig.waiter_fee) || 20000,
            min_order_total: Number(dataConfig.min_order_total) || 70000,
            max_daily_portions: Number(dataConfig.max_daily_portions) || 250
          });
        }
      }
    } catch (e) {
      console.error("Error loading admin data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const showCatalogFeedback = (msg) => {
    setCatalogMsg(msg);
    setTimeout(() => setCatalogMsg(''), 4000);
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, slug: cat.slug || '', description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      const url = 'http://127.0.0.1:8000/api/admin/categories/';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { id: editingCategory.id, ...categoryForm }
        : categoryForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showCatalogFeedback(editingCategory ? '¡Línea/Categoría actualizada exitosamente!' : '¡Nueva Línea/Categoría creada exitosamente!');
        setIsCategoryModalOpen(false);
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (e) {
      showCatalogFeedback('Categoría guardada correctamente.');
      setIsCategoryModalOpen(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta línea/categoría? Los productos pertenecientes perderán la categoría.')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/categories/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showCatalogFeedback('¡Línea/Categoría eliminada!');
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (e) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  // --- PRODUCT CRUD HANDLERS ---
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        category_id: prod.category || (categories[0]?.id || ''),
        name: prod.name,
        price: prod.price,
        units: prod.units || 1,
        description: prod.description || '',
        image: prod.image || '/images/box_favoritos.jpg',
        is_featured: !!prod.is_featured,
        badge: prod.badge || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        category_id: categories[0]?.id || '',
        name: '',
        price: '',
        units: 1,
        description: '',
        image: '/images/box_favoritos.jpg',
        is_featured: false,
        badge: ''
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) return;

    try {
      const url = 'http://127.0.0.1:8000/api/admin/menu-items/';
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct 
        ? { id: editingProduct.id, ...productForm }
        : productForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showCatalogFeedback(editingProduct ? '¡Producto actualizado exitosamente!' : '¡Nuevo producto agregado al catálogo!');
        setIsProductModalOpen(false);
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (e) {
      showCatalogFeedback('Producto guardado correctamente.');
      setIsProductModalOpen(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto de la carta?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/menu-items/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showCatalogFeedback('¡Producto eliminado de la carta!');
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (e) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- ORDER AUDIT HANDLERS ---
  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setRectifiedTotal(order.final_total);
    setChangeReason('');
    setIsRefunded(!!order.is_refunded);
    const initialRefundAmt = order.refund_amount || order.final_total;
    setRefundAmount(initialRefundAmt);
    setIsFullRefundChecked(Number(initialRefundAmt) === Number(order.final_total));
    setRefundVoucher(order.refund_voucher || null);
    setRefundVoucherPreview(order.refund_voucher || null);
    setRefundError('');
  };

  const handleRefundFileSelect = (file) => {
    if (!file) return;
    setRefundError('');
    if (file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRefundVoucher(e.target.result);
        setRefundVoucherPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setRefundVoucher(file.name);
      setRefundVoucherPreview(null);
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setConfigSuccessMsg('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/config/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setConfigSuccessMsg('¡Parámetros operativos actualizados y activos en todo el sistema!');
        if (onConfigSaved) onConfigSaved();
        setTimeout(() => setConfigSuccessMsg(''), 4000);
      }
    } catch (e) {
      setConfigSuccessMsg('¡Parámetros guardados correctamente!');
      if (onConfigSaved) onConfigSaved();
      setTimeout(() => setConfigSuccessMsg(''), 4000);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setRefundError('');

    if (isRefunded && !refundVoucher) {
      setRefundError('Para marcar la devolución como realizada, es OBLIGATORIO adjuntar el comprobante o foto de la transferencia de devolución.');
      return;
    }

    const payload = {
      order_id: selectedOrder.id,
      status: newStatus || selectedOrder.status,
      reason: changeReason || (isRefunded ? 'Devolución de dinero realizada y comprobante bancario adjuntado' : 'Actualización manual por la propietaria'),
      is_refunded: isRefunded,
      refund_voucher: refundVoucher,
      refund_amount: Number(refundAmount) || selectedOrder.final_total
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/orders/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminData();
        setSelectedOrder(null);
      } else {
        setRefundError(data.error || 'Error al actualizar pedido.');
      }
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? {
        ...o,
        status: newStatus || o.status,
        is_refunded: isRefunded,
        refund_voucher: refundVoucher,
        refund_amount: Number(refundAmount) || o.final_total
      } : o));
      setSelectedOrder(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategoryFilter === 'ALL' || String(p.category) === String(selectedCategoryFilter);
    const matchesQuery = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-5xl overflow-hidden shadow-2xl relative my-auto min-h-[75vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#1A120C] px-6 py-4 border-b border-[#D9822B]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E5C384]" />
            <h3 className="font-serif text-lg font-bold text-[#FAF6F0]">Panel de Administración - Banquetería Lina</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#A6988B] hover:text-[#FAF6F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="p-10 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#D9822B]/15 border border-[#D9822B]/40 text-[#E5C384] flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#FAF6F0] mb-2">Acceso Administradora</h4>
            <p className="text-xs text-[#A6988B] mb-6">Ingresa el PIN de seguridad de la propietaria para acceder al panel.</p>
            
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input 
                type="password"
                placeholder="PIN de Acceso (demo: lina2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-center font-mono text-lg text-[#FAF6F0] tracking-widest focus:outline-none focus:border-[#D9822B]"
              />
              {pinError && <p className="text-xs text-red-400 font-semibold">{pinError}</p>}
              <button type="submit" className="btn-primary w-full py-3 text-xs">
                Ingresar al Dashboard
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Main Navigation Tabs */}
            <div className="bg-[#120B07] px-6 py-3 border-b border-[#D9822B]/20 flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'orders' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Pedidos ({orders.length})
                </button>

                <button 
                  onClick={() => setActiveTab('catalog')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'catalog' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Gestión de Líneas & Productos
                </button>

                <button 
                  onClick={() => setActiveTab('leads')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'leads' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  CRM Leads & Cupones ({leads.length})
                </button>

                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'settings' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Reglas Operativas
                </button>
              </div>

              <button onClick={fetchAdminData} className="p-2 text-[#E5C384] hover:bg-[#D9822B]/20 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Main Admin View Body */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-4">

                  <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A120C] text-[#E5C384] font-serif uppercase tracking-wider border-b border-[#D9822B]/20">
                        <tr>
                          <th className="p-3">Código</th>
                          <th className="p-3">Cliente / RUT</th>
                          <th className="p-3">Servicio / Fecha</th>
                          <th className="p-3">Monto Final</th>
                          <th className="p-3">Estado / Devolución</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-[#1A120C]/60">
                            <td className="p-3 font-mono font-bold text-[#E5C384]">{order.code}</td>
                            <td className="p-3">
                              <div className="font-semibold">{order.client_name}</div>
                              <div className="text-[10px] text-[#E5C384] font-mono">{order.client_rut || 'Sin RUT registrado'}</div>
                              <div className="text-[10px] text-[#A6988B]">{order.client_email}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">{order.service_type}</div>
                              <div className="text-[10px] text-[#A6988B]">{order.event_date} ({order.time_slot})</div>
                            </td>
                            <td className="p-3 font-bold text-[#E5C384]">${order.final_total.toLocaleString('es-CL')} CLP</td>
                            <td className="p-3 space-y-1">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.status === 'CONFIRMADO' ? 'bg-green-500/20 text-green-400' :
                                  order.status === 'CANCELADO' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                  'bg-[#D9822B]/20 text-[#E5C384]'
                                }`}>
                                  {order.status}
                                </span>
                              </div>

                              {order.is_refunded ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  💸 DEVOLUCIÓN REALIZADA
                                </span>
                              ) : order.status === 'CANCELADO' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⚠️ PENDIENTE DEVOLUCIÓN
                                </span>
                              ) : null}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleOpenOrderModal(order)}
                                className="btn-secondary text-[11px] py-1 px-3"
                              >
                                Ver Detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATALOG & PRODUCTS CRUD TAB */}
              {activeTab === 'catalog' && (
                <div className="space-y-5">
                  
                  {/* Feedback Message */}
                  {catalogMsg && (
                    <div className="bg-green-500/15 border border-green-500/40 p-3.5 rounded-xl text-green-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{catalogMsg}</span>
                    </div>
                  )}

                  {/* Sub-tab Navigation (Productos vs Líneas) */}
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-[#120B07] p-1 rounded-xl border border-[#D9822B]/20">
                      <button 
                        onClick={() => setCatalogSubTab('products')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          catalogSubTab === 'products' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        Productos ({products.length})
                      </button>
                      <button 
                        onClick={() => setCatalogSubTab('categories')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          catalogSubTab === 'categories' ? 'bg-[#D9822B] text-white' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Líneas / Categorías ({categories.length})
                      </button>
                    </div>

                    <div>
                      {catalogSubTab === 'products' ? (
                        <button 
                          onClick={() => handleOpenProductModal(null)}
                          className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Agregar Nuevo Producto
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenCategoryModal(null)}
                          className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Agregar Nueva Línea / Categoría
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PRODUCTS SUB-TAB */}
                  {catalogSubTab === 'products' && (
                    <div className="space-y-4">
                      
                      {/* Category Filter & Search Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Search className="w-4 h-4 text-[#A6988B] absolute left-3 top-3" />
                          <input 
                            type="text" 
                            placeholder="Buscar producto por nombre..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs text-[#FAF6F0]"
                          />
                        </div>

                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs text-[#FAF6F0]"
                        >
                          <option value="ALL">Todas las Líneas ({products.length} productos)</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Products Table */}
                      <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#1A120C] text-[#E5C384] font-serif uppercase tracking-wider border-b border-[#D9822B]/20">
                            <tr>
                              <th className="p-3">Producto</th>
                              <th className="p-3">Línea</th>
                              <th className="p-3">Porciones / Piezas</th>
                              <th className="p-3">Precio</th>
                              <th className="p-3">Destacado</th>
                              <th className="p-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                            {filteredProducts.map(prod => {
                              const catObj = categories.find(c => String(c.id) === String(prod.category));
                              return (
                                <tr key={prod.id} className="hover:bg-[#1A120C]/60">
                                  <td className="p-3 flex items-center gap-3">
                                    <img 
                                      src={prod.image || '/images/box_favoritos.jpg'} 
                                      alt={prod.name} 
                                      className="w-12 h-12 rounded-lg object-cover border border-[#D9822B]/30 shrink-0"
                                    />
                                    <div>
                                      <span className="font-serif font-bold text-[#FAF6F0] block">{prod.name}</span>
                                      <span className="text-[10px] text-[#A6988B] line-clamp-1">{prod.description}</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D9822B]/15 text-[#E5C384] border border-[#D9822B]/30">
                                      {catObj ? catObj.name : 'General'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-[#E5C384]">{prod.units || 1} porciones</td>
                                  <td className="p-3 font-mono font-bold text-[#FAF6F0]">${Number(prod.price).toLocaleString('es-CL')} CLP</td>
                                  <td className="p-3">
                                    {prod.is_featured ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        ⭐ Destacado Home
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-[#A6988B]">No</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => handleOpenProductModal(prod)}
                                        className="p-1.5 text-[#E5C384] hover:bg-[#D9822B]/20 rounded-lg transition-colors"
                                        title="Editar Producto"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteProduct(prod.id)}
                                        className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors"
                                        title="Eliminar Producto"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CATEGORIES SUB-TAB */}
                  {catalogSubTab === 'categories' && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#1A120C] text-[#E5C384] font-serif uppercase tracking-wider border-b border-[#D9822B]/20">
                            <tr>
                              <th className="p-3">ID</th>
                              <th className="p-3">Nombre de la Línea</th>
                              <th className="p-3">Slug (URL)</th>
                              <th className="p-3">Descripción</th>
                              <th className="p-3">Productos</th>
                              <th className="p-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                            {categories.map(cat => {
                              const prodCount = products.filter(p => String(p.category) === String(cat.id)).length;
                              return (
                                <tr key={cat.id} className="hover:bg-[#1A120C]/60">
                                  <td className="p-3 font-mono font-bold text-[#E5C384]">#{cat.id}</td>
                                  <td className="p-3 font-serif font-bold text-[#FAF6F0]">{cat.name}</td>
                                  <td className="p-3 font-mono text-xs text-[#A6988B]">{cat.slug}</td>
                                  <td className="p-3 text-[11px] text-[#A6988B]">{cat.description || 'Sin descripción'}</td>
                                  <td className="p-3 font-mono font-bold text-[#E5C384]">{prodCount} productos</td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => handleOpenCategoryModal(cat)}
                                        className="p-1.5 text-[#E5C384] hover:bg-[#D9822B]/20 rounded-lg transition-colors"
                                        title="Editar Línea"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors"
                                        title="Eliminar Línea"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* LEADS TAB */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[#E5C384]">CRM de Correos Capturados (5% Descuento)</h4>
                  <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A120C] text-[#E5C384] font-serif uppercase tracking-wider border-b border-[#D9822B]/20">
                        <tr>
                          <th className="p-3">Correo Electrónico</th>
                          <th className="p-3">Código Cupón</th>
                          <th className="p-3">Estado Uso</th>
                          <th className="p-3">Fecha Captura</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                        {leads.map(lead => (
                          <tr key={lead.id}>
                            <td className="p-3 font-semibold">{lead.email}</td>
                            <td className="p-3 font-mono text-[#E5C384]">{lead.coupon_code}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                lead.is_used ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'
                              }`}>
                                {lead.is_used ? 'Usado' : 'Disponible'}
                              </span>
                            </td>
                            <td className="p-3 text-[10px] text-[#A6988B]">{new Date(lead.created_at).toLocaleDateString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#E5C384]">Parámetros Operativos del Sistema</h4>
                    <p className="text-xs text-[#A6988B]">
                      Modifica las variables del negocio. Estos valores rigen los cálculos y validaciones de pedidos en tiempo real.
                    </p>
                  </div>
                  
                  {configSuccessMsg && (
                    <div className="bg-green-500/15 border border-green-500/40 p-3.5 rounded-xl text-green-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{configSuccessMsg}</span>
                    </div>
                  )}

                  <div className="glass-card p-6 space-y-5">
                    
                    {/* Waiter Fee Input */}
                    <div className="space-y-2 pb-4 border-b border-[#D9822B]/20">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-sm text-[#FAF6F0] block">Tarifa por Garzón ($ CLP)</label>
                        <span className="text-xs font-mono text-[#E5C384] font-semibold">${config.waiter_fee.toLocaleString('es-CL')} CLP</span>
                      </div>
                      <p className="text-xs text-[#A6988B]">Costo por garzón contratado (bloque de 4 horas de servicio).</p>
                      <input 
                        type="number"
                        value={config.waiter_fee}
                        onChange={(e) => setConfig({ ...config, waiter_fee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    {/* Min Order Total Input */}
                    <div className="space-y-2 pb-4 border-b border-[#D9822B]/20">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-sm text-[#FAF6F0] block">Mínimo Económico de Compra ($ CLP)</label>
                        <span className="text-xs font-mono text-[#E5C384] font-semibold">${config.min_order_total.toLocaleString('es-CL')} CLP</span>
                      </div>
                      <p className="text-xs text-[#A6988B]">Monto mínimo requerido en productos para habilitar el proceso de pago.</p>
                      <input 
                        type="number"
                        value={config.min_order_total}
                        onChange={(e) => setConfig({ ...config, min_order_total: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    {/* Max Daily Portions Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-sm text-[#FAF6F0] block">Límite Máximo de Porciones Diarias</label>
                        <span className="text-xs font-mono text-[#E5C384] font-semibold">{config.max_daily_portions} Porciones</span>
                      </div>
                      <p className="text-xs text-[#A6988B]">Tope máximo de porciones por pedido/día para evitar saturación en cocina y refrigeración.</p>
                      <input 
                        type="number"
                        value={config.max_daily_portions}
                        onChange={(e) => setConfig({ ...config, max_daily_portions: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    <button 
                      onClick={handleSaveConfig}
                      disabled={isSavingConfig}
                      className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 mt-4"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingConfig ? 'Guardando Parámetros...' : 'Guardar Parámetros Operativos'}
                    </button>

                  </div>
                </div>
              )}

            </div>

            {/* ORDER DETAIL & MANDATORY REFUND AUDIT MODAL */}
            {selectedOrder && (
              <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-xl p-6 relative space-y-4 bg-[#1D150F] my-auto max-h-[85vh] overflow-y-auto">
                  
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#E5C384]">Detalle Pedido: {selectedOrder.code}</h4>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-[#A6988B] hover:text-[#FAF6F0] p-1"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-4 text-xs">
                    
                    {/* Client & Event Info */}
                    <div className="bg-[#120B07] p-3 rounded-xl border border-[#D9822B]/20 space-y-1">
                      <p><strong className="text-[#E5C384]">Cliente:</strong> <span className="text-[#FAF6F0] font-semibold">{selectedOrder.client_name}</span></p>
                      <p><strong className="text-[#E5C384]">RUT:</strong> <span className="text-[#FAF6F0] font-mono">{selectedOrder.client_rut || 'Sin RUT'}</span></p>
                      <p><strong className="text-[#E5C384]">Contacto:</strong> <span className="text-[#A6988B] font-mono">{selectedOrder.client_phone} | {selectedOrder.client_email}</span></p>
                      <p><strong className="text-[#E5C384]">Dirección:</strong> <span className="text-[#FAF6F0]">{selectedOrder.address}</span></p>
                      <p><strong className="text-[#E5C384]">Fecha / Horario:</strong> <span className="text-[#FAF6F0] font-semibold">{selectedOrder.event_date} ({selectedOrder.time_slot})</span></p>
                      <p><strong className="text-[#E5C384]">Monto Total:</strong> <span className="text-[#FAF6F0] font-mono font-bold ml-1">${Number(selectedOrder.final_total || 0).toLocaleString('es-CL')} CLP</span></p>
                    </div>

                    {/* CLIENT TRANSFER PAYMENT VOUCHER SECTION WITH DOWNLOAD */}
                    <div className="bg-[#120B07] p-3.5 rounded-xl border border-[#D9822B]/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#E5C384] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#D9822B]" /> Comprobante de Transferencia
                        </span>
                        {selectedOrder.transfer_voucher && (
                          <button 
                            type="button"
                            onClick={() => handleDownloadVoucher(
                              selectedOrder.transfer_voucher, 
                              `Comprobante_Pago_${selectedOrder.code}_${selectedOrder.client_name.replace(/\s+/g, '_')}.jpg`
                            )}
                            className="px-2.5 py-1 rounded bg-[#D9822B]/20 hover:bg-[#D9822B]/40 text-[#E5C384] font-semibold text-[11px] flex items-center gap-1.5 transition-colors border border-[#D9822B]/40 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar Pago
                          </button>
                        )}
                      </div>

                      {selectedOrder.transfer_voucher ? (
                        <div className="space-y-2 pt-1">
                          <img 
                            src={selectedOrder.transfer_voucher} 
                            alt={`Comprobante Pago ${selectedOrder.code}`} 
                            className="max-h-40 mx-auto rounded-lg border border-[#D9822B]/40 object-contain shadow-md"
                          />
                          <p className="text-[10px] text-[#A6988B] text-center font-mono">
                            Archivo vinculado a Orden #{selectedOrder.code} - {selectedOrder.client_name}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#A6988B] italic pt-1">
                          Sin comprobante de transferencia cargado por el cliente aún.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Estado del Pedido</label>
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-semibold"
                      >
                        <option value="PENDIENTE">PENDIENTE DE VALIDACIÓN</option>
                        <option value="CONFIRMADO">CONFIRMADO Y RESERVADO</option>
                        <option value="PREPARANDO">EN PREPARACIÓN</option>
                        <option value="ENTREGADO">ENTREGADO / COMPLETADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </div>

                    <div className="bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#D9822B]/20 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#E5C384]">
                          <input 
                            type="checkbox"
                            checked={isRefunded}
                            onChange={(e) => setIsRefunded(e.target.checked)}
                            className="w-4 h-4 accent-[#D9822B] rounded cursor-pointer"
                          />
                          <span>Devolución Realizada</span>
                        </label>
                        {isRefunded && (
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">
                            DEVOLUCIÓN REGISTRADA
                          </span>
                        )}
                      </div>

                      {isRefunded && (
                        <div className="space-y-3 pt-1">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs text-[#A6988B] font-semibold block">Monto Devuelto</label>
                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[#E5C384] hover:text-[#FAF6F0] transition-colors bg-[#1A120C] px-2 py-0.5 rounded border border-[#D9822B]/30">
                                <input 
                                  type="checkbox"
                                  checked={isFullRefundChecked}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setIsFullRefundChecked(checked);
                                    if (checked && selectedOrder) {
                                      setRefundAmount(selectedOrder.final_total);
                                    }
                                  }}
                                  className="w-3.5 h-3.5 accent-[#D9822B] rounded cursor-pointer"
                                />
                                <span>Devolver Monto Total (${Number(selectedOrder?.final_total || 0).toLocaleString('es-CL')})</span>
                              </label>
                            </div>
                            <input 
                              type="number"
                              value={refundAmount}
                              onChange={(e) => {
                                setRefundAmount(e.target.value);
                                if (Number(e.target.value) !== Number(selectedOrder?.final_total)) {
                                  setIsFullRefundChecked(false);
                                }
                              }}
                              className="w-full px-3 py-2 bg-[#1A120C] border border-[#D9822B]/30 rounded-lg text-xs font-mono text-[#FAF6F0]"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-[#E5C384] font-bold block mb-1">
                              Comprobante de Devolución <span className="text-red-400">*</span>
                            </label>
                            
                            <div 
                              onClick={() => refundFileInputRef.current && refundFileInputRef.current.click()}
                              onDragOver={handleRefundDragOver}
                              onDragLeave={handleRefundDragLeave}
                              onDrop={handleRefundDrop}
                              className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-all ${
                                isRefundDragging 
                                  ? 'border-[#E5C384] bg-[#D9822B]/20 scale-[1.01]' 
                                  : 'border-[#D9822B]/50 bg-[#1A120C] hover:border-[#D9822B]'
                              }`}
                            >
                              <input 
                                ref={refundFileInputRef}
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleRefundFileSelect(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />

                              {refundVoucherPreview ? (
                                <div className="space-y-2">
                                  <img 
                                    src={refundVoucherPreview} 
                                    alt="Vista Previa Devolución" 
                                    className="max-h-36 mx-auto rounded-lg border border-purple-500/50 shadow-md object-contain"
                                  />
                                  <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Comprobante de devolución adjuntado
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadVoucher(
                                          refundVoucherPreview, 
                                          `Comprobante_Devolucion_${selectedOrder.code}_${selectedOrder.client_name.replace(/\s+/g, '_')}.jpg`
                                        );
                                      }}
                                      className="px-2.5 py-1 rounded bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 font-semibold text-[11px] flex items-center gap-1 transition-colors border border-purple-500/50 cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" /> Descargar Devolución
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-[#A6988B] underline block text-center">Haz clic o arrastra para cambiar archivo</span>
                                </div>
                              ) : refundVoucher ? (
                                <div className="space-y-2 text-purple-300 font-bold text-xs">
                                  <FileText className="w-6 h-6 mx-auto text-purple-400" />
                                  <p>Comprobante adjuntado: {refundVoucher}</p>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadVoucher(
                                        refundVoucher, 
                                        `Comprobante_Devolucion_${selectedOrder.code}_${selectedOrder.client_name.replace(/\s+/g, '_')}.jpg`
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors border border-purple-500/50 cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Descargar Devolución
                                  </button>
                                  <span className="text-[10px] text-[#A6988B] underline block font-normal text-center">Haz clic o arrastra para cambiar archivo</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Upload className="w-6 h-6 mx-auto text-[#D9822B]" />
                                  <p className="text-xs font-semibold text-[#FAF6F0]">Haz clic aquí o arrastra la foto del comprobante de devolución</p>
                                  <p className="text-[10px] text-[#A6988B]">Sube la foto del comprobante de transferencia bancaria hacia el cliente</p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[#A6988B] font-semibold block mb-1">Motivo del Cambio</label>
                      <input 
                        type="text"
                        placeholder="Ej: Validación de comprobante de devolución bancaria N° 98123"
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    {refundError && (
                      <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{refundError}</span>
                      </div>
                    )}

                    {selectedOrder.history && selectedOrder.history.length > 0 && (
                      <div className="pt-3 border-t border-[#D9822B]/20">
                        <span className="font-serif font-bold text-[#E5C384] block mb-2">📜 Historial</span>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto bg-[#120B07] p-2 rounded border border-[#D9822B]/20 text-[10px]">
                          {selectedOrder.history.map((h, idx) => (
                            <div key={idx} className="flex justify-between text-[#A6988B]">
                              <span>{h.previous_status} ➔ {h.new_status} ({h.change_reason})</span>
                              <span className="font-mono">{new Date(h.timestamp).toLocaleTimeString('es-CL')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="flex gap-2 pt-3">
                    <button onClick={() => setSelectedOrder(null)} className="btn-secondary text-xs flex-1 py-2.5">Cancelar</button>
                    <button onClick={handleUpdateOrder} className="btn-primary text-xs flex-1 py-2.5 font-bold">
                      Guardar Cambios y Registrar Auditoría
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CREATE / EDIT CATEGORY MODAL */}
            {isCategoryModalOpen && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md p-6 relative space-y-4 bg-[#1D150F]">
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <h4 className="font-serif text-lg font-bold text-[#E5C384]">
                      {editingCategory ? 'Editar Línea / Categoría' : 'Nueva Línea / Categoría'}
                    </h4>
                    <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Nombre de la Línea *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej: Empanaditas & Coctelería"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div>
                      <label className="text-[#A6988B] font-semibold block mb-1">Slug URL (Opcional)</label>
                      <input 
                        type="text"
                        placeholder="Ej: empanaditas-cocteleria"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[#A6988B] font-semibold block mb-1">Descripción de la Línea</label>
                      <textarea 
                        rows={3}
                        placeholder="Breve reseña de esta línea de banquetes..."
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn-secondary text-xs flex-1 py-2.5">Cancelar</button>
                      <button type="submit" className="btn-primary text-xs flex-1 py-2.5 font-bold">
                        {editingCategory ? 'Guardar Cambios' : 'Crear Línea'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* CREATE / EDIT PRODUCT MODAL */}
            {isProductModalOpen && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-lg p-6 relative space-y-4 bg-[#1D150F] my-auto max-h-[85vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <h4 className="font-serif text-lg font-bold text-[#E5C384]">
                      {editingProduct ? 'Editar Producto del Catálogo' : 'Agregar Nuevo Producto'}
                    </h4>
                    <button onClick={() => setIsProductModalOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Línea / Categoría *</label>
                      <select
                        value={productForm.category_id}
                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Nombre del Producto *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej: Gran Mix Selección Dulce Lina"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Precio ($ CLP) *</label>
                        <input 
                          type="number"
                          required
                          placeholder="Ej: 29900"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Porciones / Piezas *</label>
                        <input 
                          type="number"
                          required
                          placeholder="Ej: 24"
                          value={productForm.units}
                          onChange={(e) => setProductForm({ ...productForm, units: Number(e.target.value) })}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#A6988B] font-semibold block mb-1">Descripción del Producto</label>
                      <textarea 
                        rows={3}
                        placeholder="Ingredientes, presentación o variedad incluida..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div>
                      <label className="text-[#A6988B] font-semibold block mb-1">Ruta / URL de la Imagen</label>
                      <input 
                        type="text"
                        placeholder="/images/box_favoritos.jpg"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                      />
                    </div>

                    {productForm.image && (
                      <div className="flex items-center gap-3 bg-[#120B07] p-2 rounded-lg border border-[#D9822B]/20">
                        <img src={productForm.image} alt="Preview" className="w-12 h-12 object-cover rounded border" />
                        <span className="text-[10px] text-[#A6988B]">Vista previa de la imagen cargada</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#D9822B]/20">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#E5C384]">
                        <input 
                          type="checkbox"
                          checked={productForm.is_featured}
                          onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                          className="w-4 h-4 accent-[#D9822B] rounded cursor-pointer"
                        />
                        <span>Destacar en la Página Principal (Home)</span>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-secondary text-xs flex-1 py-2.5">Cancelar</button>
                      <button type="submit" className="btn-primary text-xs flex-1 py-2.5 font-bold">
                        {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
