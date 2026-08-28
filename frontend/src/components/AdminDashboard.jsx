import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ShieldCheck, Lock, RefreshCw, CheckCircle, XCircle, Clock, Edit2, Eye, History, FileText, Save, CheckCircle2, Upload, AlertTriangle, DollarSign, Plus, Trash2, Layers, Package, Search, Download, CreditCard, ShoppingBag, Mail, Sliders, Calendar, CalendarX, Unlock, Key, LogOut, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Send, Users, Phone, UserCheck, ShoppingBasket, Image as ImageIcon, Link as LinkIcon, Minus, Type, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, UtensilsCrossed, Palette, Tag, MapPin } from 'lucide-react';
import API_BASE_URL from '../config/api';

const CHILE_REGIONS = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana de Santiago',
  'Región del Libertador General Bernardo O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región Aysén del General Carlos Ibáñez del Campo',
  'Región de Magallanes y de la Antártica Chilena'
];

function validateRutDv(body, dv) {
  if (!body || !dv) return false;
  const bodyClean = String(body).replace(/\D/g, '');
  const dvClean = String(dv).trim().toUpperCase();
  if (bodyClean.length < 7 || bodyClean.length > 8) return false;
  if (!/^[0-9K]$/.test(dvClean)) return false;

  let total = 0;
  let multiplier = 2;
  for (let i = bodyClean.length - 1; i >= 0; i--) {
    total += parseInt(bodyClean[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expNum = 11 - (total % 11);
  let expDv = '0';
  if (expNum === 10) expDv = 'K';
  else if (expNum < 10) expDv = String(expNum);
  return dvClean === expDv;
}

function getPasswordCriteria(pass) {
  const p = pass || '';
  return {
    length: p.length >= 12,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    symbol: /[^a-zA-Z0-9]/.test(p),
  };
}

const RichTextEditor = ({ value, onChange }) => {
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'code' | 'preview'
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const contentRef = useRef(null);

  const execCmd = (command, val = null) => {
    document.execCommand(command, false, val);
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const insertHeading = (level) => {
    execCmd('formatBlock', `<h${level}>`);
  };

  const insertImage = () => {
    if (!imageUrl) return;
    const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Imagen Términos'}" style="max-width:100%; height:auto; margin:16px 0; border-radius:12px; border:1px solid rgba(217,130,43,0.3); display:block;" />`;
    execCmd('insertHTML', imgHtml);
    setImageUrl('');
    setImageAlt('');
    setImageModalOpen(false);
  };

  const insertLink = () => {
    const url = prompt('Ingrese la URL del enlace web (http://... o https://...):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  useEffect(() => {
    if (editorMode === 'visual' && contentRef.current) {
      if (document.activeElement !== contentRef.current && contentRef.current.innerHTML !== (value || '')) {
        contentRef.current.innerHTML = value || '';
      }
    }
  }, [value, editorMode]);

  return (
    <div className="space-y-3 border border-[#D9822B]/30 rounded-2xl bg-[#120B07] p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#D9822B]/20 pb-3">
        <div>
          <label className="font-sans font-bold text-sm text-[#E5C384] flex items-center gap-2">
            📜 Editor Enriquecido de Términos y Condiciones (WYSIWYG Estilo Word)
          </label>
          <p className="text-xs text-[#A6988B]">
            Redacta, da formato, inserta encabezados, listas o imágenes explicativas. Se actualizará en tiempo real en la tienda.
          </p>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#1A120C] p-1 rounded-lg border border-[#D9822B]/30 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setEditorMode('visual')}
            className={`px-2.5 py-1 rounded transition-colors ${editorMode === 'visual' ? 'bg-[#D9822B] text-white font-bold' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Visual (Word)
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('code')}
            className={`px-2.5 py-1 rounded transition-colors ${editorMode === 'code' ? 'bg-[#D9822B] text-white font-bold' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Código HTML
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('preview')}
            className={`px-2.5 py-1 rounded transition-colors ${editorMode === 'preview' ? 'bg-[#D9822B] text-white font-bold' : 'text-[#A6988B] hover:text-[#FAF6F0]'}`}
          >
            Vista Previa
          </button>
        </div>
      </div>

      {editorMode === 'visual' && (
        <div className="space-y-2">
          {/* Toolbar */}
          <div className="flex items-center gap-1 flex-wrap bg-[#1A120C] p-2 rounded-xl border border-[#D9822B]/20 text-xs">
            <button
              type="button"
              onClick={() => insertHeading(2)}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#E5C384] font-bold rounded border border-[#D9822B]/30"
              title="Encabezado H2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertHeading(3)}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#E5C384] font-bold rounded border border-[#D9822B]/30"
              title="Encabezado H3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<p>')}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30"
              title="Párrafo"
            >
              P
            </button>

            <span className="h-4 w-px bg-[#D9822B]/30 mx-1" />

            <button
              type="button"
              onClick={() => execCmd('bold')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] font-bold rounded border border-[#D9822B]/30"
              title="Negrita"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] italic rounded border border-[#D9822B]/30"
              title="Cursiva"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] underline rounded border border-[#D9822B]/30"
              title="Subrayado"
            >
              <u>U</u>
            </button>

            <span className="h-4 w-px bg-[#D9822B]/30 mx-1" />

            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30 flex items-center gap-1"
              title="Lista con Viñetas"
            >
              <List className="w-3.5 h-3.5 text-[#E5C384]" /> Viñetas
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30 flex items-center gap-1"
              title="Lista Numerada"
            >
              <ListOrdered className="w-3.5 h-3.5 text-[#E5C384]" /> Numerada
            </button>

            <span className="h-4 w-px bg-[#D9822B]/30 mx-1" />

            <button
              type="button"
              onClick={() => execCmd('justifyLeft')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30"
              title="Alinear a la Izquierda"
            >
              <AlignLeft className="w-3.5 h-3.5 text-[#E5C384]" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyCenter')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30"
              title="Centrar Texto"
            >
              <AlignCenter className="w-3.5 h-3.5 text-[#E5C384]" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyRight')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30"
              title="Alinear a la Derecha"
            >
              <AlignRight className="w-3.5 h-3.5 text-[#E5C384]" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyFull')}
              className="p-1.5 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30"
              title="Justificar Texto"
            >
              <AlignJustify className="w-3.5 h-3.5 text-[#E5C384]" />
            </button>

            <span className="h-4 w-px bg-[#D9822B]/30 mx-1" />

            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#E5C384] font-bold rounded border border-[#D9822B]/30 flex items-center gap-1"
              title="Insertar Imagen por URL"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Insertar Imagen
            </button>

            <button
              type="button"
              onClick={insertLink}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#E5C384] rounded border border-[#D9822B]/30 flex items-center gap-1"
              title="Insertar Enlace"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Enlace
            </button>

            <button
              type="button"
              onClick={() => execCmd('insertHorizontalRule')}
              className="px-2 py-1 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#FAF6F0] rounded border border-[#D9822B]/30 flex items-center gap-1"
              title="Insertar Línea Horizontal"
            >
              <Minus className="w-3.5 h-3.5" /> Línea
            </button>
          </div>

          {/* Editable Div Area */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            onBlur={(e) => onChange(e.currentTarget.innerHTML)}
            className="w-full min-h-[280px] max-h-[500px] overflow-y-auto p-4 bg-[#1A120C] border border-[#D9822B]/30 rounded-xl text-xs text-[#FAF6F0] leading-relaxed focus:outline-none focus:border-[#D9822B] rich-text-editor-area"
          />
        </div>
      )}

      {editorMode === 'code' && (
        <textarea
          rows={12}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-[#1A120C] border border-[#D9822B]/30 rounded-xl text-xs font-mono text-[#E5C384] focus:outline-none focus:border-[#D9822B]"
          placeholder="Escribe o pega el código HTML formateado..."
        />
      )}

      {editorMode === 'preview' && (
        <div 
          className="w-full min-h-[280px] p-6 bg-[#1A120C] border border-[#D9822B]/30 rounded-xl text-xs text-[#FAF6F0] space-y-4 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}

      {/* Image Insertion Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-80 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1D150F] border border-[#D9822B]/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="font-sans text-base font-bold text-[#E5C384]">Insertar Imagen en Términos y Condiciones</h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#FAF6F0] font-semibold block mb-1">URL de la Imagen (HTTPS) *</label>
                <input 
                  type="text"
                  placeholder="https://files.catbox.moe/...jpg o URL directa"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                />
              </div>
              <div>
                <label className="text-[#FAF6F0] font-semibold block mb-1">Descripción / Alt (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ej: Logo o Diagrama de Banquetería"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#D9822B]/20">
              <button 
                type="button" 
                onClick={() => setImageModalOpen(false)} 
                className="btn-secondary text-xs flex-1 py-2"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={insertImage} 
                className="btn-primary text-xs flex-1 py-2 font-bold"
              >
                Insertar Imagen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard({ isOpen, onClose, onConfigSaved, onCatalogChanged, onCommunesChanged }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Commune Management State
  const [adminCommunes, setAdminCommunes] = useState([]);
  const [isCreateCommuneOpen, setIsCreateCommuneOpen] = useState(false);
  const [newCommuneName, setNewCommuneName] = useState('');
  const [newCommuneFee, setNewCommuneFee] = useState('4000');
  const [editingCommune, setEditingCommune] = useState(null);
  const [editCommuneName, setEditCommuneName] = useState('');
  const [editCommuneFee, setEditCommuneFee] = useState('');
  const [editCommuneActive, setEditCommuneActive] = useState(true);
  const [communeFormError, setCommuneFormError] = useState('');
  const [communeSuccessMsg, setCommuneSuccessMsg] = useState('');

  // Admin Users Management State
  const [adminUsers, setAdminUsers] = useState([]);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdminFirstName, setNewAdminFirstName] = useState('');
  const [newAdminLastNamePaternal, setNewAdminLastNamePaternal] = useState('');
  const [newAdminLastNameMaternal, setNewAdminLastNameMaternal] = useState('');
  const [newAdminRutBody, setNewAdminRutBody] = useState('');
  const [newAdminRutDv, setNewAdminRutDv] = useState('');
  const [newAdminCountry, setNewAdminCountry] = useState('Chile');
  const [newAdminRegion, setNewAdminRegion] = useState('Región Metropolitana de Santiago');
  const [newAdminCity, setNewAdminCity] = useState('Santiago');
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminFormError, setAdminFormError] = useState('');

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editAdminFirstName, setEditAdminFirstName] = useState('');
  const [editAdminLastNamePaternal, setEditAdminLastNamePaternal] = useState('');
  const [editAdminLastNameMaternal, setEditAdminLastNameMaternal] = useState('');
  const [editAdminRutBody, setEditAdminRutBody] = useState('');
  const [editAdminRutDv, setEditAdminRutDv] = useState('');
  const [editAdminCountry, setEditAdminCountry] = useState('Chile');
  const [editAdminRegion, setEditAdminRegion] = useState('Región Metropolitana de Santiago');
  const [editAdminCity, setEditAdminCity] = useState('Santiago');
  const [editAdminAddress, setEditAdminAddress] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');

  // Password Recovery State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('reset_token=')) {
        const token = hash.split('reset_token=')[1].split('&')[0];
        if (token) {
          setResetTokenInput(token);
          setForgotStep('reset');
          setIsForgotPasswordOpen(true);
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    if (!forgotInput) {
      setForgotError('Ingresa tu RUT o Correo Electrónico.');
      return;
    }
    setIsSubmittingForgot(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: forgotInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Error al solicitar la recuperación.');
        return;
      }
      setForgotMessage(data.message);
      setForgotStep('reset');
    } catch (err) {
      setForgotError('Error de conexión con el servidor.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handlePerformPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    if (!resetTokenInput || !resetNewPassword) {
      setForgotError('Debes ingresar el token de seguridad y tu nueva contraseña.');
      return;
    }
    const crit = getPasswordCriteria(resetNewPassword);
    if (!crit.length || !crit.upper || !crit.lower || !crit.number || !crit.symbol) {
      setForgotError('La contraseña no cumple con la política de seguridad (mínimo 12 caracteres, mayúscula, minúscula, número y símbolo).');
      return;
    }

    setIsSubmittingForgot(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenInput, password: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Error al restablecer la contraseña.');
        return;
      }
      setForgotMessage(data.message);
      setTimeout(() => {
        setIsForgotPasswordOpen(false);
        setForgotStep('request');
        setForgotInput('');
        setResetTokenInput('');
        setResetNewPassword('');
        setForgotMessage('');
      }, 2500);
    } catch (err) {
      setForgotError('Error de conexión con el servidor.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const [activeTab, setActiveTab] = useState('orders'); // orders | catalog | leads | calendar | settings | users
  const [catalogSubTab, setCatalogSubTab] = useState('products'); // products | categories

  const [orders, setOrders] = useState([]);
  
  // Orders Search & Pagination State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(15);

  // Filtered orders list (EXCLUDING price fields from search term matching as requested)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) {
        return false;
      }

      // 2. Text Search across non-price columns
      if (orderSearch.trim()) {
        const query = orderSearch.trim().toLowerCase();
        const itemsText = (order.items || []).map(i => i.item_name || i.name || '').join(' ').toLowerCase();
        const historyText = (order.history || []).map(h => `${h.modified_by || ''} ${h.change_reason || ''}`).join(' ').toLowerCase();
        
        // Exclude price numbers (final_total, items_total, delivery_fee, waiters_fee)
        const searchableText = [
          order.code || '',
          order.client_name || '',
          order.client_rut || '',
          order.client_email || '',
          order.client_phone || '',
          order.address || '',
          order.service_type || '',
          order.event_date || '',
          order.time_slot || '',
          order.status || '',
          order.coupon_applied?.coupon_code || '',
          itemsText,
          historyText
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Reset page to 1 when search or status filter changes
  useEffect(() => {
    setOrdersCurrentPage(1);
  }, [orderSearch, orderStatusFilter]);

  // Pagination calculation
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const safeOrdersPage = Math.min(Math.max(ordersCurrentPage, 1), totalOrderPages);
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (safeOrdersPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredOrders, safeOrdersPage, ordersPerPage]);

  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilterType, setClientFilterType] = useState('ALL'); // 'ALL' | 'FREQUENT' | 'WITH_ORDERS' | 'WITH_REFUNDS' | 'LEADS_ONLY'
  const [selectedClientModal, setSelectedClientModal] = useState(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    first_name: '',
    last_name_paternal: '',
    last_name_maternal: '',
    rut_body: '',
    rut_dv: '',
    email: '',
    phone: '',
    commune_id: '',
    address: '',
    city: 'Santiago',
    region: 'Región Metropolitana de Santiago',
    country: 'Chile'
  });
  const [clientFormMsg, setClientFormMsg] = useState({ type: '', text: '' });
  const [isSavingClient, setIsSavingClient] = useState(false);

  const openNewClientModal = () => {
    setEditingClient(null);
    setClientForm({
      first_name: '',
      last_name_paternal: '',
      last_name_maternal: '',
      rut_body: '',
      rut_dv: '',
      email: '',
      phone: '',
      commune_id: '',
      address: '',
      city: 'Santiago',
      region: 'Región Metropolitana de Santiago',
      country: 'Chile'
    });
    setClientFormMsg({ type: '', text: '' });
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client) => {
    setEditingClient(client);
    setClientForm({
      first_name: client.first_name || '',
      last_name_paternal: client.last_name_paternal || '',
      last_name_maternal: client.last_name_maternal || '',
      rut_body: client.rut_body || '',
      rut_dv: client.rut_dv || '',
      email: client.email || '',
      phone: client.phone || '',
      commune_id: client.commune_id || '',
      address: client.address || '',
      city: client.city || 'Santiago',
      region: client.region || 'Región Metropolitana de Santiago',
      country: client.country || 'Chile'
    });
    setClientFormMsg({ type: '', text: '' });
    setIsClientModalOpen(true);
  };

  const handleSaveClientSubmit = async (e) => {
    e.preventDefault();
    if (!clientForm.email) {
      setClientFormMsg({ type: 'error', text: 'El correo electrónico es obligatorio.' });
      return;
    }
    setIsSavingClient(true);
    setClientFormMsg({ type: '', text: '' });

    const url = editingClient 
      ? `${API_BASE_URL}/admin/clients/${editingClient.id}/`
      : `${API_BASE_URL}/admin/clients/create/`;
    const method = editingClient ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm)
      });
      const data = await res.json();
      if (res.ok) {
        setClientFormMsg({ type: 'success', text: data.message || 'Cliente guardado exitosamente.' });
        const resClients = await fetch(`${API_BASE_URL}/admin/clients/`);
        if (resClients.ok) {
          const freshClients = await resClients.json();
          setClients(freshClients);
        }
        setTimeout(() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }, 1000);
      } else {
        setClientFormMsg({ type: 'error', text: data.error || 'Error al guardar el cliente.' });
      }
    } catch (err) {
      setClientFormMsg({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente del directorio 3NF?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/`, { method: 'DELETE' });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
        if (selectedClientModal && selectedClientModal.id === clientId) {
          setSelectedClientModal(null);
        }
      } else {
        alert('Error al eliminar el cliente.');
      }
    } catch (e) {
      alert('Error de conexión.');
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Filter Type
      if (clientFilterType === 'FREQUENT' && (c.active_orders !== undefined ? c.active_orders : c.total_orders) <= 1) return false;
      if (clientFilterType === 'WITH_ORDERS' && (c.active_orders !== undefined ? c.active_orders : c.total_orders) === 0) return false;
      if (clientFilterType === 'WITH_REFUNDS' && (c.total_refunded || 0) === 0) return false;
      if (clientFilterType === 'LEADS_ONLY' && (c.total_orders || 0) > 0) return false;

      // Text Search
      if (clientSearch.trim()) {
        const query = clientSearch.trim().toLowerCase();
        const searchable = [
          c.first_name || '',
          c.last_name_paternal || '',
          c.last_name_maternal || '',
          c.full_name || '',
          c.client_name || '',
          c.rut_body || '',
          c.rut_dv || '',
          c.formatted_rut || '',
          c.rut || '',
          c.email || '',
          c.phone || '',
          c.address || '',
          c.commune_name || '',
          c.coupon_code || ''
        ].join(' ').toLowerCase();

        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }, [clients, clientSearch, clientFilterType]);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [config, setConfig] = useState({
    waiter_fee: 20000,
    min_order_total: 70000,
    max_daily_portions: 250,
    contact_phone: '+56 9 3465 6961',
    contact_email: 'contacto@banqueterialina.cl',
    business_hours: 'Lunes a Domingo de 09:00 a 19:00 hrs',
    terms_and_conditions: '',
    time_slots: '10:00 - 12:00, 12:00 - 14:00, 14:00 - 16:00, 16:00 - 18:00',
    site_logo: '/images/logo_lina.png',
    site_favicon: '/images/logo_lina.png',
    hero_title: 'El arte de comer rico',
    hero_subtitle: 'Presentaciones gourmet artesanales, montajes decorativos y garzones para tus momentos inolvidables.',
    hero_badge_text: 'Banquetería Familiar en Santiago de Chile',
    show_hero_badge: 'true',
    show_hero_cards: 'true',
    hero_card1_title: '3 Días de Anticipación',
    hero_card1_desc: 'Elaboración artesanal fresca con reserva previa.',
    hero_card2_title: 'Retiro o Montaje Sábados',
    hero_card2_desc: 'Retiro presencial Lun-Dom; montajes los Sábados.',
    hero_card3_title: 'Opción Garzones',
    hero_card3_desc: 'Cálculo automático de personal (1 cada 25 personas).',
    show_about_section: 'true',
    about_badge_text: 'Nuestra Historia & Familia',
    about_title: '¿Quiénes Somos?',
    about_quote: '"Somos la familia Quilodrán y nos encanta dar una experiencia gastronómica acogedora. Orgullosamente de San Bernardo."',
    about_paragraph1: 'Lo que comenzó en nuestra propia cocina como el amor por reunir a nuestros seres queridos en torno a la mesa, hoy se transforma en Banquetería Lina. Creemos firmemente que la buena mesa no es solo comida: es empatía, calidez y momentos inolvidables compartidos con las personas que más quieres.',
    about_paragraph2: 'Cada empanadita horneada al punto, cada tabla gourmet montada a mano y cada estación de café lleva el sello de dedicación de nuestra familia. Nos encargamos personalmente de cada banquete para que tú solo te dediques a disfrutar como un anfitrión radiante.',
    about_image_url: '/images/estacion_coffee.jpg',
    theme_color_primary: '#D9822B',
    theme_color_secondary: '#E5C384',
    theme_color_bg: '#120B07',
    theme_color_card: '#1A120C',
    theme_color_text: '#FAF6F0'
  });
  const [configHistory, setConfigHistory] = useState([]);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');
  const [catalogMsg, setCatalogMsg] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitData, setVisitData] = useState({ total_visits: 0, total_uniques: 0, visits_today: 0, logs: [] });
  const [visitChartPeriod, setVisitChartPeriod] = useState('daily_7'); // 'daily_7' | 'monthly_12' | 'yearly'
  const [settingsSubCategory, setSettingsSubCategory] = useState('appearance'); // 'appearance' | 'all' | 'terms' | 'time_slots' | 'limits' | 'contact' | 'audit'
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(true);

  // Logo file drag and upload state
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const logoFileInputRef = useRef(null);

  // About image file drag and upload state
  const [isAboutDragging, setIsAboutDragging] = useState(false);
  const aboutImageFileInputRef = useRef(null);

  // Favicon file drag and upload state
  const [isFaviconDragging, setIsFaviconDragging] = useState(false);
  const faviconFileInputRef = useRef(null);

  // Accordion state for all Configuración & Calendario sections (all collapsed by default)
  const [openAccordions, setOpenAccordions] = useState({
    palette: false,
    logo: false,
    hero: false,
    about: false,
    blockDates: false,
    limits: false,
    contact: false,
    timeSlots: false,
    terms: false,
    communes: false,
    auditHistory: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Live real-time updates of site theme variables and favicon when editing in Admin
  useEffect(() => {
    if (config) {
      const primary = config.theme_color_primary || '#D9822B';
      const secondary = config.theme_color_secondary || '#E5C384';
      const bg = config.theme_color_bg || '#120B07';
      const card = config.theme_color_card || '#1A120C';
      const text = config.theme_color_text || '#FAF6F0';

      const root = document.documentElement.style;
      root.setProperty('--amber-primary', primary);
      root.setProperty('--amber-hover', primary);
      root.setProperty('--gold-accent', secondary);
      root.setProperty('--wheat-light', secondary);
      root.setProperty('--bg-dark', bg);
      root.setProperty('--bg-card', card);
      root.setProperty('--bg-modal', card);
      root.setProperty('--bg-card-hover', card);
      root.setProperty('--cream-text', text);
      root.setProperty('--muted-text', `color-mix(in srgb, ${text} 65%, transparent)`);
      root.setProperty('--border-amber', `color-mix(in srgb, ${primary} 30%, transparent)`);
      root.setProperty('--border-amber-strong', `color-mix(in srgb, ${primary} 65%, transparent)`);
      root.setProperty('--shadow-glow', `0 0 25px color-mix(in srgb, ${primary} 30%, transparent)`);
    }

    if (config?.site_favicon) {
      const favUrl = config.site_favicon;
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach(l => l.href = favUrl);
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = favUrl;
        document.head.appendChild(link);
      }
    }
  }, [config.theme_color_primary, config.theme_color_secondary, config.theme_color_bg, config.theme_color_card, config.theme_color_text, config.site_favicon]);

  const handleFaviconFileSelect = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen del favicon es muy grande. El tamaño máximo recomendado es 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig(prev => ({ ...prev, site_favicon: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileSelect = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen del logo es muy grande. El tamaño máximo recomendado es 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig(prev => ({ ...prev, site_logo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutImageFileSelect = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. El tamaño máximo recomendado es 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig(prev => ({ ...prev, about_image_url: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAdminVisits = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/visits/`);
      if (res.ok) {
        const data = await res.json();
        setVisitData(data);
      }
    } catch (e) {
      console.error("Error fetching admin visits data:", e);
    }
  };

  // Dedicated Audit Trail Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL'); // 'ALL' | 'ORDERS' | 'CONFIG'
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');

  const getFilteredAuditLogs = () => {
    let logs = [];

    // Collect order histories
    orders.forEach(ord => {
      if (Array.isArray(ord.history)) {
        ord.history.forEach(h => {
          logs.push({
            id: `ord_${h.id}_${h.timestamp}`,
            type: 'ORDER',
            title: `Orden #${ord.code}`,
            modified_by: h.modified_by || 'Administración',
            summary: `${h.previous_status} ➔ ${h.new_status}${h.change_reason ? ' (' + h.change_reason + ')' : ''}`,
            timestamp: h.timestamp
          });
        });
      }
    });

    // Collect config histories
    if (Array.isArray(configHistory)) {
      configHistory.forEach(cfg => {
        logs.push({
          id: `cfg_${cfg.id}_${cfg.timestamp}`,
          type: 'CONFIG',
          title: 'Parámetros del Negocio',
          modified_by: cfg.modified_by || 'Administración',
          summary: cfg.changes_summary,
          timestamp: cfg.timestamp
        });
      });
    }

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Filter by type
    if (auditTypeFilter !== 'ALL') {
      logs = logs.filter(l => l.type === auditTypeFilter);
    }

    // Filter by search query
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      logs = logs.filter(l => 
        (l.modified_by && l.modified_by.toLowerCase().includes(q)) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.summary && l.summary.toLowerCase().includes(q))
      );
    }

    // Filter by start date
    if (auditStartDate) {
      const startMs = new Date(auditStartDate + 'T00:00:00').getTime();
      logs = logs.filter(l => new Date(l.timestamp).getTime() >= startMs);
    }

    // Filter by end date
    if (auditEndDate) {
      const endMs = new Date(auditEndDate + 'T23:59:59').getTime();
      logs = logs.filter(l => new Date(l.timestamp).getTime() <= endMs);
    }

    return logs;
  };

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
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', slugManual: false });
  const [categoryFormError, setCategoryFormError] = useState('');
  
  // Category Delete Protection Modal
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormError, setProductFormError] = useState('');
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

  // Calendar & Blocked Dates State
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockMode, setBlockMode] = useState('single'); // 'single' | 'range'
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('Bloqueado por la administración');
  const [blockMsg, setBlockMsg] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const generateSlug = (text) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const [isProductImageDragging, setIsProductImageDragging] = useState(false);
  const productFileInputRef = useRef(null);

  const handleProductImageFileSelect = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProductFormError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductForm(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductImageDragging(true);
  };

  const handleProductImageDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductImageDragging(false);
  };

  const handleProductImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProductImageDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProductImageFileSelect(e.dataTransfer.files[0]);
    }
  };

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

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAdminData();
    }
  }, [isOpen, isAuthenticated]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setLoginError('');
        fetchAdminData();
      } else {
        setLoginError(data.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setLoginError('Error al conectar con el servidor.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setActiveTab('orders');
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdminUsers(data);
      }
    } catch (e) {}
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormError('');
    if (!newAdminFirstName || !newAdminLastNamePaternal || !newAdminLastNameMaternal || !newAdminRutBody || !newAdminRutDv || !newAdminEmail || !newAdminAddress || !newAdminPassword) {
      setAdminFormError('Nombre, Apellido Paterno, Apellido Materno, RUT, Dígito Verificador, Correo Electrónico, Calle y Número y Selección de Contraseña son obligatorios.');
      return;
    }
    if (!validateRutDv(newAdminRutBody, newAdminRutDv)) {
      setAdminFormError(`El RUT ${newAdminRutBody}-${newAdminRutDv} no es válido.`);
      return;
    }
    const crit = getPasswordCriteria(newAdminPassword);
    if (!crit.length || !crit.upper || !crit.lower || !crit.number || !crit.symbol) {
      setAdminFormError('La contraseña no cumple con la política de seguridad requerida (mínimo 12 caracteres, mayúscula, minúscula, número y símbolo).');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newAdminFirstName,
          last_name_paternal: newAdminLastNamePaternal,
          last_name_maternal: newAdminLastNameMaternal,
          rut_body: newAdminRutBody,
          rut_dv: newAdminRutDv,
          country: newAdminCountry,
          region: newAdminRegion,
          city: newAdminCity,
          address: newAdminAddress,
          email: newAdminEmail,
          password: newAdminPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminFormError(data.error || 'Error al crear el administrador.');
        return;
      }
      setIsCreateAdminOpen(false);
      setNewAdminFirstName('');
      setNewAdminLastNamePaternal('');
      setNewAdminLastNameMaternal('');
      setNewAdminRutBody('');
      setNewAdminRutDv('');
      setNewAdminCountry('Chile');
      setNewAdminRegion('Región Metropolitana de Santiago');
      setNewAdminCity('Santiago');
      setNewAdminAddress('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchAdminUsers();
    } catch (err) {
      setAdminFormError('Error de conexión.');
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setAdminFormError('');
    if (editAdminRutBody && editAdminRutDv && !validateRutDv(editAdminRutBody, editAdminRutDv)) {
      setAdminFormError(`El RUT ${editAdminRutBody}-${editAdminRutDv} no es válido.`);
      return;
    }
    if (editAdminPassword) {
      const crit = getPasswordCriteria(editAdminPassword);
      if (!crit.length || !crit.upper || !crit.lower || !crit.number || !crit.symbol) {
        setAdminFormError('La nueva contraseña no cumple con la política de seguridad requerida (mínimo 12 caracteres, mayúscula, minúscula, número y símbolo).');
        return;
      }
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${editingAdmin.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editAdminFirstName,
          last_name_paternal: editAdminLastNamePaternal,
          last_name_maternal: editAdminLastNameMaternal,
          rut_body: editAdminRutBody,
          rut_dv: editAdminRutDv,
          country: editAdminCountry,
          region: editAdminRegion,
          city: editAdminCity,
          address: editAdminAddress,
          email: editAdminEmail,
          password: editAdminPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminFormError(data.error || 'Error al actualizar el administrador.');
        return;
      }
      setEditingAdmin(null);
      fetchAdminUsers();
    } catch (err) {
      setAdminFormError('Error de conexión.');
    }
  };

  const handleDeleteAdmin = async (userObj) => {
    if (userObj.is_protected || userObj.is_superadmin || userObj.username?.toLowerCase() === 'lina' || userObj.username?.toLowerCase() === 'admin' || userObj.id === 1) {
      alert('👑 La cuenta de la Propietaria Principal (Super Admin) Lina está protegida por el sistema y NO puede ser eliminada bajo ninguna circunstancia.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la cuenta de administrador "${userObj.username}" (${userObj.full_name})?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userObj.id}/`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al eliminar el administrador.');
        return;
      }
      fetchAdminUsers();
    } catch (err) {
      alert('Error de conexión.');
    }
  };

  const fetchAdminCommunes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/communes/`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminCommunes(data);
      }
    } catch (e) {
      console.error('Error fetching admin communes:', e);
    }
  };

  const handleCreateCommune = async (e) => {
    e.preventDefault();
    setCommuneFormError('');
    if (!newCommuneName.trim()) {
      setCommuneFormError('Ingresa el nombre de la comuna.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/communes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCommuneName.trim(),
          delivery_fee: Number(newCommuneFee) || 0,
          is_active: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCommuneFormError(data.error || 'Error al agregar la comuna.');
        return;
      }
      setIsCreateCommuneOpen(false);
      setNewCommuneName('');
      setNewCommuneFee('4000');
      fetchAdminCommunes();
      if (onCommunesChanged) onCommunesChanged();
      setCommuneSuccessMsg('Comuna agregada exitosamente.');
      setTimeout(() => setCommuneSuccessMsg(''), 3000);
    } catch (err) {
      setCommuneFormError('Error de conexión.');
    }
  };

  const handleSaveEditCommune = async (e) => {
    e.preventDefault();
    if (!editingCommune) return;
    setCommuneFormError('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/communes/${editingCommune.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCommuneName.trim(),
          delivery_fee: Number(editCommuneFee) || 0,
          is_active: editCommuneActive
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCommuneFormError(data.error || 'Error al actualizar la comuna.');
        return;
      }
      setEditingCommune(null);
      fetchAdminCommunes();
      if (onCommunesChanged) onCommunesChanged();
      setCommuneSuccessMsg('Comuna actualizada correctamente.');
      setTimeout(() => setCommuneSuccessMsg(''), 3000);
    } catch (err) {
      setCommuneFormError('Error de conexión.');
    }
  };

  const handleDeleteCommune = async (commune) => {
    if (!window.confirm(`¿Estás seguro de eliminar la comuna ${commune.name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/communes/${commune.id}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAdminCommunes();
        if (onCommunesChanged) onCommunesChanged();
      }
    } catch (e) {
      console.error('Error deleting commune:', e);
    }
  };

  const handleToggleCommuneActive = async (commune) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/communes/${commune.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !commune.is_active })
      });
      if (res.ok) {
        fetchAdminCommunes();
        if (onCommunesChanged) onCommunesChanged();
      }
    } catch (e) {
      console.error('Error toggling commune active status:', e);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    fetchAdminUsers();
    fetchAdminCommunes();
    fetchAdminVisits();
    try {
      const [resOrders, resLeads, resConfig, resCategories, resProducts, resBlocked, resClients] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/orders/`),
        fetch(`${API_BASE_URL}/admin/leads/`),
        fetch(`${API_BASE_URL}/config/`),
        fetch(`${API_BASE_URL}/admin/categories/`),
        fetch(`${API_BASE_URL}/admin/menu-items/`),
        fetch(`${API_BASE_URL}/admin/blocked-dates/`),
        fetch(`${API_BASE_URL}/admin/clients/`)
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

      if (resBlocked.status === 'fulfilled' && resBlocked.value.ok) {
        const dataBlocked = await resBlocked.value.json();
        if (Array.isArray(dataBlocked)) setBlockedDates(dataBlocked);
      }

      if (resClients.status === 'fulfilled' && resClients.value.ok) {
        const dataClients = await resClients.value.json();
        if (Array.isArray(dataClients)) setClients(dataClients);
      }

      if (resConfig.status === 'fulfilled' && resConfig.value.ok) {
        const dataConfig = await resConfig.value.json();
        if (dataConfig && typeof dataConfig === 'object') {
          const cfgObj = dataConfig.config || dataConfig;
          setConfig({
            waiter_fee: Number(cfgObj.waiter_fee) || 20000,
            min_order_total: Number(cfgObj.min_order_total) || 70000,
            max_daily_portions: Number(cfgObj.max_daily_portions) || 250,
            contact_phone: cfgObj.contact_phone || '+56 9 3465 6961',
            contact_email: cfgObj.contact_email || 'contacto@banqueterialina.cl',
            business_hours: cfgObj.business_hours || 'Lunes a Domingo de 09:00 a 19:00 hrs',
            terms_and_conditions: cfgObj.terms_and_conditions || '',
            time_slots: cfgObj.time_slots || '10:00 - 12:00, 12:00 - 14:00, 14:00 - 16:00, 16:00 - 18:00',
            site_logo: cfgObj.site_logo || '/images/logo_lina.png',
            site_favicon: cfgObj.site_favicon || '/images/logo_lina.png',
            hero_title: cfgObj.hero_title || 'El arte de comer rico',
            hero_subtitle: cfgObj.hero_subtitle || 'Presentaciones gourmet artesanales, montajes decorativos y garzones para tus momentos inolvidables.',
            hero_badge_text: cfgObj.hero_badge_text || 'Banquetería Familiar en Santiago de Chile',
            show_hero_badge: cfgObj.show_hero_badge ?? 'true',
            show_hero_cards: cfgObj.show_hero_cards ?? 'true',
            hero_card1_title: cfgObj.hero_card1_title || '3 Días de Anticipación',
            hero_card1_desc: cfgObj.hero_card1_desc || 'Elaboración artesanal fresca con reserva previa.',
            hero_card2_title: cfgObj.hero_card2_title || 'Retiro o Montaje Sábados',
            hero_card2_desc: cfgObj.hero_card2_desc || 'Retiro presencial Lun-Dom; montajes los Sábados.',
            hero_card3_title: cfgObj.hero_card3_title || 'Opción Garzones',
            hero_card3_desc: cfgObj.hero_card3_desc || 'Cálculo automático de personal (1 cada 25 personas).',
            show_about_section: cfgObj.show_about_section ?? 'true',
            about_badge_text: cfgObj.about_badge_text || 'Nuestra Historia & Familia',
            about_title: cfgObj.about_title || '¿Quiénes Somos?',
            about_quote: cfgObj.about_quote || '"Somos la familia Quilodrán y nos encanta dar una experiencia gastronómica acogedora. Orgullosamente de San Bernardo."',
            about_paragraph1: cfgObj.about_paragraph1 || 'Lo que comenzó en nuestra propia cocina como el amor por reunir a nuestros seres queridos en torno a la mesa, hoy se transforma en Banquetería Lina.',
            about_paragraph2: cfgObj.about_paragraph2 || 'Cada empanadita horneada al punto, cada tabla gourmet montada a mano y cada estación de café lleva el sello de dedicación de nuestra familia.',
            about_image_url: cfgObj.about_image_url || '/images/estacion_coffee.jpg',
            theme_color_primary: cfgObj.theme_color_primary || '#D9822B',
            theme_color_secondary: cfgObj.theme_color_secondary || '#E5C384',
            theme_color_bg: cfgObj.theme_color_bg || '#120B07',
            theme_color_card: cfgObj.theme_color_card || '#1A120C',
            theme_color_text: cfgObj.theme_color_text || '#FAF6F0'
          });
          if (Array.isArray(dataConfig.history)) {
            setConfigHistory(dataConfig.history);
          }
        }
      }
    } catch (e) {
      console.error("Error loading admin data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockDatesSubmit = async (e) => {
    e.preventDefault();
    if (!blockStartDate) return;
    setIsBlocking(true);
    setBlockMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/blocked-dates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: blockStartDate,
          end_date: blockMode === 'range' ? blockEndDate : blockStartDate,
          reason: blockReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBlockedDates(data);
        setBlockMsg('¡Fecha(s) bloqueada(s) exitosamente!');
        setBlockStartDate('');
        setBlockEndDate('');
        setBlockReason('Bloqueado por la administración');
      } else {
        setBlockMsg(data.error || 'Error al bloquear fechas.');
      }
    } catch (err) {
      setBlockMsg('Error de conexión al bloquear fechas.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnlockDate = async (blockedId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blocked-dates/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blockedId })
      });
      const data = await res.json();
      if (res.ok) {
        setBlockedDates(data);
        setBlockMsg('¡Fecha liberada y disponible nuevamente para reservas!');
      }
    } catch (err) {
      console.error('Error unblocking date', err);
    }
  };

  const getReservedDatesGrouped = () => {
    const map = {};
    orders.forEach(ord => {
      if (!ord.event_date) return;
      if (ord.status === 'CANCELADO') return;
      if (!map[ord.event_date]) {
        map[ord.event_date] = {
          date: ord.event_date,
          ordersCount: 0,
          ordersList: []
        };
      }
      map[ord.event_date].ordersCount += 1;
      map[ord.event_date].ordersList.push(ord);
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  };

  const showCatalogFeedback = (msg) => {
    setCatalogMsg(msg);
    setTimeout(() => setCatalogMsg(''), 4000);
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleOpenCategoryModal = (cat = null) => {
    setCategoryFormError('');
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, slug: cat.slug || '', description: cat.description || '', slugManual: true });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '', slugManual: false });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategoryFormError('');

    if (!categoryForm.name.trim()) {
      setCategoryFormError('El nombre de la línea/categoría es obligatorio.');
      return;
    }

    const slugToUse = categoryForm.slug.trim() || generateSlug(categoryForm.name);

    try {
      const url = `${API_BASE_URL}/admin/categories/`;
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { id: editingCategory.id, name: categoryForm.name.trim(), slug: slugToUse, description: categoryForm.description }
        : { name: categoryForm.name.trim(), slug: slugToUse, description: categoryForm.description };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        showCatalogFeedback(editingCategory ? '¡Línea/Categoría actualizada exitosamente!' : '¡Nueva Línea/Categoría creada exitosamente!');
        setIsCategoryModalOpen(false);
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        setCategoryFormError(data.error || 'Error al guardar la línea.');
      }
    } catch (e) {
      setCategoryFormError('Error de comunicación con el servidor.');
    }
  };

  const handlePromptDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
    setDeleteConfirmInput('');
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    if (deleteConfirmInput.trim() !== 'ELIMINAR') return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryToDelete.id })
      });
      if (res.ok) {
        showCatalogFeedback(`¡Línea "${categoryToDelete.name}" y sus productos asociados fueron eliminados!`);
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (e) {
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    } finally {
      setCategoryToDelete(null);
      setDeleteConfirmInput('');
    }
  };

  // --- PRODUCT CRUD HANDLERS ---
  const handleOpenProductModal = (prod = null) => {
    setProductFormError('');
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
    setProductFormError('');

    if (!productForm.name.trim()) {
      setProductFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (productForm.name.trim().length > 150) {
      setProductFormError('El nombre excede el límite máximo permitidos (150 caracteres).');
      return;
    }

    const numPrice = Number(String(productForm.price).replace(/[^0-9]/g, ''));
    if (!numPrice || numPrice < 100 || numPrice > 50000000) {
      setProductFormError('El precio debe ser un monto válido entre $100 y $50.000.000 CLP.');
      return;
    }

    const numUnits = Number(productForm.units);
    if (!numUnits || numUnits < 1 || numUnits > 10000) {
      setProductFormError('El número de porciones/piezas debe estar entre 1 y 10.000 unidades.');
      return;
    }

    if (!productForm.image) {
      setProductFormError('Es obligatorio seleccionar o arrastrar una imagen para el producto.');
      return;
    }

    try {
      const url = `${API_BASE_URL}/admin/menu-items/`;
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct 
        ? { id: editingProduct.id, ...productForm, price: numPrice, units: numUnits }
        : { ...productForm, price: numPrice, units: numUnits };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        showCatalogFeedback(editingProduct ? '¡Producto actualizado exitosamente!' : '¡Nuevo producto agregado al catálogo!');
        setIsProductModalOpen(false);
        fetchAdminData();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        setProductFormError(data.error || 'Error al guardar el producto.');
      }
    } catch (e) {
      setProductFormError('Error de conexión al guardar el producto.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto de la carta?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/menu-items/`, {
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
      const adminName = currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name_paternal || ''}`.trim() || currentUser.username : 'Administración';
      const adminRut = currentUser ? (currentUser.formatted_rut || (currentUser.rut_body ? `${currentUser.rut_body}-${currentUser.rut_dv}` : '')) : '';
      const modifiedByStr = adminRut ? `${adminName} (${adminRut})` : adminName;

      const res = await fetch(`${API_BASE_URL}/config/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          modified_by: modifiedByStr
        })
      });
      const data = await res.json();
      if (res.ok) {
        setConfigSuccessMsg('¡Parámetros operativos actualizados y activos en todo el sistema!');
        if (data && Array.isArray(data.history)) {
          setConfigHistory(data.history);
        }
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

    const targetStatus = newStatus || selectedOrder.status;
    if (isRefunded && targetStatus !== 'CANCELADO') {
      setRefundError('No es posible registrar una devolución sin antes cambiar el estado del pedido a CANCELADO.');
      return;
    }

    if (isRefunded && !refundVoucher) {
      setRefundError('Para marcar la devolución como realizada, es OBLIGATORIO adjuntar el comprobante o foto de la transferencia de devolución.');
      return;
    }

    const adminName = currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name_paternal || ''}`.trim() || currentUser.username : 'Administración';
    const adminRut = currentUser ? (currentUser.formatted_rut || (currentUser.rut_body ? `${currentUser.rut_body}-${currentUser.rut_dv}` : '')) : '';
    const modifiedByStr = adminRut ? `${adminName} (${adminRut})` : adminName;

    const payload = {
      order_id: selectedOrder.id,
      status: newStatus || selectedOrder.status,
      reason: changeReason || (isRefunded ? 'Devolución de dinero realizada y comprobante bancario adjuntado' : 'Actualización manual desde Panel Admin'),
      modified_by: modifiedByStr,
      is_refunded: isRefunded,
      refund_voucher: refundVoucher,
      refund_amount: Number(refundAmount) || selectedOrder.final_total
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/`, {
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="glass-panel w-full max-w-6xl overflow-hidden shadow-2xl relative my-auto min-h-[82vh] flex flex-col font-sans">
        
        {/* Content */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-[#1A120C] px-6 py-4 border-b border-[#D9822B]/20 flex items-center justify-center relative">
              <div className="flex items-center gap-2 text-center">
                <ShieldCheck className="w-5 h-5 text-[#E5C384]" />
                <h3 className="font-sans text-lg font-bold text-[#FAF6F0]">Panel de Administración</h3>
              </div>
              <button onClick={onClose} className="p-1 text-[#A6988B] hover:text-[#FAF6F0] absolute right-6 top-1/2 -translate-y-1/2" title="Cerrar ventana">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 sm:p-10 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
              <div className="w-16 h-16 rounded-full bg-[#D9822B]/15 border border-[#D9822B]/40 text-[#E5C384] flex items-center justify-center mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="font-sans text-xl font-bold text-[#FAF6F0] mb-6">Panel de Administración</h4>
              
              <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
                <div>
                  <label className="text-xs text-[#E5C384] block mb-1 font-bold">RUT *</label>
                  <input 
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-sm text-[#FAF6F0] font-mono focus:outline-none focus:border-[#D9822B]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#E5C384] block mb-1 font-bold">Contraseña *</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                  />
                  <div className="flex justify-end pt-1.5">
                    <button 
                      type="button" 
                      onClick={() => {
                        setForgotError('');
                        setForgotMessage('');
                        setForgotInput('');
                        setForgotStep('request');
                        setIsForgotPasswordOpen(true);
                      }}
                      className="text-[11px] text-[#D9822B] hover:text-[#E5C384] transition-colors underline font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                {loginError && <p className="text-xs text-red-400 font-semibold">{loginError}</p>}
                
                <button type="submit" className="btn-primary w-full py-3 text-xs font-bold mt-2">
                  Ingresar
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[78vh]">
            
            {/* LEFT VERTICAL HIERARCHICAL SIDEBAR */}
            <div className="w-full md:w-64 bg-[#120B07] border-r border-[#D9822B]/20 p-4 flex flex-col justify-between shrink-0 overflow-y-auto space-y-6">
              
              <div className="space-y-5">
                {/* Brand & App Title */}
                <div className="flex items-center gap-3 px-2 pt-1 border-b border-[#D9822B]/20 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D9822B]/20 border border-[#D9822B]/40 text-[#E5C384] flex items-center justify-center font-bold text-sm shrink-0 shadow">
                    <ShieldCheck className="w-5 h-5 text-[#D9822B]" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-[#FAF6F0] leading-tight">Banquetería Lina</h3>
                    <p className="text-[10px] text-[#A6988B] font-mono uppercase tracking-wider">Panel Admin</p>
                  </div>
                </div>

                {/* HIERARCHICAL NAVIGATION SECTIONS */}
                <nav className="space-y-5">
                  
                  {/* CATEGORY 1: OPERACIONES */}
                  <div className="space-y-1.5">
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#E5C384] block mb-1 font-sans border-b border-[#D9822B]/15 pb-1">
                      Operaciones
                    </span>
                    
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'orders' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Pedidos</span>
                      </div>
                      {orders.filter(o => o.status === 'PENDIENTE' || o.status === 'PENDING').length > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                          activeTab === 'orders' ? 'bg-black/30 text-white' : 'bg-[#D9822B] text-white shadow'
                        }`}>
                          {orders.filter(o => o.status === 'PENDIENTE' || o.status === 'PENDING').length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setActiveTab('calendar')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'calendar' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Calendario de Servicio</span>
                      </div>
                    </button>
                  </div>

                  {/* CATEGORY 2: PRODUCTOS */}
                  <div className="space-y-1.5">
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#E5C384] block mb-1 font-sans border-b border-[#D9822B]/15 pb-1">
                      Productos
                    </span>
                    
                    <button 
                      onClick={() => {
                        setActiveTab('catalog');
                        setCatalogSubTab('products');
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'catalog' && catalogSubTab === 'products' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Productos</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        setActiveTab('catalog');
                        setCatalogSubTab('categories');
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'catalog' && catalogSubTab === 'categories' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Líneas</span>
                      </div>
                    </button>
                  </div>

                  {/* CATEGORY 3: MARKETING */}
                  <div className="space-y-1.5">
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#E5C384] block mb-1 font-sans border-b border-[#D9822B]/15 pb-1">
                      Marketing
                    </span>

                    <button 
                      onClick={() => setActiveTab('clients')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'clients' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Directorio Clientes</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'leads' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Cupones Canjeados</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveTab('mailing')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'mailing' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Send className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Campaña de Mailing</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Próximamente
                      </span>
                    </button>
                  </div>

                  {/* CATEGORY 4: INFORMES */}
                  <div className="space-y-1.5">
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#E5C384] block mb-1 font-sans border-b border-[#D9822B]/15 pb-1">
                      Informes
                    </span>

                    <button 
                      onClick={() => { setActiveTab('visits'); fetchAdminVisits(); }}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'visits' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Eye className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Visitas</span>
                      </div>
                    </button>
                  </div>

                  {/* CATEGORY 5: SEGURIDAD */}
                  <div className="space-y-1.5">
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#E5C384] block mb-1 font-sans border-b border-[#D9822B]/15 pb-1">
                      Seguridad
                    </span>

                    <button 
                      onClick={() => setActiveTab('audit')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'audit' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Bitácora Auditoría</span>
                      </div>
                    </button>
                  </div>

                  {/* CATEGORY 6: SISTEMA */}
                  <div className="space-y-1.5">
                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#E5C384] block mb-1 font-sans border-b border-[#D9822B]/15 pb-1">
                      Sistema
                    </span>
                    
                    <button 
                      onClick={() => setActiveTab('users')}
                      className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group ${
                        activeTab === 'users' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                        <span>Administradores</span>
                      </div>
                    </button>

                    {/* CONFIGURACIÓN DESPLEGABLE CON CATEGORÍAS */}
                    <div className="space-y-1 pt-1 border-t border-[#D9822B]/20">
                      <button 
                        onClick={() => {
                          if (activeTab !== 'settings') {
                            setActiveTab('settings');
                            setIsSettingsMenuOpen(true);
                          } else {
                            setIsSettingsMenuOpen(!isSettingsMenuOpen);
                          }
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between group cursor-pointer ${
                          activeTab === 'settings' ? 'bg-[#D9822B] text-white font-bold shadow-lg' : 'text-[#D9C4B1] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sliders className="w-4 h-4 text-[#E5C384] group-hover:scale-110 transition-transform shrink-0" />
                          <span>Configuración</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-[#E5C384] transition-transform ${isSettingsMenuOpen && activeTab === 'settings' ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Submenu Categorías Desplegables */}
                      {activeTab === 'settings' && isSettingsMenuOpen && (
                        <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#D9822B]/40 ml-4 text-xs">
                          <button
                            onClick={() => setSettingsSubCategory('appearance')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'appearance' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>🎨 Apariencia</span>
                          </button>

                          <button
                            onClick={() => setSettingsSubCategory('all')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'all' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>⚙️ Ver Todas las Reglas</span>
                          </button>

                          <button
                            onClick={() => setSettingsSubCategory('terms')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'terms' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>📝 Términos y Condiciones</span>
                          </button>

                          <button
                            onClick={() => setSettingsSubCategory('time_slots')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'time_slots' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>🕥 Bloques Horarios</span>
                          </button>

                          <button
                            onClick={() => setSettingsSubCategory('limits')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'limits' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>💰 Límites y Tarifas</span>
                          </button>

                          <button
                            onClick={() => setSettingsSubCategory('contact')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'contact' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>📞 Contacto y Horarios</span>
                          </button>

                          <button
                            onClick={() => setSettingsSubCategory('audit')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                              settingsSubCategory === 'audit' ? 'bg-[#D9822B]/20 text-[#E5C384] font-bold border border-[#D9822B]/40' : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#1A120C]'
                            }`}
                          >
                            <span>📜 Historial Auditoría</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </nav>
              </div>

              {/* SIDEBAR FOOTER: USER BADGE & LOGOUT BUTTON */}
              {currentUser && (
                <div className="pt-4 border-t border-[#D9822B]/20 space-y-2.5">
                  <div className="flex items-center gap-2.5 p-2 bg-[#1A120C] rounded-xl border border-[#D9822B]/20">
                    <span className="w-8 h-8 rounded-full bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold text-xs border border-[#D9822B]/40 shrink-0">
                      {(currentUser.full_name || currentUser.username || 'A').charAt(0).toUpperCase()}
                    </span>
                    <div className="overflow-hidden text-ellipsis flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#FAF6F0] truncate">{currentUser.full_name}</p>
                      <p className="text-[11px] text-[#A6988B] font-mono truncate">{currentUser.formatted_rut || `${currentUser.rut_body}-${currentUser.rut_dv}`}</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                    title="Cerrar sesión de administración"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}

            </div>

            {/* RIGHT MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1A120C]/90">
              
              {/* TOP HEADER BAR OF CONTENT AREA */}
              <div className="bg-[#120B07] px-6 py-3.5 border-b border-[#D9822B]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <span className="text-[#A6988B] font-medium">Panel Admin</span>
                  <span className="text-[#D9822B] font-bold">/</span>
                  <span className="text-[#E5C384] font-bold tracking-wide font-sans text-xs sm:text-sm">
                    {activeTab === 'orders' && '📦 Gestión de Pedidos'}
                    {activeTab === 'catalog' && '🏷️ Gestión de Líneas & Productos'}
                    {activeTab === 'clients' && '📇 Directorio & Fichas de Clientes'}
                    {activeTab === 'leads' && '🎟️ Cupones Canjeados'}
                    {activeTab === 'visits' && '👁️ Visitas'}
                    {activeTab === 'mailing' && '📢 Campaña de Mailing (Próximamente)'}
                    {activeTab === 'calendar' && '📅 Calendario & Bloqueos'}
                    {activeTab === 'users' && '👥 Cuentas Administradoras'}
                    {activeTab === 'settings' && '⚙️ Configuración del Sitio Web'}
                    {activeTab === 'audit' && '📜 Bitácora de Auditoría'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={fetchAdminData} 
                    className="p-1.5 text-[#E5C384] hover:bg-[#D9822B]/20 rounded-lg transition-colors border border-[#D9822B]/20"
                    title="Actualizar Datos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={onClose} className="p-1.5 text-[#A6988B] hover:text-[#FAF6F0]" title="Cerrar Ventana">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

            {/* Main Admin View Body */}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Search, Filter & Controls Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#120B07] p-3 rounded-xl border border-[#D9822B]/20">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E5C384]/70" />
                      <input 
                        type="text"
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        placeholder="Buscar por código, cliente, RUT, teléfono, dirección, fecha, servicio, estado o menú..."
                        className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg pl-9 pr-8 py-2 text-xs text-[#FAF6F0] placeholder-[#A6988B]/60 focus:border-[#D9822B] outline-none transition-colors"
                      />
                      {orderSearch && (
                        <button 
                          onClick={() => setOrderSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A6988B] hover:text-[#FAF6F0]"
                          title="Limpiar Búsqueda"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={orderStatusFilter} 
                        onChange={e => setOrderStatusFilter(e.target.value)}
                        className="bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-xs text-[#E5C384] outline-none cursor-pointer hover:border-[#D9822B]"
                      >
                        <option value="ALL">Todos los Estados ({orders.length})</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="CONFIRMADO">CONFIRMADO</option>
                        <option value="EN_PREPARACION">EN PREPARACIÓN</option>
                        <option value="DESPACHADO">DESPACHADO</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>

                      <select 
                        value={ordersPerPage} 
                        onChange={e => setOrdersPerPage(Number(e.target.value))}
                        className="bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-xs text-[#E5C384] outline-none cursor-pointer hover:border-[#D9822B]"
                        title="Pedidos por página"
                      >
                        <option value={10}>10 pág.</option>
                        <option value={15}>15 pág.</option>
                        <option value={20}>20 pág.</option>
                        <option value={30}>30 pág.</option>
                        <option value={50}>50 pág.</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary & Active Filters Badge */}
                  <div className="flex items-center justify-between text-xs text-[#A6988B] px-1">
                    <div>
                      {filteredOrders.length > 0 ? (
                        <span>
                          Mostrando <strong className="text-[#E5C384]">{(safeOrdersPage - 1) * ordersPerPage + 1}</strong> a <strong className="text-[#E5C384]">{Math.min(safeOrdersPage * ordersPerPage, filteredOrders.length)}</strong> de <strong className="text-[#FAF6F0]">{filteredOrders.length}</strong> pedidos
                          {orders.length !== filteredOrders.length && ` (filtrados de ${orders.length} totales)`}
                        </span>
                      ) : (
                        <span className="text-amber-400">No se encontraron resultados</span>
                      )}
                    </div>
                    {orderSearch && (
                      <span className="text-[11px] bg-[#D9822B]/10 text-[#E5C384] px-2 py-0.5 rounded border border-[#D9822B]/30">
                        Buscando: "{orderSearch}"
                      </span>
                    )}
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider border-b border-[#D9822B]/20">
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
                        {paginatedOrders.length > 0 ? (
                          paginatedOrders.map(order => (
                            <tr key={order.id} className="hover:bg-[#1A120C]/60 transition-colors">
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
                                    Reembolsado
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
                                  className="btn-secondary text-[11px] py-1 px-3 hover:border-[#D9822B]"
                                >
                                  Ver Detalle
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#A6988B]">
                              <div className="space-y-2">
                                <Search className="w-8 h-8 mx-auto text-[#A6988B]/40" />
                                <p className="font-semibold text-[#FAF6F0]">No se encontraron pedidos que coincidan con la búsqueda.</p>
                                <p className="text-xs text-[#A6988B]">Intenta buscar por otro código, nombre de cliente, RUT, comuna, servicio o fecha.</p>
                                {orderSearch && (
                                  <button onClick={() => setOrderSearch('')} className="btn-secondary text-xs py-1 px-3 mt-2">
                                    Limpiar Búsqueda
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls Bar */}
                  {totalOrderPages > 1 && (
                    <div className="flex items-center justify-between bg-[#120B07] p-3 rounded-xl border border-[#D9822B]/20 text-xs">
                      <button
                        onClick={() => setOrdersCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={safeOrdersPage <= 1}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                          safeOrdersPage <= 1
                            ? 'opacity-40 cursor-not-allowed border-[#D9822B]/10 text-[#A6988B]'
                            : 'border-[#D9822B]/30 hover:border-[#D9822B] text-[#FAF6F0] bg-[#1A120C]'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {Array.from({ length: totalOrderPages }, (_, idx) => idx + 1).map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => setOrdersCurrentPage(pageNum)}
                            className={`w-7 h-7 rounded-lg font-mono text-xs transition-all ${
                              pageNum === safeOrdersPage
                                ? 'bg-[#D9822B] text-white font-bold shadow-md shadow-[#D9822B]/30'
                                : 'bg-[#1A120C] text-[#A6988B] hover:text-[#FAF6F0] border border-[#D9822B]/20'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setOrdersCurrentPage(prev => Math.min(prev + 1, totalOrderPages))}
                        disabled={safeOrdersPage >= totalOrderPages}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                          safeOrdersPage >= totalOrderPages
                            ? 'opacity-40 cursor-not-allowed border-[#D9822B]/10 text-[#A6988B]'
                            : 'border-[#D9822B]/30 hover:border-[#D9822B] text-[#FAF6F0] bg-[#1A120C]'
                        }`}
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                        Líneas ({categories.length})
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
                        <table className="w-full text-left text-xs min-w-[700px]">
                          <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider border-b border-[#D9822B]/20">
                            <tr>
                              <th className="p-3">Producto</th>
                              <th className="p-3 whitespace-nowrap">Línea</th>
                              <th className="p-3 whitespace-nowrap">Porciones / Piezas</th>
                              <th className="p-3 whitespace-nowrap">Precio</th>
                              <th className="p-3 whitespace-nowrap">Destacado</th>
                              <th className="p-3 text-right whitespace-nowrap">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                            {filteredProducts.map(prod => {
                              const catObj = categories.find(c => String(c.id) === String(prod.category));
                              return (
                                <tr key={prod.id} className="hover:bg-[#1A120C]/60 transition-colors">
                                  <td className="p-3 flex items-center gap-3 min-w-[220px]">
                                    <img 
                                      src={prod.image || '/images/box_favoritos.jpg'} 
                                      alt={prod.name} 
                                      className="w-12 h-12 rounded-lg object-cover border border-[#D9822B]/30 shrink-0"
                                    />
                                    <div>
                                      <span className="font-sans font-bold text-[#FAF6F0] block">{prod.name}</span>
                                      <span className="text-[10px] text-[#A6988B] line-clamp-1">{prod.description}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 whitespace-nowrap">
                                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-[#D9822B]/15 text-[#E5C384] border border-[#D9822B]/30 whitespace-nowrap">
                                      {catObj ? catObj.name : 'General'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-[#E5C384] whitespace-nowrap">{prod.units || 1} porciones</td>
                                  <td className="p-3 font-mono font-bold text-[#FAF6F0] whitespace-nowrap">${Number(prod.price).toLocaleString('es-CL')} CLP</td>
                                  <td className="p-3 whitespace-nowrap">
                                    {prod.is_featured ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/40 whitespace-nowrap">
                                        ⭐ Destacado
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[#A6988B]">No</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">
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
                          <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider border-b border-[#D9822B]/20">
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
                                  <td className="p-3 font-sans font-bold text-[#FAF6F0]">{cat.name}</td>
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
                                        onClick={() => handlePromptDeleteCategory(cat)}
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

              {/* CLIENTS DIRECTORY TAB */}
              {activeTab === 'clients' && (
                <div className="space-y-5">
                  
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-[#120B07] border border-[#D9822B]/25 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold shrink-0 border border-[#D9822B]/30">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A6988B] font-semibold uppercase">Total Clientes</p>
                        <p className="text-lg font-bold text-[#FAF6F0] font-mono">{clients.length}</p>
                      </div>
                    </div>

                    <div className="bg-[#120B07] border border-[#D9822B]/25 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center font-bold shrink-0 border border-green-500/30">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A6988B] font-semibold uppercase">Clientes Frecuentes</p>
                        <p className="text-lg font-bold text-green-400 font-mono">
                          {clients.filter(c => (c.active_orders !== undefined ? c.active_orders : c.total_orders) > 1).length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#120B07] border border-[#D9822B]/25 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A6988B] font-semibold uppercase">Inversión Neta Acumulada</p>
                        <p className="text-lg font-bold text-[#E5C384] font-mono">
                          ${clients.reduce((acc, c) => acc + (c.total_spent || 0), 0).toLocaleString('es-CL')} CLP
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#120B07] border border-red-500/25 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0 border border-red-500/30">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A6988B] font-semibold uppercase">Devoluciones Realizadas</p>
                        <p className="text-lg font-bold text-red-400 font-mono">
                          ${clients.reduce((acc, c) => acc + (c.total_refunded || 0), 0).toLocaleString('es-CL')} CLP
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#120B07] p-3 rounded-xl border border-[#D9822B]/20">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E5C384]/70" />
                      <input 
                        type="text"
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        placeholder="Buscar cliente por nombres, apellidos, RUT, correo, teléfono, comuna..."
                        className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg pl-9 pr-8 py-2 text-xs text-[#FAF6F0] placeholder-[#A6988B]/60 focus:border-[#D9822B] outline-none transition-colors"
                      />
                      {clientSearch && (
                        <button 
                          onClick={() => setClientSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A6988B] hover:text-[#FAF6F0]"
                          title="Limpiar Búsqueda"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={clientFilterType} 
                        onChange={e => setClientFilterType(e.target.value)}
                        className="bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-xs text-[#E5C384] outline-none cursor-pointer hover:border-[#D9822B]"
                      >
                        <option value="ALL">Todos los Clientes ({clients.length})</option>
                        <option value="FREQUENT">Clientes Frecuentes (&gt;1 Pedido Activo)</option>
                        <option value="WITH_ORDERS">Con Pedidos Activos</option>
                        <option value="WITH_REFUNDS">Con Devoluciones / Reembolsos</option>
                        <option value="LEADS_ONLY">Clientes Prospecto (Boletín)</option>
                      </select>

                      <button
                        onClick={openNewClientModal}
                        className="btn-primary text-xs py-2 px-3 flex items-center gap-1 shrink-0 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Registrar Cliente 3NF</span>
                      </button>
                    </div>
                  </div>

                  {/* Clients Table */}
                  <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider border-b border-[#D9822B]/20 text-[10px]">
                        <tr>
                          <th className="p-3.5">Cliente (Nombres & Apellidos 3NF)</th>
                          <th className="p-3.5">RUT Atomizado (1NF)</th>
                          <th className="p-3.5">Ubicación (FK Comuna / Dirección)</th>
                          <th className="p-3.5">Contacto</th>
                          <th className="p-3.5">Historial & Inversión Neta</th>
                          <th className="p-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                        {filteredClients.length > 0 ? (
                          filteredClients.map(c => (
                            <tr key={c.id} className="hover:bg-[#1A120C]/60 transition-colors">
                              <td className="p-3.5 font-bold">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-full bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold text-xs border border-[#D9822B]/30 shrink-0">
                                    {(c.full_name || c.client_name || 'C').charAt(0).toUpperCase()}
                                  </span>
                                  <div>
                                    <p className="text-xs text-[#FAF6F0] font-semibold">{c.full_name || c.client_name}</p>
                                    <p className="text-[10px] text-[#A6988B] font-mono">
                                      {c.first_name ? `${c.first_name} ${c.last_name_paternal} ${c.last_name_maternal || ''}` : 'Sincronizado 3NF'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 font-mono">
                                <p className="text-xs text-[#E5C384] font-bold">{c.formatted_rut || c.rut || 'Sin RUT registrado'}</p>
                                {c.rut_body && (
                                  <p className="text-[9px] text-[#A6988B]">Cuerpo: {c.rut_body} | DV: {c.rut_dv || '-'}</p>
                                )}
                              </td>

                              <td className="p-3.5">
                                <p className="text-xs text-[#FAF6F0] font-semibold">
                                  {c.commune_name ? c.commune_name : 'Sin comuna FK'}
                                </p>
                                <p className="text-[10px] text-[#A6988B] max-w-xs truncate font-mono">
                                  {c.address || 'Sin dirección'}
                                </p>
                              </td>

                              <td className="p-3.5">
                                <div className="space-y-0.5 font-mono">
                                  <p className="text-xs text-[#FAF6F0]">{c.email}</p>
                                  <p className="text-[10px] text-[#A6988B] flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#E5C384]" />
                                    {c.phone || 'Sin teléfono'}
                                  </p>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      (c.active_orders || c.total_orders) > 1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                      (c.active_orders || c.total_orders) === 1 ? 'bg-[#D9822B]/20 text-[#E5C384]' :
                                      'bg-purple-500/20 text-purple-300'
                                    }`}>
                                      {c.total_orders > 0 ? `${c.active_orders !== undefined ? c.active_orders : c.total_orders} activo(s) / ${c.total_orders} total` : 'Prospecto Boletín'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 font-mono text-xs">
                                    <span className="font-bold text-[#E5C384]">
                                      Neta: ${ (c.total_spent || 0).toLocaleString('es-CL') } CLP
                                    </span>
                                    {c.total_refunded > 0 && (
                                      <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
                                        Devuelto: ${c.total_refunded.toLocaleString('es-CL')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedClientModal(c)}
                                    className="btn-secondary text-[10px] py-1 px-2 hover:border-[#D9822B]"
                                    title="Ver Ficha y Historial de Pedidos"
                                  >
                                    Ficha
                                  </button>
                                  <button
                                    onClick={() => openEditClientModal(c)}
                                    className="btn-secondary text-[10px] py-1 px-2 text-[#E5C384] hover:border-[#D9822B]"
                                    title="Editar Campos Atomizados 3NF"
                                  >
                                    Editar
                                  </button>
                                  {typeof c.id === 'number' && (
                                    <button
                                      onClick={() => handleDeleteClient(c.id)}
                                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                      title="Eliminar Cliente"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#A6988B]">
                              <div className="space-y-2">
                                <Users className="w-8 h-8 mx-auto text-[#A6988B]/40" />
                                <p className="font-semibold text-[#FAF6F0]">No se encontraron clientes que coincidan con el filtro.</p>
                                {clientSearch && (
                                  <button onClick={() => setClientSearch('')} className="btn-secondary text-xs py-1 px-3 mt-2">
                                    Limpiar Búsqueda
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LEADS TAB */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <h4 className="font-sans text-lg font-bold text-[#E5C384]">Cupones Canjeados y Correos Capturados (5% Descuento)</h4>
                  <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider border-b border-[#D9822B]/20">
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

              {/* MAILING TAB (PROXIMAMENTE / EN CONSTRUCCION) */}
              {activeTab === 'mailing' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#1E130B] via-[#120B07] to-[#1E130B] border border-[#D9822B]/30 rounded-2xl p-8 text-center space-y-4 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[#D9822B]/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-md">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      🚀 PRÓXIMAMENTE / EN CONSTRUCCIÓN
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-sans text-[#FAF6F0] font-bold tracking-wide">
                      Campaña de Mailing Masivo & Fidelización
                    </h2>

                    <p className="text-sm text-[#D9C4B1] max-w-2xl mx-auto leading-relaxed">
                      Pronto podrás diseñar, programar y enviar campañas promocionales de email marketing personalizadas a todos los clientes registrados y subscriptores del boletín de Banquetería Lina.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-left">
                      <div className="bg-[#1A120C]/80 border border-[#D9822B]/20 rounded-xl p-5 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-lg bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold">
                          <Mail className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-xs text-[#E5C384] uppercase tracking-wider">Plantillas Exclusivas</h4>
                        <p className="text-xs text-[#A6988B]">Diseñador HTML WYSIWYG de correo institucional con logotipo corporativo en alta resolución.</p>
                      </div>

                      <div className="bg-[#1A120C]/80 border border-[#D9822B]/20 rounded-xl p-5 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-lg bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-xs text-[#E5C384] uppercase tracking-wider">Segmentación Inteligente</h4>
                        <p className="text-xs text-[#A6988B]">Filtra audiencia por historial de compras, tipo de servicio preferido y cupones reclamados.</p>
                      </div>

                      <div className="bg-[#1A120C]/80 border border-[#D9822B]/20 rounded-xl p-5 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-lg bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold">
                          <History className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-xs text-[#E5C384] uppercase tracking-wider">Métricas de Envíos</h4>
                        <p className="text-xs text-[#A6988B]">Monitoreo de tasa de apertura, clics en ofertas y conversiones en reservaciones de banquetes.</p>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-[#A6988B] italic">
                      Módulo en desarrollo activo • Banquetería Lina v2.0
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <h4 className="font-sans text-lg font-bold text-[#E5C384]">Configuración General del Sitio Web & Parámetros Operativos</h4>
                    <p className="text-xs text-[#A6988B]">
                      Personaliza la apariencia (colores, logo, textos hero) y modifica las reglas operativas de la banquetería.
                    </p>
                  </div>

                  {/* Subcategory Pill Filter Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap bg-[#120B07] p-1.5 rounded-xl border border-[#D9822B]/20">
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('appearance')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'appearance' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      🎨 Apariencia
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'all' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      ⚙️ Todas las Reglas
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('terms')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'terms' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      📝 Términos y Condiciones
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('time_slots')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'time_slots' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      🕥 Bloques Horarios
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('limits')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'limits' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      💰 Límites y Tarifas
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('contact')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'contact' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      📞 Contacto y Horarios
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubCategory('audit')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settingsSubCategory === 'audit' ? 'bg-[#D9822B] text-white font-bold shadow' : 'text-[#A6988B] hover:text-[#FAF6F0]'
                      }`}
                    >
                      📜 Historial Auditoría
                    </button>
                  </div>
                  
                  {configSuccessMsg && (
                    <div className="bg-green-500/15 border border-green-500/40 p-3.5 rounded-xl text-green-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{configSuccessMsg}</span>
                    </div>
                  )}

                  <div className="glass-card p-6 space-y-6">

                    {/* CATEGORY: APPEARANCE & BRAND */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'appearance') && (
                      <div className="space-y-6 pb-6 border-b border-[#D9822B]/20">
                        <div className="flex items-center justify-between border-b border-[#D9822B]/20 pb-3">
                          <div>
                            <h5 className="font-sans font-bold text-base text-[#E5C384] flex items-center gap-2">
                              Apariencia del Sitio Web & Marca
                            </h5>
                            <p className="text-xs text-[#A6988B] mt-0.5">
                              Personaliza el esquema de colores, el logo oficial de la marca y los textos publicitarios de la portada (Hero).
                            </p>
                          </div>
                        </div>

                        {/* ACCORDION 1: PALETA DE COLORES */}
                        <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                          <button
                            type="button"
                            onClick={() => toggleAccordion('palette')}
                            className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                                <Palette className="w-5 h-5" />
                              </div>
                              <div>
                                <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Paleta de Colores Generales del Sitio</h6>
                                <p className="text-[11px] text-[#A6988B]">Personaliza los colores principales, secundarios, fondos y tarjetas.</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#E5C384]">
                                {openAccordions.palette ? 'Contraer' : 'Desplegar'}
                              </span>
                              {openAccordions.palette ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                            </div>
                          </button>

                          {openAccordions.palette && (
                            <div className="p-5 border-t border-[#D9822B]/20 space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-xs text-[#A6988B]">Ajusta cada color manualmente o aplica una combinación lista:</span>
                                <button
                                  type="button"
                                  onClick={() => setConfig(prev => ({
                                    ...prev,
                                    theme_color_primary: '#D9822B',
                                    theme_color_secondary: '#E5C384',
                                    theme_color_bg: '#120B07',
                                    theme_color_card: '#1A120C',
                                    theme_color_text: '#FAF6F0'
                                  }))}
                                  className="text-xs text-[#E5C384] hover:underline transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw className="w-3 h-3" /> Restablecer Colores por Defecto
                                </button>
                              </div>

                              {/* Preset Color Themes */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-[#A6988B] block">Temas de Colores Predefinidos (Selecciona para aplicar):</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {[
                                    { name: '🟡 Dorado & Ámbar (Original)', primary: '#D9822B', secondary: '#E5C384', bg: '#120B07', card: '#1A120C', text: '#FAF6F0' },
                                    { name: '🍷 Vino & Borgoña Elegante', primary: '#C0392B', secondary: '#E6B0AA', bg: '#150A0A', card: '#221010', text: '#FDFEFE' },
                                    { name: '🌿 Verde Esmeralda Gourmet', primary: '#16A085', secondary: '#A3E4D7', bg: '#0A1512', card: '#10221E', text: '#F4F6F7' },
                                    { name: '🔷 Azul Noche Real', primary: '#2980B9', secondary: '#AED6F1', bg: '#0B131C', card: '#121E2C', text: '#F4F6F7' },
                                    { name: '🖤 Negro & Platino', primary: '#D4AF37', secondary: '#F3E5AB', bg: '#080808', card: '#141414', text: '#FFFFFF' }
                                  ].map((preset, pIdx) => (
                                    <button
                                      key={pIdx}
                                      type="button"
                                      onClick={() => setConfig(prev => ({
                                        ...prev,
                                        theme_color_primary: preset.primary,
                                        theme_color_secondary: preset.secondary,
                                        theme_color_bg: preset.bg,
                                        theme_color_card: preset.card,
                                        theme_color_text: preset.text,
                                      }))}
                                      className="p-2.5 rounded-xl border border-[#D9822B]/30 hover:border-[#D9822B] bg-[#1A120C] flex items-center justify-between text-xs transition-all text-left cursor-pointer group"
                                    >
                                      <span className="font-semibold text-[#FAF6F0] group-hover:text-[#E5C384] transition-colors">{preset.name}</span>
                                      <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: preset.primary }} />
                                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: preset.secondary }} />
                                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: preset.bg }} />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Color Pickers Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                
                                {/* Primary Color */}
                                <div className="space-y-1.5 bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                                  <label className="text-xs font-semibold text-[#FAF6F0] block">Color Primario / Botones</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      value={config.theme_color_primary || '#D9822B'}
                                      onChange={(e) => setConfig({ ...config, theme_color_primary: e.target.value })}
                                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent shrink-0"
                                    />
                                    <input 
                                      type="text" 
                                      value={config.theme_color_primary || '#D9822B'}
                                      onChange={(e) => setConfig({ ...config, theme_color_primary: e.target.value })}
                                      className="w-full p-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-mono text-[#E5C384]"
                                    />
                                  </div>
                                  <p className="text-[11px] text-[#A6988B]">Usado en botones primarios, badges y acentos.</p>
                                </div>

                                {/* Secondary Color */}
                                <div className="space-y-1.5 bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                                  <label className="text-xs font-semibold text-[#FAF6F0] block">Color Secundario / Dorado</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      value={config.theme_color_secondary || '#E5C384'}
                                      onChange={(e) => setConfig({ ...config, theme_color_secondary: e.target.value })}
                                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent shrink-0"
                                    />
                                    <input 
                                      type="text" 
                                      value={config.theme_color_secondary || '#E5C384'}
                                      onChange={(e) => setConfig({ ...config, theme_color_secondary: e.target.value })}
                                      className="w-full p-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-mono text-[#E5C384]"
                                    />
                                  </div>
                                  <p className="text-[11px] text-[#A6988B]">Usado en títulos principales, subtítulos y precios.</p>
                                </div>

                                {/* Main BG Color */}
                                <div className="space-y-1.5 bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                                  <label className="text-xs font-semibold text-[#FAF6F0] block">Color Fondo Principal</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      value={config.theme_color_bg || '#120B07'}
                                      onChange={(e) => setConfig({ ...config, theme_color_bg: e.target.value })}
                                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent shrink-0"
                                    />
                                    <input 
                                      type="text" 
                                      value={config.theme_color_bg || '#120B07'}
                                      onChange={(e) => setConfig({ ...config, theme_color_bg: e.target.value })}
                                      className="w-full p-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-mono text-[#E5C384]"
                                    />
                                  </div>
                                  <p className="text-[11px] text-[#A6988B]">Fondo general del sitio y cuerpo de la página.</p>
                                </div>

                                {/* Card BG Color */}
                                <div className="space-y-1.5 bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                                  <label className="text-xs font-semibold text-[#FAF6F0] block">Color Fondo de Tarjetas</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      value={config.theme_color_card || '#1A120C'}
                                      onChange={(e) => setConfig({ ...config, theme_color_card: e.target.value })}
                                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent shrink-0"
                                    />
                                    <input 
                                      type="text" 
                                      value={config.theme_color_card || '#1A120C'}
                                      onChange={(e) => setConfig({ ...config, theme_color_card: e.target.value })}
                                      className="w-full p-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-mono text-[#E5C384]"
                                    />
                                  </div>
                                  <p className="text-[11px] text-[#A6988B]">Fondo de tarjetas de menú, modales y módulos.</p>
                                </div>

                                {/* Main Text Color */}
                                <div className="space-y-1.5 bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                                  <label className="text-xs font-semibold text-[#FAF6F0] block">Color Texto Principal</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="color" 
                                      value={config.theme_color_text || '#FAF6F0'}
                                      onChange={(e) => setConfig({ ...config, theme_color_text: e.target.value })}
                                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent shrink-0"
                                    />
                                    <input 
                                      type="text" 
                                      value={config.theme_color_text || '#FAF6F0'}
                                      onChange={(e) => setConfig({ ...config, theme_color_text: e.target.value })}
                                      className="w-full p-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-mono text-[#E5C384]"
                                    />
                                  </div>
                                  <p className="text-[11px] text-[#A6988B]">Color del texto de párrafos y contenido.</p>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>

                        {/* ACCORDION 2: LOGO OFICIAL Y FAVICON DEL SITIO */}
                        <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                          <button
                            type="button"
                            onClick={() => toggleAccordion('logo')}
                            className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Logo Oficial & Icono de Sitio Web</h6>
                                <p className="text-[11px] text-[#A6988B]">Sube el logo oficial de la marca y el icono de la pestaña del navegador.</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#E5C384]">
                                {openAccordions.logo ? 'Contraer' : 'Desplegar'}
                              </span>
                              {openAccordions.logo ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                            </div>
                          </button>

                          {openAccordions.logo && (
                            <div className="p-5 border-t border-[#D9822B]/20 space-y-6">
                              {/* A. LOGO OFICIAL */}
                              <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <h6 className="font-sans font-bold text-sm text-[#FAF6F0] flex items-center gap-2">
                                    <span>Logo Oficial del Sitio Web</span>
                                  </h6>
                                  <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, site_logo: '/images/logo_lina.png' }))}
                                    className="text-xs text-[#E5C384] hover:underline transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Restablecer Logo Predeterminado
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                  {/* Preview Box */}
                                  <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/30 flex flex-col items-center justify-center text-center space-y-2 min-h-[130px]">
                                    <span className="text-[11px] font-semibold text-[#A6988B] uppercase tracking-wider">Vista Previa del Logo</span>
                                    <img 
                                      src={config.site_logo || '/images/logo_lina.png'} 
                                      alt="Logo Actual" 
                                      className="h-20 max-w-full object-contain filter drop-shadow-md"
                                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo_lina.png'; }}
                                    />
                                  </div>

                                  {/* Upload Controls */}
                                  <div className="md:col-span-2 space-y-3">
                                    {/* Drag & Drop File Selector */}
                                    <div
                                      onDragOver={(e) => { e.preventDefault(); setIsLogoDragging(true); }}
                                      onDragLeave={(e) => { e.preventDefault(); setIsLogoDragging(false); }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        setIsLogoDragging(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                          handleLogoFileSelect(e.dataTransfer.files[0]);
                                        }
                                      }}
                                      onClick={() => logoFileInputRef.current && logoFileInputRef.current.click()}
                                      className={`border-2 dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                        isLogoDragging ? 'border-[#D9822B] bg-[#D9822B]/20 scale-[1.01]' : 'border-[#D9822B]/40 hover:border-[#D9822B] bg-[#1A120C]/80'
                                      }`}
                                    >
                                      <input 
                                        type="file" 
                                        ref={logoFileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files && handleLogoFileSelect(e.target.files[0])}
                                      />
                                      <Upload className="w-6 h-6 text-[#E5C384] mx-auto mb-1" />
                                      <p className="text-xs font-semibold text-[#FAF6F0]">
                                        Haz clic para subir un nuevo Logo o arrastra un archivo aquí
                                      </p>
                                      <p className="text-[11px] text-[#A6988B] mt-0.5">Soporta PNG, JPG, SVG o WEBP (Recomendado fondo transparente)</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <hr className="border-[#D9822B]/20 my-2" />

                              {/* B. FAVICON (ÍCONO DE PESTAÑA DEL NAVEGADOR) */}
                              <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <h6 className="font-sans font-bold text-sm text-[#FAF6F0] flex items-center gap-2">
                                    <span>Icono de Sitio Web</span>
                                  </h6>
                                  <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, site_favicon: '/images/logo_lina.png' }))}
                                    className="text-xs text-[#E5C384] hover:underline transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Restablecer Favicon Predeterminado
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                  {/* Simulated Browser Tab Preview Box */}
                                  <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/30 flex flex-col items-center justify-center text-center space-y-2 min-h-[130px]">
                                    <span className="text-[11px] font-semibold text-[#A6988B] uppercase tracking-wider">Simulación Pestaña Navegador</span>
                                    <div className="bg-[#2B231D] border border-[#D9822B]/30 px-3 py-1.5 rounded-t-lg inline-flex items-center gap-2 max-w-[200px] shadow-md">
                                      <img 
                                        src={config.site_favicon || '/images/logo_lina.png'} 
                                        alt="Favicon Preview" 
                                        className="w-4 h-4 object-contain shrink-0"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo_lina.png'; }}
                                      />
                                      <span className="text-[10px] text-[#FAF6F0] font-medium truncate">Banquetería Lina</span>
                                      <span className="text-[10px] text-[#A6988B]">×</span>
                                    </div>
                                    <p className="text-[10px] text-[#A6988B]">Este icono aparece arriba en la pestaña del navegador.</p>
                                  </div>

                                  {/* Upload Controls */}
                                  <div className="md:col-span-2">
                                    {/* Drag & Drop File Selector for Favicon */}
                                    <div
                                      onDragOver={(e) => { e.preventDefault(); setIsFaviconDragging(true); }}
                                      onDragLeave={(e) => { e.preventDefault(); setIsFaviconDragging(false); }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        setIsFaviconDragging(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                          handleFaviconFileSelect(e.dataTransfer.files[0]);
                                        }
                                      }}
                                      onClick={() => faviconFileInputRef.current && faviconFileInputRef.current.click()}
                                      className={`border-2 dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                        isFaviconDragging ? 'border-[#D9822B] bg-[#D9822B]/20 scale-[1.01]' : 'border-[#D9822B]/40 hover:border-[#D9822B] bg-[#1A120C]/80'
                                      }`}
                                    >
                                      <input 
                                        type="file" 
                                        ref={faviconFileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files && handleFaviconFileSelect(e.target.files[0])}
                                      />
                                      <Upload className="w-6 h-6 text-[#E5C384] mx-auto mb-1" />
                                      <p className="text-xs font-semibold text-[#FAF6F0]">
                                        Haz clic para subir un nuevo Favicon o arrastra una imagen aquí
                                      </p>
                                      <p className="text-[11px] text-[#A6988B] mt-0.5">Soporta PNG, ICO, SVG o WEBP (Recomendado formato cuadrado)</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ACCORDION 3: TEXTOS Y SECCIONES DEL HERO */}
                        <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                          <button
                            type="button"
                            onClick={() => toggleAccordion('hero')}
                            className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                                <Type className="w-5 h-5" />
                              </div>
                              <div>
                                <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Textos y Secciones de la Portada (Hero)</h6>
                                <p className="text-[11px] text-[#A6988B]">Edita el título principal, subtítulo, insignia superior y las 3 tarjetas informativas.</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#E5C384]">
                                {openAccordions.hero ? 'Contraer' : 'Desplegar'}
                              </span>
                              {openAccordions.hero ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                            </div>
                          </button>

                          {openAccordions.hero && (
                            <div className="p-5 border-t border-[#D9822B]/20 space-y-5">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-xs text-[#A6988B]">Modifica los textos principales o la visibilidad de los elementos del Hero:</span>
                                <button
                                  type="button"
                                  onClick={() => setConfig(prev => ({
                                    ...prev,
                                    hero_title: 'El arte de comer rico',
                                    hero_subtitle: 'Presentaciones gourmet artesanales, montajes decorativos y garzones para tus momentos inolvidables.',
                                    hero_badge_text: 'Banquetería Familiar en Santiago de Chile',
                                    show_hero_badge: 'true',
                                    show_hero_cards: 'true',
                                    hero_card1_title: '3 Días de Anticipación',
                                    hero_card1_desc: 'Elaboración artesanal fresca con reserva previa.',
                                    hero_card2_title: 'Retiro o Montaje Sábados',
                                    hero_card2_desc: 'Retiro presencial Lun-Dom; montajes los Sábados.',
                                    hero_card3_title: 'Opción Garzones',
                                    hero_card3_desc: 'Cálculo automático de personal (1 cada 25 personas).'
                                  }))}
                                  className="text-xs text-[#E5C384] hover:underline transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw className="w-3 h-3" /> Restablecer Secciones por Defecto
                                </button>
                              </div>

                              {/* Hero Title & Subtitle inputs */}
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                    Título Principal del Hero (Encabezado)
                                  </label>
                                  <input 
                                    type="text"
                                    value={config.hero_title || ''}
                                    onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                                    placeholder="El arte de comer rico"
                                    className="w-full p-2.5 bg-[#1A120C] border border-[#D9822B]/30 rounded-xl text-xs font-sans font-bold text-[#FAF6F0]"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                    Subtítulo / Descripción del Hero
                                  </label>
                                  <textarea 
                                    rows={2}
                                    value={config.hero_subtitle || ''}
                                    onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                                    placeholder="Presentaciones gourmet artesanales..."
                                    className="w-full p-2.5 bg-[#1A120C] border border-[#D9822B]/30 rounded-xl text-xs text-[#FAF6F0]"
                                  />
                                </div>
                              </div>

                              <hr className="border-[#D9822B]/20 my-2" />

                              {/* A. Insignia Superior (Badge Header) */}
                              <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/20 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h6 className="text-xs font-bold text-[#E5C384]">Insignia Superior (Badge Encabezado)</h6>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={config.show_hero_badge === 'true' || config.show_hero_badge === true}
                                      onChange={(e) => setConfig({ ...config, show_hero_badge: e.target.checked ? 'true' : 'false' })}
                                      className="w-4 h-4 accent-[#D9822B] rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-[#FAF6F0]">
                                      {(config.show_hero_badge === 'true' || config.show_hero_badge === true) ? '👁️ Visible' : '🙈 Oculta'}
                                    </span>
                                  </label>
                                </div>

                                {(config.show_hero_badge === 'true' || config.show_hero_badge === true) && (
                                  <div>
                                    <label className="text-[11px] text-[#A6988B] block mb-1">Texto de la Insignia:</label>
                                    <input 
                                      type="text"
                                      value={config.hero_badge_text || ''}
                                      onChange={(e) => setConfig({ ...config, hero_badge_text: e.target.value })}
                                      placeholder="Ej: Banquetería Familiar en Santiago de Chile"
                                      className="w-full p-2 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-semibold text-[#E5C384]"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* B. Las 3 Tarjetas Informativas Operativas */}
                              <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/20 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h6 className="text-xs font-bold text-[#E5C384]">3 Tarjetas Informativas Operativas del Hero</h6>
                                    <p className="text-[11px] text-[#A6988B]">Resumen de anticipación, retiro/montaje y garzones.</p>
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={config.show_hero_cards === 'true' || config.show_hero_cards === true}
                                      onChange={(e) => setConfig({ ...config, show_hero_cards: e.target.checked ? 'true' : 'false' })}
                                      className="w-4 h-4 accent-[#D9822B] rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-[#FAF6F0]">
                                      {(config.show_hero_cards === 'true' || config.show_hero_cards === true) ? '👁️ Visibles' : '🙈 Ocultas'}
                                    </span>
                                  </label>
                                </div>

                                {(config.show_hero_cards === 'true' || config.show_hero_cards === true) && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Card 1 */}
                                    <div className="bg-[#120B07] p-3 rounded-lg border border-[#D9822B]/30 space-y-2">
                                      <span className="text-[11px] font-bold text-[#E5C384] uppercase block">Tarjeta 1 (Anticipación)</span>
                                      <input 
                                        type="text"
                                        value={config.hero_card1_title || ''}
                                        onChange={(e) => setConfig({ ...config, hero_card1_title: e.target.value })}
                                        placeholder="Título"
                                        className="w-full p-1.5 bg-[#1A120C] border border-[#D9822B]/20 rounded text-xs font-semibold text-[#FAF6F0]"
                                      />
                                      <textarea 
                                        rows={2}
                                        value={config.hero_card1_desc || ''}
                                        onChange={(e) => setConfig({ ...config, hero_card1_desc: e.target.value })}
                                        placeholder="Descripción"
                                        className="w-full p-1.5 bg-[#1A120C] border border-[#D9822B]/20 rounded text-[11px] text-[#A6988B]"
                                      />
                                    </div>

                                    {/* Card 2 */}
                                    <div className="bg-[#120B07] p-3 rounded-lg border border-[#D9822B]/30 space-y-2">
                                      <span className="text-[11px] font-bold text-[#E5C384] uppercase block">Tarjeta 2 (Horarios/Montaje)</span>
                                      <input 
                                        type="text"
                                        value={config.hero_card2_title || ''}
                                        onChange={(e) => setConfig({ ...config, hero_card2_title: e.target.value })}
                                        placeholder="Título"
                                        className="w-full p-1.5 bg-[#1A120C] border border-[#D9822B]/20 rounded text-xs font-semibold text-[#FAF6F0]"
                                      />
                                      <textarea 
                                        rows={2}
                                        value={config.hero_card2_desc || ''}
                                        onChange={(e) => setConfig({ ...config, hero_card2_desc: e.target.value })}
                                        placeholder="Descripción"
                                        className="w-full p-1.5 bg-[#1A120C] border border-[#D9822B]/20 rounded text-[11px] text-[#A6988B]"
                                      />
                                    </div>

                                    {/* Card 3 */}
                                    <div className="bg-[#120B07] p-3 rounded-lg border border-[#D9822B]/30 space-y-2">
                                      <span className="text-[11px] font-bold text-[#E5C384] uppercase block">Tarjeta 3 (Garzones)</span>
                                      <input 
                                        type="text"
                                        value={config.hero_card3_title || ''}
                                        onChange={(e) => setConfig({ ...config, hero_card3_title: e.target.value })}
                                        placeholder="Título"
                                        className="w-full p-1.5 bg-[#1A120C] border border-[#D9822B]/20 rounded text-xs font-semibold text-[#FAF6F0]"
                                      />
                                      <textarea 
                                        rows={2}
                                        value={config.hero_card3_desc || ''}
                                        onChange={(e) => setConfig({ ...config, hero_card3_desc: e.target.value })}
                                        placeholder="Descripción"
                                        className="w-full p-1.5 bg-[#1A120C] border border-[#D9822B]/20 rounded text-[11px] text-[#A6988B]"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Live Complete Mini Preview of Hero Section */}
                            <div className="pt-2">
                              <label className="text-xs font-semibold text-[#A6988B] block mb-1.5">
                                🔍 Vista Previa en Vivo Completa de la Sección Hero:
                              </label>
                              <div className="bg-[#160F0C] border border-[#D9822B]/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                                <div className="relative z-10 space-y-3">
                                  
                                  {(config.show_hero_badge === 'true' || config.show_hero_badge === true) && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120B07]/80 border border-[#D9822B]/50 text-[11px] font-semibold text-[#E5C384]">
                                      🏆 {config.hero_badge_text || 'Banquetería Familiar en Santiago de Chile'}
                                    </div>
                                  )}

                                  <h2 className="font-sans text-2xl md:text-3xl font-bold leading-tight">
                                    <span className="bg-gradient-to-r from-[#FFF5E6] via-[#E5C384] to-[#D9822B] bg-clip-text text-transparent">
                                      {config.hero_title || 'El arte de comer rico'}
                                    </span>
                                  </h2>

                                  <p className="text-xs text-[#FAF6F0] max-w-lg mx-auto leading-relaxed bg-[#120B07]/70 p-2.5 rounded-xl border border-[#D9822B]/30">
                                    {config.hero_subtitle || 'Presentaciones gourmet artesanales, montajes decorativos y garzones para tus momentos inolvidables.'}
                                  </p>

                                  <div className="pt-1">
                                    <span className="btn-primary text-xs py-2 px-5 font-bold shadow-lg inline-flex items-center gap-1.5">
                                      <UtensilsCrossed className="w-3.5 h-3.5" /> Solicitar Servicio ➔
                                    </span>
                                  </div>

                                  {(config.show_hero_cards === 'true' || config.show_hero_cards === true) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 max-w-md mx-auto text-left">
                                      <div className="bg-[#120B07]/90 p-2 rounded-lg border border-[#D9822B]/30">
                                        <strong className="text-[11px] text-[#FAF6F0] block">{config.hero_card1_title || '3 Días de Anticipación'}</strong>
                                        <span className="text-[10px] text-[#A6988B] block truncate">{config.hero_card1_desc || 'Elaboración artesanal fresca.'}</span>
                                      </div>
                                      <div className="bg-[#120B07]/90 p-2 rounded-lg border border-[#D9822B]/30">
                                        <strong className="text-[11px] text-[#FAF6F0] block">{config.hero_card2_title || 'Retiro o Montaje Sábados'}</strong>
                                        <span className="text-[10px] text-[#A6988B] block truncate">{config.hero_card2_desc || 'Montajes los Sábados.'}</span>
                                      </div>
                                      <div className="bg-[#120B07]/90 p-2 rounded-lg border border-[#D9822B]/30">
                                        <strong className="text-[11px] text-[#FAF6F0] block">{config.hero_card3_title || 'Opción Garzones'}</strong>
                                        <span className="text-[10px] text-[#A6988B] block truncate">{config.hero_card3_desc || 'Cálculo de personal.'}</span>
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                        {/* ACCORDION 4: SECCIÓN ¿QUIÉNES SOMOS? (HISTORIA Y FAMILIA) */}
                        <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                          <button
                            type="button"
                            onClick={() => toggleAccordion('about')}
                            className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Sección "¿Quiénes Somos?" (Historia y Familia)</h6>
                                <p className="text-[11px] text-[#A6988B]">Modifica la foto, la historia familiar, párrafos y visibilidad de la sección.</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#E5C384]">
                                {openAccordions.about ? 'Contraer' : 'Desplegar'}
                              </span>
                              {openAccordions.about ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                            </div>
                          </button>

                          {openAccordions.about && (
                            <div className="p-5 border-t border-[#D9822B]/20 space-y-5">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-xs text-[#A6988B]">Configura los contenidos de la historia familiar o su visibilidad:</span>
                                <button
                                  type="button"
                                  onClick={() => setConfig(prev => ({
                                    ...prev,
                                    show_about_section: 'true',
                                    about_badge_text: 'Nuestra Historia & Familia',
                                    about_title: '¿Quiénes Somos?',
                                    about_quote: '"Somos la familia Quilodrán y nos encanta dar una experiencia gastronómica acogedora. Orgullosamente de San Bernardo."',
                                    about_paragraph1: 'Lo que comenzó en nuestra propia cocina como el amor por reunir a nuestros seres queridos en torno a la mesa, hoy se transforma en Banquetería Lina. Creemos firmemente que la buena mesa no es solo comida: es empatía, calidez y momentos inolvidables compartidos con las personas que más quieres.',
                                    about_paragraph2: 'Cada empanadita horneada al punto, cada tabla gourmet montada a mano y cada estación de café lleva el sello de dedicación de nuestra familia. Nos encargamos personalmente de cada banquete para que tú solo te dediques a disfrutar como un anfitrión radiante.',
                                    about_image_url: '/images/estacion_coffee.jpg'
                                  }))}
                                  className="text-xs text-[#E5C384] hover:underline transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw className="w-3 h-3" /> Restablecer Sección por Defecto
                                </button>
                              </div>

                              <div className="space-y-4">
                                
                                {/* Visibilidad de la Sección */}
                                <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/20 flex items-center justify-between">
                                  <div>
                                    <h6 className="text-xs font-bold text-[#E5C384]">Visibilidad de la Sección en la Portada</h6>
                                    <p className="text-[11px] text-[#A6988B]">Puedes mostrar u ocultar la sección de "¿Quiénes Somos?" en el inicio.</p>
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={config.show_about_section === 'true' || config.show_about_section === true}
                                      onChange={(e) => setConfig({ ...config, show_about_section: e.target.checked ? 'true' : 'false' })}
                                      className="w-4 h-4 accent-[#D9822B] rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-[#FAF6F0]">
                                      {(config.show_about_section === 'true' || config.show_about_section === true) ? '👁️ Visible' : '🙈 Oculta'}
                                    </span>
                                  </label>
                                </div>

                                {(config.show_about_section === 'true' || config.show_about_section === true) && (
                                  <>
                                    {/* Imagen de la Sección */}
                                    <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/20 space-y-3">
                                      <label className="text-xs font-bold text-[#FAF6F0] block">
                                        Imagen Destacada de la Sección (Familia / Estación Gourmet)
                                      </label>

                                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                        <div className="sm:col-span-4 text-center">
                                          <div className="w-full h-32 rounded-xl overflow-hidden border border-[#D9822B]/40 bg-[#120B07] flex items-center justify-center">
                                            {config.about_image_url ? (
                                              <img 
                                                src={config.about_image_url} 
                                                alt="Vista Previa Quiénes Somos" 
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <span className="text-xs text-[#A6988B]">Sin imagen</span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="sm:col-span-8 space-y-2">
                                          <div
                                            onDragOver={(e) => { e.preventDefault(); setIsAboutDragging(true); }}
                                            onDragLeave={() => setIsAboutDragging(false)}
                                            onDrop={(e) => {
                                              e.preventDefault();
                                              setIsAboutDragging(false);
                                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                handleAboutImageFileSelect(e.dataTransfer.files[0]);
                                              }
                                            }}
                                            onClick={() => aboutImageFileInputRef.current?.click()}
                                            className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                                              isAboutDragging 
                                                ? 'border-[#D9822B] bg-[#D9822B]/20' 
                                                : 'border-[#D9822B]/30 bg-[#120B07] hover:border-[#D9822B]/60'
                                            }`}
                                          >
                                            <input 
                                              type="file"
                                              ref={aboutImageFileInputRef}
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => e.target.files && handleAboutImageFileSelect(e.target.files[0])}
                                            />
                                            <Upload className="w-5 h-5 text-[#E5C384] mx-auto mb-1" />
                                            <p className="text-xs font-semibold text-[#FAF6F0]">Clic para subir una nueva imagen o arrastra un archivo</p>
                                          </div>

                                          <div>
                                            <input 
                                              type="text"
                                              value={config.about_image_url || ''}
                                              onChange={(e) => setConfig({ ...config, about_image_url: e.target.value })}
                                              placeholder="URL de la imagen (Ej: /images/estacion_coffee.jpg)"
                                              className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs font-mono text-[#FAF6F0]"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Campos de Texto */}
                                    <div className="bg-[#1A120C] p-4 rounded-xl border border-[#D9822B]/20 space-y-3">
                                      
                                      <div>
                                        <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                          Insignia Superior (Badge Label)
                                        </label>
                                        <input 
                                          type="text"
                                          value={config.about_badge_text || ''}
                                          onChange={(e) => setConfig({ ...config, about_badge_text: e.target.value })}
                                          placeholder="Ej: Nuestra Historia & Familia"
                                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-semibold text-[#E5C384]"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                          Título Principal de la Sección
                                        </label>
                                        <input 
                                          type="text"
                                          value={config.about_title || ''}
                                          onChange={(e) => setConfig({ ...config, about_title: e.target.value })}
                                          placeholder="Ej: ¿Quiénes Somos?"
                                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-sans font-bold text-[#FAF6F0]"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                          Frase / Cita Destacada (Cursiva)
                                        </label>
                                        <textarea 
                                          rows={2}
                                          value={config.about_quote || ''}
                                          onChange={(e) => setConfig({ ...config, about_quote: e.target.value })}
                                          placeholder="Ej: Somos la familia Quilodrán..."
                                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs font-sans italic text-[#E5C384]"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                          Párrafo 1 (Historia Inicial)
                                        </label>
                                        <textarea 
                                          rows={3}
                                          value={config.about_paragraph1 || ''}
                                          onChange={(e) => setConfig({ ...config, about_paragraph1: e.target.value })}
                                          placeholder="Ej: Lo que comenzó en nuestra propia cocina..."
                                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-bold text-[#FAF6F0] block mb-1">
                                          Párrafo 2 (Compromiso y Dedicación)
                                        </label>
                                        <textarea 
                                          rows={3}
                                          value={config.about_paragraph2 || ''}
                                          onChange={(e) => setConfig({ ...config, about_paragraph2: e.target.value })}
                                          placeholder="Ej: Cada empanadita horneada al punto..."
                                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-lg text-xs text-[#FAF6F0]"
                                        />
                                      </div>
                                    </div>

                                    {/* Vista Previa en Vivo de Quiénes Somos */}
                                    <div className="pt-2">
                                      <label className="text-xs font-semibold text-[#A6988B] block mb-1.5">
                                        🔍 Vista Previa en Vivo de la Sección ¿Quiénes Somos?:
                                      </label>
                                      <div className="bg-[#160F0C] border border-[#D9822B]/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden text-left">
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                          <div className="sm:col-span-4">
                                            <img 
                                              src={config.about_image_url || "/images/estacion_coffee.jpg"} 
                                              alt="Vista previa" 
                                              className="w-full h-32 object-cover rounded-xl border border-[#D9822B]/30"
                                            />
                                          </div>
                                          <div className="sm:col-span-8 space-y-2">
                                            <span className="text-[10px] font-bold text-[#E5C384] uppercase tracking-widest block">
                                              ❤️ {config.about_badge_text || 'Nuestra Historia & Familia'}
                                            </span>
                                            <h4 className="font-sans text-lg font-bold text-[#FAF6F0]">
                                              {config.about_title || '¿Quiénes Somos?'}
                                            </h4>
                                            <p className="text-[11px] font-sans text-[#E5C384] italic truncate">
                                              {config.about_quote}
                                            </p>
                                            <p className="text-[11px] text-[#A6988B] line-clamp-2">
                                              {config.about_paragraph1}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}

                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                    
                    {/* CATEGORY: LIMITS & FEES ACCORDION */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'limits') && (
                      <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleAccordion('limits')}
                          className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                              <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                              <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Límites y Tarifas del Servicio</h6>
                              <p className="text-[11px] text-[#A6988B]">Tarifa por garzón, mínimo de compra y tope de porciones diarias.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#E5C384]">
                              {openAccordions.limits ? 'Contraer' : 'Desplegar'}
                            </span>
                            {openAccordions.limits ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                          </div>
                        </button>

                        {openAccordions.limits && (
                          <div className="p-5 border-t border-[#D9822B]/20 space-y-4">
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
                          </div>
                        )}
                      </div>
                    )}

                    {/* CATEGORY: CONTACT & BUSINESS HOURS ACCORDION */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'contact') && (
                      <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleAccordion('contact')}
                          className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                              <Phone className="w-5 h-5" />
                            </div>
                            <div>
                              <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Datos de Contacto y Horarios de Atención</h6>
                              <p className="text-[11px] text-[#A6988B]">Teléfono/WhatsApp oficial, correo público y horario de atención.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#E5C384]">
                              {openAccordions.contact ? 'Contraer' : 'Desplegar'}
                            </span>
                            {openAccordions.contact ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                          </div>
                        </button>

                        {openAccordions.contact && (
                          <div className="p-5 border-t border-[#D9822B]/20 space-y-4">
                            {/* Contact Phone / WhatsApp Input */}
                            <div className="space-y-2 pb-4 border-b border-[#D9822B]/20">
                              <div className="flex justify-between items-center">
                                <label className="font-bold text-sm text-[#FAF6F0] block">Teléfono / WhatsApp Oficial de Contacto</label>
                                <span className="text-xs font-mono text-[#25D366] font-semibold">{config.contact_phone}</span>
                              </div>
                              <p className="text-xs text-[#A6988B]">Número visible en la sección de Contacto. Habilita el enlace directo a WhatsApp.</p>
                              <input 
                                type="text"
                                value={config.contact_phone}
                                onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
                                placeholder="Ej: +56 9 3465 6961"
                                className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                              />
                            </div>

                            {/* Contact Email Input */}
                            <div className="space-y-2 pb-4 border-b border-[#D9822B]/20">
                              <div className="flex justify-between items-center">
                                <label className="font-bold text-sm text-[#FAF6F0] block">Correo Electrónico Oficial de Contacto</label>
                                <span className="text-xs font-mono text-[#E5C384] font-semibold">{config.contact_email}</span>
                              </div>
                              <p className="text-xs text-[#A6988B]">Correo desplegado públicamente en la página de Contacto.</p>
                              <input 
                                type="email"
                                value={config.contact_email}
                                onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                                placeholder="Ej: contacto@banqueterialina.cl"
                                className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                              />
                            </div>

                            {/* Business Hours Input */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="font-bold text-sm text-[#FAF6F0] block">Días y Horario de Atención</label>
                                <span className="text-xs font-mono text-[#E5C384] font-semibold">{config.business_hours}</span>
                              </div>
                              <p className="text-xs text-[#A6988B]">Horario de atención oficial que se exhibe a los clientes en la sección de Contacto.</p>
                              <input 
                                type="text"
                                value={config.business_hours}
                                onChange={(e) => setConfig({ ...config, business_hours: e.target.value })}
                                placeholder="Ej: Lunes a Domingo de 09:00 a 19:00 hrs"
                                className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CATEGORY: TIME SLOTS ACCORDION */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'time_slots') && (
                      <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleAccordion('timeSlots')}
                          className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Bloques Horarios Seleccionables para Clientes</h6>
                              <p className="text-[11px] text-[#A6988B]">Rangos de horas elegibles en el Checkout para entregas y retiros.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#E5C384]">
                              {openAccordions.timeSlots ? 'Contraer' : 'Desplegar'}
                            </span>
                            {openAccordions.timeSlots ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                          </div>
                        </button>

                        {openAccordions.timeSlots && (
                          <div className="p-5 border-t border-[#D9822B]/20 space-y-3">
                            <p className="text-xs text-[#A6988B]">
                              Configura los bloques de horario de entrega o retiro que Lina y sus clientes podrán elegir en el Checkout. Agrega nuevos o elimina existentes según la disponibilidad de trabajo.
                            </p>
                            
                            <div className="flex flex-wrap gap-2 pt-1">
                              {(config.time_slots ? config.time_slots.split(',').map(s => s.trim()).filter(Boolean) : []).map((slot, idx) => (
                                <span 
                                  key={idx} 
                                  className="bg-[#120B07] text-[#FAF6F0] font-mono text-xs px-3 py-1.5 rounded-xl border border-[#D9822B]/40 flex items-center gap-2 group hover:border-[#D9822B]"
                                >
                                  <span>{slot.includes('hrs') ? slot : `${slot} hrs`}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentList = config.time_slots.split(',').map(s => s.trim()).filter(Boolean);
                                      const newList = currentList.filter((_, i) => i !== idx);
                                      setConfig({ ...config, time_slots: newList.join(', ') });
                                    }}
                                    className="text-[#A6988B] hover:text-red-400 font-bold transition-colors ml-1 text-sm cursor-pointer"
                                    title="Eliminar bloque horario"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="text"
                                id="newSlotInput"
                                placeholder="Ej: 18:00 - 20:00"
                                className="flex-1 px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.target.value.trim();
                                    if (val) {
                                      const currentList = config.time_slots ? config.time_slots.split(',').map(s => s.trim()).filter(Boolean) : [];
                                      if (!currentList.includes(val)) {
                                        currentList.push(val);
                                        setConfig({ ...config, time_slots: currentList.join(', ') });
                                      }
                                      e.target.value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('newSlotInput');
                                  if (input && input.value.trim()) {
                                    const val = input.value.trim();
                                    const currentList = config.time_slots ? config.time_slots.split(',').map(s => s.trim()).filter(Boolean) : [];
                                    if (!currentList.includes(val)) {
                                      currentList.push(val);
                                      setConfig({ ...config, time_slots: currentList.join(', ') });
                                    }
                                    input.value = '';
                                  }
                                }}
                                className="btn-secondary text-xs py-2.5 px-3.5 flex items-center gap-1 shrink-0 font-bold cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-[#E5C384]" /> Agregar Horario
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CATEGORY: TERMS & CONDITIONS ACCORDION */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'terms') && (
                      <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleAccordion('terms')}
                          className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Términos y Condiciones Oficiales (Editor Enriquecido)</h6>
                              <p className="text-[11px] text-[#A6988B]">Edita el contenido completo de las políticas y términos del sitio.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#E5C384]">
                              {openAccordions.terms ? 'Contraer' : 'Desplegar'}
                            </span>
                            {openAccordions.terms ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                          </div>
                        </button>

                        {openAccordions.terms && (
                          <div className="p-5 border-t border-[#D9822B]/20 space-y-3">
                            <RichTextEditor 
                              value={config.terms_and_conditions || ''} 
                              onChange={(newVal) => setConfig(prev => ({ ...prev, terms_and_conditions: newVal }))} 
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* COMMUNE MANAGEMENT & DELIVERY FEES ACCORDION */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'limits') && (
                      <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleAccordion('communes')}
                          className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Cobertura de Despacho y Tarifas por Comuna</h6>
                              <p className="text-[11px] text-[#A6988B]">Administra comunas habilitadas y valores del flete de envío.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#E5C384]">
                              {openAccordions.communes ? 'Contraer' : 'Desplegar'}
                            </span>
                            {openAccordions.communes ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                          </div>
                        </button>

                        {openAccordions.communes && (
                          <div className="p-5 border-t border-[#D9822B]/20 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <p className="text-xs text-[#A6988B]">
                                  Administra las comunas de la Región Metropolitana con despacho habilitado y el valor del envío asociado.
                                </p>
                              </div>

                              <button 
                                type="button"
                                onClick={() => {
                                  setCommuneFormError('');
                                  setNewCommuneName('');
                                  setNewCommuneFee('4000');
                                  setIsCreateCommuneOpen(true);
                                }}
                                className="btn-primary text-xs py-2 px-3 font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                              >
                                <Plus className="w-4 h-4" /> Agregar Comuna
                              </button>
                            </div>

                            {communeSuccessMsg && (
                              <div className="bg-emerald-500/15 border border-emerald-500/40 p-3 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{communeSuccessMsg}</span>
                              </div>
                            )}

                            <div className="bg-[#120B07] rounded-xl border border-[#D9822B]/20 overflow-hidden shadow-lg">
                              <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-left text-xs text-[#FAF6F0]">
                                  <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider text-[11px] border-b border-[#D9822B]/20 sticky top-0 z-10">
                                    <tr>
                                      <th className="p-3">Comuna</th>
                                      <th className="p-3">Tarifa de Despacho (CLP)</th>
                                      <th className="p-3">Estado Cobertura</th>
                                      <th className="p-3 text-right">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#D9822B]/10">
                                    {adminCommunes.length === 0 ? (
                                      <tr>
                                        <td colSpan={4} className="p-6 text-center text-[#A6988B] italic">
                                          Cargando listado de comunas...
                                        </td>
                                      </tr>
                                    ) : (
                                      adminCommunes.map(c => (
                                        <tr key={c.id} className="hover:bg-[#1A120C]/60 transition-colors">
                                          <td className="p-3 font-bold text-[#FAF6F0]">
                                            📍 {c.name}
                                          </td>
                                          <td className="p-3 font-mono font-bold text-[#E5C384]">
                                            +${Number(c.delivery_fee || c.fee || 0).toLocaleString('es-CL')} CLP
                                          </td>
                                          <td className="p-3">
                                            <button 
                                              type="button"
                                              onClick={() => handleToggleCommuneActive(c)}
                                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                                c.is_active 
                                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                                                  : 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/30'
                                              }`}
                                            >
                                              {c.is_active ? '✓ Habilitada' : '⛔ Deshabilitada'}
                                            </button>
                                          </td>
                                          <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                              <button 
                                                type="button"
                                                onClick={() => {
                                                  setEditingCommune(c);
                                                  setEditCommuneName(c.name);
                                                  setEditCommuneFee(c.delivery_fee || c.fee || '4000');
                                                  setEditCommuneActive(c.is_active);
                                                  setCommuneFormError('');
                                                }}
                                                className="p-1.5 bg-[#1A120C] hover:bg-[#D9822B]/20 text-[#E5C384] rounded-lg border border-[#D9822B]/30 transition-colors cursor-pointer"
                                                title="Editar tarifa o nombre de comuna"
                                              >
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => handleDeleteCommune(c)}
                                                className="p-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 rounded-lg border border-red-500/30 transition-colors cursor-pointer"
                                                title="Eliminar comuna"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONFIG HISTORY AUDIT LOG ACCORDION */}
                    {(settingsSubCategory === 'all' || settingsSubCategory === 'audit') && (
                      <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/30 overflow-hidden transition-all shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleAccordion('auditHistory')}
                          className="w-full flex items-center justify-between p-4 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                              <History className="w-5 h-5" />
                            </div>
                            <div>
                              <h6 className="font-sans font-bold text-sm text-[#FAF6F0]">Historial de Auditoría de Parámetros del Negocio</h6>
                              <p className="text-[11px] text-[#A6988B]">Registro inmutable de modificaciones en tarifas y configuraciones ({configHistory.length} registros).</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#E5C384]">
                              {openAccordions.auditHistory ? 'Contraer' : 'Desplegar'}
                            </span>
                            {openAccordions.auditHistory ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                          </div>
                        </button>

                        {openAccordions.auditHistory && (
                          <div className="p-5 border-t border-[#D9822B]/20 space-y-3">
                            <p className="text-xs text-[#A6988B]">
                              Registro inmutable para prevención de alteraciones no autorizadas en tarifas y límites del sistema.
                            </p>

                            {configHistory.length === 0 ? (
                              <p className="text-xs text-[#A6988B] italic text-center py-6 bg-[#120B07] rounded-xl border border-[#D9822B]/10">
                                Sin modificaciones registradas en los parámetros operativos aún.
                              </p>
                            ) : (
                              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                {configHistory.map(item => (
                                  <div key={item.id} className="bg-[#120B07] p-3.5 rounded-xl border border-[#D9822B]/20 space-y-1.5 hover:border-[#D9822B]/50 transition-all text-xs">
                                    <div className="flex justify-between items-center border-b border-[#D9822B]/15 pb-1.5">
                                      <span className="font-bold text-[#E5C384] flex items-center gap-1.5 text-[11px]">
                                        👤 <strong className="text-[#FAF6F0]">{item.modified_by || 'Administración'}</strong>
                                      </span>
                                      <span className="font-mono text-[10px] text-[#A6988B]">
                                        {new Date(item.timestamp).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                                      </span>
                                    </div>
                                    <p className="text-[#FAF6F0] font-mono text-[11px] leading-relaxed bg-[#1A120C] p-2 rounded-lg border border-[#D9822B]/10">
                                      🔧 {item.changes_summary}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SAVE BUTTON FOR CONFIG */}
                    {settingsSubCategory !== 'audit' && (
                      <button 
                        onClick={handleSaveConfig}
                        disabled={isSavingConfig}
                        className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 mt-4 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        {isSavingConfig ? 'Guardando Parámetros...' : 'Guardar Parámetros Operativos'}
                      </button>
                    )}

                  </div>
                </div>
              )}

              {/* VISITS ANALYTICS & TRAFFIC COUNTER TAB */}
              {activeTab === 'visits' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9822B]/20 pb-4">
                    <div>
                      <h4 className="font-sans text-xl font-bold text-[#E5C384] flex items-center gap-2">
                        <Eye className="w-6 h-6 text-[#D9822B]" />
                        Contador de Visitas & Analíticas de Tráfico Web
                      </h4>
                      <p className="text-xs text-[#A6988B] mt-0.5">
                        Estadísticas en tiempo real de visitas a la plataforma, visitantes únicos y auditoría de accesos.
                      </p>
                    </div>
                    <button 
                      onClick={fetchAdminVisits}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#E5C384]" /> Actualizar Métricas
                    </button>
                  </div>

                  {/* 3 KPI Cards for Traffic */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card p-4 rounded-xl border border-[#D9822B]/30 bg-[#120B07] space-y-2">
                      <span className="text-xs font-semibold text-[#A6988B] flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#E5C384]" /> Visitas Acumuladas
                      </span>
                      <p className="text-2xl font-bold font-mono text-[#E5C384]">
                        {(visitData.total_visits || 0).toLocaleString('es-CL')}
                      </p>
                      <span className="text-[10px] text-[#A6988B]">Total histórico real</span>
                    </div>

                    <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-[#120B07] space-y-2">
                      <span className="text-xs font-semibold text-[#A6988B] flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Visitas de Hoy
                      </span>
                      <p className="text-2xl font-bold font-mono text-emerald-400">
                        {(visitData.visits_today || 0).toLocaleString('es-CL')}
                      </p>
                      <span className="text-[10px] text-[#A6988B]">Tráfico del día en curso</span>
                    </div>

                    <div className="glass-card p-4 rounded-xl border border-blue-500/30 bg-[#120B07] space-y-2">
                      <span className="text-xs font-semibold text-[#A6988B] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-400" /> Visitantes Únicos
                      </span>
                      <p className="text-2xl font-bold font-mono text-blue-400">
                        {(visitData.total_uniques || 0).toLocaleString('es-CL')}
                      </p>
                      <span className="text-[10px] text-[#A6988B]">Dispositivos / Direcciones IP</span>
                    </div>
                  </div>

                  {/* TRAFFIC EVOLUTION CHART SECTION */}
                  <div className="glass-card p-5 rounded-xl border border-[#D9822B]/30 bg-[#120B07] space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D9822B]/20 pb-3">
                      <div>
                        <h5 className="font-sans font-bold text-sm text-[#E5C384] flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#D9822B]" />
                          Gráfico de Evolución de Visitas
                        </h5>
                        <p className="text-[11px] text-[#A6988B]">
                          {visitChartPeriod === 'daily_7' && 'Métricas de los últimos 7 días.'}
                          {visitChartPeriod === 'monthly_12' && 'Métricas de los últimos 12 meses.'}
                          {visitChartPeriod === 'yearly' && 'Métricas históricas por año.'}
                        </p>
                      </div>

                      {/* Period Selector Filter Buttons */}
                      <div className="flex items-center gap-1 bg-[#1A120C] p-1 rounded-xl border border-[#D9822B]/30">
                        <button
                          type="button"
                          onClick={() => setVisitChartPeriod('daily_7')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            visitChartPeriod === 'daily_7'
                              ? 'bg-[#D9822B] text-white shadow-md'
                              : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#120B07]'
                          }`}
                        >
                          7 Días
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisitChartPeriod('monthly_12')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            visitChartPeriod === 'monthly_12'
                              ? 'bg-[#D9822B] text-white shadow-md'
                              : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#120B07]'
                          }`}
                        >
                          Mensual
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisitChartPeriod('yearly')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            visitChartPeriod === 'yearly'
                              ? 'bg-[#D9822B] text-white shadow-md'
                              : 'text-[#A6988B] hover:text-[#FAF6F0] hover:bg-[#120B07]'
                          }`}
                        >
                          Anual
                        </button>
                      </div>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-end gap-4 text-[11px] font-semibold">
                      <span className="flex items-center gap-1.5 text-[#E5C384]">
                        <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#D9822B] to-[#E5C384] inline-block"></span>
                        Visitas Totales
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
                        Visitantes Únicos
                      </span>
                    </div>

                    {/* Interactive SVG Line Chart Container */}
                    {(() => {
                      const items = visitData.chart_data ? (visitData.chart_data[visitChartPeriod] || []) : [];
                      const maxVal = Math.max(...items.map(i => Math.max(i.visits || 0, i.uniques || 0)), 5);
                      
                      const svgWidth = 700;
                      const svgHeight = 220;
                      const paddingX = 45;
                      const paddingTop = 25;
                      const paddingBottom = 35;
                      const graphWidth = svgWidth - paddingX * 2;
                      const graphHeight = svgHeight - paddingTop - paddingBottom;

                      const getCoords = (idx, val) => {
                        const x = items.length > 1 
                          ? paddingX + (idx / (items.length - 1)) * graphWidth 
                          : svgWidth / 2;
                        const y = paddingTop + graphHeight - (val / maxVal) * graphHeight;
                        return { x, y };
                      };

                      // Generate SVG path for visits
                      const visitsPoints = items.map((item, idx) => getCoords(idx, item.visits || 0));
                      const visitsPath = visitsPoints.length > 0
                        ? visitsPoints.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')
                        : '';
                      
                      const visitsAreaPath = visitsPoints.length > 0
                        ? `${visitsPath} L ${visitsPoints[visitsPoints.length - 1].x} ${paddingTop + graphHeight} L ${visitsPoints[0].x} ${paddingTop + graphHeight} Z`
                        : '';

                      // Generate SVG path for uniques
                      const uniquesPoints = items.map((item, idx) => getCoords(idx, item.uniques || 0));
                      const uniquesPath = uniquesPoints.length > 0
                        ? uniquesPoints.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')
                        : '';

                      const uniquesAreaPath = uniquesPoints.length > 0
                        ? `${uniquesPath} L ${uniquesPoints[uniquesPoints.length - 1].x} ${paddingTop + graphHeight} L ${uniquesPoints[0].x} ${paddingTop + graphHeight} Z`
                        : '';

                      return (
                        <div className="bg-[#1A120C]/80 border border-[#D9822B]/20 p-4 rounded-xl space-y-2 relative overflow-hidden">
                          {items.length === 0 ? (
                            <div className="h-56 flex items-center justify-center text-xs text-[#A6988B] italic">
                              Cargando métricas del período...
                            </div>
                          ) : (
                            <div className="relative w-full overflow-x-auto">
                              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px] overflow-visible">
                                <defs>
                                  <linearGradient id="gradientVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#D9822B" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#D9822B" stopOpacity="0.0" />
                                  </linearGradient>
                                  <linearGradient id="gradientUniques" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>

                                {/* Horizontal Grid Lines & Y-Axis Labels */}
                                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                                  const yVal = paddingTop + graphHeight * (1 - pct);
                                  const numVal = Math.round(maxVal * pct);
                                  return (
                                    <g key={i}>
                                      <line 
                                        x1={paddingX} 
                                        y1={yVal} 
                                        x2={svgWidth - paddingX} 
                                        y2={yVal} 
                                        stroke="#D9822B" 
                                        strokeOpacity="0.15" 
                                        strokeDasharray={i === 0 || i === 4 ? undefined : "3 3"} 
                                      />
                                      <text 
                                        x={paddingX - 10} 
                                        y={yVal + 3} 
                                        fill="#A6988B" 
                                        fontSize="9" 
                                        fontFamily="monospace" 
                                        textAnchor="end"
                                      >
                                        {numVal}
                                      </text>
                                    </g>
                                  );
                                })}

                                {/* Area Fills */}
                                {visitsAreaPath && <path d={visitsAreaPath} fill="url(#gradientVisits)" />}
                                {uniquesAreaPath && <path d={uniquesAreaPath} fill="url(#gradientUniques)" />}

                                {/* Lines */}
                                {uniquesPath && (
                                  <path 
                                    d={uniquesPath} 
                                    fill="none" 
                                    stroke="#3B82F6" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                  />
                                )}
                                {visitsPath && (
                                  <path 
                                    d={visitsPath} 
                                    fill="none" 
                                    stroke="#E5C384" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                  />
                                )}

                                {/* Data Points (Nodes & Hover Labels) */}
                                {items.map((item, idx) => {
                                  const ptVisits = visitsPoints[idx];
                                  const ptUniques = uniquesPoints[idx];
                                  return (
                                    <g key={idx} className="group cursor-pointer">
                                      {/* Vertical hover guide line */}
                                      <line 
                                        x1={ptVisits.x} 
                                        y1={paddingTop} 
                                        x2={ptVisits.x} 
                                        y2={paddingTop + graphHeight} 
                                        stroke="#D9822B" 
                                        strokeOpacity="0" 
                                        className="group-hover:stroke-opacity-40 transition-opacity" 
                                        strokeDasharray="2 2" 
                                      />

                                      {/* Uniques Point Circle */}
                                      <circle 
                                        cx={ptUniques.x} 
                                        cy={ptUniques.y} 
                                        r="4" 
                                        fill="#120B07" 
                                        stroke="#3B82F6" 
                                        strokeWidth="2" 
                                        className="transition-transform group-hover:r-6"
                                      />

                                      {/* Visits Point Circle */}
                                      <circle 
                                        cx={ptVisits.x} 
                                        cy={ptVisits.y} 
                                        r="5" 
                                        fill="#D9822B" 
                                        stroke="#FAF6F0" 
                                        strokeWidth="2" 
                                        className="transition-transform group-hover:r-7"
                                      />

                                      {/* Value label on node if > 0 */}
                                      {(item.visits || 0) > 0 && (
                                        <text 
                                          x={ptVisits.x} 
                                          y={ptVisits.y - 10} 
                                          fill="#E5C384" 
                                          fontSize="9" 
                                          fontWeight="bold" 
                                          fontFamily="monospace" 
                                          textAnchor="middle"
                                        >
                                          {item.visits}
                                        </text>
                                      )}

                                      {/* X Axis Date Label */}
                                      <text 
                                        x={ptVisits.x} 
                                        y={svgHeight - 8} 
                                        fill="#A6988B" 
                                        fontSize="10" 
                                        fontWeight="600" 
                                        textAnchor="middle" 
                                        className="group-hover:fill-[#E5C384] transition-colors"
                                      >
                                        {item.label}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Recent Access Logs Table */}
                  <div className="glass-card p-5 rounded-xl border border-[#D9822B]/20 bg-[#120B07] space-y-3">
                    <div className="flex justify-between items-center border-b border-[#D9822B]/15 pb-2">
                      <h5 className="font-sans font-bold text-sm text-[#E5C384] flex items-center gap-2">
                        <History className="w-4 h-4 text-[#D9822B]" />
                        Registro Reciente de Tráfico y Navegación (Últimos Accesos)
                      </h5>
                      <span className="text-[11px] text-[#A6988B] font-mono">
                        {visitData.logs?.length || 0} registros recientes
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#D9822B]/20 max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#1A120C] text-[#E5C384] border-b border-[#D9822B]/20 sticky top-0">
                          <tr>
                            <th className="p-2.5 font-bold">Fecha / Hora</th>
                            <th className="p-2.5 font-bold">Dirección IP</th>
                            <th className="p-2.5 font-bold">Página / Ruta</th>
                            <th className="p-2.5 font-bold">Navegador / Dispositivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D9822B]/10">
                          {!visitData.logs || visitData.logs.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="p-6 text-center text-[#A6988B] italic">
                                Sin registros de tráfico web aún.
                              </td>
                            </tr>
                          ) : (
                            visitData.logs.map((log, idx) => (
                              <tr key={log.id || idx} className="hover:bg-[#1A120C]/60 transition-colors">
                                <td className="p-2.5 font-mono text-[11px] text-[#FAF6F0] whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'medium' })}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-[#E5C384]">
                                  {log.ip_address || '127.0.0.1'}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-[#FAF6F0]">
                                  <span className="bg-[#1A120C] px-2 py-0.5 rounded border border-[#D9822B]/20">
                                    {log.path || '/'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-[11px] text-[#A6988B] truncate max-w-xs" title={log.user_agent}>
                                  {log.user_agent || 'Navegador Web'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* CALENDAR & BLOCKED DATES TAB (LEFT/RIGHT SPLIT VIEW) */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-sans text-xl font-bold text-[#E5C384]">Gestión de Calendario: Bloqueo de Fechas & Reservas de Clientes</h4>
                    <p className="text-xs text-[#A6988B] mt-0.5">
                      Bloquea días específicos o períodos completos para impedir nuevos pedidos. Revisa en paralelo las fechas ya agendadas por pedidos de clientes.
                    </p>
                  </div>

                  {/* Left / Right Split View Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* LEFT PANEL: ADMIN BLOCKED DATES (ACCORDION) */}
                    <div className="glass-card overflow-hidden border border-[#D9822B]/30 bg-[#1D150F] rounded-2xl shadow-lg transition-all">
                      <button
                        type="button"
                        onClick={() => toggleAccordion('blockDates')}
                        className="w-full flex items-center justify-between p-5 bg-[#120B07] hover:bg-[#1A120C] transition-colors cursor-pointer text-left border-b border-[#D9822B]/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#D9822B]/15 border border-[#D9822B]/30 text-[#E5C384]">
                            <CalendarX className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-sans font-bold text-sm text-[#E5C384]">Bloquear Fechas (Impedir Pedidos)</h5>
                            <p className="text-[11px] text-[#A6988B]">Selecciona fecha individual o período de inactividad</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#E5C384]">
                            {openAccordions.blockDates ? 'Contraer' : 'Desplegar'}
                          </span>
                          {openAccordions.blockDates ? <ChevronUp className="w-5 h-5 text-[#E5C384]" /> : <ChevronDown className="w-5 h-5 text-[#E5C384]" />}
                        </div>
                      </button>

                      {openAccordions.blockDates && (
                        <div className="p-5 space-y-5">
                          {blockMsg && (
                            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                              blockMsg.includes('exitosamente') || blockMsg.includes('liberada')
                                ? 'bg-green-950/40 border border-green-500/40 text-green-300'
                                : 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
                            }`}>
                              <AlertTriangle className="w-4 h-4 shrink-0 text-[#E5C384]" />
                              <span>{blockMsg}</span>
                            </div>
                          )}

                          {/* Block Form */}
                          <form onSubmit={handleBlockDatesSubmit} className="space-y-3.5 text-xs">
                            {/* Selector de Modo: Día Único vs Rango */}
                            <div className="flex gap-2 p-1 bg-[#120B07] rounded-xl border border-[#D9822B]/20">
                              <button
                                type="button"
                                onClick={() => setBlockMode('single')}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                                  blockMode === 'single'
                                    ? 'bg-[#D9822B] text-white font-bold shadow'
                                    : 'text-[#A6988B] hover:text-[#FAF6F0]'
                                }`}
                              >
                                📅 Día Único
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlockMode('range')}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                                  blockMode === 'range'
                                    ? 'bg-[#D9822B] text-white font-bold shadow'
                                    : 'text-[#A6988B] hover:text-[#FAF6F0]'
                                }`}
                              >
                                📆 Rango de Fechas
                              </button>
                            </div>

                            {blockMode === 'single' ? (
                              <div>
                                <label className="text-[#FAF6F0] font-semibold block mb-1">Seleccionar Fecha a Bloquear *</label>
                                <input
                                  type="date"
                                  required
                                  value={blockStartDate}
                                  onChange={(e) => setBlockStartDate(e.target.value)}
                                  className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                                />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[#FAF6F0] font-semibold block mb-1">Fecha Desde *</label>
                                  <input
                                    type="date"
                                    required
                                    value={blockStartDate}
                                    onChange={(e) => setBlockStartDate(e.target.value)}
                                    className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[#FAF6F0] font-semibold block mb-1">Fecha Hasta *</label>
                                  <input
                                    type="date"
                                    required
                                    value={blockEndDate}
                                    onChange={(e) => setBlockEndDate(e.target.value)}
                                    className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-[#A6988B] font-semibold block mb-1">Motivo del Bloqueo</label>
                              <input
                                type="text"
                                placeholder="Ej: Feriado / Vacaciones de Invierno / Mantención de Cocina"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/30 rounded-xl text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isBlocking}
                              className="w-full bg-[#D9822B] hover:bg-[#C06F1B] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-[#D9822B]/50 cursor-pointer"
                            >
                              <Lock className="w-4 h-4" />
                              {isBlocking ? 'Bloqueando Fecha...' : 'Bloquear Fecha(s) Seleccionada(s)'}
                            </button>
                          </form>

                          {/* Lista de Fechas Actualmente Bloqueadas */}
                          <div className="pt-4 border-t border-[#D9822B]/20 space-y-3">
                            <div className="flex justify-between items-center">
                              <h6 className="font-sans font-bold text-xs text-[#E5C384] uppercase tracking-wider">
                                Fechas Bloqueadas ({blockedDates.length})
                              </h6>
                              <span className="text-[10px] text-[#A6988B]">Click en "Liberar" para rehabilitar</span>
                            </div>

                            {blockedDates.length === 0 ? (
                              <p className="text-xs text-[#A6988B] italic text-center py-6 bg-[#120B07] rounded-xl border border-[#D9822B]/10">
                                No hay fechas bloqueadas actualmente por la administración.
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {blockedDates.map(bd => (
                                  <div key={bd.id} className="bg-[#120B07] p-3 rounded-xl border border-[#D9822B]/30 flex items-center justify-between gap-3 hover:border-[#D9822B]/60 transition-all">
                                    <div className="text-xs">
                                      <span className="font-mono font-bold text-[#E5C384] text-sm block">📅 {bd.date}</span>
                                      <span className="text-[11px] text-[#A6988B]">{bd.reason}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleUnlockDate(bd.id)}
                                      className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                                      title="Liberar fecha para volver a recibir pedidos"
                                    >
                                      <Unlock className="w-3.5 h-3.5" />
                                      Liberar Fecha
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT PANEL: RESERVED DATES FROM CUSTOMERS */}
                    <div className="glass-card p-6 space-y-5 border border-[#D9822B]/30 bg-[#1D150F] rounded-xl shadow-lg">
                      <div className="flex items-center gap-2.5 border-b border-[#D9822B]/20 pb-3">
                        <div className="p-2 bg-[#D9822B]/20 text-[#E5C384] rounded-lg border border-[#D9822B]/30">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-[#E5C384]">Fechas Reservadas por Pedidos</h5>
                          <p className="text-[11px] text-[#A6988B]">Eventos y despachos agendados por clientes</p>
                        </div>
                      </div>

                      {getReservedDatesGrouped().length === 0 ? (
                        <p className="text-xs text-[#A6988B] italic text-center py-12 bg-[#120B07] rounded-xl border border-[#D9822B]/10">
                          No hay fechas reservadas por pedidos activos aún.
                        </p>
                      ) : (
                        <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                          {getReservedDatesGrouped().map(grp => (
                            <div key={grp.date} className="bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/30 space-y-2.5 hover:border-[#D9822B]/60 transition-all">
                              <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-2">
                                <span className="font-mono font-bold text-sm text-[#E5C384]">
                                  📅 {grp.date}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D9822B]/20 text-[#FAF6F0] border border-[#D9822B]/40">
                                  {grp.ordersCount} {grp.ordersCount === 1 ? 'Pedido Agendado' : 'Pedidos Agendados'}
                                </span>
                              </div>

                              <div className="space-y-2 pt-1">
                                {grp.ordersList.map(ord => (
                                  <div key={ord.id} className="flex justify-between items-center text-xs bg-[#1A120C] p-2.5 rounded-lg border border-[#D9822B]/15">
                                    <div>
                                      <span className="font-mono text-[#E5C384] font-bold mr-2">{ord.code}</span>
                                      <span className="text-[#FAF6F0] font-semibold">{ord.client_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-[#A6988B] font-mono">{ord.service_type}</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        ord.status === 'CONFIRMADO' ? 'bg-green-500/20 text-green-400' : 'bg-[#D9822B]/20 text-[#E5C384]'
                                      }`}>
                                        {ord.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              )}

            {/* TAB: ADMIN USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#120B07] p-5 rounded-2xl border border-[#D9822B]/30 shadow-lg">
                  <div>
                    <h4 className="font-sans text-base font-bold text-[#E5C384] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#D9822B]" />
                      Gestión de Cuentas de Administrador
                    </h4>
                    <p className="text-xs text-[#A6988B] mt-0.5">
                      Crea, modifica o elimina accesos autorizados. Incluye datos atomizados, RUT verificado y contraseña de alta seguridad.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setAdminFormError('');
                      setNewAdminFirstName('');
                      setNewAdminLastNamePaternal('');
                      setNewAdminLastNameMaternal('');
                      setNewAdminRutBody('');
                      setNewAdminRutDv('');
                      setNewAdminCountry('Chile');
                      setNewAdminRegion('Región Metropolitana de Santiago');
                      setNewAdminCity('Santiago');
                      setNewAdminAddress('');
                      setNewAdminEmail('');
                      setNewAdminPassword('');
                      setIsCreateAdminOpen(true);
                    }}
                    className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Nuevo Administrador
                  </button>
                </div>

                {/* Table of Admin Users */}
                <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/20 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#FAF6F0]">
                      <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider text-[11px] border-b border-[#D9822B]/20">
                        <tr>
                          <th className="p-4">RUT (ID de Usuario)</th>
                          <th className="p-4">Nombre Completo</th>
                          <th className="p-4">Ubicación / Ciudad</th>
                          <th className="p-4">Dirección</th>
                          <th className="p-4">Correo Electrónico</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9822B]/10">
                        {adminUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#A6988B] italic">
                              Cargando cuentas de usuario administrador...
                            </td>
                          </tr>
                        ) : (
                          adminUsers.map(userItem => {
                            const isLinaProtected = userItem.is_protected || userItem.is_superadmin || userItem.username?.toLowerCase() === 'lina' || userItem.username?.toLowerCase() === 'admin' || userItem.id === 1;
                            const isCurrentAdminLina = currentUser?.username?.toLowerCase() === 'lina' || currentUser?.username?.toLowerCase() === 'admin' || currentUser?.is_superadmin;

                            return (
                              <tr key={userItem.id} className="hover:bg-[#1A120C]/60 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#E5C384]">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold text-xs border border-[#D9822B]/30 shrink-0">
                                      {(userItem.full_name || userItem.username || 'A').charAt(0).toUpperCase()}
                                    </span>
                                    <span>{userItem.formatted_rut || `${userItem.rut_body}-${userItem.rut_dv}`}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-semibold">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span>{userItem.full_name}</span>
                                    {isLinaProtected && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 shadow-sm shadow-amber-500/10">
                                        👑 Propietaria & Super Admin
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-[#A6988B]">
                                  {userItem.city || 'Santiago'}, {userItem.region || 'RM'} ({userItem.country || 'Chile'})
                                </td>
                                <td className="p-4 text-[#FAF6F0] font-mono text-[11px]">
                                  {userItem.address || 'Sin dirección registrada'}
                                </td>
                                <td className="p-4 text-[#A6988B] font-mono">{userItem.email || 'Sin correo'}</td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Edit Button */}
                                    {isLinaProtected && !isCurrentAdminLina ? (
                                      <button 
                                        disabled
                                        className="p-1.5 opacity-40 cursor-not-allowed text-[#A6988B] bg-[#1A120C] rounded-lg border border-gray-700/50"
                                        title="🔒 Solo la Propietaria Lina puede editar su propia cuenta"
                                      >
                                        <Lock className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          setEditingAdmin(userItem);
                                          setEditAdminFirstName(userItem.first_name || '');
                                          setEditAdminLastNamePaternal(userItem.last_name_paternal || '');
                                          setEditAdminLastNameMaternal(userItem.last_name_maternal || '');
                                          setEditAdminRutBody(userItem.rut_body || '');
                                          setEditAdminRutDv(userItem.rut_dv || '');
                                          setEditAdminCountry(userItem.country || 'Chile');
                                          setEditAdminRegion(userItem.region || 'Región Metropolitana de Santiago');
                                          setEditAdminCity(userItem.city || 'Santiago');
                                          setEditAdminAddress(userItem.address || '');
                                          setEditAdminEmail(userItem.email || '');
                                          setEditAdminPassword('');
                                          setAdminFormError('');
                                        }}
                                        className="p-1.5 bg-[#1A120C] hover:bg-[#D9822B]/20 text-[#E5C384] rounded-lg border border-[#D9822B]/30 transition-colors"
                                        title="Editar cuenta de administrador"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Delete Button */}
                                    {isLinaProtected ? (
                                      <button 
                                        disabled
                                        className="p-1.5 opacity-30 cursor-not-allowed text-amber-400 bg-amber-950/20 rounded-lg border border-amber-500/30"
                                        title="🛡️ La cuenta de la Propietaria Principal (Super Admin) Lina está inalterablemente protegida y no puede ser eliminada"
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleDeleteAdmin(userItem)}
                                        className="p-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                                        title="Eliminar cuenta"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DEDICATED AUDIT TRAIL & SECURITY LOGS */}
            {activeTab === 'audit' && (
              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                
                {/* Header & Stats Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120B07] p-5 rounded-2xl border border-[#D9822B]/30 shadow-lg">
                  <div>
                    <h4 className="font-sans text-lg font-bold text-[#E5C384] flex items-center gap-2">
                      <History className="w-5 h-5 text-[#D9822B]" />
                      Bitácora de Auditoría y Seguridad del Sistema
                    </h4>
                    <p className="text-xs text-[#A6988B] mt-0.5">
                      Registro inmutable de trazabilidad. Monitorea quién modificó estados de pedidos o alteró parámetros operativos del negocio.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 self-stretch md:self-auto justify-between">
                    <div className="px-3.5 py-2 rounded-xl bg-[#1A120C] border border-[#D9822B]/20 text-center">
                      <span className="text-[10px] text-[#A6988B] block">Total Registros</span>
                      <strong className="font-mono text-base text-[#E5C384]">{getFilteredAuditLogs().length}</strong>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#1A120C] border border-[#D9822B]/20 text-center">
                      <span className="text-[10px] text-[#A6988B] block">📦 Pedidos</span>
                      <strong className="font-mono text-base text-blue-400">
                        {getFilteredAuditLogs().filter(l => l.type === 'ORDER').length}
                      </strong>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#1A120C] border border-[#D9822B]/20 text-center">
                      <span className="text-[10px] text-[#A6988B] block">⚙️ Parámetros</span>
                      <strong className="font-mono text-base text-purple-400">
                        {getFilteredAuditLogs().filter(l => l.type === 'CONFIG').length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* FILTERS TOOLBAR: BUSQUEDA POR TEXTO, TIPO Y RANGO DE FECHAS */}
                <div className="bg-[#1D150F] p-4 rounded-2xl border border-[#D9822B]/30 space-y-3 shadow-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    
                    {/* Search Input */}
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Búsqueda (Admin, RUT, Motivo, Ítem)</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#A6988B] absolute left-3 top-2.5" />
                        <input 
                          type="text"
                          placeholder="Buscar por RUT, admin, motivo..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                        />
                      </div>
                    </div>

                    {/* Filter by Type */}
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Filtrar por Módulo</label>
                      <select 
                        value={auditTypeFilter}
                        onChange={(e) => setAuditTypeFilter(e.target.value)}
                        className="w-full p-2 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] font-semibold focus:outline-none focus:border-[#D9822B]"
                      >
                        <option value="ALL">Todos los Eventos (Pedidos + Parámetros)</option>
                        <option value="ORDERS">📦 Cambios en Pedidos</option>
                        <option value="CONFIG">⚙️ Cambios en Parámetros del Negocio</option>
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Período Fecha Desde</label>
                      <input 
                        type="date"
                        value={auditStartDate}
                        onChange={(e) => setAuditStartDate(e.target.value)}
                        className="w-full p-2 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Período Fecha Hasta</label>
                      <div className="flex gap-2">
                        <input 
                          type="date"
                          value={auditEndDate}
                          onChange={(e) => setAuditEndDate(e.target.value)}
                          className="w-full p-2 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                        />
                        {(auditSearch || auditTypeFilter !== 'ALL' || auditStartDate || auditEndDate) && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setAuditSearch('');
                              setAuditTypeFilter('ALL');
                              setAuditStartDate('');
                              setAuditEndDate('');
                            }}
                            className="p-2 bg-[#120B07] hover:bg-[#D9822B]/20 text-[#E5C384] border border-[#D9822B]/30 rounded-xl text-xs font-bold transition-all shrink-0"
                            title="Limpiar todos los filtros"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* AUDIT LOG TABLE / CARDS LIST */}
                <div className="bg-[#120B07] rounded-2xl border border-[#D9822B]/20 overflow-hidden shadow-xl">
                  {getFilteredAuditLogs().length === 0 ? (
                    <div className="p-12 text-center text-[#A6988B] space-y-2">
                      <History className="w-10 h-10 mx-auto text-[#D9822B]/40" />
                      <p className="font-sans font-bold text-sm text-[#FAF6F0]">No se encontraron registros de auditoría</p>
                      <p className="text-xs">Prueba ajustando los filtros de búsqueda por fecha, administrador o tipo de evento.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#FAF6F0]">
                        <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase tracking-wider text-[11px] border-b border-[#D9822B]/20">
                          <tr>
                            <th className="p-4">Fecha y Hora</th>
                            <th className="p-4">Administrador Ejecutor</th>
                            <th className="p-4">Módulo</th>
                            <th className="p-4">Elemento / Ítem</th>
                            <th className="p-4">Detalle / Modificación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D9822B]/10">
                          {getFilteredAuditLogs().map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#1A120C]/60 transition-colors">
                              <td className="p-4 font-mono text-[11px] text-[#A6988B] whitespace-nowrap">
                                📅 {new Date(item.timestamp).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'medium' })}
                              </td>
                              <td className="p-4 font-bold text-[#FAF6F0] whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-lg bg-[#1A120C] border border-[#D9822B]/30 text-[#E5C384] inline-flex items-center gap-1.5">
                                  👤 {item.modified_by || 'Administración'}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                {item.type === 'ORDER' ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 inline-flex items-center gap-1">
                                    <ShoppingBag className="w-3 h-3" /> PEDIDO
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1">
                                    <Sliders className="w-3 h-3" /> PARÁMETROS
                                  </span>
                                )}
                              </td>
                              <td className="p-4 font-mono font-bold text-[#E5C384] whitespace-nowrap">
                                {item.title}
                              </td>
                              <td className="p-4 text-[11px]">
                                <div className="bg-[#1A120C] p-2.5 rounded-xl border border-[#D9822B]/20 text-[#FAF6F0] font-mono leading-relaxed">
                                  {item.summary}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* CREATE ADMIN MODAL */}
            {isCreateAdminOpen && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-2xl p-6 relative space-y-4 bg-[#1D150F] my-auto max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <h4 className="font-sans text-lg font-bold text-[#E5C384]">Crear Nueva Cuenta Administradora</h4>
                    <button onClick={() => setIsCreateAdminOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  {adminFormError && (
                    <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{adminFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">

                    {/* Atomized Names Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Nombre *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej: Valentina"
                          value={newAdminFirstName}
                          onChange={(e) => setNewAdminFirstName(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Apellido Paterno *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej: Morales"
                          value={newAdminLastNamePaternal}
                          onChange={(e) => setNewAdminLastNamePaternal(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Apellido Materno *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej: Rojas"
                          value={newAdminLastNameMaternal}
                          onChange={(e) => setNewAdminLastNameMaternal(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                    </div>

                    {/* RUT + DV Grid with separate labels */}
                    <div>
                      <div className="grid grid-cols-4 gap-2 mb-1">
                        <label className="col-span-3 text-[#E5C384] font-bold block">RUT *</label>
                        <label className="text-[#E5C384] font-bold block">Dígito Verificador *</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <input 
                            type="text"
                            required
                            placeholder="RUT sin puntos (ej: 12345678)"
                            value={newAdminRutBody}
                            onChange={(e) => setNewAdminRutBody(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                          />
                        </div>
                        <div>
                          <input 
                            type="text"
                            required
                            maxLength={1}
                            placeholder="DV (ej: K)"
                            value={newAdminRutDv}
                            onChange={(e) => setNewAdminRutDv(e.target.value.toUpperCase())}
                            className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#E5C384] font-mono font-bold text-center uppercase"
                          />
                        </div>
                      </div>
                      {newAdminRutBody && newAdminRutDv && !validateRutDv(newAdminRutBody, newAdminRutDv) && (
                        <div className="mt-1 text-[11px]">
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            ✗ El RUT {newAdminRutBody}-{newAdminRutDv} no es válido
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Location & Address Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[#A6988B] font-semibold block mb-1">País *</label>
                        <input 
                          type="text"
                          required
                          value={newAdminCountry}
                          onChange={(e) => setNewAdminCountry(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[#A6988B] font-semibold block mb-1">Región *</label>
                        <select
                          value={newAdminRegion}
                          onChange={(e) => setNewAdminRegion(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        >
                          {CHILE_REGIONS.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[#A6988B] font-semibold block mb-1">Ciudad *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej: Santiago"
                          value={newAdminCity}
                          onChange={(e) => setNewAdminCity(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Calle y Número *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej: Av. Andrés Bello 2425, Depto 402"
                        value={newAdminAddress}
                        onChange={(e) => setNewAdminAddress(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Correo Electrónico *</label>
                      <input 
                        type="email"
                        required
                        placeholder="ejemplo@banqueterialina.cl"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    {/* Password Field with Visual Live Checklist */}
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Selección de Contraseña *</label>
                      <input 
                        type="password"
                        required
                        placeholder="Ej: LinaPass#2026!"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />

                      {/* Password Requirements Checklist */}
                      {(() => {
                        const crit = getPasswordCriteria(newAdminPassword);
                        return (
                          <div className="mt-2 bg-[#120B07] p-3 rounded-lg border border-[#D9822B]/20 space-y-1 text-[11px]">
                            <p className="font-bold text-[#E5C384] mb-1">Requisitos de Selección de Contraseña:</p>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <span className={crit.length ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                {crit.length ? '✓' : '○'} Mínimo 12 caracteres ({newAdminPassword.length}/12)
                              </span>
                              <span className={crit.upper ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                {crit.upper ? '✓' : '○'} Una mayúscula (A-Z)
                              </span>
                              <span className={crit.lower ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                {crit.lower ? '✓' : '○'} Una minúscula (a-z)
                              </span>
                              <span className={crit.number ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                {crit.number ? '✓' : '○'} Un número (0-9)
                              </span>
                              <span className={crit.symbol ? 'text-green-400 font-bold' : 'text-[#A6988B] col-span-2'}>
                                {crit.symbol ? '✓' : '○'} Un símbolo especial (@, #, $, %, !, &, *, etc.)
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#D9822B]/20">
                      <button type="button" onClick={() => setIsCreateAdminOpen(false)} className="btn-secondary text-xs flex-1 py-2.5">Cancelar</button>
                      <button type="submit" className="btn-primary text-xs flex-1 py-2.5 font-bold">Crear Cuenta de Administrador</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT ADMIN MODAL */}
            {editingAdmin && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-2xl p-6 relative space-y-4 bg-[#1D150F] my-auto max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <h4 className="font-sans text-lg font-bold text-[#E5C384]">Editar Administrador ({editingAdmin.username})</h4>
                    <button onClick={() => setEditingAdmin(null)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  {adminFormError && (
                    <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{adminFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleEditAdmin} className="space-y-4 text-xs">
                    {/* Atomized Names Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Nombre *</label>
                        <input 
                          type="text"
                          required
                          value={editAdminFirstName}
                          onChange={(e) => setEditAdminFirstName(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Apellido Paterno *</label>
                        <input 
                          type="text"
                          required
                          value={editAdminLastNamePaternal}
                          onChange={(e) => setEditAdminLastNamePaternal(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Apellido Materno *</label>
                        <input 
                          type="text"
                          required
                          value={editAdminLastNameMaternal}
                          onChange={(e) => setEditAdminLastNameMaternal(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                    </div>

                    {/* RUT + DV Grid */}
                    <div>
                      <div className="grid grid-cols-4 gap-2 mb-1">
                        <label className="col-span-3 text-[#E5C384] font-bold block">RUT *</label>
                        <label className="text-[#E5C384] font-bold block">Dígito Verificador *</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <input 
                            type="text"
                            placeholder="RUT sin puntos (ej: 12345678)"
                            value={editAdminRutBody}
                            onChange={(e) => setEditAdminRutBody(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                          />
                        </div>
                        <div>
                          <input 
                            type="text"
                            maxLength={1}
                            placeholder="DV"
                            value={editAdminRutDv}
                            onChange={(e) => setEditAdminRutDv(e.target.value.toUpperCase())}
                            className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#E5C384] font-mono font-bold text-center uppercase"
                          />
                        </div>
                      </div>
                      {editAdminRutBody && editAdminRutDv && !validateRutDv(editAdminRutBody, editAdminRutDv) && (
                        <div className="mt-1 text-[11px]">
                          <span className="text-red-400 font-bold">✗ El RUT {editAdminRutBody}-{editAdminRutDv} no es válido</span>
                        </div>
                      )}
                    </div>

                    {/* Location & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[#A6988B] font-semibold block mb-1">País</label>
                        <input 
                          type="text"
                          value={editAdminCountry}
                          onChange={(e) => setEditAdminCountry(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                      <div>
                        <label className="text-[#A6988B] font-semibold block mb-1">Región</label>
                        <select
                          value={editAdminRegion}
                          onChange={(e) => setEditAdminRegion(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        >
                          {CHILE_REGIONS.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[#A6988B] font-semibold block mb-1">Ciudad</label>
                        <input 
                          type="text"
                          value={editAdminCity}
                          onChange={(e) => setEditAdminCity(e.target.value)}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Calle y Número *</label>
                      <input 
                        type="text"
                        value={editAdminAddress}
                        onChange={(e) => setEditAdminAddress(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Correo Electrónico *</label>
                      <input 
                        type="email"
                        required
                        value={editAdminEmail}
                        onChange={(e) => setEditAdminEmail(e.target.value)}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    {/* Password Modification - Restricted strictly to self account */}
                    {(() => {
                      const isSelfAccount = currentUser && (
                        currentUser.id === editingAdmin.id || 
                        currentUser.username === editingAdmin.username || 
                        (currentUser.rut_body && currentUser.rut_body === editingAdmin.rut_body)
                      );

                      if (isSelfAccount) {
                        return (
                          <div>
                            <label className="text-[#E5C384] font-bold block mb-1">Selección de Contraseña (Cambiar Tu Contraseña - Opcional)</label>
                            <input 
                              type="password"
                              placeholder="Dejar en blanco para mantener tu contraseña actual"
                              value={editAdminPassword}
                              onChange={(e) => setEditAdminPassword(e.target.value)}
                              className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                            />

                            {editAdminPassword && (() => {
                              const crit = getPasswordCriteria(editAdminPassword);
                              return (
                                <div className="mt-2 bg-[#120B07] p-3 rounded-lg border border-[#D9822B]/20 space-y-1 text-[11px]">
                                  <p className="font-bold text-[#E5C384] mb-1">Requisitos de la Nueva Contraseña:</p>
                                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                                    <span className={crit.length ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                      {crit.length ? '✓' : '○'} Mínimo 12 caracteres
                                    </span>
                                    <span className={crit.upper ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                      {crit.upper ? '✓' : '○'} Una mayúscula
                                    </span>
                                    <span className={crit.lower ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                      {crit.lower ? '✓' : '○'} Una minúscula
                                    </span>
                                    <span className={crit.number ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                                      {crit.number ? '✓' : '○'} Un número
                                    </span>
                                    <span className={crit.symbol ? 'text-green-400 font-bold' : 'text-[#A6988B] col-span-2'}>
                                      {crit.symbol ? '✓' : '○'} Un símbolo especial
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      }

                      return (
                        <div className="p-3 bg-[#120B07] border border-[#D9822B]/20 rounded-lg text-[#A6988B] text-xs flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#E5C384] shrink-0" />
                          <span>Por políticas de seguridad, la contraseña solo puede ser modificada directamente por el propio administrador desde su sesión activa.</span>
                        </div>
                      );
                    })()}

                    <div className="flex gap-2 pt-2 border-t border-[#D9822B]/20">
                      <button type="button" onClick={() => setEditingAdmin(null)} className="btn-secondary text-xs flex-1 py-2.5">Cancelar</button>
                      <button type="submit" className="btn-primary text-xs flex-1 py-2.5 font-bold">Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* CLIENT DETAIL MODAL */}
            {selectedClientModal && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-3xl p-6 relative space-y-5 bg-[#1D150F] my-auto max-h-[90vh] overflow-y-auto border border-[#D9822B]/30 rounded-2xl shadow-2xl">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start border-b border-[#D9822B]/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold text-lg border border-[#D9822B]/40 shrink-0">
                        {(selectedClientModal.client_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-sans text-xl font-bold text-[#FAF6F0]">{selectedClientModal.client_name}</h3>
                        <p className="text-xs text-[#E5C384] font-mono">{selectedClientModal.rut || 'Sin RUT registrado'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedClientModal(null)} 
                      className="p-1.5 text-[#A6988B] hover:text-[#FAF6F0] rounded-lg hover:bg-[#1A120C]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Client Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#120B07] p-4 rounded-xl border border-[#D9822B]/20">
                    <div>
                      <p className="text-[#A6988B] font-semibold uppercase text-[10px]">Correo Electrónico</p>
                      <p className="text-[#FAF6F0] font-mono font-bold">{selectedClientModal.email}</p>
                    </div>

                    <div>
                      <p className="text-[#A6988B] font-semibold uppercase text-[10px]">Teléfono de Contacto</p>
                      <p className="text-[#FAF6F0] font-mono font-bold">{selectedClientModal.phone || 'Sin teléfono'}</p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-[#A6988B] font-semibold uppercase text-[10px]">Dirección Registrada</p>
                      <p className="text-[#FAF6F0] font-mono">{selectedClientModal.address || 'Sin dirección registrada'}</p>
                    </div>

                    {selectedClientModal.coupon_code && (
                      <div className="sm:col-span-2 pt-1 border-t border-[#D9822B]/10 flex items-center justify-between">
                        <span className="text-[#A6988B]">Cupón de Bienvenida (5% Desc):</span>
                        <span className="font-mono text-[#E5C384] font-bold bg-[#D9822B]/15 px-2 py-0.5 rounded border border-[#D9822B]/30">
                          {selectedClientModal.coupon_code}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Client Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                      <p className="text-[#A6988B] text-[10px] uppercase font-semibold">Total Pedidos</p>
                      <p className="text-sm font-bold text-[#FAF6F0] font-mono">{selectedClientModal.total_orders}</p>
                    </div>
                    <div className="bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                      <p className="text-[#A6988B] text-[10px] uppercase font-semibold">Inversión Neta</p>
                      <p className="text-sm font-bold text-[#E5C384] font-mono">${(selectedClientModal.total_spent || 0).toLocaleString('es-CL')} CLP</p>
                    </div>
                    <div className="bg-[#1A120C] p-3 rounded-xl border border-red-500/20">
                      <p className="text-[#A6988B] text-[10px] uppercase font-semibold">Devoluciones</p>
                      <p className="text-sm font-bold text-red-400 font-mono">${(selectedClientModal.total_refunded || 0).toLocaleString('es-CL')} CLP</p>
                    </div>
                    <div className="bg-[#1A120C] p-3 rounded-xl border border-[#D9822B]/20">
                      <p className="text-[#A6988B] text-[10px] uppercase font-semibold">Último Pedido</p>
                      <p className="text-xs font-bold text-[#FAF6F0] font-mono mt-0.5">{selectedClientModal.last_order_date || 'Sin fecha'}</p>
                    </div>
                  </div>

                  {/* Orders History List */}
                  <div className="space-y-2">
                    <h4 className="font-sans text-sm font-bold text-[#E5C384]">Historial de Pedidos & Registro de Devoluciones</h4>
                    {selectedClientModal.orders && selectedClientModal.orders.length > 0 ? (
                      <div className="overflow-x-auto border border-[#D9822B]/20 rounded-xl bg-[#120B07]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#1A120C] text-[#E5C384] font-sans uppercase text-[10px]">
                            <tr>
                              <th className="p-2.5">Código</th>
                              <th className="p-2.5">Servicio</th>
                              <th className="p-2.5">Fecha Evento</th>
                              <th className="p-2.5">Monto Original</th>
                              <th className="p-2.5">Estado / Devolución</th>
                              <th className="p-2.5 text-right">Comprobante</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D9822B]/10 text-[#FAF6F0]">
                            {selectedClientModal.orders.map(ord => {
                              const isRefunded = ord.is_refunded || ord.status === 'CANCELADO';
                              return (
                                <tr key={ord.id} className="hover:bg-[#1A120C]/60 transition-colors">
                                  <td className="p-2.5 font-mono text-[#E5C384] font-bold">{ord.code}</td>
                                  <td className="p-2.5">{ord.service_type}</td>
                                  <td className="p-2.5 font-mono text-[#A6988B]">{ord.event_date}</td>
                                  <td className="p-2.5 font-bold font-mono">${ord.final_total.toLocaleString('es-CL')} CLP</td>
                                  <td className="p-2.5">
                                    <div className="space-y-0.5">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block ${
                                        ord.status === 'CONFIRMADO' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        isRefunded ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                        'bg-[#D9822B]/20 text-[#E5C384]'
                                      }`}>
                                        {isRefunded ? 'Reembolsado' : ord.status}
                                      </span>
                                      {isRefunded && (
                                        <p className="text-[10px] font-mono text-red-400 font-bold">
                                          Devuelto: ${ (ord.refund_amount || ord.final_total).toLocaleString('es-CL') } CLP
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2.5 text-right">
                                    {ord.refund_voucher ? (
                                      <a
                                        href={ord.refund_voucher}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary text-[10px] py-1 px-2.5 inline-flex items-center gap-1 text-red-400 border-red-500/40 hover:bg-red-500/10"
                                      >
                                        <FileText className="w-3 h-3" />
                                        <span>Comprobante</span>
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-[#A6988B] italic">No requiere</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-[#A6988B] italic bg-[#120B07] p-4 rounded-xl text-center border border-[#D9822B]/10">
                        Este cliente aún no ha generado compras completadas (Registrado vía boletín/cupones).
                      </p>
                    )}
                  </div>

                  <div className="pt-2 text-right">
                    <button 
                      onClick={() => setSelectedClientModal(null)} 
                      className="btn-secondary text-xs py-2 px-5"
                    >
                      Cerrar Ficha
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ATOMIZED CLIENT CREATE / EDIT MODAL (3NF) */}
            {isClientModalOpen && (
              <div className="fixed inset-0 z-75 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-2xl p-6 relative space-y-4 bg-[#1D150F] my-auto max-h-[90vh] overflow-y-auto border border-[#D9822B]/30 rounded-2xl shadow-2xl">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#D9822B]/20 text-[#E5C384] flex items-center justify-center font-bold border border-[#D9822B]/30">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-sans text-base font-bold text-[#E5C384]">
                          {editingClient ? `Editar Ficha Cliente 3NF: ${editingClient.full_name || editingClient.email}` : 'Registrar Nuevo Cliente (Estructura 3NF)'}
                        </h4>
                        <p className="text-[10px] text-[#A6988B]">Campos atómicos normalizados según estándar de la base de datos.</p>
                      </div>
                    </div>
                    <button onClick={() => setIsClientModalOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0] p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {clientFormMsg.text && (
                    <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      clientFormMsg.type === 'success' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {clientFormMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveClientSubmit} className="space-y-4 text-xs">
                    
                    {/* Section 1: Nombres Atomizados (1NF) */}
                    <div className="bg-[#120B07] p-3.5 rounded-xl border border-[#D9822B]/20 space-y-3">
                      <p className="text-[11px] font-bold text-[#E5C384] uppercase tracking-wide flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#D9822B]" />
                        1. Nombres y Apellidos Atomizados (1NF)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">Nombres *</label>
                          <input 
                            type="text" 
                            required
                            value={clientForm.first_name}
                            onChange={e => setClientForm({...clientForm, first_name: e.target.value})}
                            placeholder="Ej. Juan Carlos"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] focus:border-[#D9822B] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">Apellido Paterno *</label>
                          <input 
                            type="text" 
                            required
                            value={clientForm.last_name_paternal}
                            onChange={e => setClientForm({...clientForm, last_name_paternal: e.target.value})}
                            placeholder="Ej. Pérez"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] focus:border-[#D9822B] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1">Apellido Materno</label>
                          <input 
                            type="text" 
                            value={clientForm.last_name_maternal}
                            onChange={e => setClientForm({...clientForm, last_name_maternal: e.target.value})}
                            placeholder="Ej. Soto"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] focus:border-[#D9822B] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Identificación RUT Atomizada (1NF) */}
                    <div className="bg-[#120B07] p-3.5 rounded-xl border border-[#D9822B]/20 space-y-3">
                      <p className="text-[11px] font-bold text-[#E5C384] uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D9822B]" />
                        2. Identificación RUT Atomizada (Cuerpo + DV)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-3">
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">Cuerpo RUT (Sin puntos ni guion)</label>
                          <input 
                            type="text" 
                            value={clientForm.rut_body}
                            onChange={e => setClientForm({...clientForm, rut_body: e.target.value.replace(/[^0-9]/g, '')})}
                            placeholder="Ej. 18345678"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] font-mono focus:border-[#D9822B] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">DV (Dígito)</label>
                          <input 
                            type="text" 
                            maxLength={1}
                            value={clientForm.rut_dv}
                            onChange={e => setClientForm({...clientForm, rut_dv: e.target.value.toUpperCase()})}
                            placeholder="Ej. K o 9"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] font-mono text-center focus:border-[#D9822B] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Contacto & Dirección (3NF FK Comuna) */}
                    <div className="bg-[#120B07] p-3.5 rounded-xl border border-[#D9822B]/20 space-y-3">
                      <p className="text-[11px] font-bold text-[#E5C384] uppercase tracking-wide flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#D9822B]" />
                        3. Contacto & Ubicación Normalizada (3NF FK Comuna)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">Correo Electrónico *</label>
                          <input 
                            type="email" 
                            required
                            value={clientForm.email}
                            onChange={e => setClientForm({...clientForm, email: e.target.value})}
                            placeholder="cliente@ejemplo.cl"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] font-mono focus:border-[#D9822B] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">Teléfono de Contacto</label>
                          <input 
                            type="text" 
                            value={clientForm.phone}
                            onChange={e => setClientForm({...clientForm, phone: e.target.value})}
                            placeholder="+56 9 1234 5678"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] font-mono focus:border-[#D9822B] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1 font-semibold">Comuna de Residencia (FK Normalizada)</label>
                          <select 
                            value={clientForm.commune_id}
                            onChange={e => setClientForm({...clientForm, commune_id: e.target.value})}
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#E5C384] focus:border-[#D9822B] outline-none"
                          >
                            <option value="">-- Sin Comuna Asignada --</option>
                            {adminCommunes.map(com => (
                              <option key={com.id} value={com.id}>
                                {com.name} (+${Number(com.delivery_fee).toLocaleString('es-CL')} CLP)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[#A6988B] text-[10px] uppercase mb-1">Calle, Número y Depto (Dirección Atomizada)</label>
                          <input 
                            type="text" 
                            value={clientForm.address}
                            onChange={e => setClientForm({...clientForm, address: e.target.value})}
                            placeholder="Ej. Av. Providencia 1234, Depto 502"
                            className="w-full bg-[#1A120C] border border-[#D9822B]/30 rounded-lg px-3 py-2 text-[#FAF6F0] focus:border-[#D9822B] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-[#D9822B]/20">
                      <button 
                        type="button" 
                        onClick={() => setIsClientModalOpen(false)} 
                        className="btn-secondary text-xs flex-1 py-2.5"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSavingClient}
                        className="btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5"
                      >
                        {isSavingClient ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <span>{editingClient ? 'Actualizar Ficha 3NF' : 'Crear Cliente 3NF'}</span>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}



            {/* ORDER DETAIL & MANDATORY REFUND AUDIT MODAL */}
            {selectedOrder && (
              <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-xl p-6 relative space-y-4 bg-[#1D150F] my-auto max-h-[85vh] overflow-y-auto">
                  
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <div>
                      <h4 className="font-sans text-lg font-bold text-[#E5C384]">Detalle Pedido: {selectedOrder.code}</h4>
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
                            onChange={(e) => {
                              const targetStatus = newStatus || selectedOrder?.status;
                              if (e.target.checked && targetStatus !== 'CANCELADO') {
                                setRefundError('No es posible registrar una devolución sin antes cambiar el estado del pedido a CANCELADO.');
                                setIsRefunded(false);
                                return;
                              }
                              setRefundError('');
                              setIsRefunded(e.target.checked);
                            }}
                            className="w-4 h-4 accent-[#D9822B] rounded cursor-pointer"
                          />
                          <span>Devolución Realizada</span>
                        </label>
                        {isRefunded ? (
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">
                            Reembolsado
                          </span>
                        ) : (newStatus || selectedOrder?.status) !== 'CANCELADO' && (
                          <span className="text-[10px] font-semibold text-amber-300/90 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                            ⚠️ Requiere Estado CANCELADO
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
                        <span className="font-sans font-bold text-[#E5C384] block mb-2 flex items-center justify-between">
                          <span>📜 Historial de Cambios y Auditoría</span>
                          <span className="text-[10px] text-[#A6988B] font-sans font-normal">{selectedOrder.history.length} registros</span>
                        </span>
                        <div className="space-y-2 max-h-40 overflow-y-auto bg-[#120B07] p-2.5 rounded-xl border border-[#D9822B]/20">
                          {selectedOrder.history.map((h, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-[#1A120C] border border-[#D9822B]/20 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center text-[#E5C384] font-semibold">
                                <span className="px-2 py-0.5 rounded bg-[#D9822B]/20 text-[10px] text-[#E5C384] font-mono border border-[#D9822B]/30">
                                  {h.previous_status} ➔ {h.new_status}
                                </span>
                                <span className="font-mono text-[10px] text-[#A6988B]">
                                  {new Date(h.timestamp).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              </div>
                              <p className="text-[#FAF6F0] text-[11px] leading-tight">
                                {h.change_reason || 'Sin motivo especificado'}
                              </p>
                              <div className="flex justify-end pt-0.5 border-t border-[#D9822B]/10">
                                <span className="text-[10px] text-[#E5C384] font-medium bg-[#120B07] px-2 py-0.5 rounded border border-[#D9822B]/30 flex items-center gap-1">
                                  👤 Realizado por: <strong className="text-[#FAF6F0]">{h.modified_by || 'Administración'}</strong>
                                </span>
                              </div>
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
                    <h4 className="font-sans text-lg font-bold text-[#E5C384]">
                      {editingCategory ? 'Editar Línea / Categoría' : 'Nueva Línea / Categoría'}
                    </h4>
                    <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  {categoryFormError && (
                    <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{categoryFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Nombre de la Línea *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej: Empanaditas & Coctelería"
                        value={categoryForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryForm(prev => ({
                            ...prev,
                            name: val,
                            slug: prev.slugManual ? prev.slug : generateSlug(val)
                          }));
                        }}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[#A6988B] font-semibold block">Slug URL (Dirección Web Única)</label>
                        <span className="text-[10px] text-[#D9822B] italic">Autogenerado</span>
                      </div>
                      <input 
                        type="text"
                        placeholder="Ej: empanaditas-cocteleria"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value, slugManual: true }))}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                      />
                      <p className="text-[10px] text-[#A6988B] mt-1 leading-relaxed">
                        💡 <strong>¿Qué es el Slug URL?</strong> Es el identificador limpio para direcciones web y buscadores (SEO). Ejemplo: <code>banqueterialina.cl/carta/empanaditas-cocteleria</code>
                      </p>
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
                    <h4 className="font-sans text-lg font-bold text-[#E5C384]">
                      {editingProduct ? 'Editar Producto del Catálogo' : 'Agregar Nuevo Producto'}
                    </h4>
                    <button onClick={() => setIsProductModalOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  {productFormError && (
                    <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{productFormError}</span>
                    </div>
                  )}

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
                      <label className="text-[#E5C384] font-bold block mb-1">Nombre del Producto * (Máx 150 caracteres)</label>
                      <input 
                        type="text"
                        required
                        maxLength={150}
                        placeholder="Ej: Gran Mix Selección Dulce Lina"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Precio ($ CLP) * (Entre $100 y $50M)</label>
                        <input 
                          type="number"
                          required
                          min="100"
                          max="50000000"
                          placeholder="Ej: 29900"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full p-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-lg text-xs text-[#FAF6F0] font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[#E5C384] font-bold block mb-1">Porciones / Piezas * (1 a 10.000)</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          max="10000"
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
                      <label className="text-[#E5C384] font-bold block mb-1">
                        Imagen del Producto <span className="text-red-400">*</span>
                      </label>
                      
                      {/* Drag and Drop Zone */}
                      <div 
                        onClick={() => productFileInputRef.current && productFileInputRef.current.click()}
                        onDragOver={handleProductImageDragOver}
                        onDragLeave={handleProductImageDragLeave}
                        onDrop={handleProductImageDrop}
                        className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-all ${
                          isProductImageDragging 
                            ? 'border-[#E5C384] bg-[#D9822B]/20 scale-[1.01]' 
                            : 'border-[#D9822B]/50 bg-[#120B07] hover:border-[#D9822B]'
                        }`}
                      >
                        <input 
                          ref={productFileInputRef}
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleProductImageFileSelect(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        {productForm.image ? (
                          <div className="space-y-2">
                            <img 
                              src={productForm.image} 
                              alt="Vista previa" 
                              className="max-h-36 mx-auto rounded-lg border border-[#D9822B]/40 object-cover shadow-md"
                            />
                            <div className="flex justify-center gap-2">
                              <span className="text-[11px] font-semibold text-[#E5C384] bg-[#D9822B]/20 px-2.5 py-1 rounded border border-[#D9822B]/40 flex items-center gap-1">
                                <Upload className="w-3.5 h-3.5" /> Haz clic o arrastra para cambiar imagen
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 py-2">
                            <Upload className="w-6 h-6 text-[#D9822B] mx-auto" />
                            <p className="font-bold text-xs text-[#FAF6F0]">Haz clic aquí o arrastra la foto del producto</p>
                            <p className="text-[10px] text-[#A6988B]">Sube archivos JPG, PNG o WEBP</p>
                          </div>
                        )}
                      </div>
                    </div>

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

            {/* DANGER WARNING DELETE CATEGORY MODAL */}
            {categoryToDelete && (
              <div className="fixed inset-0 z-80 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md p-6 relative space-y-4 bg-[#1D150F] border border-red-500/50 shadow-2xl">
                  
                  <div className="flex items-center gap-3 border-b border-red-500/30 pb-3">
                    <div className="p-2.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/40">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base font-bold text-red-400">Eliminar Línea / Categoría</h4>
                      <p className="text-[11px] text-[#FAF6F0] font-semibold">{categoryToDelete.name}</p>
                    </div>
                  </div>

                  <div className="bg-red-950/40 p-3.5 rounded-xl border border-red-500/30 space-y-2 text-xs text-[#FAF6F0]">
                    <p className="font-bold text-red-300 flex items-center gap-1.5">
                      ⚠️ ¡Advertencia de Eliminación!
                    </p>
                    <p className="text-[#A6988B] leading-relaxed">
                      Al eliminar la línea <strong className="text-[#E5C384]">«{categoryToDelete.name}»</strong>, <span className="text-red-400 font-bold">se eliminarán PERMANENTEMENTE todos los productos asociados a ella</span> del catálogo.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-[#FAF6F0] block mb-1.5 font-semibold">
                      Para confirmar, escribe la palabra <strong className="text-red-400 font-extrabold tracking-wide">ELIMINAR</strong> (en mayúsculas):
                    </label>
                    <input 
                      type="text"
                      placeholder="Escribe ELIMINAR en mayúsculas"
                      value={deleteConfirmInput}
                      onChange={(e) => setDeleteConfirmInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#120B07] border border-red-500/50 rounded-lg text-xs font-mono text-[#FAF6F0] focus:outline-none focus:border-red-400"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#D9822B]/20">
                    <button 
                      type="button" 
                      onClick={() => { setCategoryToDelete(null); setDeleteConfirmInput(''); }} 
                      className="btn-secondary text-xs flex-1 py-2.5"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      onClick={handleConfirmDeleteCategory}
                      disabled={deleteConfirmInput.trim() !== 'ELIMINAR'}
                      className={`text-xs flex-1 py-2.5 font-bold rounded-lg transition-all border ${
                        deleteConfirmInput.trim() === 'ELIMINAR'
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 cursor-pointer shadow-lg'
                          : 'bg-red-950/40 text-red-400/40 border-red-900/40 cursor-not-allowed'
                      }`}
                    >
                      Eliminar Línea
                    </button>
                  </div>

                </div>
              </div>
            )}

            </div>
          </div>
        )}

            {/* CREATE COMMUNE MODAL */}
            {isCreateCommuneOpen && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md p-6 relative space-y-4 bg-[#1D150F] border border-[#D9822B]/30 rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <h4 className="font-sans text-base font-bold text-[#E5C384] flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#D9822B]" /> Agregar Nueva Comuna de Despacho
                    </h4>
                    <button onClick={() => setIsCreateCommuneOpen(false)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  {communeFormError && (
                    <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold">
                      {communeFormError}
                    </div>
                  )}

                  <form onSubmit={handleCreateCommune} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Nombre de la Comuna *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej: Macul, Providencia, San Bernardo"
                        value={newCommuneName}
                        onChange={(e) => setNewCommuneName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Tarifa de Despacho (CLP) *</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        placeholder="4000"
                        value={newCommuneFee}
                        onChange={(e) => setNewCommuneFee(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] font-mono focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setIsCreateCommuneOpen(false)} className="btn-secondary text-xs flex-1 py-2.5">
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary text-xs flex-1 py-2.5 font-bold">
                        Guardar Comuna
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT COMMUNE MODAL */}
            {editingCommune && (
              <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md p-6 relative space-y-4 bg-[#1D150F] border border-[#D9822B]/30 rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                    <h4 className="font-sans text-base font-bold text-[#E5C384] flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-[#D9822B]" /> Editar Comuna: {editingCommune.name}
                    </h4>
                    <button onClick={() => setEditingCommune(null)} className="text-[#A6988B] hover:text-[#FAF6F0]"><X className="w-5 h-5" /></button>
                  </div>

                  {communeFormError && (
                    <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs font-semibold">
                      {communeFormError}
                    </div>
                  )}

                  <form onSubmit={handleSaveEditCommune} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Nombre de la Comuna *</label>
                      <input 
                        type="text"
                        required
                        value={editCommuneName}
                        onChange={(e) => setEditCommuneName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    <div>
                      <label className="text-[#E5C384] font-bold block mb-1">Tarifa de Despacho (CLP) *</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        value={editCommuneFee}
                        onChange={(e) => setEditCommuneFee(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] font-mono focus:outline-none focus:border-[#D9822B]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox"
                        id="editCommuneActiveCheck"
                        checked={editCommuneActive}
                        onChange={(e) => setEditCommuneActive(e.target.checked)}
                        className="accent-[#D9822B] w-4 h-4 rounded"
                      />
                      <label htmlFor="editCommuneActiveCheck" className="text-xs text-[#FAF6F0] font-semibold cursor-pointer">
                        Comuna Habilitada para Despacho
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setEditingCommune(null)} className="btn-secondary text-xs flex-1 py-2.5">
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary text-xs flex-1 py-2.5 font-bold">
                        Actualizar Comuna
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

        {/* FORGOT / RESET PASSWORD MODAL */}
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-80 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-6 relative space-y-4 bg-[#1D150F] border border-[#D9822B]/30 rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#D9822B]/20 pb-3">
                <h4 className="font-sans text-lg font-bold text-[#E5C384] flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#D9822B]" />
                  Recuperación de Contraseña
                </h4>
                <button 
                  onClick={() => setIsForgotPasswordOpen(false)} 
                  className="text-[#A6988B] hover:text-[#FAF6F0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {forgotError && (
                <div className="bg-red-500/15 border border-red-500/40 p-3 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotMessage && (
                <div className="bg-green-500/15 border border-green-500/40 p-3 rounded-xl text-green-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{forgotMessage}</span>
                </div>
              )}

              {forgotStep === 'request' ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4 text-xs">
                  <p className="text-[#A6988B] leading-relaxed">
                    Ingresa tu <strong>RUT</strong> o <strong>Correo Electrónico</strong> registrado. Te enviaremos un token de seguridad para restablecer tu clave mediante <strong>Resend</strong>.
                  </p>

                  <div>
                    <label className="text-[#E5C384] font-bold block mb-1">RUT o Correo Electrónico *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej: 12.345.678-9 o usuario@banqueterialina.cl"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      className="w-full p-3 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] font-mono focus:outline-none focus:border-[#D9822B]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPasswordOpen(false)} 
                      className="btn-secondary text-xs flex-1 py-2.5"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingForgot}
                      className="btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-2"
                    >
                      {isSubmittingForgot ? 'Enviando Correo...' : 'Enviar Token por Correo'}
                    </button>
                  </div>

                  <div className="text-center pt-2 border-t border-[#D9822B]/10">
                    <button 
                      type="button" 
                      onClick={() => setForgotStep('reset')}
                      className="text-[11px] text-[#A6988B] hover:text-[#E5C384] underline"
                    >
                      ¿Ya tienes un token de seguridad? Ingresar token aquí
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePerformPasswordReset} className="space-y-4 text-xs">
                  <p className="text-[#A6988B] leading-relaxed">
                    Ingresa el token de seguridad enviado a tu correo y define tu nueva contraseña.
                  </p>

                  <div>
                    <label className="text-[#E5C384] font-bold block mb-1">Token de Seguridad *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Pega aquí tu token de seguridad"
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      className="w-full p-3 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] font-mono focus:outline-none focus:border-[#D9822B]"
                    />
                  </div>

                  <div>
                    <label className="text-[#E5C384] font-bold block mb-1">Nueva Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full p-3 bg-[#120B07] border border-[#D9822B]/40 rounded-xl text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D9822B]"
                    />

                    {resetNewPassword && (() => {
                      const crit = getPasswordCriteria(resetNewPassword);
                      return (
                        <div className="mt-2 bg-[#120B07] p-3 rounded-lg border border-[#D9822B]/20 space-y-1 text-[11px]">
                          <p className="font-bold text-[#E5C384] mb-1">Requisitos de la Nueva Contraseña:</p>
                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <span className={crit.length ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                              {crit.length ? '✓' : '○'} Mínimo 12 caracteres ({resetNewPassword.length}/12)
                            </span>
                            <span className={crit.upper ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                              {crit.upper ? '✓' : '○'} Una mayúscula (A-Z)
                            </span>
                            <span className={crit.lower ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                              {crit.lower ? '✓' : '○'} Una minúscula (a-z)
                            </span>
                            <span className={crit.number ? 'text-green-400 font-bold' : 'text-[#A6988B]'}>
                              {crit.number ? '✓' : '○'} Un número (0-9)
                            </span>
                            <span className={crit.symbol ? 'text-green-400 font-bold' : 'text-[#A6988B] col-span-2'}>
                              {crit.symbol ? '✓' : '○'} Un símbolo especial (@, #, $, %, !, &, *, etc.)
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setForgotStep('request')} 
                      className="btn-secondary text-xs flex-1 py-2.5"
                    >
                      Volver Atrás
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingForgot}
                      className="btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-2"
                    >
                      {isSubmittingForgot ? 'Actualizando...' : 'Restablecer Contraseña'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
