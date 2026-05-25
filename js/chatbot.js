/* ============================================
   chatbot.js — AI chat widget
   - Welcome popup with 2-second delay
   - Floating chat toggle button
   - Chat panel with AI integration
   - Calls /api/chat (Vercel serverless function)
   ============================================ */

(function () {
  'use strict';

  // ============ CONFIG ============
  const WELCOME_DELAY_MS = 2500;
  const STORAGE_KEY = 'roshan_portfolio_chat_welcomed';
  const API_ENDPOINT = '/api/chat';

  const SUGGESTED_PROMPTS = [
    'What projects has Roshan built?',
    'What tech stack does he know?',
    'Is he available for hire?',
    'Tell me about MIIRA'
  ];

  // ============ STATE ============
  let chatHistory = [];
  let isWaitingForResponse = false;

  // ============ DOM HELPERS ============
  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  // ============ WELCOME POPUP ============
  function showWelcomePopup() {
    const popup = $('#welcomePopup');
    if (!popup) return;

    // Don't show again if user already dismissed it this session
    if (sessionStorage.getItem(STORAGE_KEY) === 'dismissed') return;

    setTimeout(() => {
      popup.classList.add('show');
      const toggle = $('#chatToggle');
      if (toggle) toggle.classList.add('has-notification');
    }, WELCOME_DELAY_MS);
  }

  function hideWelcomePopup() {
    const popup = $('#welcomePopup');
    if (popup) {
      popup.classList.remove('show');
      sessionStorage.setItem(STORAGE_KEY, 'dismissed');
    }
  }

  // ============ CHAT PANEL ============
  function openChat() {
    const panel = $('#chatPanel');
    const toggle = $('#chatToggle');
    if (!panel || !toggle) return;

    hideWelcomePopup();
    panel.classList.add('open');
    toggle.classList.add('open');
    toggle.classList.remove('has-notification');

    setTimeout(() => {
      const input = $('#chatInput');
      if (input) input.focus();
    }, 300);

    // Send greeting message on first open
    if (chatHistory.length === 0) {
      addBotMessage(
        "Hi! I'm Roshan's AI assistant 👋 I can answer questions about his projects, skills, experience, or help you with general coding questions. What would you like to know?"
      );
    }
  }

  function closeChat() {
    const panel = $('#chatPanel');
    const toggle = $('#chatToggle');
    if (panel) panel.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
  }

  function toggleChat() {
    const panel = $('#chatPanel');
    if (panel.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  }

  // ============ MESSAGES ============
  function formatMessage(text) {
    // Basic formatting: line breaks, bold markdown, inline code
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function addBotMessage(text) {
    const messages = $('#chatMessages');
    if (!messages) return;
    const msg = createEl('div', 'msg bot', formatMessage(text));
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    chatHistory.push({ role: 'assistant', content: text });
  }

  function addUserMessage(text) {
    const messages = $('#chatMessages');
    if (!messages) return;
    const msg = createEl('div', 'msg user', formatMessage(text));
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    chatHistory.push({ role: 'user', content: text });
  }

  function addErrorMessage(text) {
    const messages = $('#chatMessages');
    if (!messages) return;
    const msg = createEl('div', 'msg error', formatMessage(text));
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTypingIndicator() {
    const messages = $('#chatMessages');
    if (!messages) return null;
    const indicator = createEl(
      'div',
      'typing-indicator',
      '<span></span><span></span><span></span>'
    );
    indicator.id = 'typingIndicator';
    messages.appendChild(indicator);
    messages.scrollTop = messages.scrollHeight;
    return indicator;
  }

  function hideTypingIndicator() {
    const indicator = $('#typingIndicator');
    if (indicator) indicator.remove();
  }

  // ============ SUGGESTED PROMPTS ============
  function renderSuggestions() {
    const container = $('#chatSuggestions');
    if (!container) return;

    container.innerHTML = '';
    SUGGESTED_PROMPTS.forEach((prompt) => {
      const btn = createEl('button', 'chat-suggestion', prompt);
      btn.addEventListener('click', () => {
        const input = $('#chatInput');
        if (input) {
          input.value = prompt;
          sendMessage();
        }
      });
      container.appendChild(btn);
    });
  }

  function hideSuggestions() {
    const container = $('#chatSuggestions');
    if (container) container.style.display = 'none';
  }

  // ============ API CALL ============
  async function callAI(userMessage) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory.slice(-10) // last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data.reply || "Sorry, I didn't get a response. Please try again.";
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  // ============ SEND MESSAGE ============
  async function sendMessage() {
    if (isWaitingForResponse) return;

    const input = $('#chatInput');
    const sendBtn = $('#chatSend');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // Clear input and disable send
    input.value = '';
    input.style.height = 'auto';
    isWaitingForResponse = true;
    if (sendBtn) sendBtn.disabled = true;
    hideSuggestions();

    addUserMessage(message);
    showTypingIndicator();

    try {
      const reply = await callAI(message);
      hideTypingIndicator();
      addBotMessage(reply);
    } catch (error) {
      hideTypingIndicator();
      addErrorMessage(
        "Something went wrong reaching the AI. You can email me directly at **roshan.sayyad@gmail.com** or try again in a moment."
      );
    } finally {
      isWaitingForResponse = false;
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }
  }

  // ============ INPUT AUTO-RESIZE ============
  function autoResizeInput() {
    const input = $('#chatInput');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  }

  // ============ EVENT BINDINGS ============
  function bindEvents() {
    const toggle = $('#chatToggle');
    const close = $('#welcomeClose');
    const openBtn = $('#welcomeOpenBtn');
    const dismissBtn = $('#welcomeDismissBtn');
    const sendBtn = $('#chatSend');
    const input = $('#chatInput');

    if (toggle) toggle.addEventListener('click', toggleChat);
    if (close) close.addEventListener('click', hideWelcomePopup);
    if (openBtn) openBtn.addEventListener('click', openChat);
    if (dismissBtn) dismissBtn.addEventListener('click', hideWelcomePopup);
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      input.addEventListener('input', autoResizeInput);
    }

    // Close chat with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const panel = $('#chatPanel');
        if (panel && panel.classList.contains('open')) closeChat();
      }
    });
  }

  // ============ INIT ============
  function init() {
    bindEvents();
    renderSuggestions();
    showWelcomePopup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
