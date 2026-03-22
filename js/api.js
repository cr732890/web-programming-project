const API = 'http://localhost:3000/api';

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Set auth token and user
function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Clear auth
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken();
}

// Generic fetch wrapper with auth
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `API Error: ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// Auth endpoints
const auth = {
  login: (username, password) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (name, username, password, email = null) => 
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password })
    }),

  getMe: () => apiFetch('/auth/me')
};

// Labs endpoints
const labs = {
  getAll: () => apiFetch('/labs', { method: 'GET' }),
  
  getById: (id) => apiFetch(`/labs/${id}`, { method: 'GET' }),

  create: (title, description, instructions, starter_code, language) =>
    apiFetch('/labs', {
      method: 'POST',
      body: JSON.stringify({ title, description, instructions, starter_code, language })
    }),

  update: (id, updates) =>
    apiFetch(`/labs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  delete: (id) => apiFetch(`/labs/${id}`, { method: 'DELETE' })
};

// Submissions endpoints
const submissions = {
  submit: (lab_id, code) =>
    apiFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify({ lab_id, code })
    }),

  getMySubmissions: () => apiFetch('/submissions/my', { method: 'GET' }),

  getById: (id) => apiFetch(`/submissions/${id}`, { method: 'GET' }),

  grade: (id, grade, feedback) =>
    apiFetch(`/submissions/${id}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ grade, feedback })
    })
};
