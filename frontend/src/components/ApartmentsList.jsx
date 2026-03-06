import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ApartmentCard from './ApartmentCard';
import './ApartmentsList.css';

function ApartmentsList({ onSelectApartment }) {
  const { t } = useTranslation();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/apartments');
      const data = await response.json();
      setApartments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      // Mock data for demo
      setApartments(mockApartments);
      setLoading(false);
    }
  };

  const filteredApartments = apartments.filter(apt =>
    apt.city.toLowerCase().includes(searchCity.toLowerCase())
  );

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="apartments-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="search-input"
        />
        <button className="search-btn">{t('home.search')}</button>
      </div>

      <h2>{t('apartments.title')}</h2>

      {filteredApartments.length === 0 ? (
        <p className="no-results">{t('apartments.noResults')}</p>
      ) : (
        <div className="apartments-grid">
          {filteredApartments.map(apartment => (
            <ApartmentCard
              key={apartment._id || apartment.id}
              apartment={apartment}
              onBook={() => onSelectApartment(apartment)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Mock data for demo
const mockApartments = [
  {
    id: '1',
    title: 'Modern Studio in Berlin',
    city: 'Berlin',
    price: 45,
    beds: 0,
    baths: 1,
    image: '🏢',
    description: 'Cozy studio apartment in the heart of Berlin'
  },
  {
    id: '2',
    title: 'Spacious 2BR in Munich',
    city: 'Munich',
    price: 75,
    beds: 2,
    baths: 1,
    image: '🏠',
    description: 'Beautiful 2-bedroom apartment near the city center'
  },
  {
    id: '3',
    title: 'Luxury Penthouse in Hamburg',
    city: 'Hamburg',
    price: 120,
    beds: 3,
    baths: 2,
    image: '🏛️',
    description: 'Stunning penthouse with a view'
  },
  {
    id: '4',
    title: 'Cozy 1BR in Frankfurt',
    city: 'Frankfurt',
    price: 55,
    beds: 1,
    baths: 1,
    image: '🏘️',
    description: 'Comfortable 1-bedroom in a peaceful neighborhood'
  },
  {
    id: '5',
    title: 'Modern 2BR in Cologne',
    city: 'Cologne',
    price: 65,
    beds: 2,
    baths: 1,
    image: '🏢',
    description: 'Contemporary apartment with modern amenities'
  },
  {
    id: '6',
    title: '3BR Family Home in Dresden',
    city: 'Dresden',
    price: 85,
    beds: 3,
    baths: 2,
    image: '🏠',
    description: 'Spacious family apartment with garden'
  }
];

export default ApartmentsList;
