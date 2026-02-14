// Navbar scroll effect
(function() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  function handleScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();
