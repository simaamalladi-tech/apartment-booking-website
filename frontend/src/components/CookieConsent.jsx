import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CookieConsent.css';

const CONSENT_KEY = 'cookie_consent';

function CookieConsent({ onNavigate }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,     // always on, cannot be disabled
    functional: false,   // language preference stored in localStorage
    analytics: false,    // future: analytics tracking
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
    // If consent exists, apply stored preferences
    try {
      const parsed = JSON.parse(stored);
      setPreferences(prev => ({ ...prev, ...parsed, essential: true }));
    } catch { /* invalid stored value, show banner */ }
  }, []);

  const saveConsent = (prefs) => {
    const toSave = { ...prefs, essential: true };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(toSave));
    setPreferences(toSave);
    setVisible(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, functional: true, analytics: true });
  };

  const handleAcceptEssential = () => {
    saveConsent({ essential: true, functional: false, analytics: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleToggle = (key) => {
    if (key === 'essential') return; // cannot disable
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) return null;

  return (
    <div className="cookie-overlay" role="dialog" aria-label={t('cookie.title')}>
      <div className="cookie-banner">
        <div className="cookie-header">
          <h3>🍪 {t('cookie.title')}</h3>
        </div>

        {!showSettings ? (
          <>
            <p className="cookie-text">
              {t('cookie.description')}{' '}
              <button className="cookie-link" onClick={() => onNavigate('privacy')}>
                {t('cookie.privacyLink')}
              </button>
            </p>
            <div className="cookie-actions">
              <button className="cookie-btn cookie-btn-accept" onClick={handleAcceptAll}>
                {t('cookie.acceptAll')}
              </button>
              <button className="cookie-btn cookie-btn-essential" onClick={handleAcceptEssential}>
                {t('cookie.essentialOnly')}
              </button>
              <button className="cookie-btn cookie-btn-settings" onClick={() => setShowSettings(true)}>
                {t('cookie.settings')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="cookie-text">{t('cookie.settingsDescription')}</p>
            <div className="cookie-categories">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <strong>{t('cookie.essentialTitle')}</strong>
                    <p className="cookie-category-desc">{t('cookie.essentialDesc')}</p>
                  </div>
                  <label className="cookie-toggle disabled">
                    <input type="checkbox" checked disabled />
                    <span className="cookie-slider"></span>
                    <span className="cookie-always">{t('cookie.alwaysOn')}</span>
                  </label>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <strong>{t('cookie.functionalTitle')}</strong>
                    <p className="cookie-category-desc">{t('cookie.functionalDesc')}</p>
                  </div>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handleToggle('functional')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <strong>{t('cookie.analyticsTitle')}</strong>
                    <p className="cookie-category-desc">{t('cookie.analyticsDesc')}</p>
                  </div>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="cookie-actions">
              <button className="cookie-btn cookie-btn-accept" onClick={handleSavePreferences}>
                {t('cookie.savePreferences')}
              </button>
              <button className="cookie-btn cookie-btn-settings" onClick={() => setShowSettings(false)}>
                {t('cookie.back')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CookieConsent;
