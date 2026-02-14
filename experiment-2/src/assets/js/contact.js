/**
 * Contact Form Validation and Submission
 */

(function() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successMessage = document.getElementById('form-success');

  // Form fields
  const fields = {
    name: {
      element: document.getElementById('name'),
      error: document.getElementById('name-error'),
      validate: (value) => value.trim().length >= 2
    },
    email: {
      element: document.getElementById('email'),
      error: document.getElementById('email-error'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    message: {
      element: document.getElementById('message'),
      error: document.getElementById('message-error'),
      validate: (value) => value.trim().length >= 10
    }
  };

  // Real-time validation
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    
    field.element.addEventListener('blur', () => {
      validateField(fieldName);
    });

    field.element.addEventListener('input', () => {
      if (field.element.classList.contains('is-invalid')) {
        validateField(fieldName);
      }
    });
  });

  function validateField(fieldName) {
    const field = fields[fieldName];
    const isValid = field.validate(field.element.value);
    const formGroup = field.element.closest('.form-group');

    if (isValid) {
      field.element.classList.remove('is-invalid');
      field.element.classList.add('is-valid');
      field.error.classList.remove('is-visible');
      formGroup.classList.remove('has-error');
    } else {
      field.element.classList.remove('is-valid');
      field.element.classList.add('is-invalid');
      field.error.classList.add('is-visible');
      formGroup.classList.add('has-error');
    }

    return isValid;
  }

  function validateForm() {
    let isValid = true;
    Object.keys(fields).forEach(fieldName => {
      if (!validateField(fieldName)) {
        isValid = false;
      }
    });
    return isValid;
  }

  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  }

  function showSuccess() {
    form.classList.add('is-submitted');
    successMessage.classList.add('is-visible');
    
    // Reset after 5 seconds for demo purposes
    setTimeout(() => {
      form.reset();
      form.classList.remove('is-submitted');
      successMessage.classList.remove('is-visible');
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        field.element.classList.remove('is-valid', 'is-invalid');
        field.element.closest('.form-group').classList.remove('has-error');
      });
    }, 5000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    showSuccess();
  });
})();
