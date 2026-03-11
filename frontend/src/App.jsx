import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import PropertyHero from './components/PropertyHero';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ContactPage from './pages/ContactPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LegalPage from './pages/LegalPage';
import CookieConsent from './components/CookieConsent';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [propertyError, setPropertyError] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Fetch the single property on mount
  useEffect(() => {
    const fetchProperty = async () => {
      setPropertyLoading(true);
      setPropertyError(false);
      try {
        const res = await fetch('/api/apartments');
        const apartments = await res.json();
        if (apartments.length > 0) {
          setPropertyData(apartments[0]);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setPropertyError(true);
      }
      setPropertyLoading(false);
    };
    fetchProperty();
  }, []);

  // Handle Stripe Checkout return (PayPal via Stripe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('checkout_session_id');
    const cancelled = params.get('checkout_cancelled');

    if (cancelled) {
      // User cancelled the Stripe Checkout — restore booking data and go to payment page
      window.history.replaceState({}, '', '/');
      const saved = sessionStorage.getItem('pendingBookingData');
      if (saved) {
        try {
          const restored = JSON.parse(saved);
          setBookingData(restored);
          setSelectedApartment(restored.apartment);
          setCurrentPage('payment');
        } catch (e) { /* ignore parse errors */ }
      }
      sessionStorage.removeItem('pendingBookingData');
      return;
    }

    if (sessionId) {
      // User completed Stripe Checkout — verify and show confirmation
      window.history.replaceState({}, '', '/');
      const saved = sessionStorage.getItem('pendingBookingData');
      let restoredData = null;
      if (saved) {
        try { restoredData = JSON.parse(saved); } catch (e) { /* ignore */ }
      }
      sessionStorage.removeItem('pendingBookingData');

      const verifySession = async () => {
        try {
          const res = await fetch(`/api/payments/checkout-session/${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (data.success) {
            setBookingData(prev => ({
              ...(restoredData || prev || {}),
              bookingId: data.bookingId,
              paymentId: data.paymentId,
            }));
            setCurrentPage('confirmation');
          } else {
            // Payment not completed — restore booking data and return to payment page
            if (restoredData) {
              setBookingData(restoredData);
              setSelectedApartment(restoredData.apartment);
              setCurrentPage('payment');
            }
          }
        } catch (err) {
          console.error('Checkout verification error:', err);
          if (restoredData) {
            setBookingData(restoredData);
            setSelectedApartment(restoredData.apartment);
            setCurrentPage('payment');
          }
        }
      };
      verifySession();
    }
  }, []);

  // Header show/hide on scroll with hysteresis to prevent bounce
  useEffect(() => {
    let ticking = false;
    let lastDirection = 'up';
    let directionChangeY = 0;
    const HYSTERESIS = 40; // px of consistent scroll needed to toggle

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        setHeaderScrolled(currentScrollY > 50);

        if (currentScrollY <= 200) {
          setHeaderHidden(false);
          lastDirection = 'up';
          directionChangeY = currentScrollY;
        } else {
          const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
          if (direction !== lastDirection) {
            directionChangeY = lastScrollY.current;
            lastDirection = direction;
          }
          const delta = Math.abs(currentScrollY - directionChangeY);
          if (delta > HYSTERESIS) {
            setHeaderHidden(direction === 'down');
          }
        }

        lastScrollY.current = currentScrollY;
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated page change
  const navigateTo = (page) => {
    if (page === currentPage) return;
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => setPageTransition(false), 50);
    }, 250);
  };

  const handleBookNow = () => {
    if (propertyData) {
      setSelectedApartment(propertyData);
      navigateTo('booking');
    }
  };

  const handleBookingComplete = (data) => {
    setBookingData(data);
    navigateTo('payment');
  };

  const handlePaymentSuccess = (paymentResult) => {
    setBookingData(prev => ({
      ...prev,
      bookingId: paymentResult?.bookingId,
      paymentId: paymentResult?.paymentId
    }));
    navigateTo('confirmation');
  };

  const handleGoHome = () => {
    navigateTo('home');
    setSelectedApartment(null);
    setBookingData(null);
  };

  return (
    <div className="app">
      <Header
        currentPage={currentPage}
        onPageChange={navigateTo}
        onBookNow={handleBookNow}
        scrolled={headerScrolled}
        hidden={headerHidden}
      />
      
      <main className={`main-content ${pageTransition ? 'page-exit' : 'page-enter'}`}>
        {currentPage === 'home' && propertyLoading && (
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>{t('common.loading', 'Loading...')}</p>
          </div>
        )}

        {currentPage === 'home' && propertyError && !propertyLoading && (
          <div className="page-error">
            <p>{t('common.loadError', 'Unable to load property. Please try again.')}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">{t('common.retry', 'Retry')}</button>
          </div>
        )}

        {currentPage === 'home' && propertyData && !propertyLoading && (
          <PropertyHero 
            apartment={propertyData}
            onBookNow={handleBookNow}
          />
        )}
        
        {currentPage === 'booking' && selectedApartment && (
          <BookingPage 
            apartment={selectedApartment}
            onBookingComplete={handleBookingComplete}
            onCancel={() => navigateTo('home')}
          />
        )}
        
        {currentPage === 'payment' && bookingData && (
          <PaymentPage 
            bookingData={bookingData}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => navigateTo('booking')}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage onBookNow={handleBookNow} />
        )}

        {currentPage === 'confirmation' && bookingData && (
          <ConfirmationPage
            bookingData={bookingData}
            onGoHome={handleGoHome}
          />
        )}

        {(currentPage === 'impressum' || currentPage === 'privacy' || currentPage === 'terms') && (
          <LegalPage page={currentPage} onBack={() => navigateTo('home')} />
        )}
      </main>

      <Footer onPageChange={navigateTo} onBookNow={handleBookNow} />
      <CookieConsent onNavigate={navigateTo} />
    </div>
  );
}

export default App;
