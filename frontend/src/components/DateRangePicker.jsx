import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './DateRangePicker.css';

function DateRangePicker({ apartmentId, checkIn, checkOut, onChange, onRatesLoaded }) {
  const { t, i18n } = useTranslation();
  const [smoobuRates, setSmoobuRates] = useState({});
  const [bookedDates, setBookedDates] = useState(new Set());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selecting, setSelecting] = useState('checkIn');
  const [hoverDate, setHoverDate] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);

  // Fetch Smoobu rates (primary source of truth for availability + pricing)
  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const res = await fetch('/api/smoobu/rates');
        if (res.ok) {
          const data = await res.json();
          setSmoobuRates(data.rates || {});
          // Build booked dates set from Smoobu availability data
          const blocked = new Set();
          for (const [date, info] of Object.entries(data.rates || {})) {
            if (!info.available) {
              blocked.add(date);
            }
          }
          setBookedDates(blocked);
          // Notify parent about rates for dynamic pricing
          if (onRatesLoaded) onRatesLoaded(data.rates || {});
        }
      } catch (err) {
        console.error('Error fetching Smoobu rates:', err);
      }
      // Also fetch local booked dates as fallback
      if (apartmentId) {
        try {
          const res = await fetch(`/api/bookings/booked-dates/${apartmentId}`);
          if (res.ok) {
            const dates = await res.json();
            setBookedDates(prev => {
              const merged = new Set(prev);
              dates.forEach(d => merged.add(d));
              return merged;
            });
          }
        } catch (err) {
          // silently ignore fallback failures
        }
      }
      setLoadingRates(false);
    };
    fetchRates();
  }, [apartmentId, onRatesLoaded]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = today.toISOString().split('T')[0];

  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

  const dayNames = useMemo(() => {
    const days = [];
    // Start from Monday
    for (let i = 1; i <= 7; i++) {
      const d = new Date(2024, 0, i); // Jan 1, 2024 is Monday
      days.push(d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2));
    }
    return days;
  }, [locale]);

  const monthLabel = currentMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0=Sun, 1=Mon, ...). We want Monday=0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days = [];

    // Padding for days before month start
    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }

    // Days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rateInfo = smoobuRates[dateStr];
      days.push({
        day: d,
        date,
        dateStr,
        isPast: date < today,
        isBooked: bookedDates.has(dateStr),
        isToday: dateStr === todayStr,
        price: rateInfo?.price || null,
        minStay: rateInfo?.minStay || null,
      });
    }

    return days;
  }, [currentMonth, bookedDates, smoobuRates, today, todayStr]);

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const canGoPrev = currentMonth > new Date(today.getFullYear(), today.getMonth(), 1);

  const isInRange = (dateStr) => {
    if (!checkIn || !dateStr) return false;
    const end = hoverDate && selecting === 'checkOut' ? hoverDate : checkOut;
    if (!end) return false;
    return dateStr > checkIn && dateStr < end;
  };

  const hasBookedInRange = (start, end) => {
    if (!start || !end) return false;
    for (const d of bookedDates) {
      if (d >= start && d < end) return true;
    }
    return false;
  };

  const handleDayClick = (day) => {
    if (!day || day.isPast || day.isBooked) return;

    if (selecting === 'checkIn') {
      onChange(day.dateStr, '');
      setSelecting('checkOut');
    } else {
      // Check-out selection
      if (day.dateStr <= checkIn) {
        // If clicked before check-in, reset
        onChange(day.dateStr, '');
        setSelecting('checkOut');
        return;
      }
      // Check no booked dates in range
      if (hasBookedInRange(checkIn, day.dateStr)) {
        // Invalid range, reset
        onChange(day.dateStr, '');
        setSelecting('checkOut');
        return;
      }
      onChange(checkIn, day.dateStr);
      setSelecting('checkIn');
    }
  };

  const getDayClass = (day) => {
    if (!day) return 'cal-day cal-empty';
    let cls = 'cal-day';
    if (day.isPast) cls += ' cal-past';
    if (day.isBooked) cls += ' cal-booked';
    if (day.isToday) cls += ' cal-today';
    if (day.dateStr === checkIn) cls += ' cal-selected cal-check-in';
    if (day.dateStr === checkOut) cls += ' cal-selected cal-check-out';
    if (isInRange(day.dateStr)) cls += ' cal-in-range';
    if (!day.isPast && !day.isBooked) cls += ' cal-available';
    return cls;
  };

  return (
    <div className="date-range-picker">
      <div className="drp-labels">
        <button
          type="button"
          className={`drp-label ${selecting === 'checkIn' ? 'drp-label-active' : ''}`}
          onClick={() => setSelecting('checkIn')}
        >
          <span className="drp-label-title">{t('booking.checkIn')}</span>
          <span className="drp-label-value">{checkIn || '—'}</span>
        </button>
        <div className="drp-arrow">→</div>
        <button
          type="button"
          className={`drp-label ${selecting === 'checkOut' ? 'drp-label-active' : ''}`}
          onClick={() => setSelecting('checkOut')}
        >
          <span className="drp-label-title">{t('booking.checkOut')}</span>
          <span className="drp-label-value">{checkOut || '—'}</span>
        </button>
      </div>

      <div className="cal-container">
        <div className="cal-header">
          <button type="button" className="cal-nav" onClick={prevMonth} disabled={!canGoPrev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="cal-month-label">{monthLabel}</span>
          <button type="button" className="cal-nav" onClick={nextMonth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div className="cal-weekdays">
          {dayNames.map((name, i) => (
            <div key={i} className="cal-weekday">{name}</div>
          ))}
        </div>

        <div className="cal-grid">
          {calendarDays.map((day, i) => (
            <button
              key={i}
              type="button"
              className={getDayClass(day)}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => day && !day.isPast && !day.isBooked && setHoverDate(day.dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={!day || day.isPast || day.isBooked}
              title={day?.isBooked ? t('booking.dateBooked') : day?.price ? `€${day.price}` : ''}
            >
              {day ? (
                <>
                  <span className="cal-day-num">{day.day}</span>
                  {day.price && !day.isPast && !day.isBooked && (
                    <span className="cal-day-price">€{day.price}</span>
                  )}
                </>
              ) : ''}
            </button>
          ))}
        </div>

        {loadingRates && (
          <div className="cal-loading">
            <span>{t('common.loading', 'Loading...')}</span>
          </div>
        )}

        <div className="cal-legend">
          <div className="cal-legend-item">
            <span className="cal-legend-dot cal-legend-available"></span>
            <span>{t('booking.available')}</span>
          </div>
          <div className="cal-legend-item">
            <span className="cal-legend-dot cal-legend-booked"></span>
            <span>{t('booking.booked')}</span>
          </div>
          <div className="cal-legend-item">
            <span className="cal-legend-dot cal-legend-selected"></span>
            <span>{t('booking.selected')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DateRangePicker;
