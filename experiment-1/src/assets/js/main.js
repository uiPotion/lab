/**
 * Nexus Landing Page - Main JavaScript
 * Handles: Navbar scroll, Mobile menu, Pricing toggle
 */

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('navbar--scrolled', scrolled);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  let isOpen = false;

  const toggleMenu = (event) => {
    if (event) {
      event.stopPropagation();
    }
    
    isOpen = !isOpen;
    mobileMenu.classList.toggle('mobile-menu--open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleMenu();
    }
  });

  // Close on backdrop click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      toggleMenu();
    }
  });

  // Close on link click
  const links = mobileMenu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });
}

// ============================================
// PRICING TOGGLE
// ============================================
function initPricingToggle() {
  const toggle = document.getElementById('billingToggle');
  const monthlyLabel = document.getElementById('monthly-label');
  const yearlyLabel = document.getElementById('yearly-label');
  const savingsBadge = document.getElementById('savingsBadge');
  const priceAmounts = document.querySelectorAll('.pricing-card__amount');
  
  if (!toggle) return;

  let isYearly = false;

  const updatePrices = () => {
    priceAmounts.forEach(amount => {
      const monthly = amount.dataset.monthly;
      const yearly = amount.dataset.yearly;
      const newValue = isYearly ? yearly : monthly;
      
      // Animate price change
      amount.style.opacity = '0';
      amount.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        amount.textContent = newValue;
        amount.style.opacity = '1';
        amount.style.transform = 'translateY(0)';
      }, 150);
    });

    // Update toggle state
    toggle.classList.toggle('billing-toggle__switch--yearly', isYearly);
    toggle.setAttribute('aria-checked', isYearly.toString());
    
    // Update labels
    monthlyLabel.classList.toggle('billing-toggle__label--active', !isYearly);
    yearlyLabel.classList.toggle('billing-toggle__label--active', isYearly);
    
    // Update savings badge
    if (savingsBadge) {
      savingsBadge.style.opacity = isYearly ? '1' : '0.5';
    }
  };

  toggle.addEventListener('click', () => {
    isYearly = !isYearly;
    updatePrices();
  });

  // Keyboard support
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isYearly = !isYearly;
      updatePrices();
    }
  });
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initPricingToggle();
});

// Re-init on page transitions (if using turbolinks, etc.)
document.addEventListener('turbolinks:load', () => {
  initNavbar();
  initMobileMenu();
  initPricingToggle();
});
