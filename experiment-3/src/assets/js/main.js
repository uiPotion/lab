/**
 * PotionKit Landing Page - Main JavaScript
 * Handles theme switching, mobile menu, navbar scroll effects, and blog features
 */

(function() {
  'use strict';

  // ========================================
  // Theme Toggle
  // ========================================
  
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getCurrentTheme() {
    return html.getAttribute('data-theme') || 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  // Theme toggle click handler
  if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleTheme();
    });
  }

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', function(e) {
    const stored = localStorage.getItem('theme');
    if (!stored) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ========================================
  // Navbar Scroll Effect
  // ========================================
  
  const navbar = document.getElementById('navbar');
  const scrollThreshold = 20;

  function handleScroll() {
    if (!navbar) return;
    const scrollY = window.scrollY || window.pageYOffset;
    navbar.classList.toggle('navbar--scrolled', scrollY > scrollThreshold);
  }

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  handleScroll();

  // ========================================
  // Mobile Menu
  // ========================================
  
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  function toggleMenu() {
    if (!mobileMenu || !menuBtn) return;
    menuOpen = !menuOpen;
    
    mobileMenu.classList.toggle('mobile-menu--open', menuOpen);
    mobileMenu.hidden = !menuOpen;
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    mobileMenu.setAttribute('aria-hidden', String(!menuOpen));
  }

  function closeMenu() {
    if (menuOpen) toggleMenu();
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (menuOpen && mobileMenu && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // Close menu when clicking a link
  document.querySelectorAll('.mobile-menu__link').forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on window resize (if going to desktop)
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && menuOpen) closeMenu();
  });

})();

// ========================================
// Global Functions (exposed to window)
// ========================================

/**
 * Show a toast notification
 */
function showToast(message, type) {
  // Remove existing toasts
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast toast--' + (type || 'info');
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;border-radius:0.75rem;background:var(--surface);color:var(--text-primary);box-shadow:var(--shadow-lg);border:1px solid var(--border);z-index:9999;animation:slideIn 0.3s ease;';
  
  document.body.appendChild(toast);
  
  setTimeout(function() {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

/**
 * Share post to social media
 */
function sharePost(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  let shareUrl = '';
  
  switch(platform) {
    case 'twitter':
      shareUrl = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;
      break;
    case 'linkedin':
      shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}

/**
 * Copy current URL to clipboard
 */
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(function() {
    showToast('Link copied to clipboard!', 'success');
  }).catch(function() {
    showToast('Failed to copy link', 'error');
  });
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
