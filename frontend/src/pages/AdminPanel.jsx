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

  // Check session
  useEffect(() => {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') setAuthenticated(true);
  }, []);

  // Fetch bookings when authenticated
  useEffect(() => {
    if (authenticated) fetchBookings();
  }, [authenticated]);

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
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b._id === id ? { ...b, status } : b
        ));
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b._id === id ? { ...b, status: 'cancelled' } : b
        ));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  // Stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  // Filter & search
  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (b.user?.name || '').toLowerCase().includes(s) ||
        (b.user?.email || '').toLowerCase().includes(s)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const statusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const statusLabel = (status) => {
    return t(`admin.${status}`);
  };

  // Login Screen
  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <div className="login-card">
            <div className="login-icon">🔐</div>
            <h2>{t('admin.loginTitle')}</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>{t('admin.passwordLabel')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {loginError && <div className="login-error">{loginError}</div>}
              <button type="submit" className="login-btn">
                {t('admin.loginButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>{t('admin.title')}</h1>
          <button className="logout-btn" onClick={handleLogout}>
            {t('admin.logout')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">{t('admin.totalBookings')}</div>
          </div>
          <div className="stat-card stat-confirmed">
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">{t('admin.confirmedBookings')}</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">{t('admin.pendingBookings')}</div>
          </div>
          <div className="stat-card stat-cancelled">
            <div className="stat-value">{stats.cancelled}</div>
            <div className="stat-label">{t('admin.cancelledBookings')}</div>
          </div>
          <div className="stat-card stat-revenue">
            <div className="stat-value">€{stats.revenue}</div>
            <div className="stat-label">{t('admin.revenue')}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="filter-pills">
            {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
              <button
                key={f}
                className={`pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? t('admin.filterAll') : t(`admin.${f}`)}
                {f !== 'all' && (
                  <span className="pill-count">{stats[f] || 0}</span>
                )}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={t('admin.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />
        </div>

        {/* Error */}
        {error && <div className="admin-error">{error}</div>}

        {/* Loading */}
        {loading && <div className="admin-loading">{t('common.loading')}</div>}

        {/* Bookings Table */}
        {!loading && filteredBookings.length === 0 && (
          <div className="admin-empty">{t('admin.noBookings')}</div>
        )}

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
                  <tr key={booking._id}>
                    <td className="guest-name">{booking.user?.name || '—'}</td>
                    <td className="guest-email">{booking.user?.email || '—'}</td>
                    <td className="dates-cell">
                      {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                    </td>
                    <td>{booking.numberOfNights || '—'}</td>
                    <td>{booking.numberOfGuests || '—'}</td>
                    <td className="amount-cell">€{booking.totalPrice || 0}</td>
                    <td>
                      <span className={statusClass(booking.status)}>
                        {statusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="action-cell">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            className="action-btn confirm-btn"
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            title={t('admin.confirm')}
                          >
                            ✓
                          </button>
                          <button
                            className="action-btn cancel-btn"
                            onClick={() => cancelBooking(booking._id)}
                            title={t('admin.cancel')}
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => cancelBooking(booking._id)}
                          title={t('admin.cancel')}
                        >
                          ✕
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="no-actions">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
