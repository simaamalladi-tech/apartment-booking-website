import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './ContactPage.css';

function ContactPage({ onBookNow }) {
  const { t } = useTranslation();
  useScrollAnimation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [formTimestamp, setFormTimestamp] = useState(Date.now());

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, _timestamp: formTimestamp })
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '', website: '' });
      } else {
        setSendError(data.message || t('contact.errorMessage', 'Failed to send message. Please try again.'));
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setSendError(t('contact.errorMessage', 'Failed to send message. Please try again.'));
    }
    setSending(false);
  };

  const handleSendAnother = () => {
    setSent(false);
    setSendError('');
    setFormTimestamp(Date.now());
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.subtitle')}</p>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          {/* Contact Info Cards */}
          <div className="contact-info stagger-children">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>{t('contact.addressLabel')}</h3>
              <p>Gustav-Adolf-Straße 146A<br />13086 Berlin, {t('contact.country')}</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>{t('contact.phoneLabel')}</h3>
              <p><a href="tel:+491783485970">+49 178 348 5970</a></p>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>{t('contact.emailLabel')}</h3>
              <p><a href="mailto:lutz.richter@gmail.com">lutz.richter@gmail.com</a></p>
            </div>

            <div className="info-card">
              <div className="info-icon">🕐</div>
              <h3>{t('contact.hoursLabel')}</h3>
              <p>{t('contact.hoursValue')}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-wrapper fade-in-right">
            <h2>{t('contact.formTitle')}</h2>

            {sent ? (
              <div className="contact-success">
                <div className="success-icon">✓</div>
                <p>{t('contact.successMessage')}</p>
                <button className="send-another-btn" onClick={handleSendAnother}>
                  {t('contact.sendAnother', 'Send Another Message')}
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {/* Honeypot field - hidden from users, bots will fill it */}
                <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input type="text" name="website" id="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('contact.nameField')}</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('contact.emailField')}</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('contact.subjectField')}</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('contact.messageField')}</label>
                  <textarea
                    name="message"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="send-btn" disabled={sending}>
                  {sending ? t('contact.sending') : t('contact.sendButton')}
                </button>

                {sendError && (
                  <div className="contact-error">
                    <p>{sendError}</p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="map-section fade-in-up">
          <h2>{t('contact.findUs')}</h2>
          <div className="map-wrapper">
            <iframe
              title="Alt-Berliner Eckkneipe Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2424.5!2d13.4342755!3d52.5547119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84df1937ffd3f%3A0x149023e694b8d638!2sGustav-Adolf-Stra%C3%9Fe%20146A%2C%2013086%20Berlin!5e0!3m2!1sde!2sde!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Book Now CTA Banner */}
        {onBookNow && (
          <div className="contact-cta-banner fade-in-up">
            <div className="contact-cta-content">
              <h3>{t('cta.contactCta')}</h3>
              <p>{t('cta.contactCtaSub')}</p>
            </div>
            <button className="contact-cta-btn" onClick={onBookNow}>
              {t('cta.bookNow')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
