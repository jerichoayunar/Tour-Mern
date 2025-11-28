// src/components/user/inquiry/InquiryForm.jsx
import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import inquiryService from '../../../services/inquiryService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../ui/Loader';
import { Mail, User, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

const InquiryForm = ({ onSuccess = null }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isAuthenticated, requireAuthRedirect } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  // ============================================================================
  // 🎯 HANDLE INPUT CHANGE
  // ============================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ============================================================================
  // 🎯 VALIDATE FORM
  // ============================================================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // 🎯 HANDLE FORM SUBMIT
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Require authentication before submitting an inquiry
    if (!isAuthenticated) {
      requireAuthRedirect(window.location.pathname + window.location.search);
      return;
    }

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await inquiryService.createInquiry(formData);
      const resp = response?.data ?? response;

      if (resp && (resp.success || resp._id || resp.id)) {
        showToast('Inquiry submitted successfully! We\'ll get back to you soon.', 'success');
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
          if (onSuccess) onSuccess();
        }, 3000);
      } else {
        showToast(resp?.message || 'Failed to submit inquiry', 'error');
      }
    } catch (error) {
      console.error('Inquiry submission error:', error);
      showToast(error.message || 'Failed to submit inquiry', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 🎯 SUCCESS MESSAGE
  // ============================================================================
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center max-w-lg mx-auto border border-gray-100">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Thank You!</h2>
        <p className="text-gray-600 mb-2">Your inquiry has been submitted successfully.</p>
        <p className="text-sm text-gray-500">We'll review your message and get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-2xl w-full mx-auto border border-gray-100">
      <div className="p-6 bg-white">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Send Us an Inquiry</h2>
        <p className="text-gray-600 text-sm mt-1">Have a question? We'd love to hear from you.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            Full Name *
          </label>
          <input
            id="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={loading}
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-600 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:border-blue-600 focus:ring-4 transition-all outline-none`}
          />
          {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail size={16} className="text-blue-600" />
            Email Address *
          </label>
          <input
            id="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            disabled={loading}
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-600 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:border-blue-600 focus:ring-4 transition-all outline-none`}
          />
          {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-600" />
            Subject
          </label>
          <input
            id="subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What is your inquiry about? (optional)"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-primary-200 focus:border-primary-500 focus:ring-4 transition-all outline-none"
          />
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MessageSquare size={16} className="text-blue-600" />
            Message *
          </label>
          <textarea
            id="message"
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us more about your inquiry... (at least 10 characters)"
            rows="5"
            maxLength={1000}
            disabled={loading}
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.message ? 'border-red-600 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:border-blue-600 focus:ring-4 transition-all outline-none resize-none`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message ? (
              <p id="message-error" className="text-xs text-red-600">{errors.message}</p>
            ) : (
              <span></span>
            )}
            <span className={`text-xs font-medium transition-colors ${
              formData.message.length >= 900 ? 'text-red-600' : 
              formData.message.length >= 800 ? 'text-blue-500' : 'text-gray-400'
            }`}>
              {formData.message.length} / 1000
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size="small" color="white" />
              <span>Submitting...</span>
            </>
          ) : (
            'Send Inquiry'
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          We typically respond to inquiries within 24 hours during business days.
        </p>
      </form>
    </div>
  );
};

export default InquiryForm;
