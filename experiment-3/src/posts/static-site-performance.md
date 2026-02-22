---
layout: post
title: Maximizing Performance in Static Site Generators
publicationDate: 2024-11-28
excerpt: Techniques for building blazing fast static sites. From image optimization to critical CSS, learn how to achieve perfect Core Web Vitals scores.
tags: [Performance, Static Sites, Core Web Vitals]
coverImage: https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop
author: David Park
authorAvatar: https://ui-avatars.com/api/?name=David+Park&background=f59e0b&color=fff
---

# Maximizing Performance in Static Site Generators

Static sites are fast by default—but with the right techniques, they can be lightning fast. Here's how to achieve perfect Core Web Vitals scores.

## The Static Site Advantage

Static sites have inherent performance benefits:

- **No server processing** on each request
- **CDN-friendly** with aggressive caching
- **Predictable performance** regardless of traffic
- **Minimal JavaScript** by default

But default performance isn't maximum performance. Let's optimize.

## Image Optimization

Images are typically the largest assets. Optimize aggressively:

### Modern Formats

```html
<!-- Use modern formats with fallbacks -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy" decoding="async">
</picture>
```

### Responsive Images

```html
<!-- Serve appropriately sized images -->
<img 
  srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  src="large.jpg"
  alt="Description">
```

### Lazy Loading

```html
<!-- Native lazy loading -->
<img src="below-fold.jpg" loading="lazy" alt="Below fold content">

<!-- Eager load above-fold images -->
<img src="hero.jpg" loading="eager" alt="Hero image" fetchpriority="high">
```

## CSS Optimization

### Critical CSS

Inline critical CSS and load the rest asynchronously:

```html
<head>
  <!-- Critical CSS inlined -->
  <style>
    /* Above-fold styles */
    .hero { /* ... */ }
    .navbar { /* ... */ }
  </style>
  
  <!-- Non-critical CSS loaded async -->
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
```

### Purge Unused Styles

Use tools to remove unused CSS:

```javascript
// Example: PurgeCSS configuration
module.exports = {
  content: ['src/**/*.html', 'src/**/*.js'],
  css: ['src/styles/main.css'],
  safelist: ['active', 'open', /^theme-/]
}
```

## JavaScript Strategy

### Minimize JavaScript

Static sites should need minimal JS:

```html
<!-- Load non-critical scripts with defer -->
<script src="analytics.js" defer></script>

<!-- Or use type=module (automatically deferred) -->
<script type="module" src="app.js"></script>

<!-- Inline critical interaction handlers -->
<script>
  // Toggle mobile menu immediately
  document.getElementById('menu-btn').addEventListener('click', toggleMenu);
</script>
```

### Progressive Enhancement

Build core functionality without JS, then enhance:

```html
<!-- Form works without JavaScript -->
<form action="/search" method="GET">
  <input type="search" name="q" placeholder="Search...">
  <button type="submit">Search</button>
</form>

<!-- Enhanced with JS for instant results -->
<script>
  // Add autocomplete, instant search, etc.
</script>
```

## Core Web Vitals Targets

### Largest Contentful Paint (LCP)

Target: **< 2.5s**

- Preload LCP images: `<link rel="preload" as="image" href="hero.jpg">`
- Use a CDN close to your users
- Optimize and compress all assets

### First Input Delay (FID) / Interaction to Next Paint (INP)

Target: **< 200ms**

- Break up long JavaScript tasks
- Use web workers for heavy processing
- Defer non-critical third-party scripts

### Cumulative Layout Shift (CLS)

Target: **< 0.1**

```html
<!-- Always size images to prevent layout shift -->
<img src="photo.jpg" width="800" height="600" alt="Photo">

<!-- Reserve space for dynamic content -->
<div style="min-height: 200px;">
  <!-- Content loads here -->
</div>
```

## Advanced Techniques

### Service Workers

Cache assets for instant repeat visits:

```javascript
// sw.js
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Resource Hints

```html
<!-- Preconnect to required origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- Prefetch likely next pages -->
<link rel="prefetch" href="/about">

<!-- Prerender for instant navigation -->
<link rel="prerender" href="/next-page">
```

## Measuring Performance

Use these tools to track your progress:

1. **PageSpeed Insights** - Overall score and recommendations
2. **WebPageTest** - Detailed waterfall analysis
3. **Chrome DevTools** - Real-time profiling
4. **Lighthouse CI** - Automated regression testing

## Conclusion

Static sites offer a performance foundation that's hard to beat. By applying these techniques—image optimization, critical CSS, minimal JavaScript, and proper resource hints—you can achieve perfect Core Web Vitals scores and deliver exceptional user experiences.

Remember: performance is a feature. Treat it as such from the start.
