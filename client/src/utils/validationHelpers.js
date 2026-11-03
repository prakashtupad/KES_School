/**
 * Institutional Validation Helpers for Karnataka State Compliance & Student Onboarding
 * Shri Siddharoodha English Medium School, Khanatti
 */

export const isValidIndianMobile = (phone = '') => {
  const cleaned = String(phone).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

export const isValidAadhaar = (aadhaar = '') => {
  const cleaned = String(aadhaar).replace(/\D/g, '');
  if (!cleaned) return true; // Optional unless provided
  return /^\d{12}$/.test(cleaned);
};

export const isValidStsNumber = (sts = '') => {
  const cleaned = String(sts).trim();
  if (!cleaned) return true;
  return /^[A-Za-z0-9-]{5,18}$/.test(cleaned);
};

export const sanitizeDigits = (val = '', maxLen = 12) => {
  return String(val).replace(/\D/g, '').slice(0, maxLen);
};
