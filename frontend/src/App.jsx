import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import PropertyHero from './components/PropertyHero';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ContactPage from './pages/ContactPage';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);

  // Fetch the single property on mount
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch('/api/apartments');
        const apartments = await res.json();
        if (apartments.length > 0) {
          setPropertyData(apartments[0]);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
      }
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

  const handlePaymentSuccess = () => {
    setCurrentPage('home');
    setSelectedApartment(null);
    setBookingData(null);
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="main-content">
        {currentPage === 'home' && propertyData && (
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
            onCancel={() => setCurrentPage('home')}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage />
        )}

        {currentPage === 'admin' && (
          <AdminPanel />
        )}
      </main>

      <Footer onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
