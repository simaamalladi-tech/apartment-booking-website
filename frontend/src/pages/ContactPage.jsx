import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ContactPage.css';

function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Contact form error:', err);
    }
    setSending(false);
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
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>{t('contact.addressLabel')}</h3>
              <p>146A Gustav-Adolf-Straße<br />13086 Berlin, Germany</p>
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
          <div className="contact-form-wrapper">
            <h2>{t('contact.formTitle')}</h2>

            {sent ? (
              <div className="contact-success">
                <div className="success-icon">✓</div>
                <p>{t('contact.successMessage')}</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
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
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="map-section">
          <h2>{t('contact.findUs')}</h2>
          <div className="map-wrapper">
            <iframe
              title="Alt-Berliner Eckkneipe Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2425.8!2d13.4574!3d52.5492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDMyJzU3LjEiTiAxM8KwMjcnMjYuNiJF!5e0!3m2!1sde!2sde!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
