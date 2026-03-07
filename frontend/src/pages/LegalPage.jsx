import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPage.css';

function LegalPage({ page, onBack }) {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {t('common.back')}
        </button>

        {page === 'impressum' && <ImpressumContent t={t} />}
        {page === 'privacy' && <PrivacyContent t={t} />}
        {page === 'terms' && <TermsContent t={t} />}
      </div>
    </div>
  );
}

function ImpressumContent({ t }) {
  return (
    <div className="legal-content">
      <h1>{t('legal.impressum.title')}</h1>
      <p className="legal-subtitle">{t('legal.impressum.subtitle')}</p>

      <section>
        <h2>{t('legal.impressum.providerTitle')}</h2>
        <p>
          Lutz Richter<br />
          146A Gustav-Adolf-Straße<br />
          13086 Berlin<br />
          Deutschland / Germany
        </p>
      </section>

      <section>
        <h2>{t('legal.impressum.contactTitle')}</h2>
        <p>
          {t('legal.impressum.phone')}: +49 178 348 5970<br />
          {t('legal.impressum.email')}: lutz.richter@gmail.com
        </p>
      </section>

      <section>
        <h2>{t('legal.impressum.disputeTitle')}</h2>
        <p>{t('legal.impressum.disputeText')}</p>
        <p>
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p>{t('legal.impressum.disputeNote')}</p>
      </section>

      <section>
        <h2>{t('legal.impressum.liabilityTitle')}</h2>
        <p>{t('legal.impressum.liabilityText')}</p>
      </section>

      <section>
        <h2>{t('legal.impressum.linksTitle')}</h2>
        <p>{t('legal.impressum.linksText')}</p>
      </section>

      <section>
        <h2>{t('legal.impressum.copyrightTitle')}</h2>
        <p>{t('legal.impressum.copyrightText')}</p>
      </section>
    </div>
  );
}

function PrivacyContent({ t }) {
  return (
    <div className="legal-content">
      <h1>{t('legal.privacy.title')}</h1>
      <p className="legal-subtitle">{t('legal.privacy.lastUpdated')}: 07.03.2026</p>

      <section>
        <h2>1. {t('legal.privacy.overviewTitle')}</h2>
        <p>{t('legal.privacy.overviewText')}</p>
      </section>

      <section>
        <h2>2. {t('legal.privacy.controllerTitle')}</h2>
        <p>
          Lutz Richter<br />
          146A Gustav-Adolf-Straße<br />
          13086 Berlin<br />
          {t('legal.impressum.email')}: lutz.richter@gmail.com<br />
          {t('legal.impressum.phone')}: +49 178 348 5970
        </p>
      </section>

      <section>
        <h2>3. {t('legal.privacy.collectionTitle')}</h2>
        <h3>{t('legal.privacy.bookingDataTitle')}</h3>
        <p>{t('legal.privacy.bookingDataText')}</p>
        <ul>
          <li>{t('legal.privacy.dataName')}</li>
          <li>{t('legal.privacy.dataEmail')}</li>
          <li>{t('legal.privacy.dataPhone')}</li>
          <li>{t('legal.privacy.dataDates')}</li>
          <li>{t('legal.privacy.dataPayment')}</li>
        </ul>

        <h3>{t('legal.privacy.technicalDataTitle')}</h3>
        <p>{t('legal.privacy.technicalDataText')}</p>
      </section>

      <section>
        <h2>4. {t('legal.privacy.purposeTitle')}</h2>
        <ul>
          <li>{t('legal.privacy.purpose1')}</li>
          <li>{t('legal.privacy.purpose2')}</li>
          <li>{t('legal.privacy.purpose3')}</li>
          <li>{t('legal.privacy.purpose4')}</li>
        </ul>
      </section>

      <section>
        <h2>5. {t('legal.privacy.paymentTitle')}</h2>
        <p>{t('legal.privacy.paymentText')}</p>
      </section>

      <section>
        <h2>6. {t('legal.privacy.rightsTitle')}</h2>
        <p>{t('legal.privacy.rightsText')}</p>
        <ul>
          <li>{t('legal.privacy.rightAccess')}</li>
          <li>{t('legal.privacy.rightCorrection')}</li>
          <li>{t('legal.privacy.rightDeletion')}</li>
          <li>{t('legal.privacy.rightRestriction')}</li>
          <li>{t('legal.privacy.rightPortability')}</li>
          <li>{t('legal.privacy.rightObjection')}</li>
        </ul>
      </section>

      <section>
        <h2>7. {t('legal.privacy.retentionTitle')}</h2>
        <p>{t('legal.privacy.retentionText')}</p>
      </section>

      <section>
        <h2>8. {t('legal.privacy.cookiesTitle')}</h2>
        <p>{t('legal.privacy.cookiesText')}</p>
      </section>

      <section>
        <h2>9. {t('legal.privacy.changesTitle')}</h2>
        <p>{t('legal.privacy.changesText')}</p>
      </section>
    </div>
  );
}

function TermsContent({ t }) {
  return (
    <div className="legal-content">
      <h1>{t('legal.terms.title')}</h1>
      <p className="legal-subtitle">{t('legal.terms.lastUpdated')}: 07.03.2026</p>

      <section>
        <h2>1. {t('legal.terms.scopeTitle')}</h2>
        <p>{t('legal.terms.scopeText')}</p>
      </section>

      <section>
        <h2>2. {t('legal.terms.bookingTitle')}</h2>
        <p>{t('legal.terms.bookingText')}</p>
      </section>

      <section>
        <h2>3. {t('legal.terms.pricesTitle')}</h2>
        <p>{t('legal.terms.pricesText')}</p>
      </section>

      <section>
        <h2>4. {t('legal.terms.paymentTermsTitle')}</h2>
        <p>{t('legal.terms.paymentTermsText')}</p>
      </section>

      <section>
        <h2>5. {t('legal.terms.cancellationTitle')}</h2>
        <p>{t('legal.terms.cancellationText')}</p>
      </section>

      <section>
        <h2>6. {t('legal.terms.checkinTitle')}</h2>
        <p>{t('legal.terms.checkinText')}</p>
      </section>

      <section>
        <h2>7. {t('legal.terms.houseRulesTitle')}</h2>
        <ul>
          <li>{t('legal.terms.rule1')}</li>
          <li>{t('legal.terms.rule2')}</li>
          <li>{t('legal.terms.rule3')}</li>
          <li>{t('legal.terms.rule4')}</li>
          <li>{t('legal.terms.rule5')}</li>
        </ul>
      </section>

      <section>
        <h2>8. {t('legal.terms.liabilityTitle')}</h2>
        <p>{t('legal.terms.liabilityText')}</p>
      </section>

      <section>
        <h2>9. {t('legal.terms.governingLawTitle')}</h2>
        <p>{t('legal.terms.governingLawText')}</p>
      </section>

      <section>
        <h2>10. {t('legal.terms.contactTitle')}</h2>
        <p>
          Lutz Richter<br />
          146A Gustav-Adolf-Straße, 13086 Berlin<br />
          lutz.richter@gmail.com<br />
          +49 178 348 5970
        </p>
      </section>
    </div>
  );
}

export default LegalPage;
