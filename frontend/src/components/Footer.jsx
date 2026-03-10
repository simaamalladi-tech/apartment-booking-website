import React from 'react';
import { useTranslation } from 'react-i18next';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './Footer.css';

function Footer({ onPageChange, onBookNow }) {
  const { t } = useTranslation();
  useScrollAnimation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      {/* Also Available On */}
      <div className="also-available fade-in-up">
        <p className="also-available-label">{t('footer.alsoAvailable')}</p>
        <div className="platform-logos">
          <a href="https://www.booking.com/hotel/de/alt-berliner-eckkneipe-feuchte-ecke.html" target="_blank" rel="noopener noreferrer" className="platform-link" aria-label="Booking.com">
            <svg className="platform-logo" viewBox="0 0 300 48" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="48" rx="6" fill="#003580"/><text x="150" y="33" textAnchor="middle" fill="#fff" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">Booking.com</text></svg>
          </a>
          <a href="https://www.airbnb.de/rooms/1593474482014854100" target="_blank" rel="noopener noreferrer" className="platform-link" aria-label="Airbnb">
            <svg className="platform-logo" viewBox="0 0 300 48" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="48" rx="6" fill="#FF5A5F"/><text x="150" y="33" textAnchor="middle" fill="#fff" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">Airbnb</text></svg>
          </a>
          <a href="https://www.google.com/travel/hotels" target="_blank" rel="noopener noreferrer" className="platform-link" aria-label="Google Hotels">
            <svg className="platform-logo google-logo" viewBox="0 0 300 48" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="48" rx="6" fill="#fff" stroke="#ddd"/><text x="20" y="33" fill="#4285F4" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">G</text><text x="40" y="33" fill="#EA4335" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">o</text><text x="62" y="33" fill="#FBBC05" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">o</text><text x="84" y="33" fill="#4285F4" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">g</text><text x="106" y="33" fill="#34A853" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">l</text><text x="118" y="33" fill="#EA4335" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">e</text><text x="145" y="33" fill="#555" fontFamily="Arial,sans-serif" fontSize="20" fontWeight="400">Hotels</text></svg>
          </a>
        </div>
      </div>

      {/* Book Now CTA Banner */}
      <div className="footer-cta fade-in-up">
        <p className="footer-cta-text">{t('cta.footerCta')}</p>
        <button className="footer-cta-btn" onClick={onBookNow}>
          {t('cta.bookNow')} →
        </button>
      </div>

      <div className="footer-container">
        <div className="footer-grid stagger-children">
          {/* Brand */}
          <div className="footer-brand">
            <img src="/logo.svg" alt="Alt-Berliner Eckkneipe" className="footer-logo" />
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <div className="footer-rating">
              <span className="footer-rating-badge">9.3</span>
              <span className="footer-rating-text">{t('property.superb')} · {t('footer.reviews', { count: 82 })}</span>
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
              <li>📍 Gustav-Adolf-Straße 146A, 13086 Berlin</li>
              <li><a href="tel:+491783485970">📞 +49 178 348 5970</a></li>
              <li><a href="mailto:lutz.richter@gmail.com">✉️ lutz.richter@gmail.com</a></li>
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
