import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './SmoobuCalendar.css';

function SmoobuCalendar() {
  const { i18n, t } = useTranslation();
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    const locale = i18n.language === 'de' ? 'de' : 'en';

    // Create the Smoobu calendar widget div
    const calendarDiv = document.createElement('div');
    calendarDiv.className = 'calendarContent';
    calendarDiv.setAttribute('data-load-calendar-url',
      `https://login.smoobu.com/${locale}/cockpit/widget/single-calendar/1896269`
    );
    calendarDiv.setAttribute('data-verification',
      'dde1663403d10f53614f33bf1e4b7499bf420b7710c6447791a28456175b1838'
    );
    calendarDiv.setAttribute('data-baseUrl', 'https://login.smoobu.com');
    calendarDiv.setAttribute('data-disable-css', 'false');

    containerRef.current.appendChild(calendarDiv);

    // Load the Smoobu script
    // Remove previous script if reloading for language change
    const existingScript = document.querySelector('script[src*="CalendarWidget.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://login.smoobu.com/js/Apartment/CalendarWidget.js';
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [i18n.language]);

  return (
    <div className="sidebar-card smoobu-calendar-card fade-in-up">
      <h3>📅 {t('property.availabilityTitle', 'Availability')}</h3>
      <div
        id="smoobuApartment1896269de"
        className="calendarWidget smoobu-calendar-wrapper"
        ref={containerRef}
      />
    </div>
  );
}

export default SmoobuCalendar;
