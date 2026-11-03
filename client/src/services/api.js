const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Submit an admission enquiry to POST /api/v1/enquiries
 * @param {Object} payload
 */
export async function submitAdmissionEnquiry(payload) {
  const response = await fetch(`${API_BASE}/enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to submit enquiry.');
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

/**
 * Fetch active school notices from GET /api/v1/notices
 */
export async function fetchSchoolNotices() {
  const response = await fetch(`${API_BASE}/notices`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch notices');
  }

  return response.json();
}
