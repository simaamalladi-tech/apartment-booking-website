import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import BerlinSkyline from './components/BerlinSkyline';
import Footer from './components/Footer';
import PropertyHero from './components/PropertyHero';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ContactPage from './pages/ContactPage';
import AdminPanel from './pages/AdminPanel';
import ConfirmationPage from './pages/ConfirmationPage';
import LegalPage from './pages/LegalPage';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [propertyError, setPropertyError] = useState(false);
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

  // Header show/hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHeaderScrolled(currentScrollY > 50);
      if (currentScrollY > 200) {
        setHeaderHidden(currentScrollY > lastScrollY.current && currentScrollY > 300);
      } else {
        setHeaderHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Page navigation with scroll to top
  const navigateTo = (page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
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
        scrolled={headerScrolled}
        hidden={headerHidden}
      />
      <BerlinSkyline />
      
      <main className="main-content">
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
          <ContactPage />
        )}

        {currentPage === 'confirmation' && bookingData && (
          <ConfirmationPage
            bookingData={bookingData}
            onGoHome={handleGoHome}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPanel />
        )}

        {(currentPage === 'impressum' || currentPage === 'privacy' || currentPage === 'terms') && (
          <LegalPage page={currentPage} onBack={() => navigateTo('home')} />
        )}
      </main>

      <Footer onPageChange={navigateTo} />
    </div>
  );
}

export default App;
