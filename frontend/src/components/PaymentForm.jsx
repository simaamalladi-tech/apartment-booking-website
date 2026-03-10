import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import './PaymentForm.css';

function PaymentForm({ bookingData, onSuccess }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    email: bookingData?.user?.email || '',
    name: bookingData?.user?.name || '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Germany'
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return t('payment.validation.emailRequired', 'Email is required.');
        if (!emailRegex.test(value)) return t('payment.validation.emailInvalid', 'Please enter a valid email.');
        return '';
      case 'name':
        if (!value.trim()) return t('payment.validation.nameRequired', 'Full name is required.');
        if (value.trim().length < 2) return t('payment.validation.nameTooShort', 'Name must be at least 2 characters.');
        return '';
      case 'address':
        if (!value.trim()) return t('payment.validation.addressRequired', 'Street address is required.');
        return '';
      case 'city':
        if (!value.trim()) return t('payment.validation.cityRequired', 'City is required.');
        return '';
      case 'zipCode':
        if (!value.trim()) return t('payment.validation.zipRequired', 'Zip code is required.');
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const errors = {};
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'country') continue;
      const err = validateField(key, value);
      if (err) errors[key] = err;
    }
    setFieldErrors(errors);
    setTouched({ email: true, name: true, address: true, city: true, zipCode: true });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateAll()) return;
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: formData.email,
          name: formData.name,
          address: {
            line1: formData.address,
            city: formData.city,
            postal_code: formData.zipCode,
            country: 'DE'
          }
        }
      });

      if (methodError) {
        setError(methodError.message);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingData: bookingData,
          paymentMethodId: paymentMethod.id,
          email: formData.email
        })
      });

      const paymentData = await response.json();

      if (paymentData.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess({
            bookingId: paymentData.bookingId,
            paymentId: paymentData.paymentId
          });
        }, 1500);
      } else {
        setError(paymentData.message || t('payment.error'));
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h2>{t('payment.success')}</h2>
        <p>{t('payment.bookingConfirmed')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form" noValidate>
      <div className="form-section">
        <h3>{t('payment.cardInfo')}</h3>

        <div className={`form-group ${fieldErrors.email && touched.email ? 'has-error' : ''}`}>
          <label>{t('payment.email')} *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.email && touched.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className={`form-group ${fieldErrors.name && touched.name ? 'has-error' : ''}`}>
          <label>{t('payment.name')} *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.name && touched.name && <span className="field-error">{fieldErrors.name}</span>}
        </div>

        <div className="form-group">
          <label>{t('payment.cardInfo')} *</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': {
                    color: '#aaa'
                  }
                },
                invalid: {
                  color: '#fa755a'
                }
              }
            }}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>{t('payment.billingAddress')}</h3>

        <div className={`form-group ${fieldErrors.address && touched.address ? 'has-error' : ''}`}>
          <label>{t('payment.address')} *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.address && touched.address && <span className="field-error">{fieldErrors.address}</span>}
        </div>

        <div className="form-row">
          <div className={`form-group ${fieldErrors.city && touched.city ? 'has-error' : ''}`}>
            <label>{t('payment.city')} *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {fieldErrors.city && touched.city && <span className="field-error">{fieldErrors.city}</span>}
          </div>

          <div className={`form-group ${fieldErrors.zipCode && touched.zipCode ? 'has-error' : ''}`}>
            <label>{t('payment.zipCode')} *</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {fieldErrors.zipCode && touched.zipCode && <span className="field-error">{fieldErrors.zipCode}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>{t('payment.country')} *</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="country-select"
          >
            <option value="Germany">Germany</option>
            <option value="Austria">Austria</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Afghanistan">Afghanistan</option>
            <option value="Albania">Albania</option>
            <option value="Algeria">Algeria</option>
            <option value="Andorra">Andorra</option>
            <option value="Angola">Angola</option>
            <option value="Argentina">Argentina</option>
            <option value="Armenia">Armenia</option>
            <option value="Australia">Australia</option>
            <option value="Azerbaijan">Azerbaijan</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Belarus">Belarus</option>
            <option value="Belgium">Belgium</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
            <option value="Brazil">Brazil</option>
            <option value="Bulgaria">Bulgaria</option>
            <option value="Cambodia">Cambodia</option>
            <option value="Cameroon">Cameroon</option>
            <option value="Canada">Canada</option>
            <option value="Chile">Chile</option>
            <option value="China">China</option>
            <option value="Colombia">Colombia</option>
            <option value="Costa Rica">Costa Rica</option>
            <option value="Croatia">Croatia</option>
            <option value="Cuba">Cuba</option>
            <option value="Cyprus">Cyprus</option>
            <option value="Czech Republic">Czech Republic</option>
            <option value="Denmark">Denmark</option>
            <option value="Dominican Republic">Dominican Republic</option>
            <option value="Ecuador">Ecuador</option>
            <option value="Egypt">Egypt</option>
            <option value="Estonia">Estonia</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="Finland">Finland</option>
            <option value="France">France</option>
            <option value="Georgia">Georgia</option>
            <option value="Ghana">Ghana</option>
            <option value="Greece">Greece</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Honduras">Honduras</option>
            <option value="Hong Kong">Hong Kong</option>
            <option value="Hungary">Hungary</option>
            <option value="Iceland">Iceland</option>
            <option value="India">India</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Iran">Iran</option>
            <option value="Iraq">Iraq</option>
            <option value="Ireland">Ireland</option>
            <option value="Israel">Israel</option>
            <option value="Italy">Italy</option>
            <option value="Jamaica">Jamaica</option>
            <option value="Japan">Japan</option>
            <option value="Jordan">Jordan</option>
            <option value="Kazakhstan">Kazakhstan</option>
            <option value="Kenya">Kenya</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Latvia">Latvia</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Libya">Libya</option>
            <option value="Liechtenstein">Liechtenstein</option>
            <option value="Lithuania">Lithuania</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Malta">Malta</option>
            <option value="Mexico">Mexico</option>
            <option value="Moldova">Moldova</option>
            <option value="Monaco">Monaco</option>
            <option value="Mongolia">Mongolia</option>
            <option value="Montenegro">Montenegro</option>
            <option value="Morocco">Morocco</option>
            <option value="Nepal">Nepal</option>
            <option value="Netherlands">Netherlands</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Nicaragua">Nicaragua</option>
            <option value="Nigeria">Nigeria</option>
            <option value="North Macedonia">North Macedonia</option>
            <option value="Norway">Norway</option>
            <option value="Oman">Oman</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Panama">Panama</option>
            <option value="Paraguay">Paraguay</option>
            <option value="Peru">Peru</option>
            <option value="Philippines">Philippines</option>
            <option value="Poland">Poland</option>
            <option value="Portugal">Portugal</option>
            <option value="Qatar">Qatar</option>
            <option value="Romania">Romania</option>
            <option value="Russia">Russia</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Senegal">Senegal</option>
            <option value="Serbia">Serbia</option>
            <option value="Singapore">Singapore</option>
            <option value="Slovakia">Slovakia</option>
            <option value="Slovenia">Slovenia</option>
            <option value="South Africa">South Africa</option>
            <option value="South Korea">South Korea</option>
            <option value="Spain">Spain</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Sweden">Sweden</option>
            <option value="Taiwan">Taiwan</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Thailand">Thailand</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Turkey">Turkey</option>
            <option value="Ukraine">Ukraine</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Uzbekistan">Uzbekistan</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Vietnam">Vietnam</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="pay-btn"
      >
        {loading ? t('payment.processing') : `${t('payment.pay')} €${bookingData.totalPrice}`}
      </button>
    </form>
  );
}

export default PaymentForm;
