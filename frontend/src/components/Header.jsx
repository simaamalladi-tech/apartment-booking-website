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
            <a href="/admin" className="admin-link">
              Admin
            </a>
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
