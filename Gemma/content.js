// content.js - Handles page translation and content extraction
class PageTranslator {
  constructor() {
    this.isTranslating = false;
    this.originalContent = new Map();
    this.init();
  }

  init() {
    console.log('🌐 Gemma Page Translator initialized');
    
    // Listen for messages from side panel
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Page Translator received:', request);
      
      switch (request.action) {
        case 'translatePage':
          this.translatePage(request.targetLanguage, request.content)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
          return true; // Keep message channel open
          
        case 'extractPageContent':
          sendResponse(this.extractPageContent());
          break;
          
        case 'revertTranslation':
          this.revertTranslation();
          sendResponse({ success: true });
          break;
          
        case 'translateElement':
          this.translateElement(request.element, request.targetLanguage)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
          return true;
      }
    });
  }

  // Extract main content from page
  extractPageContent() {
    const content = {
      title: document.title,
      mainText: '',
      links: [],
      images: []
    };

    // Try to get main content (prioritize article, main, or content areas)
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      'body'
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && this.getTextContent(element).length > 100) {
        content.mainText = this.getTextContent(element);
        break;
      }
    }

    // If no substantial content found, use body
    if (!content.mainText) {
      content.mainText = this.getTextContent(document.body);
    }

    // Extract links
    document.querySelectorAll('a').forEach(link => {
      if (link.href && link.textContent.trim()) {
        content.links.push({
          text: link.textContent.trim(),
          href: link.href
        });
      }
    });

    // Extract images with alt text
    document.querySelectorAll('img').forEach(img => {
      if (img.alt) {
        content.images.push({
          alt: img.alt,
          src: img.src
        });
      }
    });

    return content;
  }

  getTextContent(element) {
    return element.textContent.replace(/\s+/g, ' ').trim();
  }

  // Translate entire page
  async translatePage(targetLanguage, specificContent = null) {
    if (this.isTranslating) {
      throw new Error('Translation already in progress');
    }

    this.isTranslating = true;
    
    try {
      if (specificContent) {
        // Translate specific content provided by user
        return await this.translateText(specificContent, targetLanguage);
      } else {
        // Translate visible page content
        return await this.translateVisibleContent(targetLanguage);
      }
    } finally {
      this.isTranslating = false;
    }
  }

  // Translate visible text content on page
  async translateVisibleContent(targetLanguage) {
    const translatableElements = this.getTranslatableElements();
    const translations = [];
    
    // Store original content
    this.originalContent.clear();
    
    for (const element of translatableElements) {
      const originalText = element.textContent.trim();
      if (originalText && originalText.length > 1) {
        this.originalContent.set(element, originalText);
        
        try {
          const translated = await this.translateText(originalText, targetLanguage);
          element.textContent = translated;
          translations.push({
            original: originalText,
            translated: translated,
            element: element.tagName
          });
        } catch (error) {
          console.warn('Failed to translate element:', element, error);
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return {
      translatedElements: translations.length,
      language: targetLanguage,
      timestamp: new Date().toISOString()
    };
  }

  // Get elements that should be translated
  getTranslatableElements() {
    const selectors = [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'div', 'li', 'td', 'th',
      'a', 'button', 'label',
      '[translate="yes"]', '.translatable'
    ].join(',');

    const elements = Array.from(document.querySelectorAll(selectors))
      .filter(element => {
        // Filter out elements that are likely not content
        const text = element.textContent.trim();
        return text && 
               text.length > 1 &&
               text.length < 1000 && // Avoid huge blocks
               !element.closest('script') &&
               !element.closest('style') &&
               !element.closest('[aria-hidden="true"]');
      });

    return elements;
  }

  // Translate individual text using Chrome's Translation API
  async translateText(text, targetLanguage) {
    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    // Check if Translation API is available
    if (!('Translation' in window) || !window.Translation.translate) {
      throw new Error('Translation API not available in this browser');
    }

    try {
      const result = await window.Translation.translate({
        text: text,
        targetLanguage: targetLanguage,
        sourceLanguage: 'auto'
      });
      
      return result.translation || text;
    } catch (error) {
      console.error('Translation API error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  // Revert translated content back to original
  revertTranslation() {
    let revertedCount = 0;
    
    this.originalContent.forEach((originalText, element) => {
      if (element.isConnected) {
        element.textContent = originalText;
        revertedCount++;
      }
    });
    
    this.originalContent.clear();
    return revertedCount;
  }

  // Translate specific element
  async translateElement(elementSelector, targetLanguage) {
    const element = document.querySelector(elementSelector);
    if (!element) {
      throw new Error('Element not found');
    }

    const originalText = element.textContent.trim();
    if (!originalText) {
      throw new Error('Element has no text content');
    }

    const translated = await this.translateText(originalText, targetLanguage);
    this.originalContent.set(element, originalText);
    element.textContent = translated;

    return {
      original: originalText,
      translated: translated,
      element: elementSelector
    };
  }
}

// Initialize page translator
const pageTranslator = new PageTranslator();

// Additional message handlers for insertion and simple writing detection
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (!req || !req.action) return;
  if (req.action === 'insertText') {
    try {
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        el.value = req.text;
        // dispatch input event
        el.dispatchEvent(new Event('input', {bubbles:true}));
        sendResponse({ok:true});
      } else {
        // try to find a contenteditable focused element
        const ce = document.querySelector('[contenteditable="true"]');
        if (ce) {
          ce.innerText = req.text;
          sendResponse({ok:true});
        } else {
          sendResponse({ok:false, reason:'no focused editable'});
        }
      }
    } catch (e) { sendResponse({ok:false, error: e.message}); }
    return true;
  }
});