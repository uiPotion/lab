/**
 * Login Form Handler
 * Uses global Auth module for mock authentication
 */

// Form state
const formState = {
  email: { value: '', touched: false, error: null, valid: false },
  password: { value: '', touched: false, error: null, valid: false },
  isSubmitting: false
};

// DOM Elements
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const formErrorMessage = document.getElementById('form-error-message');

// Validation functions
function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true, error: null };
}

function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  return { valid: true, error: null };
}

// Update field UI
function updateFieldUI(fieldName, result) {
  const field = document.getElementById(`${fieldName}-field`);
  const input = document.getElementById(fieldName);
  const errorEl = document.getElementById(`${fieldName}-error`);
  const successIcon = field.querySelector('.form-field__icon--success');
  
  // Update input state
  input.setAttribute('aria-invalid', !result.valid);
  
  // Show/hide error with animation
  if (result.error && formState[fieldName].touched) {
    errorEl.textContent = result.error;
    field.classList.add('form-field--error');
    field.classList.remove('form-field--success');
  } else {
    errorEl.textContent = '';
    field.classList.remove('form-field--error');
    if (result.valid && formState[fieldName].touched) {
      field.classList.add('form-field--success');
    } else {
      field.classList.remove('form-field--success');
    }
  }
  
  // Show/hide success icon
  if (successIcon) {
    successIcon.hidden = !result.valid || !formState[fieldName].touched;
  }
}

// Validate field on blur
function handleBlur(fieldName) {
  formState[fieldName].touched = true;
  const value = formState[fieldName].value;
  let result;
  
  if (fieldName === 'email') {
    result = validateEmail(value);
  } else if (fieldName === 'password') {
    result = validatePassword(value);
  }
  
  formState[fieldName].valid = result.valid;
  formState[fieldName].error = result.error;
  updateFieldUI(fieldName, result);
}

// Handle input changes
function handleInput(fieldName, value) {
  formState[fieldName].value = value;
  
  // Clear error when user starts typing again
  if (formState[fieldName].touched && formState[fieldName].error) {
    const field = document.getElementById(`${fieldName}-field`);
    const errorEl = document.getElementById(`${fieldName}-error`);
    errorEl.textContent = '';
    field.classList.remove('form-field--error');
  }
}

// Toggle password visibility
function togglePassword() {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-pressed', isPassword);
  togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  
  const showIcon = togglePasswordBtn.querySelector('.form-field__toggle-icon--show');
  const hideIcon = togglePasswordBtn.querySelector('.form-field__toggle-icon--hide');
  
  // Only one icon should be visible at a time
  if (isPassword) {
    // Password is now text (shown), so hide the "show" icon and show the "hide" icon
    showIcon.hidden = true;
    hideIcon.hidden = false;
  } else {
    // Password is now hidden, so show the "show" icon and hide the "hide" icon
    showIcon.hidden = false;
    hideIcon.hidden = true;
  }
}

// Show form error
function showFormError(message) {
  formErrorMessage.textContent = message;
  formError.hidden = false;
  
  // Shake animation
  form.classList.add('auth-form--error');
  setTimeout(() => {
    form.classList.remove('auth-form--error');
  }, 300);
}

// Hide form error
function hideFormError() {
  formError.hidden = true;
  formErrorMessage.textContent = '';
}

// Set loading state
function setLoading(loading) {
  formState.isSubmitting = loading;
  submitBtn.disabled = loading;
  submitBtn.setAttribute('aria-busy', loading);
  
  const btnText = submitBtn.querySelector('.auth-form__submit-text');
  const btnSpinner = submitBtn.querySelector('.auth-form__submit-spinner');
  
  btnText.hidden = loading;
  btnSpinner.hidden = !loading;
  
  // Disable inputs
  emailInput.disabled = loading;
  passwordInput.disabled = loading;
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  hideFormError();
  
  // Mark all fields as touched
  formState.email.touched = true;
  formState.password.touched = true;
  
  // Validate all fields
  const emailResult = validateEmail(formState.email.value);
  const passwordResult = validatePassword(formState.password.value);
  
  formState.email.valid = emailResult.valid;
  formState.email.error = emailResult.error;
  formState.password.valid = passwordResult.valid;
  formState.password.error = passwordResult.error;
  
  updateFieldUI('email', emailResult);
  updateFieldUI('password', passwordResult);
  
  // Check if form is valid
  if (!emailResult.valid || !passwordResult.valid) {
    // Focus first invalid field
    if (!emailResult.valid) {
      emailInput.focus();
    } else {
      passwordInput.focus();
    }
    return;
  }
  
  // Set loading state
  setLoading(true);
  
  try {
    // Wait for Auth module to be ready
    if (!window.Auth) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const rememberMe = document.getElementById('remember-me').checked;
    const result = await window.Auth.login(
      formState.email.value,
      formState.password.value,
      rememberMe
    );
    
    if (result.success) {
      // Check for redirect
      const redirect = sessionStorage.getItem('auth_redirect');
      if (redirect) {
        sessionStorage.removeItem('auth_redirect');
        window.location.href = redirect;
      } else {
        window.location.href = 'chat.html';
      }
    } else {
      showFormError(result.error);
      setLoading(false);
    }
  } catch (error) {
    showFormError('An error occurred. Please try again.');
    setLoading(false);
  }
}

// Event listeners
emailInput.addEventListener('blur', () => handleBlur('email'));
emailInput.addEventListener('input', (e) => handleInput('email', e.target.value));

passwordInput.addEventListener('blur', () => handleBlur('password'));
passwordInput.addEventListener('input', (e) => handleInput('password', e.target.value));

togglePasswordBtn.addEventListener('click', togglePassword);
form.addEventListener('submit', handleSubmit);

// Handle Enter key in password field
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
});

// Auto-fill demo credentials on double click of demo section
document.getElementById('demo-credentials')?.addEventListener('dblclick', () => {
  emailInput.value = 'demo@example.com';
  passwordInput.value = 'SecurePass2024!xK';
  handleInput('email', 'demo@example.com');
  handleInput('password', 'SecurePass2024!xK');
  // Trigger validation
  handleBlur('email');
  handleBlur('password');
});
