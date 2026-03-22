const API = 'http://localhost:3000/api';

const usernameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const loginBtn      = document.querySelector('.btn');

// If already logged in, skip the login page
if (localStorage.getItem('token')) {
  window.location.href = 'subjects.html';
}

function showError(msg) {
  let err = document.getElementById('login-error');
  if (!err) {
    err = document.createElement('p');
    err.id = 'login-error';
    err.style.cssText = 'color: red; margin-top: 10px; font-size: 0.9rem;';
    loginBtn.insertAdjacentElement('afterend', err);
  }
  err.textContent = msg;
}

function clearError() {
  const err = document.getElementById('login-error');
  if (err) err.textContent = '';
}

async function handleLogin() {
  clearError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError('Please enter your username and password.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Login failed. Please try again.');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'subjects.html';
    }

  } catch (err) {
    showError('Could not connect to the server. Make sure it is running.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
}

loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});
