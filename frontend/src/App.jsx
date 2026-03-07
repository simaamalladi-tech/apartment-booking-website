import React, { useState, useEffect } from 'react';
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

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleBookNow = () => {
    if (propertyData) {
      setSelectedApartment(propertyData);
      setCurrentPage('booking');
    }
  };

  const handleBookingComplete = (data) => {
    setBookingData(data);
    setCurrentPage('payment');
  };

  const handlePaymentSuccess = (paymentResult) => {
    setBookingData(prev => ({
      ...prev,
      bookingId: paymentResult?.bookingId,
      paymentId: paymentResult?.paymentId
    }));
    setCurrentPage('confirmation');
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setSelectedApartment(null);
    setBookingData(null);
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
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
            onCancel={() => setCurrentPage('home')}
          />
        )}
        
        {currentPage === 'payment' && bookingData && (
          <PaymentPage 
            bookingData={bookingData}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentPage('booking')}
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
          <LegalPage page={currentPage} onBack={() => setCurrentPage('home')} />
        )}
      </main>

      <Footer onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
