import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminPanel.css';

const ADMIN_PASSWORD = 'admin123';

function AdminPanel() {
  const { t } = useTranslation();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) fetchBookings();
  }, [authenticated]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError(t('admin.loginError'));
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPassword('');
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(t('admin.loadError'));
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
        showToast(status === 'confirmed' ? t('admin.confirmSuccess') : t('admin.cancelSuccess'));
        if (selectedBooking?._id === id) setSelectedBooking(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showToast(t('common.error'), 'error');
    }
    setActionLoading(null);
    setConfirmAction(null);
  };

  const cancelBooking = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
        showToast(t('admin.cancelSuccess'));
        if (selectedBooking?._id === id) setSelectedBooking(prev => ({ ...prev, status: 'cancelled' }));
      }
    } catch (err) {
      showToast(t('common.error'), 'error');
    }
    setActionLoading(null);
    setConfirmAction(null);
  };

  const resendEmail = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/bookings/${id}/send-email`, { method: 'POST' });
      const data = await res.json();
      showToast(data.success ? t('admin.emailSent') : t('admin.emailFailed'), data.success ? 'success' : 'error');
    } catch (err) {
      showToast(t('admin.emailFailed'), 'error');
    }
    setActionLoading(null);
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (b.user?.name || '').toLowerCase().includes(s) || (b.user?.email || '').toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formatDateLong = (d) => d ? new Date(d).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const statusClass = (s) => `status-badge status-${s}`;
  const statusLabel = (s) => t(`admin.${s}`);

  const requestConfirmAction = (id, action, booking) => setConfirmAction({ id, action, booking });

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.action === 'confirm') updateStatus(confirmAction.id, 'confirmed');
    else cancelBooking(confirmAction.id);
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <div className="login-card">
            <div className="login-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2>{t('admin.loginTitle')}</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>{t('admin.passwordLabel')}</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }} placeholder="••••••••" autoFocus />
              </div>
              {loginError && <div className="login-error">{loginError}</div>}
              <button type="submit" className="login-btn">{t('admin.loginButton')}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>{t('admin.title')}</h1>
            <p className="admin-subtitle">{t('admin.subtitle')}</p>
          </div>
          <div className="admin-header-actions">
            <button className="refresh-btn" onClick={fetchBookings} title={t('admin.refresh')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
            <button className="logout-btn" onClick={handleLogout}>{t('admin.logout')}</button>
          </div>
        </div>

        <div className="stats-grid">
          {[
            { key: 'total', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, value: stats.total, label: t('admin.totalBookings') },
            { key: 'confirmed', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, value: stats.confirmed, label: t('admin.confirmedBookings') },
            { key: 'pending', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, value: stats.pending, label: t('admin.pendingBookings') },
            { key: 'cancelled', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, value: stats.cancelled, label: t('admin.cancelledBookings') },
            { key: 'revenue', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, value: `€${stats.revenue}`, label: t('admin.revenue') }
          ].map(s => (
            <div key={s.key} className={`stat-card stat-${s.key}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-toolbar">
          <div className="filter-pills">
            {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
              <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? t('admin.filterAll') : t(`admin.${f}`)}
                {f !== 'all' && <span className="pill-count">{stats[f] || 0}</span>}
              </button>
            ))}
          </div>
          <input type="text" placeholder={t('admin.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="admin-search" />
        </div>

        {error && <div className="admin-error">{error}</div>}
        {loading && <div className="admin-loading">{t('common.loading')}</div>}
        {!loading && filteredBookings.length === 0 && <div className="admin-empty">{t('admin.noBookings')}</div>}

        {!loading && filteredBookings.length > 0 && (
          <div className="bookings-table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>{t('admin.guest')}</th>
                  <th>{t('admin.email')}</th>
                  <th>{t('admin.dates')}</th>
                  <th>{t('admin.nightsLabel')}</th>
                  <th>{t('admin.guestsLabel')}</th>
                  <th>{t('admin.amount')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} onClick={() => setSelectedBooking(booking)} className="booking-row-clickable">
                    <td className="guest-name">{booking.user?.name || '—'}</td>
                    <td className="guest-email">{booking.user?.email || '—'}</td>
                    <td className="dates-cell">{formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}</td>
                    <td>{booking.numberOfNights || '—'}</td>
                    <td>{booking.numberOfGuests || '—'}</td>
                    <td className="amount-cell">€{booking.totalPrice || 0}</td>
                    <td><span className={statusClass(booking.status)}>{statusLabel(booking.status)}</span></td>
                    <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                      {booking.status === 'pending' && (
                        <>
                          <button className="action-btn confirm-btn" disabled={actionLoading === booking._id} onClick={() => requestConfirmAction(booking._id, 'confirm', booking)} title={t('admin.confirm')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                          <button className="action-btn cancel-btn" disabled={actionLoading === booking._id} onClick={() => requestConfirmAction(booking._id, 'cancel', booking)} title={t('admin.cancel')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button className="action-btn cancel-btn" disabled={actionLoading === booking._id} onClick={() => requestConfirmAction(booking._id, 'cancel', booking)} title={t('admin.cancel')}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                      {booking.status === 'cancelled' && <span className="no-actions">—</span>}
                      <button className="action-btn email-btn" disabled={actionLoading === booking._id} onClick={() => resendEmail(booking._id)} title={t('admin.resendEmail')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBooking(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="modal-header">
              <h2>{t('admin.bookingDetails')}</h2>
              <span className={statusClass(selectedBooking.status)}>{statusLabel(selectedBooking.status)}</span>
            </div>
            <div className="detail-grid">
              <div className="detail-section">
                <h3>{t('admin.guestInfo')}</h3>
                <div className="detail-row"><span className="detail-label">{t('admin.guest')}</span><span className="detail-value">{selectedBooking.user?.name || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">{t('admin.email')}</span><span className="detail-value"><a href={`mailto:${selectedBooking.user?.email}`}>{selectedBooking.user?.email || '—'}</a></span></div>
                {selectedBooking.user?.phone && <div className="detail-row"><span className="detail-label">{t('admin.phone')}</span><span className="detail-value">{selectedBooking.user.phone}</span></div>}
              </div>
              <div className="detail-section">
                <h3>{t('admin.stayDetails')}</h3>
                <div className="detail-row"><span className="detail-label">{t('booking.checkIn')}</span><span className="detail-value">{formatDateLong(selectedBooking.checkInDate)}</span></div>
                <div className="detail-row"><span className="detail-label">{t('booking.checkOut')}</span><span className="detail-value">{formatDateLong(selectedBooking.checkOutDate)}</span></div>
                <div className="detail-row"><span className="detail-label">{t('admin.nightsLabel')}</span><span className="detail-value">{selectedBooking.numberOfNights}</span></div>
                <div className="detail-row"><span className="detail-label">{t('admin.guestsLabel')}</span><span className="detail-value">{selectedBooking.numberOfGuests}</span></div>
              </div>
              <div className="detail-section">
                <h3>{t('admin.paymentInfo')}</h3>
                <div className="detail-row"><span className="detail-label">{t('admin.amount')}</span><span className="detail-value detail-amount">€{selectedBooking.totalPrice}</span></div>
                <div className="detail-row"><span className="detail-label">{t('admin.paymentStatus')}</span><span className="detail-value">{selectedBooking.paymentStatus || 'pending'}</span></div>
                {selectedBooking.paymentId && <div className="detail-row"><span className="detail-label">{t('admin.paymentId')}</span><span className="detail-value detail-mono">{selectedBooking.paymentId}</span></div>}
                <div className="detail-row"><span className="detail-label">{t('admin.bookedOn')}</span><span className="detail-value">{formatDateTime(selectedBooking.createdAt)}</span></div>
              </div>
            </div>
            <div className="modal-actions">
              {selectedBooking.status === 'pending' && (
                <button className="modal-action-btn modal-confirm-btn" onClick={() => requestConfirmAction(selectedBooking._id, 'confirm', selectedBooking)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {t('admin.confirmBooking')}
                </button>
              )}
              {selectedBooking.status !== 'cancelled' && (
                <button className="modal-action-btn modal-cancel-btn" onClick={() => requestConfirmAction(selectedBooking._id, 'cancel', selectedBooking)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  {t('admin.cancelBooking')}
                </button>
              )}
              <button className="modal-action-btn modal-email-btn" onClick={() => resendEmail(selectedBooking._id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {t('admin.resendEmail')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-icon ${confirmAction.action === 'confirm' ? 'confirm-icon-green' : 'confirm-icon-red'}`}>
              {confirmAction.action === 'confirm' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              )}
            </div>
            <h3>{confirmAction.action === 'confirm' ? t('admin.confirmTitle') : t('admin.cancelTitle')}</h3>
            <p>{confirmAction.action === 'confirm' ? t('admin.confirmMessage') : t('admin.cancelMessage')}</p>
            <p className="confirm-guest"><strong>{confirmAction.booking?.user?.name || '—'}</strong> — {formatDate(confirmAction.booking?.checkInDate)} → {formatDate(confirmAction.booking?.checkOutDate)}</p>
            <p className="confirm-email-note">{t('admin.emailWillBeSent')}</p>
            <div className="confirm-buttons">
              <button className="confirm-btn-secondary" onClick={() => setConfirmAction(null)}>{t('admin.goBack')}</button>
              <button className={`confirm-btn-primary ${confirmAction.action === 'cancel' ? 'confirm-btn-danger' : ''}`} onClick={executeConfirmAction} disabled={actionLoading}>
                {actionLoading ? t('common.loading') : (confirmAction.action === 'confirm' ? t('admin.yesConfirm') : t('admin.yesCancel'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
