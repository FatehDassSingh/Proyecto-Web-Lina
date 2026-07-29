import React, { useState, useEffect } from 'react';
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
    max_daily_portions: 250
  });

  // Fetch Menu, Communes, and BusinessConfig from Django API
  useEffect(() => {
    fetchMenuData();
    fetchCommunesData();
    fetchBusinessConfig();
  }, []);

  const fetchBusinessConfig = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/config/');
      const data = await res.json();
      if (data && typeof data === 'object') {
        setBusinessConfig({
          waiter_fee: Number(data.waiter_fee) || 20000,
          min_order_total: Number(data.min_order_total) || 70000,
          max_daily_portions: Number(data.max_daily_portions) || 250
        });
      }
    } catch (e) {
      console.log("Using default businessConfig");
    }
  };

  const fetchMenuData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/menu/');
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
      const res = await fetch('http://127.0.0.1:8000/api/communes/');
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
      />

      {/* Page Routing Views */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <Hero onNavigateToCarta={() => handleNavigate('carta')} />
            <FeaturedGrid 
              featuredItems={featuredItems}
              onAddToCart={handleAddToCart}
            />
            <QuienesSomosSection onNavigateToCarta={() => handleNavigate('carta')} />
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
          <ContactoPage />
        )}

        {activePage === 'terminos' && (
          <TerminosPage onNavigateHome={() => handleNavigate('home')} />
        )}
      </main>

      {/* Footer & Schema.org */}
      <Footer onNavigate={handleNavigate} />

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
      />

      {/* Marketing Assets & QR Modal */}
      <MarketingModal 
        isOpen={isMarketingOpen}
        onClose={() => setIsMarketingOpen(false)}
      />

    </div>
  );
}
