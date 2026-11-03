import React, { useState, useRef } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

const INITIAL_FORM_STATE = {
  guardianName: '',
  studentName: '',
  classOfInterest: '',
  phone: '',
  location: '',
  needSchoolVan: '',
  message: '',
  consentToContact: false,
  honeypot: '',
};

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export default function EnquiryForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const successRef = useRef(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'guardianName':
        return !String(value).trim() ? "Please enter parent or guardian's name." : '';
      case 'studentName':
        return !String(value).trim() ? "Please enter the student's name." : '';
      case 'classOfInterest':
        return !value ? 'Please select the intended class.' : '';
      case 'phone': {
        const cleaned = String(value).trim().replace(/\D/g, '');
        if (!cleaned || !INDIAN_PHONE_REGEX.test(cleaned)) {
          return 'Please enter a valid 10-digit Indian mobile number (starting with 6–9).';
        }
        return '';
      }
      case 'location':
        return !String(value).trim() ? 'Please specify your village or town name.' : '';
      case 'needSchoolVan':
        return !['Yes', 'No'].includes(value)
          ? 'Please select whether you need the School Van (Yes or No).'
          : '';
      case 'consentToContact':
        return !value ? 'Please check the consent box to proceed.' : '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    [
      'guardianName',
      'studentName',
      'classOfInterest',
      'phone',
      'location',
      'needSchoolVan',
      'consentToContact',
    ].forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValue),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateAll()) {
      return;
    }

    setSubmitting(true);

    try {
      const cleanedPhone = formData.phone.trim().replace(/\D/g, '');
      const response = await fetch('/api/v1/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guardianName: formData.guardianName.trim(),
          studentName: formData.studentName.trim(),
          classOfInterest: formData.classOfInterest,
          phone: cleanedPhone,
          phoneNumber: cleanedPhone,
          location: formData.location.trim(),
          villageTown: formData.location.trim(),
          needSchoolVan: formData.needSchoolVan,
          message: formData.message.trim(),
          optionalMessage: formData.message.trim(),
          consentToContact: formData.consentToContact,
          honeypot: formData.honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors((prev) => ({ ...prev, ...data.errors }));
        }
        throw new Error(data.message || 'Unable to submit admission enquiry. Please try again.');
      }

      setSuccessData({
        referenceId: data.referenceId,
        message:
          data.message ||
          'Thank you. Your details have been received by the school desk. A staff member will connect with you via the provided phone number.',
        studentName: formData.studentName.trim(),
      });
      setFormData(INITIAL_FORM_STATE);
      setErrors({});

      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="enquiry" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
            Direct Enquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy mt-1">
            Admissions Enquiry Form
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Please fill out this form to register your interest. Submissions are delivered directly
            to the school administrative team at Khanatti.
          </p>
          <div className="mt-3 inline-block bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600">
            Enquiries are addressed to:{' '}
            <strong>
              <a href={`mailto:${SCHOOL_INFO.email}`} className="placeholder-badge">
                {SCHOOL_INFO.email}
              </a>
            </strong>{' '}
            or by calling{' '}
            <strong>
              <a href={SCHOOL_INFO.phoneHref} className="placeholder-badge">
                {SCHOOL_INFO.phoneDisplay}
              </a>
            </strong>
          </div>
        </div>

        {/* Prominent Green Success Notification Banner */}
        {successData && (
          <div
            id="enquirySuccessBox"
            ref={successRef}
            className="mb-6 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 shadow-sm"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-emerald-900">
                    Enquiry Submitted Successfully!
                  </h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-emerald-400 text-emerald-900 font-mono text-xs font-bold shadow-sm">
                    Reference ID: <span className="text-brand-navy">{successData.referenceId}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm mt-1.5 text-emerald-800 leading-relaxed">
                  {successData.message}
                </p>
                <p className="text-[11px] mt-2 text-emerald-700 font-medium">
                  Please note your Reference ID (<strong>{successData.referenceId}</strong>) for
                  future correspondence with the Khanatti school office desk.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Server Error Banner */}
        {submitError && (
          <div
            className="mb-6 p-4 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm"
            role="alert"
          >
            <strong>Submission Alert:</strong> {submitError}
          </div>
        )}

        {/* Accessible Enquiry Form */}
        <form
          id="admissionForm"
          onSubmit={handleSubmit}
          className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5"
          noValidate
        >
          {/* Hidden Honeypot Input for Anti-Spam Bot Trap */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="honeypot">Leave this field blank</label>
            <input
              type="text"
              id="honeypot"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Parent / Guardian Name */}
            <div>
              <label
                htmlFor="parentName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Parent / Guardian Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="parentName"
                name="guardianName"
                required
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Patil"
                aria-invalid={Boolean(errors.guardianName)}
                aria-describedby={errors.guardianName ? 'parentNameError' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:border-brand-navy bg-white transition ${
                  errors.guardianName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.guardianName && (
                <span id="parentNameError" className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.guardianName}
                </span>
              )}
            </div>

            {/* Student Name */}
            <div>
              <label
                htmlFor="studentName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Student Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                required
                value={formData.studentName}
                onChange={handleChange}
                placeholder="e.g. Anand Patil"
                aria-invalid={Boolean(errors.studentName)}
                aria-describedby={errors.studentName ? 'studentNameError' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:border-brand-navy bg-white transition ${
                  errors.studentName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.studentName && (
                <span id="studentNameError" className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.studentName}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class of Interest */}
            <div>
              <label
                htmlFor="classInterest"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Class of Interest <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="classInterest"
                name="classOfInterest"
                required
                value={formData.classOfInterest}
                onChange={handleChange}
                aria-invalid={Boolean(errors.classOfInterest)}
                aria-describedby={errors.classOfInterest ? 'classInterestError' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:border-brand-navy bg-white transition ${
                  errors.classOfInterest ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              >
                <option value="">-- Select Class / Grade --</option>
                <option value="Nursery / LKG / UKG">Pre-Primary (Nursery / LKG / UKG)</option>
                <option value="Class 1st to 5th">Primary (Class 1st to 5th)</option>
                <option value="Class 6th to 10th">Upper Primary / High School</option>
                <option value="Other">Other / General Admission Query</option>
              </select>
              {errors.classOfInterest && (
                <span
                  id="classInterestError"
                  className="text-[11px] text-red-600 mt-1 block font-medium"
                >
                  {errors.classOfInterest}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Phone Number <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phone"
                required
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phoneNumberError' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:border-brand-navy bg-white transition ${
                  errors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.phone && (
                <span
                  id="phoneNumberError"
                  className="text-[11px] text-red-600 mt-1 block font-medium"
                >
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Village / Town */}
            <div>
              <label
                htmlFor="villageTown"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Village / Town <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="villageTown"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Khanatti / Gokak / Surrounding village"
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? 'villageTownError' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:border-brand-navy bg-white transition ${
                  errors.location ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.location && (
                <span id="villageTownError" className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.location}
                </span>
              )}
            </div>

            {/* Do you need School Van? (Yes / No) */}
            <div>
              <span
                id="needSchoolVanLabel"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Do you need School Van? <span className="text-red-500" aria-hidden="true">*</span>
              </span>
              <div
                role="radiogroup"
                aria-labelledby="needSchoolVanLabel"
                aria-describedby={errors.needSchoolVan ? 'needSchoolVanError' : undefined}
                className="grid grid-cols-2 gap-3"
              >
                {['Yes', 'No'].map((option) => {
                  const isSelected = formData.needSchoolVan === option;
                  return (
                    <label
                      key={option}
                      className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                          : errors.needSchoolVan
                          ? 'bg-red-50/30 border-red-500 text-slate-700 hover:bg-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-brand-navy/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="needSchoolVan"
                        value={option}
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span>{option === 'Yes' ? '🚐 Yes' : 'No'}</span>
                    </label>
                  );
                })}
              </div>
              {errors.needSchoolVan && (
                <span
                  id="needSchoolVanError"
                  className="text-[11px] text-red-600 mt-1 block font-medium"
                >
                  {errors.needSchoolVan}
                </span>
              )}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label
              htmlFor="optionalMessage"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Optional Message or Query
            </label>
            <textarea
              id="optionalMessage"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Any specific questions regarding transportation, documents, or admission timelines..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white transition"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                id="consentCheck"
                name="consentToContact"
                required
                checked={formData.consentToContact}
                onChange={handleChange}
                aria-invalid={Boolean(errors.consentToContact)}
                aria-describedby={errors.consentToContact ? 'consentError' : undefined}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-gold"
              />
              <span className="text-xs text-slate-600 leading-normal">
                I give consent for Shri Siddharoodha English Medium School, Khanatti to contact me
                regarding this admission enquiry using the details provided above.
              </span>
            </label>
            {errors.consentToContact && (
              <span id="consentError" className="text-[11px] text-red-600 mt-1 block font-medium">
                {errors.consentToContact}
              </span>
            )}
          </div>

          {/* Information & Privacy Note */}
          <div className="p-3 bg-white rounded border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Information Note:</strong> Enquiries sent through this interface are securely
            logged with a unique reference number and forwarded to the school’s administrative desk
            at Khanatti.
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-3 px-6 rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Submitting Enquiry...' : 'Submit Admission Enquiry'}</span>
              <svg
                className="w-4 h-4 text-brand-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
