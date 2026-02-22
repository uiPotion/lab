---
layout: 'post'
title: 'Dark Mode Implementation Guide'
excerpt: 'A comprehensive guide to implementing dark mode in web applications with accessibility in mind.'
coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200'
tags: ['CSS', 'Accessibility', 'UI']
publicationDate: '2025-01-05'
author: 'Emily Rodriguez'
authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
---

# Dark Mode Implementation Guide

Dark mode has become an essential feature for modern web applications. Beyond aesthetics, it reduces eye strain and saves battery life on OLED devices. Here's how to implement it properly.

## Why Dark Mode Matters

- **User preference** - Many users prefer dark interfaces, especially at night
- **Accessibility** - Reduces eye strain and light sensitivity issues
- **Battery life** - OLED screens use less power displaying dark colors
- **Modern expectation** - Users expect dark mode as a standard feature

## Implementation Strategies

### 1. CSS Custom Properties (Recommended)

Using CSS variables makes theming straightforward:

```css
:root {
  /* Light mode (default) */
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --color-border: #e2e8f0;
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --color-bg: #0f172a;
  --color-text: #f8fafc;
  --color-border: #1e293b;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

### 2. System Preference Detection

Respect the user's OS-level preference:

```javascript
// Check system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Listen for changes
prefersDark.addEventListener('change', (e) => {
  setTheme(e.matches ? 'dark' : 'light');
});
```

### 3. User Override

Allow users to explicitly choose their preference:

```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// On page load
const savedTheme = localStorage.getItem('theme') || 
  (prefersDark.matches ? 'dark' : 'light');
setTheme(savedTheme);
```

## Color Strategy

### Avoid Pure Black

Pure black (`#000000`) can cause eye strain. Use dark grays instead:

- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Elevated: `#334155` (slate-700)

### Adjust Saturation

Colors appear more saturated on dark backgrounds. Reduce saturation for dark mode:

```css
/* Light mode */
--color-primary: #3b82f6; /* Bright blue */

/* Dark mode */
--color-primary: #60a5fa; /* Softer blue */
```

### Elevation with Shadows

On light backgrounds, shadows create depth. On dark backgrounds, use lighter surface colors:

```css
.card {
  background: var(--color-surface);
}

.card-elevated {
  background: var(--color-surface-elevated);
}
```

## Accessibility Considerations

### Contrast Ratios

WCAG 2.1 requires:
- **Normal text**: 4.5:1 contrast ratio
- **Large text**: 3:1 contrast ratio

Use tools like WebAIM's contrast checker to verify.

### Focus Indicators

Don't rely solely on color changes. Ensure focus states are visible:

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Common Pitfalls

### 1. Images and Icons

Ensure images work on both backgrounds:

```css
/* Add subtle background to transparent images */
img {
  background: var(--color-surface);
}

/* Or use filter for icons */
.icon {
  filter: var(--icon-filter);
}

[data-theme="dark"] {
  --icon-filter: invert(1);
}
```

### 2. Third-Party Content

Embedded content (maps, videos, iframes) may not support theming. Use overlays or container backgrounds:

```css
.iframe-container {
  background: var(--color-surface);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

### 3. Color Meaning

Don't use color alone to convey information:

```css
/* Bad: Only color indicates error */
.error { color: red; }

/* Good: Color + icon + text */
.error { 
  color: var(--color-error);
  border-left: 3px solid var(--color-error);
}
.error::before {
  content: '⚠️ ';
}
```

## Advanced Techniques

### Smooth Transitions

Animate theme changes for polish:

```css
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Multiple Themes

Support more than just light/dark:

```javascript
const themes = ['light', 'dark', 'high-contrast', 'sepia'];
```

### SSR Considerations

Prevent flash of wrong theme on server-rendered apps:

```html
<script>
  // Inline in <head> to prevent flash
  (function() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

## Testing Your Implementation

1. **Manual testing** - Toggle theme in different lighting conditions
2. **Automated testing** - Use axe or Lighthouse for contrast checks
3. **User testing** - Get feedback from users with visual impairments
4. **Device testing** - Test on OLED, LCD, and various screen sizes

## Tools and Resources

- **Polished** - JavaScript library for styled-components theming
- **Theme UI** - React theming library
- **Tailwind Dark Mode** - Built-in dark mode support
- **Stitches** - CSS-in-JS with theming

## Conclusion

Implementing dark mode is more than inverting colors. It requires thoughtful color choices, accessibility considerations, and respect for user preferences. Done well, it enhances usability and shows users you care about their experience.

Start with CSS custom properties, respect system preferences, and always prioritize accessibility. Your users' eyes will thank you! 👀