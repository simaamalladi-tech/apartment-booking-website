import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './SmoobuCalendar.css';

function SmoobuCalendar() {
  const { i18n, t } = useTranslation();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/smoobu/rates')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (data?.rates && Object.keys(data.rates).length > 0) {
          setRates(data.rates);
          setDataLoaded(true);
        }
      })
      .catch(err => {
        console.error('SmoobuCalendar: failed to load rates', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayNames = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(2024, 0, i); // Jan 1 2024 = Monday
      days.push(d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2));
    }
    return days;
  }, [locale]);

  const buildMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    let startDow = first.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rateInfo = rates[dateStr];
      days.push({
        day: d,
        dateStr,
        isPast: date < today,
        available: rateInfo != null ? !!rateInfo.available : null,
        price: rateInfo?.price || null,
      });
    }
    return days;
  };

  const secondMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
  const month1Days = buildMonth(baseMonth);
  const month2Days = buildMonth(secondMonth);

  const canGoPrev = baseMonth > new Date(today.getFullYear(), today.getMonth(), 1);

  const prevMonth = () => setBaseMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setBaseMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const label1 = baseMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const label2 = secondMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const renderMonth = (days, label) => (
    <div className="avail-month">
      <div className="avail-month-label">{label}</div>
      <div className="avail-weekdays">
        {dayNames.map((n, i) => <div key={i} className="avail-weekday">{n}</div>)}
      </div>
      <div className="avail-grid">
        {days.map((day, i) => {
          if (!day) return <div key={i} className="avail-cell avail-empty" />;
          let cls = 'avail-cell';
          if (day.isPast) cls += ' avail-past';
          else if (day.available === false) cls += ' avail-booked';
          else if (day.available === true) cls += ' avail-free';
          else cls += ' avail-no-data';
          return (
            <div key={i} className={cls} title={day.price ? `€${day.price}` : ''}>
              <span className="avail-day-num">{day.day}</span>
              {day.price && !day.isPast && day.available && (
                <span className="avail-day-price">€{day.price}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="sidebar-card avail-calendar-card fade-in-up">
      <h3>📅 {t('property.availabilityTitle', 'Availability')}</h3>

      {loading ? (
        <div className="avail-loading">
          <div className="avail-spinner" />
          <span>{t('common.loading', 'Loading...')}</span>
        </div>
      ) : (
        <>
          <div className="avail-nav">
            <button className="avail-nav-btn" onClick={prevMonth} disabled={!canGoPrev} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="avail-nav-btn" onClick={nextMonth} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="avail-months-row">
            {renderMonth(month1Days, label1)}
            {renderMonth(month2Days, label2)}
          </div>
          <div className="avail-legend">
            <div className="avail-legend-item">
              <span className="avail-legend-dot avail-legend-free" />
              <span>{t('booking.available', 'Available')}</span>
            </div>
            <div className="avail-legend-item">
              <span className="avail-legend-dot avail-legend-booked" />
              <span>{t('booking.booked', 'Booked')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SmoobuCalendar;
