/**
 * Theme Toggle - Dark/Light Mode
 * Implements the UIPotion dark-light-mode pattern
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  /**
   * Get the current theme from localStorage or system preference
   */
  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  /**
   * Get system preference
   */
  function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT;
  }

  /**
   * Resolve effective theme (stored > system > dark fallback)
   */
  function getEffectiveTheme() {
    const stored = getStoredTheme();
    if (stored === THEME_LIGHT || stored === THEME_DARK) {
      return stored;
    }
    return getSystemPreference();
  }

  /**
   * Apply theme to document
   */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    updateToggleButton(theme);
  }

  /**
   * Save theme preference
   */
  function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Toggle between light and dark
   */
  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    applyTheme(next);
    saveTheme(next);
  }

  /**
   * Update toggle button aria-label (CSS handles icon visibility)
   */
  function updateToggleButton(theme) {
    if (!toggleBtn) return;
    
    if (theme === THEME_DARK) {
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  /**
   * Remove flash prevention style after paint
   */
  function removeFlashPrevention() {
    const style = document.getElementById('theme-flash-prevent');
    if (style) {
      // Use double RAF to ensure styles have been applied
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          style.remove();
        });
      });
    }
  }

  /**
   * Initialize theme
   */
  function init() {
    // Theme is already set by inline script in head to prevent flash
    // Just ensure toggle button aria-label matches current state
    const currentTheme = html.getAttribute('data-theme') || getEffectiveTheme();
    
    // Apply theme if not already set (e.g., if inline script failed)
    if (!html.getAttribute('data-theme')) {
      applyTheme(currentTheme);
    } else {
      updateToggleButton(currentTheme);
    }

    // Bind toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // Listen for system preference changes (if no user override)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!getStoredTheme()) {
        const newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
        applyTheme(newTheme);
      }
    });

    // Remove flash prevention style after initial paint
    removeFlashPrevention();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
