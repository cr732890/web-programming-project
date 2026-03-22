const usernameInput = document.getElementById('signup-username');
const passwordInput = document.getElementById('signup-password');
const confirmInput  = document.getElementById('signup-confirm');
const signupBtn     = document.getElementById('signup-btn');

// If already logged in, skip signup
if (localStorage.getItem('token')) {
  window.location.href = 'subjects.html';
}

function showError(msg) {
  let err = document.getElementById('signup-error');
  if (!err) {
    err = document.createElement('p');
    err.id = 'signup-error';
    err.style.cssText = 'color: red; margin-top: 10px; font-size: 0.9rem;';
    signupBtn.insertAdjacentElement('afterend', err);
  }
  err.style.color = 'red';
  err.textContent = msg;
}

function showSuccess(msg) {
  let err = document.getElementById('signup-error');
  if (!err) {
    err = document.createElement('p');
    err.id = 'signup-error';
    err.style.cssText = 'margin-top: 10px; font-size: 0.9rem;';
    signupBtn.insertAdjacentElement('afterend', err);
  }
  err.style.color = 'green';
  err.textContent = msg;
}

function clearError() {
  const err = document.getElementById('signup-error');
  if (err) err.textContent = '';
}

function validatePassword(password) {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

async function handleSignup() {
  clearError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const confirm  = confirmInput.value;

  // Validation
  if (!username || !password || !confirm) {
    showError('All fields are required.');
    return;
  }

  if (username.length < 3) {
    showError('Username must be at least 3 characters.');
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showError('Username can only contain letters, numbers, and underscores.');
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    showError(passwordError);
    return;
  }

  if (password !== confirm) {
    showError('Passwords do not match.');
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account...';

  try {
    const data = await auth.register(username, username, password);
    
    setAuth(data.token, data.user);

    showSuccess('Account created! Redirecting...');
    setTimeout(() => {
      window.location.href = 'subjects.html';
    }, 1000);

  } catch (err) {
    showError(err.message || 'Signup failed. Please try again.');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Sign Up';
  }
}

signupBtn.addEventListener('click', handleSignup);
confirmInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSignup();
});
