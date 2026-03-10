import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

function Header({ currentPage, onPageChange, onBookNow, scrolled, hidden }) {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleNav = useCallback((page) => {
    onPageChange(page);
    setMenuOpen(false);
  }, [onPageChange]);

  const handleBook = useCallback(() => {
    onBookNow();
    setMenuOpen(false);
  }, [onBookNow]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''} ${hidden ? 'header-hidden' : ''}`}>
      {/* Overlay for mobile menu */}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}

      <div className="header-container">
        <div className="logo" onClick={() => handleNav('home')} style={{ cursor: 'pointer' }}>
          <img src="/logo.svg" alt="Alt-Berliner Eckkneipe" className="logo-img" />
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={`header-right ${menuOpen ? 'menu-open' : ''}`}>
          <nav className="nav">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handleNav('home')}
            >
              {t('nav.home')}
            </button>
            <button
              className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
              onClick={() => handleNav('contact')}
            >
              {t('nav.contact')}
            </button>
            <button className="book-now-btn" onClick={handleBook}>
              {t('nav.bookNow')}
            </button>
          </nav>

          <div className="lang-toggle">
            <button
              className={i18n.language === 'en' ? 'active' : ''}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <button
              className={i18n.language === 'de' ? 'active' : ''}
              onClick={() => changeLanguage('de')}
            >
              DE
            </button>
          </div>
        </div>
      </div>

      {/* Berlin skyline silhouette along the bottom of the header */}
      <svg
        className="header-skyline"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background layer — distant buildings, softer */}
        <path
          d="M0,120 L0,98 L30,98 L30,92 L55,92 L55,96 L80,96 L80,90 L110,90 L110,94 L140,94 L140,88 L170,88 L170,92 L200,92 L200,86 L230,86 L230,90 L265,90 L265,84 L295,84 L295,88 L330,88 L330,82 L360,82 L360,86 L395,86 L395,80 L425,80 L425,84 L460,84 L460,78 L490,78 L490,82 L520,82 L520,76 L555,76 L555,80 L590,80 L590,76 L620,76 L620,80 L655,80 L655,76 L690,76 L690,72 L740,72 L740,76 L770,76 L770,80 L800,80 L800,76 L835,76 L835,80 L870,80 L870,76 L905,76 L905,82 L940,82 L940,78 L975,78 L975,84 L1010,84 L1010,80 L1050,80 L1050,86 L1085,86 L1085,82 L1120,82 L1120,88 L1155,88 L1155,84 L1195,84 L1195,90 L1230,90 L1230,86 L1270,86 L1270,92 L1310,92 L1310,88 L1350,88 L1350,94 L1390,94 L1390,98 L1440,98 L1440,120 Z"
          fill="rgba(255,255,255,0.12)"
        />

        {/* Main skyline — left section */}
        <path
          d="M0,120 L0,94 L16,94 L16,84 L28,84 L28,80 L32,77 L36,80 L36,84 L50,84 L50,92 L62,92 L62,80 L74,80 L74,72 L78,69 L82,72 L82,80 L96,80 L96,90 L110,90 L110,82 L120,82 L120,74 L124,71 L128,74 L128,82 L140,82 L140,90 L154,90 L154,78 L164,78 L164,70 L168,66 L172,70 L172,78 L186,78 L186,88 L200,88 L200,80 L212,80 L212,72 L218,69 L224,72 L224,80 L238,80 L238,88 L252,88 L252,80 L264,80 L264,72 L268,69 L272,72 L272,80 L288,80 L288,90 L306,90 L306,82 L318,82 L318,74 L326,74 L326,66 L332,60 L338,54 L344,60 L350,66 L350,74 L358,74 L358,82 L370,82 L370,90 L386,90 L386,80 L398,80 L398,72 L410,72 L410,66 L414,63 L418,66 L418,72 L430,72 L430,82 L455,82 L455,120 Z"
          fill="rgba(255,255,255,0.35)"
        />

        {/* Berliner Dom — prominent dome */}
        <path
          d="M455,120 L455,82 L464,82 L464,72 L470,72 L470,64 L474,64 L474,56 Q505,28 536,56 L536,64 L540,64 L540,72 L546,72 L546,82 L555,82 L555,120 Z"
          fill="rgba(255,255,255,0.35)"
        />
        {/* Dom cross */}
        <rect x="503" y="24" width="3" height="10" fill="rgba(255,255,255,0.4)" />
        <rect x="500" y="27" width="9" height="2.5" fill="rgba(255,255,255,0.4)" />
        {/* Dom side turrets */}
        <path d="M464,72 L464,62 L467,56 L470,62 L470,72 Z" fill="rgba(255,255,255,0.35)" />
        <path d="M540,72 L540,62 L543,56 L546,62 L546,72 Z" fill="rgba(255,255,255,0.35)" />

        {/* Center buildings before tower */}
        <path
          d="M555,120 L555,82 L568,82 L568,72 L580,72 L580,64 L588,64 L588,58 L592,55 L596,58 L596,64 L608,64 L608,74 L620,74 L620,66 L630,66 L630,58 L634,55 L638,58 L638,66 L650,66 L650,76 L662,76 L662,84 L672,84 L672,74 L682,74 L682,82 L698,82 L698,120 Z"
          fill="rgba(255,255,255,0.35)"
        />

        {/* ====== FERNSEHTURM (TV Tower) — centerpiece ====== */}
        <rect x="718" y="3" width="4" height="32" fill="rgba(255,255,255,0.45)" />
        <rect x="715" y="14" width="10" height="1.5" fill="rgba(255,255,255,0.4)" />
        <rect x="715.5" y="22" width="9" height="1.2" fill="rgba(255,255,255,0.4)" />
        <ellipse cx="720" cy="40" rx="16" ry="13" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="720" cy="45" rx="13" ry="4.5" fill="rgba(255,255,255,0.45)" />
        <polygon points="711,50 729,50 725,86 715,86" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="720" cy="60" rx="11" ry="2.5" fill="rgba(255,255,255,0.4)" />
        <rect x="716" y="86" width="8" height="16" fill="rgba(255,255,255,0.45)" />
        <polygon points="708,102 732,102 744,120 696,120" fill="rgba(255,255,255,0.45)" />

        {/* Buildings between tower and Brandenburg Gate */}
        <path
          d="M744,120 L744,90 L758,90 L758,80 L770,80 L770,72 L778,72 L778,66 L782,63 L786,66 L786,72 L798,72 L798,62 L810,62 L810,54 L816,51 L822,54 L822,62 L834,62 L834,72 L846,72 L846,64 L854,64 L854,58 L858,55 L862,58 L862,64 L874,64 L874,74 L886,74 L886,82 L898,82 L898,72 L910,72 L910,62 L920,62 L920,72 L932,72 L932,82 L946,82 L946,90 L958,90 L958,120 Z"
          fill="rgba(255,255,255,0.35)"
        />

        {/* ====== BRANDENBURG GATE ====== */}
        {/* Top beam */}
        <rect x="960" y="72" width="82" height="5" fill="rgba(255,255,255,0.45)" />
        {/* Attic */}
        <rect x="963" y="66" width="76" height="6" fill="rgba(255,255,255,0.45)" />
        {/* Quadriga (horses + chariot) */}
        <path d="M988,66 L993,56 L997,60 L1001,52 L1005,60 L1009,56 L1014,66 Z" fill="rgba(255,255,255,0.45)" />
        <rect x="997" y="48" width="8" height="5" fill="rgba(255,255,255,0.45)" />
        <polygon points="999,48 1001,40 1003,48" fill="rgba(255,255,255,0.45)" />
        {/* 6 columns */}
        <rect x="964" y="77" width="6" height="30" fill="rgba(255,255,255,0.45)" />
        <rect x="978" y="77" width="6" height="30" fill="rgba(255,255,255,0.45)" />
        <rect x="992" y="77" width="6" height="30" fill="rgba(255,255,255,0.45)" />
        <rect x="1006" y="77" width="6" height="30" fill="rgba(255,255,255,0.45)" />
        <rect x="1020" y="77" width="6" height="30" fill="rgba(255,255,255,0.45)" />
        <rect x="1034" y="77" width="6" height="30" fill="rgba(255,255,255,0.45)" />
        {/* Base steps */}
        <rect x="958" y="107" width="86" height="13" fill="rgba(255,255,255,0.45)" />

        {/* Right buildings */}
        <path
          d="M1044,120 L1044,90 L1058,90 L1058,80 L1070,80 L1070,72 L1082,72 L1082,62 L1094,62 L1094,54 L1098,51 L1102,54 L1102,62 L1114,62 L1114,72 L1128,72 L1128,64 L1138,64 L1138,56 L1148,56 L1148,64 L1160,64 L1160,74 L1174,74 L1174,82 L1188,82 L1188,72 L1198,72 L1198,64 L1202,61 L1206,64 L1206,72 L1218,72 L1218,82 L1232,82 L1232,76 L1244,76 L1244,68 L1256,68 L1256,76 L1268,76 L1268,84 L1282,84 L1282,78 L1292,78 L1292,72 L1296,69 L1300,72 L1300,78 L1312,78 L1312,86 L1328,86 L1328,80 L1340,80 L1340,88 L1358,88 L1358,84 L1370,84 L1370,90 L1386,90 L1386,86 L1398,86 L1398,92 L1414,92 L1414,88 L1426,88 L1426,96 L1440,96 L1440,120 Z"
          fill="rgba(255,255,255,0.35)"
        />

        {/* Bottom band to anchor the skyline */}
        <rect x="0" y="116" width="1440" height="4" fill="rgba(255,255,255,0.25)" />
      </svg>
    </header>
  );
}

export default Header;
