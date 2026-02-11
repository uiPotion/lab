/**
 * Dashboard JavaScript
 * Handles sidebar navigation, dropdowns, mock authentication, data table, form validation,
 * toast notifications, and custom confirmation dialogs
 */

(function() {
  'use strict';

  const SIDEBAR_STORAGE_KEY = 'uipotion.dashboard.sidebarCollapsed.v1';

  // Mock user data
  let users = [
    { id: 1, name: 'Sarah Kim', email: 'sarah@example.com', role: 'Admin', status: 'active', joined: new Date(Date.now() - 2 * 60000), avatar: 'SK', color: '#3b82f6' },
    { id: 2, name: 'Mike Johnson', email: 'mike@example.com', role: 'Editor', status: 'active', joined: new Date(Date.now() - 15 * 60000), avatar: 'MJ', color: '#10b981' },
    { id: 3, name: 'Emma Wilson', email: 'emma@example.com', role: 'User', status: 'pending', joined: new Date(Date.now() - 60 * 60000), avatar: 'EW', color: '#f59e0b' },
    { id: 4, name: 'Tom Cooper', email: 'tom@example.com', role: 'User', status: 'inactive', joined: new Date(Date.now() - 3 * 60 * 60000), avatar: 'TC', color: '#ef4444' },
    { id: 5, name: 'Lisa Chen', email: 'lisa@example.com', role: 'Editor', status: 'active', joined: new Date(Date.now() - 5 * 60 * 60000), avatar: 'LC', color: '#8b5cf6' },
    { id: 6, name: 'James Brown', email: 'james@example.com', role: 'User', status: 'active', joined: new Date(Date.now() - 8 * 60 * 60000), avatar: 'JB', color: '#06b6d4' },
    { id: 7, name: 'Anna Martinez', email: 'anna@example.com', role: 'Admin', status: 'active', joined: new Date(Date.now() - 24 * 60 * 60000), avatar: 'AM', color: '#ec4899' },
    { id: 8, name: 'David Lee', email: 'david@example.com', role: 'User', status: 'pending', joined: new Date(Date.now() - 48 * 60 * 60000), avatar: 'DL', color: '#f97316' },
    { id: 9, name: 'Rachel Green', email: 'rachel@example.com', role: 'Editor', status: 'active', joined: new Date(Date.now() - 72 * 60 * 60000), avatar: 'RG', color: '#14b8a6' },
    { id: 10, name: 'Chris Evans', email: 'chris@example.com', role: 'User', status: 'inactive', joined: new Date(Date.now() - 96 * 60 * 60000), avatar: 'CE', color: '#6366f1' },
    { id: 11, name: 'Megan Fox', email: 'megan@example.com', role: 'User', status: 'active', joined: new Date(Date.now() - 120 * 60 * 60000), avatar: 'MF', color: '#84cc16' },
    { id: 12, name: 'Robert Downey', email: 'robert@example.com', role: 'Admin', status: 'active', joined: new Date(Date.now() - 168 * 60 * 60000), avatar: 'RD', color: '#eab308' }
  ];

  let tableState = {
    data: [...users],
    filteredData: [...users],
    currentPage: 1,
    pageSize: 10,
    sortColumn: null,
    sortDirection: 'asc',
    selectedIds: new Set(),
    searchQuery: ''
  };

  const formValidation = {
    touched: new Set(),
    errors: {},
    validFields: new Set()
  };

  // Track current modal mode (add or edit)
  let modalMode = 'add';
  let editingUserId = null;

  // ============================================
  // TOAST NOTIFICATION SYSTEM - UIPotion Pattern
  // ============================================
  const ToastSystem = {
    container: null,
    ariaLive: null,
    toasts: [],
    queue: [],
    maxVisible: 3,
    durations: {
      success: 4000,
      error: 7000,
      warning: 6000,
      info: 5000
    },
    icons: {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    },

    init() {
      this.container = document.getElementById('toastContainer');
      this.ariaLive = document.getElementById('toastAriaLive');
      
      // Add console log to verify initialization
      console.log('[ToastSystem] Initialized', { container: !!this.container, ariaLive: !!this.ariaLive });
    },

    createToast(message, type = 'info', options = {}) {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const duration = options.duration || this.durations[type];
      
      console.log('[ToastSystem] Creating toast:', { message, type, duration });
      
      const toastData = {
        id,
        message,
        type,
        duration,
        startTime: Date.now(),
        remainingTime: duration,
        paused: false,
        timerId: null,
        element: null
      };

      // If at max visible, add to queue
      if (this.toasts.length >= this.maxVisible) {
        this.queue.push(toastData);
        console.log('[ToastSystem] Added to queue, current queue size:', this.queue.length);
        return id;
      }

      this.showToast(toastData);
      return id;
    },

    showToast(toastData) {
      if (!this.container) {
        console.error('[ToastSystem] Container not found!');
        return;
      }

      // Create wrapper for exit animation
      const wrapper = document.createElement('div');
      wrapper.className = 'toast-wrapper toast-wrapper--entering';
      wrapper.dataset.toastId = toastData.id;

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast toast--${toastData.type} toast--entering`;
      toast.setAttribute('role', toastData.type === 'error' ? 'alert' : 'status');
      toast.setAttribute('aria-atomic', 'true');

      toast.innerHTML = `
        <div class="toast__icon">${this.icons[toastData.type]}</div>
        <div class="toast__content">
          <div class="toast__message">${this.escapeHtml(toastData.message)}</div>
        </div>
        <button class="toast__close" aria-label="Dismiss notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        ${toastData.duration > 0 ? `
          <div class="toast__progress">
            <div class="toast__progress-bar" style="animation-duration: ${toastData.duration}ms"></div>
          </div>
        ` : ''}
      `;

      wrapper.appendChild(toast);
      this.container.appendChild(wrapper);
      toastData.element = wrapper;

      // Trigger enter animation
      requestAnimationFrame(() => {
        wrapper.classList.remove('toast-wrapper--entering');
        toast.classList.remove('toast--entering');
      });

      // Store reference
      this.toasts.push(toastData);
      console.log('[ToastSystem] Toast shown, active toasts:', this.toasts.length);

      // Announce to screen readers
      this.announce(toastData.message, toastData.type);

      // Setup interactions
      this.setupToastInteractions(toastData, wrapper, toast);

      // Start auto-dismiss timer
      if (toastData.duration > 0) {
        this.startTimer(toastData);
      }
    },

    setupToastInteractions(toastData, wrapper, toast) {
      const closeBtn = toast.querySelector('.toast__close');
      
      // Close button
      closeBtn.addEventListener('click', () => {
        this.dismissToast(toastData.id);
      });

      // Pause on hover
      wrapper.addEventListener('mouseenter', () => {
        this.pauseToast(toastData.id);
      });

      wrapper.addEventListener('mouseleave', () => {
        this.resumeToast(toastData.id);
      });

      // Pause on focus
      wrapper.addEventListener('focusin', () => {
        this.pauseToast(toastData.id);
      });

      wrapper.addEventListener('focusout', () => {
        this.resumeToast(toastData.id);
      });

      // Keyboard: Escape to dismiss
      wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.dismissToast(toastData.id);
        }
      });
    },

    startTimer(toastData) {
      toastData.timerId = setTimeout(() => {
        this.dismissToast(toastData.id);
      }, toastData.remainingTime);
    },

    pauseToast(id) {
      const toast = this.toasts.find(t => t.id === id);
      if (!toast || toast.paused || toast.duration === 0) return;

      toast.paused = true;
      clearTimeout(toast.timerId);
      toast.remainingTime -= (Date.now() - toast.startTime);

      // Add paused class to pause CSS animation
      if (toast.element) {
        toast.element.querySelector('.toast')?.classList.add('toast--paused');
      }
    },

    resumeToast(id) {
      const toast = this.toasts.find(t => t.id === id);
      if (!toast || !toast.paused || toast.duration === 0) return;

      toast.paused = false;
      toast.startTime = Date.now();

      // Remove paused class
      if (toast.element) {
        toast.element.querySelector('.toast')?.classList.remove('toast--paused');
      }

      this.startTimer(toast);
    },

    dismissToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index === -1) return;

      const toast = this.toasts[index];
      
      // Clear timer
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }

      // Trigger exit animation
      if (toast.element) {
        toast.element.classList.add('toast-wrapper--exiting');
        
        // Remove from DOM after animation
        setTimeout(() => {
          if (toast.element && toast.element.parentNode) {
            toast.element.remove();
          }
          this.toasts.splice(index, 1);
          this.processQueue();
        }, 300);
      } else {
        this.toasts.splice(index, 1);
        this.processQueue();
      }
    },

    processQueue() {
      if (this.queue.length > 0 && this.toasts.length < this.maxVisible) {
        const nextToast = this.queue.shift();
        this.showToast(nextToast);
      }
    },

    dismissAll() {
      // Clear queue
      this.queue = [];
      
      // Dismiss all visible toasts
      [...this.toasts].forEach(toast => {
        this.dismissToast(toast.id);
      });
    },

    announce(message, type) {
      if (this.ariaLive) {
        this.ariaLive.textContent = '';
        // Use appropriate assertiveness
        this.ariaLive.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        setTimeout(() => {
          this.ariaLive.textContent = message;
        }, 100);
      }
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Public API
    success(message, options) {
      return this.createToast(message, 'success', options);
    },

    error(message, options) {
      return this.createToast(message, 'error', options);
    },

    warning(message, options) {
      return this.createToast(message, 'warning', options);
    },

    info(message, options) {
      return this.createToast(message, 'info', options);
    }
  };

  // ============================================
  // CONFIRM DIALOG SYSTEM
  // ============================================
  const ConfirmDialog = {
    dialog: null,
    overlay: null,
    title: null,
    description: null,
    cancelBtn: null,
    deleteBtn: null,
    resolvePromise: null,
    previousFocus: null,

    init() {
      this.dialog = document.getElementById('confirmDialog');
      this.overlay = document.getElementById('confirmOverlay');
      this.title = document.getElementById('confirmTitle');
      this.description = document.getElementById('confirmDescription');
      this.cancelBtn = document.getElementById('confirmCancel');
      this.deleteBtn = document.getElementById('confirmDelete');

      // Event listeners
      this.cancelBtn.addEventListener('click', () => this.handleCancel());
      this.deleteBtn.addEventListener('click', () => this.handleConfirm());
      this.overlay.addEventListener('click', () => this.handleCancel());

      // Keyboard handling
      this.dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.handleCancel();
        }
        if (e.key === 'Tab') {
          this.handleTab(e);
        }
      });
    },

    show(options = {}) {
      const {
        title = 'Delete User',
        description = 'Are you sure you want to delete this user? This action cannot be undone.',
        confirmText = 'Delete',
        itemName = null
      } = options;

      // Update content
      this.title.textContent = title;
      if (itemName) {
        this.description.textContent = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
      } else {
        this.description.textContent = description;
      }
      this.deleteBtn.textContent = confirmText;

      // Store previous focus
      this.previousFocus = document.activeElement;

      // Show dialog
      this.dialog.classList.add('confirm-dialog--open');
      document.body.style.overflow = 'hidden';

      // Focus trap - focus the cancel button initially (safer than delete)
      setTimeout(() => {
        this.cancelBtn.focus();
      }, 100);

      // Return promise
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },

    handleConfirm() {
      this.close(true);
    },

    handleCancel() {
      this.close(false);
    },

    close(confirmed) {
      this.dialog.classList.remove('confirm-dialog--open');
      document.body.style.overflow = '';
      
      // Restore focus
      if (this.previousFocus) {
        this.previousFocus.focus();
      }

      // Resolve promise
      if (this.resolvePromise) {
        this.resolvePromise(confirmed);
        this.resolvePromise = null;
      }
    },

    handleTab(e) {
      const focusableElements = [this.cancelBtn, this.deleteBtn];
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // DOM Elements
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsDropdown = document.getElementById('notificationsDropdown');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const usersTableBody = document.getElementById('usersTableBody');
  const selectAllCheckbox = document.getElementById('selectAll');
  const userSearch = document.getElementById('userSearch');
  const bulkActions = document.getElementById('bulkActions');
  const selectedCount = document.getElementById('selectedCount');
  const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
  const exportBtn = document.getElementById('exportBtn');
  const addUserBtn = document.getElementById('addUserBtn');
  const pageSizeSelect = document.getElementById('pageSize');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const paginationPages = document.getElementById('paginationPages');
  const paginationStart = document.getElementById('paginationStart');
  const paginationEnd = document.getElementById('paginationEnd');
  const paginationTotal = document.getElementById('paginationTotal');
  const addUserModal = document.getElementById('addUserModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const cancelAddUser = document.getElementById('cancelAddUser');
  const addUserForm = document.getElementById('addUserForm');
  const saveUserBtn = document.getElementById('saveUserBtn');
  const modalTitle = document.getElementById('modalTitle');
  const formAlert = document.getElementById('formAlert');
  const formAlertMessage = document.getElementById('formAlertMessage');
  const userNameField = document.getElementById('userName');
  const userEmailField = document.getElementById('userEmail');
  const userRoleField = document.getElementById('userRole');
  const userStatusField = document.getElementById('userStatus');

  let openDropdown = null;

  function init() {
    console.log('[Dashboard] Initializing...');
    
    checkAuth();
    initSidebar();
    initDropdowns();
    initTable();
    initModal();
    initFormValidation();
    initEventListeners();
    
    // Initialize new systems
    ToastSystem.init();
    ConfirmDialog.init();
    
    // Show welcome toast after a short delay to ensure everything is ready
    setTimeout(() => {
      console.log('[Dashboard] Showing welcome toast');
      ToastSystem.info('Welcome back to the dashboard!');
    }, 800);
    
    console.log('[Dashboard] Initialization complete');
  }

  function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const isLoggingIn = urlParams.get('login') === 'true';
    if (isLoggingIn) {
      sessionStorage.setItem('dashboard_authenticated', 'true');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  function initSidebar() {
    const isCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    if (isCollapsed && window.innerWidth >= 1024) {
      sidebar.classList.add('sidebar--collapsed');
      sidebarCollapseBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleSidebar() {
    const isCollapsed = sidebar.classList.toggle('sidebar--collapsed');
    sidebarCollapseBtn.setAttribute('aria-expanded', !isCollapsed);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, isCollapsed);
  }

  function openMobileSidebar() {
    sidebar.classList.add('sidebar--open');
    sidebarOverlay.classList.add('sidebar-overlay--visible');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('sidebar--open');
    sidebarOverlay.classList.remove('sidebar-overlay--visible');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function initDropdowns() {
    document.addEventListener('click', function(e) {
      if (openDropdown && !e.target.closest('.dashboard-header__notifications') && 
          !e.target.closest('.dashboard-header__user')) {
        closeAllDropdowns();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        closeModal();
        if (sidebar.classList.contains('sidebar--open')) {
          closeMobileSidebar();
        }
      }
    });
  }

  function toggleNotificationsDropdown() {
    const isOpen = notificationsDropdown.classList.contains('dropdown--open');
    closeAllDropdowns();
    if (!isOpen) {
      notificationsDropdown.classList.add('dropdown--open');
      notificationsBtn.setAttribute('aria-expanded', 'true');
      openDropdown = 'notifications';
    }
  }

  function toggleUserDropdown() {
    const isOpen = userDropdown.classList.contains('dropdown--open');
    closeAllDropdowns();
    if (!isOpen) {
      userDropdown.classList.add('dropdown--open');
      userMenuBtn.setAttribute('aria-expanded', 'true');
      openDropdown = 'user';
    }
  }

  function closeAllDropdowns() {
    notificationsDropdown.classList.remove('dropdown--open');
    notificationsBtn.setAttribute('aria-expanded', 'false');
    userDropdown.classList.remove('dropdown--open');
    userMenuBtn.setAttribute('aria-expanded', 'false');
    openDropdown = null;
  }

  // ============================================
  // FORM VALIDATION - UIPotion Pattern
  // ============================================

  function initFormValidation() {
    const validationRules = {
      userName: {
        required: true,
        minLength: 2,
        validate: (value) => {
          if (!value.trim()) return 'Full name is required';
          if (value.trim().length < 2) return 'Name must be at least 2 characters';
          return null;
        }
      },
      userEmail: {
        required: true,
        validate: (value) => {
          if (!value.trim()) return 'Email is required';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Please enter a valid email address (e.g., name@example.com)';
          return null;
        }
      },
      userRole: {
        required: true,
        validate: (value) => {
          if (!value) return 'Please select a role';
          return null;
        }
      },
      userStatus: {
        required: true,
        validate: (value) => {
          if (!value) return 'Please select a status';
          return null;
        }
      }
    };

    // On-blur validation for text inputs (UIPotion pattern)
    [userNameField, userEmailField].forEach(field => {
      field.addEventListener('blur', function() {
        const fieldName = this.name;
        formValidation.touched.add(fieldName);
        validateField(fieldName, this.value, validationRules[fieldName]);
      });

      // Real-time validation after first blur (UIPotion pattern)
      field.addEventListener('input', function() {
        const fieldName = this.name;
        if (formValidation.touched.has(fieldName)) {
          validateField(fieldName, this.value, validationRules[fieldName]);
        }
      });
    });

    // Change validation for selects
    [userRoleField, userStatusField].forEach(field => {
      field.addEventListener('change', function() {
        const fieldName = this.name;
        formValidation.touched.add(fieldName);
        validateField(fieldName, this.value, validationRules[fieldName]);
      });
    });

    addUserForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmit(validationRules);
    });
  }

  function validateField(fieldName, value, rules) {
    const error = rules.validate(value);
    const field = document.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    const errorEl = document.getElementById(`${fieldName}Error`);

    if (error) {
      // Show error state
      formValidation.errors[fieldName] = error;
      formValidation.validFields.delete(fieldName);
      
      // Use CSS classes for state (matching UIPotion spec)
      formGroup.classList.remove('form-group--success');
      formGroup.classList.add('form-group--error');
      field.setAttribute('aria-invalid', 'true');
      errorEl.textContent = error;
      
      // Hide hint when showing error
      const hint = formGroup.querySelector('.form-hint');
      if (hint) hint.style.display = 'none';
    } else {
      // Show success state
      delete formValidation.errors[fieldName];
      formValidation.validFields.add(fieldName);
      
      formGroup.classList.remove('form-group--error');
      formGroup.classList.add('form-group--success');
      field.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
      
      // Show hint when valid
      const hint = formGroup.querySelector('.form-hint');
      if (hint) hint.style.display = 'block';
    }

    return !error;
  }

  function handleFormSubmit(validationRules) {
    let hasErrors = false;
    const formData = new FormData(addUserForm);
    
    // Validate all fields on submit
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = formData.get(fieldName) || '';
      formValidation.touched.add(fieldName);
      
      if (!validateField(fieldName, value, rules)) {
        hasErrors = true;
      }
    }

    // Check for duplicate email (only in add mode, or if email changed in edit mode)
    const email = formData.get('userEmail');
    const existingUser = tableState.data.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (email && existingUser) {
      // In add mode: any existing email is a duplicate
      // In edit mode: only if it's a different user
      const isDuplicate = modalMode === 'add' || (modalMode === 'edit' && existingUser.id !== editingUserId);
      
      if (isDuplicate) {
        const field = document.querySelector('[name="userEmail"]');
        const formGroup = field.closest('.form-group');
        const errorEl = document.getElementById('userEmailError');
        
        formValidation.errors['userEmail'] = 'A user with this email already exists';
        formValidation.validFields.delete('userEmail');
        
        formGroup.classList.remove('form-group--success');
        formGroup.classList.add('form-group--error');
        field.setAttribute('aria-invalid', 'true');
        errorEl.textContent = 'A user with this email already exists';
        
        hasErrors = true;
      }
    }

    if (hasErrors) {
      // Show global error
      showFormAlert('Please fix the errors below to continue.', 'error');
      
      // Focus first invalid field (UIPotion pattern)
      const firstInvalid = document.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    hideFormAlert();

    // Show loading state
    const btnText = saveUserBtn.querySelector('.btn__text');
    const btnSpinner = saveUserBtn.querySelector('.btn__spinner');
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-flex';
    saveUserBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      if (modalMode === 'add') {
        // Add new user
        const name = formData.get('userName');
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
        
        const newUser = {
          id: Math.max(...tableState.data.map(u => u.id), 0) + 1,
          name: name,
          email: formData.get('userEmail'),
          role: formData.get('userRole'),
          status: formData.get('userStatus'),
          joined: new Date(),
          avatar: initials,
          color: colors[Math.floor(Math.random() * colors.length)]
        };

        tableState.data.unshift(newUser);
        filterData();
        
        // Show success toast
        ToastSystem.success(`${name} has been added successfully`);
      } else {
        // Edit existing user
        const userIndex = tableState.data.findIndex(u => u.id === editingUserId);
        if (userIndex !== -1) {
          const name = formData.get('userName');
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          
          tableState.data[userIndex] = {
            ...tableState.data[userIndex],
            name: name,
            email: formData.get('userEmail'),
            role: formData.get('userRole'),
            status: formData.get('userStatus'),
            avatar: initials
          };
          filterData();
          
          // Show success toast
          ToastSystem.success(`${name} has been updated successfully`);
        }
      }
      
      closeModal();

      // Reset button state
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
      saveUserBtn.disabled = false;
    }, 800);
  }

  function showFormAlert(message, type) {
    formAlert.className = `form-alert form-alert--${type}`;
    formAlertMessage.textContent = message;
    formAlert.style.display = 'flex';
  }

  function hideFormAlert() {
    formAlert.style.display = 'none';
    formAlertMessage.textContent = '';
  }

  function clearFormErrors() {
    formValidation.touched.clear();
    formValidation.errors = {};
    formValidation.validFields.clear();
    
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('form-group--error', 'form-group--success');
    });
    
    document.querySelectorAll('.form-input, .form-select').forEach(field => {
      field.setAttribute('aria-invalid', 'false');
    });
    
    document.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
    });
    
    document.querySelectorAll('.form-hint').forEach(hint => {
      hint.style.display = 'block';
    });
    
    hideFormAlert();
  }

  // ============================================
  // DATA TABLE
  // ============================================

  function initTable() {
    renderTable();
    initSortListeners();
  }

  function renderTable() {
    const start = (tableState.currentPage - 1) * tableState.pageSize;
    const end = start + tableState.pageSize;
    const pageData = tableState.filteredData.slice(start, end);

    if (pageData.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-8);">
            <div style="color: var(--color-text-muted);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: var(--space-4); opacity: 0.5;">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p>No users found</p>
            </div>
          </td>
        </tr>
      `;
      updatePagination();
      updateBulkActions();
      return;
    }

    usersTableBody.innerHTML = pageData.map(user => `
      <tr data-id="${user.id}" class="${tableState.selectedIds.has(user.id) ? 'is-selected' : ''}">
        <td class="data-table__checkbox">
          <label class="checkbox">
            <input type="checkbox" class="checkbox__input row-checkbox" value="${user.id}" ${tableState.selectedIds.has(user.id) ? 'checked' : ''}>
            <span class="checkbox__box"></span>
          </label>
        </td>
        <td data-label="User">
          <div class="data-table__user">
            <div class="data-table__avatar" style="background: ${user.color};">${user.avatar}</div>
            <div class="data-table__info">
              <div class="data-table__name">${escapeHtml(user.name)}</div>
              <div class="data-table__email">${escapeHtml(user.email)}</div>
            </div>
          </div>
        </td>
        <td data-label="Role"><span class="badge badge--secondary">${escapeHtml(user.role)}</span></td>
        <td data-label="Status"><span class="badge badge--${getStatusBadgeClass(user.status)}">${escapeHtml(user.status)}</span></td>
        <td data-label="Joined">${formatTimeAgo(user.joined)}</td>
        <td class="data-table__actions">
          <div class="row-actions">
            <button class="row-action-btn" data-action="edit" data-id="${user.id}" aria-label="Edit user">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="row-action-btn row-action-btn--delete" data-action="delete" data-id="${user.id}" aria-label="Delete user">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    updatePagination();
    updateBulkActions();
    initRowListeners();
  }

  function initSortListeners() {
    document.querySelectorAll('.data-table__sortable').forEach(header => {
      header.addEventListener('click', function() {
        const column = this.dataset.sort;
        
        if (tableState.sortColumn === column) {
          tableState.sortDirection = tableState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          tableState.sortColumn = column;
          tableState.sortDirection = 'asc';
        }

        document.querySelectorAll('.data-table__sortable').forEach(h => {
          h.classList.remove('data-table__sortable--asc', 'data-table__sortable--desc');
        });
        this.classList.add(`data-table__sortable--${tableState.sortDirection}`);

        sortData();
        renderTable();
      });
    });
  }

  function sortData() {
    if (!tableState.sortColumn) return;

    tableState.filteredData.sort((a, b) => {
      let aVal = a[tableState.sortColumn];
      let bVal = b[tableState.sortColumn];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return tableState.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return tableState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function initRowListeners() {
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const id = parseInt(this.value);
        if (this.checked) {
          tableState.selectedIds.add(id);
        } else {
          tableState.selectedIds.delete(id);
        }
        updateSelectAllState();
        updateBulkActions();
        renderTable();
      });
    });

    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.dataset.action;
        const id = parseInt(this.dataset.id);
        
        if (action === 'delete') {
          deleteUser(id);
        } else if (action === 'edit') {
          openEditModal(id);
        }
      });
    });
  }

  function updateSelectAllState() {
    const visibleIds = getVisibleIds();
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => tableState.selectedIds.has(id));
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = !allSelected && visibleIds.some(id => tableState.selectedIds.has(id));
  }

  function getVisibleIds() {
    const start = (tableState.currentPage - 1) * tableState.pageSize;
    const end = start + tableState.pageSize;
    return tableState.filteredData.slice(start, end).map(u => u.id);
  }

  function updateBulkActions() {
    const count = tableState.selectedIds.size;
    selectedCount.textContent = count;
    bulkActions.style.display = count > 0 ? 'flex' : 'none';
  }

  function updatePagination() {
    const total = tableState.filteredData.length;
    const totalPages = Math.ceil(total / tableState.pageSize);
    const start = (tableState.currentPage - 1) * tableState.pageSize + 1;
    const end = Math.min(start + tableState.pageSize - 1, total);

    paginationStart.textContent = total > 0 ? start : 0;
    paginationEnd.textContent = end;
    paginationTotal.textContent = total;

    prevPageBtn.disabled = tableState.currentPage === 1;
    nextPageBtn.disabled = tableState.currentPage === totalPages || totalPages === 0;

    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= tableState.currentPage - 1 && i <= tableState.currentPage + 1)) {
        pagesHtml += `<button class="pagination__page ${i === tableState.currentPage ? 'pagination__page--active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === tableState.currentPage - 2 || i === tableState.currentPage + 2) {
        pagesHtml += '<span class="pagination__ellipsis" style="color: var(--color-text-muted); padding: 0 var(--space-2);">...</span>';
      }
    }
    paginationPages.innerHTML = pagesHtml;

    paginationPages.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', function() {
        tableState.currentPage = parseInt(this.dataset.page);
        renderTable();
      });
    });
  }

  function filterData() {
    const query = tableState.searchQuery.toLowerCase();
    
    if (!query) {
      tableState.filteredData = [...tableState.data];
    } else {
      tableState.filteredData = tableState.data.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.status.toLowerCase().includes(query)
      );
    }

    tableState.currentPage = 1;
    
    if (tableState.sortColumn) {
      sortData();
    }
    
    renderTable();
  }

  // ============================================
  // DELETE WITH CUSTOM CONFIRM DIALOG
  // ============================================
  
  async function deleteUser(id) {
    const user = tableState.data.find(u => u.id === id);
    if (!user) return;

    // Show custom confirm dialog
    const confirmed = await ConfirmDialog.show({
      title: 'Delete User',
      itemName: user.name,
      confirmText: 'Delete User'
    });

    if (confirmed) {
      tableState.data = tableState.data.filter(u => u.id !== id);
      tableState.selectedIds.delete(id);
      filterData();
      
      // Show success toast
      ToastSystem.success(`${user.name} has been deleted`);
    }
  }

  async function bulkDeleteUsers() {
    const count = tableState.selectedIds.size;
    if (count === 0) return;

    // Show custom confirm dialog for bulk delete
    const confirmed = await ConfirmDialog.show({
      title: 'Delete Multiple Users',
      description: `Are you sure you want to delete ${count} selected users? This action cannot be undone.`,
      confirmText: `Delete ${count} Users`
    });

    if (confirmed) {
      tableState.data = tableState.data.filter(u => !tableState.selectedIds.has(u.id));
      tableState.selectedIds.clear();
      filterData();
      
      // Show success toast
      ToastSystem.success(`${count} users have been deleted`);
    }
  }

  function exportUsers() {
    const usersToExport = tableState.selectedIds.size > 0 
      ? tableState.data.filter(u => tableState.selectedIds.has(u.id))
      : tableState.filteredData;

    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Joined'].join(','),
      ...usersToExport.map(u => [
        u.name,
        u.email,
        u.role,
        u.status,
        u.joined.toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    ToastSystem.success(`${usersToExport.length} users exported`);
  }

  // ============================================
  // MODAL - UIPotion Dialog Pattern
  // ============================================

  function initModal() {
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    cancelAddUser.addEventListener('click', closeModal);
    addUserBtn.addEventListener('click', openAddModal);
  }

  function openAddModal() {
    modalMode = 'add';
    editingUserId = null;
    
    // Update modal title and button text
    modalTitle.textContent = 'Add New User';
    saveUserBtn.querySelector('.btn__text').textContent = 'Add User';
    
    // Reset form
    addUserForm.reset();
    clearFormErrors();
    
    // Open modal
    addUserModal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element (UIPotion pattern)
    userNameField.focus();
  }

  function openEditModal(userId) {
    const user = tableState.data.find(u => u.id === userId);
    if (!user) return;
    
    modalMode = 'edit';
    editingUserId = userId;
    
    // Update modal title and button text
    modalTitle.textContent = 'Edit User';
    saveUserBtn.querySelector('.btn__text').textContent = 'Save Changes';
    
    // Pre-fill form with user data
    userNameField.value = user.name;
    userEmailField.value = user.email;
    userRoleField.value = user.role;
    userStatusField.value = user.status;
    
    // Clear any previous validation states
    clearFormErrors();
    
    // Mark all fields as valid initially
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.add('form-group--success');
    });
    
    // Open modal
    addUserModal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
    // Focus first field
    userNameField.focus();
  }

  function closeModal() {
    addUserModal.classList.remove('modal--open');
    document.body.style.overflow = '';
    addUserForm.reset();
    clearFormErrors();
    
    // Reset mode
    modalMode = 'add';
    editingUserId = null;
  }

  function handleLogout(e) {
    e.preventDefault();
    sessionStorage.removeItem('dashboard_authenticated');
    window.location.href = logoutBtn.getAttribute('href');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function initEventListeners() {
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener('click', toggleSidebar);
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        if (sidebar.classList.contains('sidebar--open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNotificationsDropdown();
      });
    }

    if (userMenuBtn) {
      userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleUserDropdown();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function() {
        const visibleIds = getVisibleIds();
        if (this.checked) {
          visibleIds.forEach(id => tableState.selectedIds.add(id));
        } else {
          visibleIds.forEach(id => tableState.selectedIds.delete(id));
        }
        renderTable();
        updateBulkActions();
      });
    }

    if (userSearch) {
      userSearch.addEventListener('input', function() {
        tableState.searchQuery = this.value;
        filterData();
      });
    }

    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', bulkDeleteUsers);
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportUsers);
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', function() {
        tableState.pageSize = parseInt(this.value);
        tableState.currentPage = 1;
        renderTable();
      });
    }

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', function() {
        if (tableState.currentPage > 1) {
          tableState.currentPage--;
          renderTable();
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(tableState.filteredData.length / tableState.pageSize);
        if (tableState.currentPage < totalPages) {
          tableState.currentPage++;
          renderTable();
        }
      });
    }

    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        if (window.innerWidth >= 1024 && sidebar.classList.contains('sidebar--open')) {
          closeMobileSidebar();
        }
      }, 300);
    });
  }

  // Utility functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getStatusBadgeClass(status) {
    const classes = {
      'active': 'success',
      'pending': 'warning',
      'inactive': 'error'
    };
    return classes[status] || 'secondary';
  }

  function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
