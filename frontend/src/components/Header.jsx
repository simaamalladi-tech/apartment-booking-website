import React from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

function Header({ currentPage, onPageChange }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => onPageChange('home')} style={{ cursor: 'pointer' }}>
          <img src="/logo.svg" alt="Alt-Berliner Eckkneipe" className="logo-img" />
        </div>

        <div className="header-right">
          <nav className="nav">
            <button 
              className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => onPageChange('home')}
            >
              {t('nav.home')}
            </button>
            <button 
              className={`nav-btn ${currentPage === 'contact' ? 'active' : ''}`}
              onClick={() => onPageChange('contact')}
            >
              {t('nav.contact')}
            </button>
            <button
              className={`nav-btn admin-btn ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => onPageChange('admin')}
            >
              {t('nav.admin')}
            </button>
          </nav>

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
