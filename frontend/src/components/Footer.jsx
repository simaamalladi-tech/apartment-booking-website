import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

function Footer({ onPageChange }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <img src="/logo.svg" alt="Alt-Berliner Eckkneipe" className="footer-logo" />
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <div className="footer-rating">
              <span className="footer-rating-badge">9.3</span>
              <span className="footer-rating-text">{t('property.superb')} · 82 Reviews</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              <li><button onClick={() => onPageChange('home')}>{t('footer.home')}</button></li>
              <li><button onClick={() => onPageChange('home')}>{t('footer.bookNow')}</button></li>
              <li><button onClick={() => onPageChange('contact')}>{t('footer.contact')}</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-links">
            <h4>{t('footer.contactUs')}</h4>
            <ul className="footer-contact-list">
              <li>📍 146A Gustav-Adolf-Straße, 13086 Berlin</li>
              <li>📞 +49 178 348 5970</li>
              <li>✉️ lutz.richter@gmail.com</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-links">
            <h4>{t('footer.legal')}</h4>
            <ul>
              <li><button onClick={() => onPageChange('impressum')}>{t('footer.impressum')}</button></li>
              <li><button onClick={() => onPageChange('privacy')}>{t('footer.privacy')}</button></li>
              <li><button onClick={() => onPageChange('terms')}>{t('footer.terms')}</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.copyright', { year })}</p>
          <p className="footer-made">{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
