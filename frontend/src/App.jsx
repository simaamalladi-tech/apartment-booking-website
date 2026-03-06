import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import ApartmentsList from './components/ApartmentsList';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const handleSelectApartment = (apartment) => {
    setSelectedApartment(apartment);
    setCurrentPage('booking');
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
        {currentPage === 'home' && (
          <ApartmentsList onSelectApartment={handleSelectApartment} />
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
      </main>
    </div>
  );
}

export default App;
