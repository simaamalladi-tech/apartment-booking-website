import React from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

function Header({ currentPage, onPageChange, onBookNow, scrolled, hidden }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''} ${hidden ? 'header-hidden' : ''}`}>
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
              className="nav-btn book-now-btn"
              onClick={onBookNow}
            >
              {t('nav.bookNow')}
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

      {/* Berlin skyline silhouette along the bottom of the header */}
      <svg
        className="header-skyline"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left buildings */}
        <path
          d="M0,120 L0,92 L14,92 L14,82 L24,82 L24,78 L30,75 L36,78 L36,82 L48,82 L48,90 L58,90 L58,78 L68,78 L68,72 L76,72 L76,66 L80,63 L84,66 L84,72 L94,72 L94,80 L104,80 L104,88 L116,88 L116,78 L124,78 L124,72 L130,72 L130,66 L134,63 L138,66 L138,72 L146,72 L146,80 L156,80 L156,86 L166,86 L166,72 L172,72 L172,65 L176,60 L180,65 L180,72 L188,72 L188,84 L198,84 L198,78 L208,78 L208,72 L218,72 L218,66 L224,63 L230,66 L230,72 L240,72 L240,80 L250,80 L250,86 L262,86 L262,78 L272,78 L272,72 L282,72 L282,66 L286,63 L290,66 L290,72 L300,72 L300,82 L312,82 L312,88 L326,88 L326,80 L336,80 L336,72 L344,72 L344,64 L350,60 L356,56 L362,60 L368,64 L368,72 L374,72 L374,78 L382,78 L382,84 L394,84 L394,76 L404,76 L404,70 L414,70 L414,65 L420,65 L420,60 L424,56 L428,60 L428,65 L434,65 L434,72 L444,72 L444,76 L455,76 L455,120 Z"
          fill="rgba(255,255,255,0.15)"
        />
        {/* Berliner Dom dome */}
        <path
          d="M455,120 L455,76 L462,76 L462,68 L468,68 L468,62 L472,62 L472,56 Q505,32 538,56 L538,62 L542,62 L542,68 L548,68 L548,76 L555,76 L555,120 Z"
          fill="rgba(255,255,255,0.15)"
        />
        <path d="M462,68 L462,60 L465,56 L468,60 L468,68 Z" fill="rgba(255,255,255,0.15)" />
        <path d="M542,68 L542,60 L545,56 L548,60 L548,68 Z" fill="rgba(255,255,255,0.15)" />

        {/* Center buildings */}
        <path
          d="M555,120 L555,76 L565,76 L565,68 L575,68 L575,62 L585,62 L585,58 L590,55 L595,58 L595,62 L605,62 L605,70 L615,70 L615,65 L625,65 L625,58 L630,55 L635,58 L635,65 L645,65 L645,72 L655,72 L655,80 L662,80 L662,72 L672,72 L672,65 L678,65 L678,78 L688,78 L688,84 L698,84 L698,120 Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Fernsehturm (TV Tower) */}
        <rect x="718.5" y="4" width="3" height="30" fill="rgba(255,255,255,0.18)" />
        <rect x="716" y="14" width="8" height="1.2" fill="rgba(255,255,255,0.18)" />
        <rect x="716.5" y="20" width="7" height="1" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="720" cy="38" rx="14" ry="11" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="720" cy="42" rx="12" ry="4" fill="rgba(255,255,255,0.18)" />
        <polygon points="712,48 728,48 724,82 716,82" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="720" cy="56" rx="9" ry="2" fill="rgba(255,255,255,0.18)" />
        <rect x="717" y="82" width="6" height="18" fill="rgba(255,255,255,0.18)" />
        <polygon points="710,100 730,100 742,120 698,120" fill="rgba(255,255,255,0.18)" />

        {/* Buildings between tower and Brandenburg Gate */}
        <path
          d="M742,120 L742,88 L752,88 L752,80 L762,80 L762,72 L772,72 L772,66 L776,63 L780,66 L780,72 L790,72 L790,63 L800,63 L800,56 L810,56 L810,52 L814,50 L818,52 L818,56 L828,56 L828,65 L838,65 L838,60 L848,60 L848,55 L852,52 L856,55 L856,60 L866,60 L866,70 L876,70 L876,78 L886,78 L886,72 L896,72 L896,63 L906,63 L906,56 L916,56 L916,63 L926,63 L926,72 L936,72 L936,80 L948,80 L948,86 L958,86 L958,120 Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Brandenburg Gate */}
        <rect x="960" y="72" width="80" height="4" fill="rgba(255,255,255,0.2)" />
        <rect x="963" y="68" width="74" height="4" fill="rgba(255,255,255,0.2)" />
        <path d="M988,68 L992,60 L996,63 L1000,57 L1004,63 L1008,60 L1012,68 Z" fill="rgba(255,255,255,0.2)" />
        <rect x="964" y="76" width="5" height="28" fill="rgba(255,255,255,0.2)" />
        <rect x="977" y="76" width="5" height="28" fill="rgba(255,255,255,0.2)" />
        <rect x="990" y="76" width="5" height="28" fill="rgba(255,255,255,0.2)" />
        <rect x="1003" y="76" width="5" height="28" fill="rgba(255,255,255,0.2)" />
        <rect x="1016" y="76" width="5" height="28" fill="rgba(255,255,255,0.2)" />
        <rect x="1029" y="76" width="5" height="28" fill="rgba(255,255,255,0.2)" />
        <rect x="958" y="104" width="84" height="16" fill="rgba(255,255,255,0.2)" />

        {/* Right buildings */}
        <path
          d="M1042,120 L1042,86 L1052,86 L1052,78 L1062,78 L1062,72 L1072,72 L1072,64 L1082,64 L1082,56 L1092,56 L1092,50 L1096,48 L1100,50 L1100,56 L1110,56 L1110,65 L1120,65 L1120,58 L1130,58 L1130,52 L1140,52 L1140,58 L1150,58 L1150,66 L1162,66 L1162,74 L1175,74 L1175,65 L1185,65 L1185,58 L1190,55 L1195,58 L1195,65 L1205,65 L1205,74 L1218,74 L1218,82 L1228,82 L1228,76 L1238,76 L1238,68 L1248,68 L1248,76 L1260,76 L1260,84 L1272,84 L1272,78 L1282,78 L1282,72 L1286,69 L1290,72 L1290,78 L1302,78 L1302,84 L1318,84 L1318,80 L1328,80 L1328,86 L1342,86 L1342,82 L1352,82 L1352,88 L1368,88 L1368,84 L1378,84 L1378,90 L1392,90 L1392,86 L1402,86 L1402,92 L1415,92 L1415,88 L1425,88 L1425,94 L1435,94 L1435,98 L1440,98 L1440,120 Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Bottom fill */}
        <rect x="0" y="114" width="1440" height="6" fill="rgba(255,255,255,0.15)" />
      </svg>
    </header>
  );
}

export default Header;
