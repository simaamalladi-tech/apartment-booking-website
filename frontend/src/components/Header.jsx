import React from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

function Header({ currentPage, onPageChange }) {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🏠 ApartmentHub</h1>
        </div>

        <nav className="nav">
          <ul className="nav-menu">
            <li>
              <button 
                className={currentPage === 'home' ? 'active' : ''}
                onClick={() => onPageChange('home')}
              >
                {t('nav.home')}
              </button>
            </li>
            <li>
              <button 
                className={currentPage === 'apartments' ? 'active' : ''}
                onClick={() => onPageChange('apartments')}
              >
                {t('nav.apartments')}
              </button>
            </li>
            <li>
              <button 
                className={currentPage === 'bookings' ? 'active' : ''}
                onClick={() => onPageChange('bookings')}
              >
                {t('nav.bookings')}
              </button>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="language-selector">
            <button 
              className={i18n.language === 'en' ? 'active' : ''}
              onClick={() => changeLanguage('en')}
              title="English"
            >
              EN
            </button>
            <button 
              className={i18n.language === 'de' ? 'active' : ''}
              onClick={() => changeLanguage('de')}
              title="Deutsch"
            >
              DE
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
