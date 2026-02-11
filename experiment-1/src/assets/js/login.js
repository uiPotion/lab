/**
 * Login Form - Validation & Interactions
 * HaroldJS + UIPotion Form Pattern
 */

(function() {
  'use strict';

  // DOM Elements
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const eyeOpen = togglePasswordBtn.querySelector('.eye-open');
  const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');

  // Form State
  const state = {
    touched: {
      email: false,
      password: false
    },
    errors: {
      email: false,
      password: false
    },
    isSubmitting: false
  };

  /**
   * Email validation
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Password validation (min 8 chars)
   * @param {string} password
   * @returns {boolean}
   */
  function isValidPassword(password) {
    return password.length >= 8;
  }

  /**
   * Show error for a field
   * @param {HTMLElement} input
   * @param {HTMLElement} errorEl
   */
  function showError(input, errorEl) {
    input.classList.add('login-form__input--error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.style.display = 'flex';
    
    // Shake animation
    errorEl.style.animation = 'none';
    errorEl.offsetHeight; // Trigger reflow
    errorEl.style.animation = 'errorShake 0.3s ease-in-out';
  }

  /**
   * Hide error for a field
   * @param {HTMLElement} input
   * @param {HTMLElement} errorEl
   */
  function hideError(input, errorEl) {
    input.classList.remove('login-form__input--error');
    input.setAttribute('aria-invalid', 'false');
    errorEl.style.display = 'none';
  }

  /**
   * Validate email field
   * @param {boolean} showErrorState - Whether to show error UI
   * @returns {boolean}
   */
  function validateEmail(showErrorState = true) {
    const value = emailInput.value.trim();
    const isValid = value !== '' && isValidEmail(value);
    
    state.errors.email = !isValid;
    
    if (showErrorState || state.touched.email) {
      if (!isValid && value !== '') {
        showError(emailInput, emailError);
      } else {
        hideError(emailInput, emailError);
      }
    }
    
    return isValid;
  }

  /**
   * Validate password field
   * @param {boolean} showErrorState - Whether to show error UI
   * @returns {boolean}
   */
  function validatePassword(showErrorState = true) {
    const value = passwordInput.value;
    const isValid = isValidPassword(value);
    
    state.errors.password = !isValid;
    
    if (showErrorState || state.touched.password) {
      if (!isValid && value !== '') {
        showError(passwordInput, passwordError);
      } else {
        hideError(passwordInput, passwordError);
      }
    }
    
    return isValid;
  }

  /**
   * Set loading state
   * @param {boolean} loading
   */
  function setLoading(loading) {
    state.isSubmitting = loading;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('login-form__submit--loading', loading);
    submitBtn.querySelector('.login-form__spinner').style.display = loading ? 'block' : 'none';
    submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
    
    // Disable inputs during submission
    emailInput.disabled = loading;
    passwordInput.disabled = loading;
  }

  /**
   * Focus first invalid field
   */
  function focusFirstError() {
    if (state.errors.email) {
      emailInput.focus();
    } else if (state.errors.password) {
      passwordInput.focus();
    }
  }

  /**
   * Handle form submission
   * @param {Event} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    
    // Mark all fields as touched
    state.touched.email = true;
    state.touched.password = true;
    
    // Validate all fields
    const isEmailValid = validateEmail(true);
    const isPasswordValid = validatePassword(true);
    
    if (!isEmailValid || !isPasswordValid) {
      focusFirstError();
      return;
    }
    
    // Simulate form submission
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      
      // Show success (in real app, redirect to dashboard)
      // For demo, we'll just show an alert
      alert('Login successful! (This is a demo)');
      
      // Reset form
      form.reset();
      hideError(emailInput, emailError);
      hideError(passwordInput, passwordError);
    }, 1500);
  }

  /**
   * Toggle password visibility
   */
  function togglePassword() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    // Toggle icons
    eyeOpen.style.display = isPassword ? 'none' : 'block';
    eyeClosed.style.display = isPassword ? 'block' : 'none';
    
    // Update aria
    togglePasswordBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
    togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  }

  // Event Listeners
  
  // Email validation on blur
  emailInput.addEventListener('blur', () => {
    state.touched.email = true;
    validateEmail(true);
  });
  
  // Clear error on input
  emailInput.addEventListener('input', () => {
    if (state.touched.email) {
      validateEmail(true);
    }
  });
  
  // Password validation on blur
  passwordInput.addEventListener('blur', () => {
    state.touched.password = true;
    validatePassword(true);
  });
  
  // Clear error on input
  passwordInput.addEventListener('input', () => {
    if (state.touched.password) {
      validatePassword(true);
    }
  });
  
  // Password visibility toggle
  togglePasswordBtn.addEventListener('click', togglePassword);
  
  // Form submission
  form.addEventListener('submit', handleSubmit);
  
  // Allow Enter key to submit from any field
  form.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      handleSubmit(e);
    }
  });

  // Focus email on load
  if (emailInput) {
    emailInput.focus();
  }
})();