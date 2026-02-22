/**
 * Mock Authentication System
 * Simple session-based auth for demo purposes
 */

(function() {
  'use strict';

  // Mock credentials
  const MOCK_CREDENTIALS = {
    email: 'demo@example.com',
    password: 'SecurePass2024!xK'
  };

  const AUTH_TOKEN_KEY = 'potionkit_auth_token';
  const AUTH_USER_KEY = 'potionkit_auth_user';

  /**
   * Check if user is authenticated
   */
  function isAuthenticated() {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  }

  /**
   * Get current user
   */
  function getCurrentUser() {
    const userJson = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Mock login
   */
  async function login(email, password, rememberMe = false) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      const token = 'mock-jwt-token-' + Date.now();
      const user = { 
        email, 
        name: 'John Doe',
        avatar: 'JD'
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_TOKEN_KEY, token);
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      return { success: true, token, user };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  /**
   * Logout
   */
  function logout() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    window.location.href = 'login.html';
  }

  /**
   * Protect a page - redirect to login if not authenticated
   */
  function protectPage() {
    if (!isAuthenticated()) {
      // Store intended destination
      sessionStorage.setItem('auth_redirect', window.location.pathname);
      window.location.replace('login.html');
      return false;
    }
    return true;
  }

  /**
   * Initialize User Menu
   */
  function initUserMenu() {
    const menuTrigger = document.getElementById('user-menu-trigger');
    const menuDropdown = document.getElementById('user-menu-dropdown');
    
    if (!menuTrigger || !menuDropdown) return;

    let isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
      menuTrigger.setAttribute('aria-expanded', isOpen);
      menuDropdown.setAttribute('aria-hidden', !isOpen);
      menuDropdown.classList.toggle('user-menu__dropdown--open', isOpen);
    }

    function closeMenu() {
      if (isOpen) {
        isOpen = false;
        menuTrigger.setAttribute('aria-expanded', false);
        menuDropdown.setAttribute('aria-hidden', true);
        menuDropdown.classList.remove('user-menu__dropdown--open');
      }
    }

    // Toggle on click
    menuTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!menuTrigger.contains(e.target) && !menuDropdown.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        menuTrigger.focus();
      }
    });

    // Handle menu item clicks
    const menuItems = menuDropdown.querySelectorAll('.user-menu__link');
    menuItems.forEach(item => {
      item.addEventListener('click', function(e) {
        const isSignOut = this.classList.contains('user-menu__link--danger');
        
        if (isSignOut) {
          e.preventDefault();
          logout();
        } else {
          // For other items, just show a toast/alert in this demo
          e.preventDefault();
          const itemName = this.querySelector('span')?.textContent || 'Item';
          console.log('Clicked:', itemName);
          // In a real app, these would navigate to their respective pages
        }
        closeMenu();
      });
    });
  }

  /**
   * Update UI with auth state
   */
  function updateAuthUI() {
    const user = getCurrentUser();
    
    // Update user avatar in sidebar if present
    const userAvatar = document.querySelector('.chat-sidebar__avatar');
    if (userAvatar && user) {
      userAvatar.textContent = user.avatar || user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    // Update user name
    const userName = document.querySelector('.chat-sidebar__user-name');
    if (userName && user) {
      userName.textContent = user.name;
    }

    // Update user menu header
    const menuHeaderAvatar = document.querySelector('.user-menu__header-avatar');
    const menuHeaderName = document.querySelector('.user-menu__header-name');
    const menuHeaderEmail = document.querySelector('.user-menu__header-email');
    
    if (menuHeaderAvatar && user) {
      menuHeaderAvatar.textContent = user.avatar || user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (menuHeaderName && user) {
      menuHeaderName.textContent = user.name;
    }
    if (menuHeaderEmail && user) {
      menuHeaderEmail.textContent = user.email;
    }

    // Attach logout handler to navbar logout button
    const navbarLogout = document.getElementById('navbar-logout');
    if (navbarLogout) {
      navbarLogout.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }

    // Initialize user menu
    initUserMenu();
  }

  // Expose to global scope
  window.Auth = {
    isAuthenticated,
    getCurrentUser,
    login,
    logout,
    protectPage,
    updateAuthUI
  };

  // Auto-protect on DOM ready if data-protect attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    if (document.body.hasAttribute('data-protect')) {
      if (protectPage()) {
        updateAuthUI();
      }
    } else {
      updateAuthUI();
    }
  });
})();
