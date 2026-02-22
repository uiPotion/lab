/**
 * PotionKit AI Chat
 * Fake interactions with beautiful UI transitions + File Upload
 */

(function() {
  'use strict';

  // ========================================
  // DOM Elements
  // ========================================
  
  const sidebar = document.getElementById('chat-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarOverlay = document.getElementById('chat-sidebar-overlay');
  const messagesContainer = document.getElementById('chat-messages');
  const welcomeState = document.getElementById('chat-welcome');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const typingIndicator = document.getElementById('chat-typing');
  const quickActions = document.querySelectorAll('.chat-quick-action');
  const newChatBtn = document.getElementById('new-chat-btn');
  
  // File upload elements
  const attachBtn = document.getElementById('chat-attach');
  const fileInput = document.getElementById('chat-file-input');
  const filePreview = document.getElementById('chat-file-preview');
  const filePreviewImg = document.getElementById('chat-file-preview-img');
  const fileRemoveBtn = document.getElementById('chat-file-remove');

  // State
  let isTyping = false;
  let messageId = 0;
  const messages = [];
  let currentFile = null;
  let currentFileDataUrl = null;

  // Fake AI responses
  const fakeResponses = {
    default: [
      "I understand you're asking about that. Let me provide you with a comprehensive answer. PotionKit is designed to make building modern websites incredibly fast and intuitive. It combines the power of HaroldJS for static site generation with UIPotion's beautiful, accessible components.",
      "That's a great question! Here's what you need to know: PotionKit offers a complete solution for developers who want to create stunning, performant websites without the complexity of modern frontend frameworks. It uses Handlebars for templating, SCSS for styling, and Markdown for content.",
      "I'd be happy to help with that. Based on what you're describing, you might want to consider using our Pro plan which includes priority support, custom domains, and advanced analytics. Would you like me to walk you through the features?"
    ],
    getting: [
      "Getting started with PotionKit is super easy! First, make sure you have Node.js installed (version 16 or higher). Then run `npm install -g harold-scripts` to install the CLI. After that, create a new project with `harold create my-project` and you're ready to go!",
      "To get started with PotionKit, you'll want to familiarize yourself with the project structure. The `src/pages/` directory contains your Handlebars templates, `src/styles/` has your SCSS files, and `src/partials/` is where reusable components live. Check out our documentation for detailed guides!"
    ],
    pro: [
      "The Pro plan includes everything in Starter plus: unlimited projects, custom domains, priority email support, advanced analytics dashboard, team collaboration features, and API access. It's perfect for professional developers and small teams.",
      "With our Pro plan ($29/month or $279/year), you get all the features of Starter plus some powerful additions: custom domain support, priority support with 24-hour response time, advanced analytics to track your site performance, and early access to new features."
    ],
    theme: [
      "Custom themes in PotionKit are incredibly flexible! You can override any CSS custom property in your `main.scss` file. The design system uses semantic tokens like `--bg-primary`, `--text-primary`, and `--accent` that adapt to both light and dark modes automatically.",
      "For custom themes, I recommend starting with the CSS custom properties in `:root`. You can change the accent color, adjust the color palette, or even create entirely new color schemes. All components will automatically inherit your changes since they use these design tokens."
    ],
    code: [
      "Here's a React component for you:\n\n```jsx\nimport React from 'react';\n\nexport const Button = ({ \n  children, \n  variant = 'primary', \n  size = 'md',\n  ...props \n}) => {\n  return (\n    <button \n      className={`btn btn--${variant} btn--${size}`}\n      {...props}\n    >\n      {children}\n    </button>\n  );\n};\n```\n\nThis uses the same BEM-style classes as PotionKit's design system!"
    ],
    image: [
      "Thanks for sharing that image! I can see it clearly. Is there something specific you'd like me to help you with regarding this image? I can help analyze it, extract text, or provide feedback on design elements.",
      "Great image! I can see it in the chat. How can I help you with this? Whether you need design feedback, want to extract information, or just want to discuss it, I'm here to help!",
      "I've received your image. It looks interesting! What would you like me to do with it? I can provide analysis, suggestions, or help you incorporate similar elements into your PotionKit project."
    ]
  };

  // Helper: Get response based on prompt
  function getResponse(text, hasImage) {
    if (hasImage) {
      return fakeResponses.image[Math.floor(Math.random() * fakeResponses.image.length)];
    }
    
    const lower = text.toLowerCase();
    if (lower.includes('start') || lower.includes('begin')) {
      return fakeResponses.getting[Math.floor(Math.random() * fakeResponses.getting.length)];
    }
    if (lower.includes('pro') || lower.includes('plan') || lower.includes('pricing')) {
      return fakeResponses.pro[Math.floor(Math.random() * fakeResponses.pro.length)];
    }
    if (lower.includes('theme') || lower.includes('custom') || lower.includes('style')) {
      return fakeResponses.theme[Math.floor(Math.random() * fakeResponses.theme.length)];
    }
    if (lower.includes('code') || lower.includes('react') || lower.includes('component')) {
      return fakeResponses.code[0];
    }
    return fakeResponses.default[Math.floor(Math.random() * fakeResponses.default.length)];
  }

  // Helper: Format markdown-like content
  function formatContent(content) {
    // Simple code block formatting
    let formatted = content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="chat-message__code"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="chat-message__inline-code">$1</code>');
    
    // Convert newlines to breaks (outside of code blocks)
    formatted = formatted.split('<pre').map((part, i) => {
      if (i === 0) return part.replace(/\n/g, '<br>');
      const [code, ...rest] = part.split('</pre>');
      return '<pre' + code + '</pre>' + rest.join('</pre>').replace(/\n/g, '<br>');
    }).join('');
    
    return formatted;
  }

  // Create message element
  function createMessageElement(content, role, imageUrl = null, animate = true) {
    const id = `msg-${++messageId}`;
    const div = document.createElement('div');
    div.className = `chat-message chat-message--${role}${animate ? ' chat-message--entering' : ''}`;
    div.id = id;
    div.setAttribute('role', 'article');
    
    const contentPreview = imageUrl 
      ? (content ? content.substring(0, 50) : 'Image') 
      : content.substring(0, 100);
    div.setAttribute('aria-label', `${role === 'user' ? 'You said' : 'AI said'}: ${contentPreview}${contentPreview.length > 100 ? '...' : ''}`);
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let imageHtml = '';
    if (imageUrl) {
      imageHtml = `<img class="chat-message__image" src="${imageUrl}" alt="Uploaded image">`;
    }
    
    div.innerHTML = `
      ${role === 'agent' ? `
        <div class="chat-message__avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="6" width="18" height="12" rx="2"/>
            <path d="M8 12h.01M16 12h.01M12 14v.01"/>
            <path d="M12 2v4"/>
            <path d="M8 2v4M16 2v4"/>
          </svg>
        </div>
      ` : ''}
      <div class="chat-message__content">
        <div class="chat-message__bubble">
          ${imageUrl ? imageHtml : ''}
          ${content ? formatContent(content) : ''}
        </div>
        <span class="chat-message__time">${timestamp}</span>
      </div>
    `;
    
    return div;
  }

  // Add message to chat
  function addMessage(content, role, imageUrl = null) {
    // Hide welcome state on first message
    if (welcomeState && !welcomeState.hidden) {
      welcomeState.style.display = 'none';
    }
    
    const messageEl = createMessageElement(content, role, imageUrl);
    messagesContainer.appendChild(messageEl);
    messages.push({ id: messageEl.id, content, role, imageUrl });
    
    // Scroll to bottom
    scrollToBottom();
    
    // Remove entering class after animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messageEl.classList.remove('chat-message--entering');
      });
    });
  }

  // Show typing indicator
  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    typingIndicator.removeAttribute('hidden');
    typingIndicator.style.display = 'flex';
    scrollToBottom();
  }

  // Hide typing indicator immediately (no delay)
  function hideTyping() {
    if (!isTyping) return;
    isTyping = false;
    typingIndicator.setAttribute('hidden', '');
    typingIndicator.style.display = 'none';
  }

  // Scroll to bottom of messages
  function scrollToBottom() {
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  // File upload handlers
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Only accept images
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Max file size 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    currentFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      currentFileDataUrl = e.target.result;
      filePreviewImg.src = currentFileDataUrl;
      filePreview.removeAttribute('hidden');
      filePreview.style.display = 'block';
      updateSendButton();
    };
    reader.readAsDataURL(file);
  }

  function removeFile() {
    currentFile = null;
    currentFileDataUrl = null;
    filePreviewImg.src = '';
    filePreview.setAttribute('hidden', '');
    filePreview.style.display = 'none';
    fileInput.value = '';
    updateSendButton();
  }

  // Update send button state
  function updateSendButton() {
    const hasContent = input.value.trim().length > 0;
    const hasFile = currentFile !== null;
    sendBtn.disabled = !(hasContent || hasFile);
  }

  // Send message handler
  async function sendMessage(text) {
    const hasText = text.trim().length > 0;
    const hasFile = currentFile !== null;
    
    if ((!hasText && !hasFile) || isTyping) return;
    
    // Add user message with image if present
    addMessage(hasText ? text : '', 'user', hasFile ? currentFileDataUrl : null);
    
    // Clear input and file
    input.value = '';
    input.style.height = 'auto';
    removeFile();
    
    // Show typing indicator
    showTyping();
    
    // Simulate AI response delay (1.5-3 seconds)
    const delay = 1500 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // IMPORTANT: Hide typing indicator FIRST, then add the response
    // This prevents the visual jump where both are visible at once
    hideTyping();
    
    // Small delay to ensure typing is fully hidden before adding message
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const response = getResponse(text, hasFile);
    addMessage(response, 'agent');
  }

  // Auto-resize textarea
  function autoResize() {
    input.style.height = 'auto';
    const newHeight = Math.min(input.scrollHeight, 160); // Max 160px
    input.style.height = newHeight + 'px';
    
    // Update send button state
    updateSendButton();
  }

  // Sidebar toggle
  function toggleSidebar() {
    const isOpen = sidebar.classList.toggle('chat-sidebar--open');
    sidebarToggle.setAttribute('aria-expanded', isOpen);
    sidebar.setAttribute('aria-hidden', !isOpen);
    sidebarOverlay.hidden = !isOpen;
    sidebarOverlay.classList.toggle('chat-sidebar__overlay--visible', isOpen);
    
    // Prevent body scroll on mobile when sidebar is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // New chat
  function startNewChat() {
    // Clear messages
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(welcomeState);
    welcomeState.style.display = '';
    messages.length = 0;
    messageId = 0;
    
    // Clear any pending file
    removeFile();
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      sidebar.classList.remove('chat-sidebar--open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
      sidebarOverlay.hidden = true;
      sidebarOverlay.classList.remove('chat-sidebar__overlay--visible');
      document.body.style.overflow = '';
    }
  }

  // Event Listeners
  input.addEventListener('input', autoResize);
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });
  
  sendBtn.addEventListener('click', () => {
    sendMessage(input.value);
  });
  
  sidebarToggle.addEventListener('click', toggleSidebar);
  
  sidebarOverlay.addEventListener('click', () => {
    toggleSidebar();
  });
  
  newChatBtn.addEventListener('click', startNewChat);
  
  // File upload event listeners
  attachBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', handleFileSelect);
  
  fileRemoveBtn.addEventListener('click', removeFile);
  
  // Quick action buttons
  quickActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });
  
  // Close sidebar on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('chat-sidebar--open')) {
      toggleSidebar();
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      sidebarOverlay.hidden = true;
      sidebarOverlay.classList.remove('chat-sidebar__overlay--visible');
      document.body.style.overflow = '';
    }
  });
  
  // Initialize - ensure typing indicator is hidden
  function init() {
    typingIndicator.setAttribute('hidden', '');
    typingIndicator.style.display = 'none';
    autoResize();
    updateSendButton();
  }
  
  init();
})();
