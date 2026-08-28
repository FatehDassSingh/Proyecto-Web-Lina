import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config/api';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedGrid from './components/FeaturedGrid';
import Carta from './components/Carta';
import MisionPage from './components/MisionPage';
import ContactoPage from './components/ContactoPage';
import TerminosPage from './components/TerminosPage';
import QuienesSomosSection from './components/QuienesSomosSection';
import ServiceCheckoutModal from './components/ServiceCheckoutModal';
import DiscountBanner from './components/DiscountBanner';
import DiscountEmailModal from './components/DiscountEmailModal';
import AdminDashboard from './components/AdminDashboard';
import MarketingModal from './components/MarketingModal';
import Footer from './components/Footer';
import './styles/theme.css';

export default function App() {
  // Page Routing State: 'home' | 'carta' | 'mision' | 'contacto' | 'terminos'
  const [activePage, setActivePage] = useState('home');

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [communes, setCommunes] = useState([]);
  
  // Cart state
  const [cartItems, setCartItems] = useState([]);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);

  const [businessConfig, setBusinessConfig] = useState({
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
  const [visitStats, setVisitStats] = useState({ total_visits: 1042, visits_today: 38, total_uniques: 420 });

  // Dynamically update site theme CSS root variables when businessConfig changes
  useEffect(() => {
    if (businessConfig) {
      const primary = businessConfig.theme_color_primary || '#D9822B';
      const secondary = businessConfig.theme_color_secondary || '#E5C384';
      const bg = businessConfig.theme_color_bg || '#120B07';
      const card = businessConfig.theme_color_card || '#1A120C';
      const text = businessConfig.theme_color_text || '#FAF6F0';

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
  }, [businessConfig]);

  // Dynamically update browser tab favicon link when site_favicon changes
  useEffect(() => {
    if (businessConfig?.site_favicon) {
      const favUrl = businessConfig.site_favicon;
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
  }, [businessConfig?.site_favicon]);

  const trackVisit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/visits/track/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname || '/' })
      });
      if (res.ok) {
        const data = await res.json();
        setVisitStats(data);
      }
    } catch (e) {
      console.log("Visit counter fallback active");
    }
  };

  // Fetch Menu, Communes, and BusinessConfig from Django API
  useEffect(() => {
    fetchMenuData();
    fetchCommunesData();
    fetchBusinessConfig();
    trackVisit();

    const checkUrlOrHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin') {
        setIsAdminOpen(true);
      }
    };

    checkUrlOrHash();
    window.addEventListener('hashchange', checkUrlOrHash);
    window.addEventListener('popstate', checkUrlOrHash);

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlOrHash);
      window.removeEventListener('popstate', checkUrlOrHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchBusinessConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        setBusinessConfig({
          waiter_fee: Number(data.waiter_fee) || 20000,
          min_order_total: Number(data.min_order_total) || 70000,
          max_daily_portions: Number(data.max_daily_portions) || 250,
          contact_phone: data.contact_phone || '+56 9 3465 6961',
          contact_email: data.contact_email || 'contacto@banqueterialina.cl',
          business_hours: data.business_hours || 'Lunes a Domingo de 09:00 a 19:00 hrs',
          terms_and_conditions: data.terms_and_conditions || '',
          time_slots: data.time_slots || '10:00 - 12:00, 12:00 - 14:00, 14:00 - 16:00, 16:00 - 18:00',
          site_logo: data.site_logo || '/images/logo_lina.png',
          site_favicon: data.site_favicon || '/images/logo_lina.png',
          hero_title: data.hero_title || 'El arte de comer rico',
          hero_subtitle: data.hero_subtitle || 'Presentaciones gourmet artesanales, montajes decorativos y garzones para tus momentos inolvidables.',
          hero_badge_text: data.hero_badge_text || 'Banquetería Familiar en Santiago de Chile',
          show_hero_badge: data.show_hero_badge ?? 'true',
          show_hero_cards: data.show_hero_cards ?? 'true',
          hero_card1_title: data.hero_card1_title || '3 Días de Anticipación',
          hero_card1_desc: data.hero_card1_desc || 'Elaboración artesanal fresca con reserva previa.',
          hero_card2_title: data.hero_card2_title || 'Retiro o Montaje Sábados',
          hero_card2_desc: data.hero_card2_desc || 'Retiro presencial Lun-Dom; montajes los Sábados.',
          hero_card3_title: data.hero_card3_title || 'Opción Garzones',
          hero_card3_desc: data.hero_card3_desc || 'Cálculo automático de personal (1 cada 25 personas).',
          show_about_section: data.show_about_section ?? 'true',
          about_badge_text: data.about_badge_text || 'Nuestra Historia & Familia',
          about_title: data.about_title || '¿Quiénes Somos?',
          about_quote: data.about_quote || '"Somos la familia Quilodrán y nos encanta dar una experiencia gastronómica acogedora. Orgullosamente de San Bernardo."',
          about_paragraph1: data.about_paragraph1 || 'Lo que comenzó en nuestra propia cocina como el amor por reunir a nuestros seres queridos en torno a la mesa, hoy se transforma en Banquetería Lina.',
          about_paragraph2: data.about_paragraph2 || 'Cada empanadita horneada al punto, cada tabla gourmet montada a mano y cada estación de café lleva el sello de dedicación de nuestra familia.',
          about_image_url: data.about_image_url || '/images/estacion_coffee.jpg',
          theme_color_primary: data.theme_color_primary || '#D9822B',
          theme_color_secondary: data.theme_color_secondary || '#E5C384',
          theme_color_bg: data.theme_color_bg || '#120B07',
          theme_color_card: data.theme_color_card || '#1A120C',
          theme_color_text: data.theme_color_text || '#FAF6F0'
        });
      }
    } catch (e) {
      console.log("Using default businessConfig");
    }
  };

  const fetchMenuData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setCategories(data.categories || []);
        setItems(data.items || []);
      } else {
        loadFallbackJson();
      }
    } catch (e) {
      loadFallbackJson();
    }
  };

  const fetchCommunesData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/communes/`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCommunes(data);
      } else {
        loadFallbackJson();
      }
    } catch (e) {
      loadFallbackJson();
    }
  };

  const loadFallbackJson = async () => {
    try {
      const res = await fetch('/assets/carta.json');
      const data = await res.json();
      setCategories(data.categories || []);
      setItems(data.items || []);
      setCommunes(data.communes || []);
    } catch (e) {
      console.error("Error loading menu dataset", e);
    }
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleNavigate = (page) => {
    if (page === 'quienes') {
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById('quienes-somos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const featuredItems = items.filter(i => i.is_featured);

  return (
    <div className="min-h-screen bg-[#120B07] text-[#FAF6F0] flex flex-col font-sans selection:bg-[#D9822B] selection:text-white">
      
      {/* Navigation Header */}
      <Header 
        cartCount={cartCount}
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMarketing={() => setIsMarketingOpen(true)}
        logoUrl={businessConfig.site_logo}
      />

      {/* Page Routing Views */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <Hero 
              onNavigateToCarta={() => handleNavigate('carta')} 
              heroTitle={businessConfig.hero_title}
              heroSubtitle={businessConfig.hero_subtitle}
              heroBadgeText={businessConfig.hero_badge_text}
              showHeroBadge={businessConfig.show_hero_badge !== 'false' && businessConfig.show_hero_badge !== false}
              showHeroCards={businessConfig.show_hero_cards !== 'false' && businessConfig.show_hero_cards !== false}
              heroCard1Title={businessConfig.hero_card1_title}
              heroCard1Desc={businessConfig.hero_card1_desc}
              heroCard2Title={businessConfig.hero_card2_title}
              heroCard2Desc={businessConfig.hero_card2_desc}
              heroCard3Title={businessConfig.hero_card3_title}
              heroCard3Desc={businessConfig.hero_card3_desc}
            />
            <FeaturedGrid 
              featuredItems={featuredItems}
              onAddToCart={handleAddToCart}
              onNavigateToCarta={() => handleNavigate('carta')}
            />
            <QuienesSomosSection 
              onNavigateToCarta={() => handleNavigate('carta')} 
              showAboutSection={businessConfig.show_about_section !== 'false' && businessConfig.show_about_section !== false}
              aboutBadgeText={businessConfig.about_badge_text}
              aboutTitle={businessConfig.about_title}
              aboutQuote={businessConfig.about_quote}
              aboutParagraph1={businessConfig.about_paragraph1}
              aboutParagraph2={businessConfig.about_paragraph2}
              aboutImageUrl={businessConfig.about_image_url}
            />
          </>
        )}

        {activePage === 'carta' && (
          <Carta 
            categories={categories}
            items={items}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onAddToCart={handleAddToCart}
          />
        )}

        {(activePage === 'mision' || activePage === 'quienes') && (
          <MisionPage onNavigateToCarta={() => handleNavigate('carta')} />
        )}

        {activePage === 'contacto' && (
          <ContactoPage businessConfig={businessConfig} />
        )}

        {activePage === 'terminos' && (
          <TerminosPage onNavigateHome={() => handleNavigate('home')} businessConfig={businessConfig} />
        )}
      </main>

      {/* Footer & Schema.org */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        visitStats={visitStats} 
        logoUrl={businessConfig.site_logo}
      />

      {/* Floating 5% Discount Bar */}
      <DiscountBanner onOpenModal={() => setIsDiscountOpen(true)} />

      {/* Service Checkout Modal */}
      <ServiceCheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        communes={communes}
        businessConfig={businessConfig}
        onRefreshConfig={fetchBusinessConfig}
      />

      {/* Email Capture & Resend Simulation Modal */}
      <DiscountEmailModal 
        isOpen={isDiscountOpen}
        onClose={() => setIsDiscountOpen(false)}
      />

      {/* Protected Admin Dashboard Modal */}
      <AdminDashboard 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onConfigSaved={fetchBusinessConfig}
        onCatalogChanged={fetchMenuData}
        onCommunesChanged={fetchCommunesData}
      />

      {/* Marketing Assets & QR Modal */}
      <MarketingModal 
        isOpen={isMarketingOpen}
        onClose={() => setIsMarketingOpen(false)}
      />

    </div>
  );
}
