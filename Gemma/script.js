class GemmaAssistant {
  constructor() {
    this.session = null;
    this.modelAvailable = false;
    this.currentScreen = 'welcome';
    this.isGenerating = false;
    this.additionalRings = [];
    
    this.elements = {
      welcomeScreen: document.getElementById('welcomeScreen'),
      chatInterface: document.getElementById('chatInterface'),
      settingsModal: document.getElementById('settingsModal'),
      mainOrb: document.getElementById('mainOrb'),
      settingsBtn: document.getElementById('settingsBtn'),
      chatOrb: document.getElementById('chatOrb'),
      chatMessages: document.getElementById('chatMessages'),
      chatInput: document.getElementById('chatInput'),
      chatSend: document.getElementById('chatSend'),
      backToWelcome: document.getElementById('backToWelcome'),
      settingsBtn2: document.getElementById('settingsBtn2'),
      closeSettings: document.getElementById('closeSettings'),
      aiStatus: document.getElementById('aiStatus'),
      connectionStatus: document.getElementById('connectionStatus')
    };
    
    this.init();
  }

  async init() {
    console.log('🚀 Gemma Assistant Initializing...');
    this.updateAIStatus('Checking AI availability...', 'warning');
    
    await this.checkLanguageModel();
    this.setupEventListeners();
    this.showScreen('welcome');
    
    console.log('✅ Gemma initialization complete');
  }

  async checkLanguageModel() {
    console.log('🔍 Checking LanguageModel API...');
    
    if (!('LanguageModel' in window)) {
      this.updateAIStatus('AI API not available', 'error');
      console.error('❌ LanguageModel API not found');
      return;
    }
    
    try {
      const availability = await LanguageModel.availability();
      console.log('📊 Model availability:', availability);
      
      if (availability === 'readable' || availability === 'available') {
        this.modelAvailable = true;
        await this.initializeSession();
        this.updateAIStatus('AI Ready ✅', 'success');
        this.updateConnectionStatus('Connected', 'success');
        console.log('✅ AI model is ready');
      } else if (availability === 'downloadable') {
        this.updateAIStatus('Click to Download AI Model', 'warning');
        console.log('⬇️ Model needs download');
      } else {
        this.updateAIStatus('AI Model Unavailable', 'error');
        console.log('❌ Model unavailable:', availability);
      }
      
    } catch (error) {
      this.updateAIStatus('AI Check Failed', 'error');
      console.error('❌ Availability check failed:', error);
    }
  }

  async initializeSession() {
    try {
      console.log('🔄 Creating AI session...');
      this.session = await LanguageModel.create({
        systemPrompt: "You are Gemma from Iron Man. Be concise, helpful, and slightly witty. Keep responses under 3 sentences. Use simple formatting with **bold** for emphasis.",
        expectedOutputs: [{ type: "text", languages: ["en"] }]
      });
      console.log('✅ AI session created successfully');
      return true;
    } catch (error) {
      console.error('❌ Session creation failed:', error);
      return false;
    }
  }

  setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    this.elements.mainOrb.addEventListener('click', () => {
      console.log('🎯 Orb clicked, entering chat mode');
      this.enterChatMode();
    });
    
    this.elements.settingsBtn.addEventListener('click', () => {
      console.log('⚙️ Settings clicked');
      this.showSettings();
    });
    
    this.elements.chatSend.addEventListener('click', () => {
      console.log('📤 Chat send clicked');
      this.handleChatSend();
    });
    
    this.elements.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('📤 Chat enter pressed');
        this.handleChatSend();
      }
    });
    
    this.elements.backToWelcome.addEventListener('click', () => {
      console.log('🔙 Back to welcome screen');
      this.showScreen('welcome');
    });
    
    this.elements.settingsBtn2.addEventListener('click', () => {
      console.log('⚙️ Settings clicked from chat');
      this.showSettings();
    });
    
    this.elements.closeSettings.addEventListener('click', () => {
      console.log('❌ Closing settings');
      this.hideSettings();
    });
    
    this.elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) {
        this.hideSettings();
      }
    });
    
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prompt = e.target.dataset.prompt;
        console.log('💡 Quick suggestion:', prompt);
        this.elements.chatInput.value = prompt;
        this.handleChatSend();
      });
    });
    
    console.log('✅ Event listeners setup complete');
  }

  showScreen(screen) {
    console.log('🖥️ Switching to screen:', screen);
    
    this.elements.welcomeScreen.classList.remove('active');
    this.elements.chatInterface.classList.remove('active');
    
    this.currentScreen = screen;
    switch(screen) {
      case 'welcome':
        this.elements.welcomeScreen.classList.add('active');
        break;
      case 'chat':
        this.elements.chatInterface.classList.add('active');
        this.elements.chatInput.focus();
        break;
    }
  }

  enterChatMode() {
    console.log('💬 Entering chat mode');
    this.showScreen('chat');
  }

  showSettings() {
    console.log('📋 Showing settings modal');
    this.elements.settingsModal.classList.add('active');
  }

  hideSettings() {
    console.log('📋 Hiding settings modal');
    this.elements.settingsModal.classList.remove('active');
  }

  async handleChatSend() {
    const message = this.elements.chatInput.value.trim();
    if (!message) {
      console.log('⚠️ Empty chat message');
      return;
    }
    
    console.log('📝 Processing chat message:', message);
    
    this.addChatMessage(message, 'user');
    this.elements.chatInput.value = '';
    
    this.startGenerationAnimation();
    await this.processChatCommand(message);
    this.stopGenerationAnimation();
  }

  async processChatCommand(command) {
    console.log('🎯 Processing chat command:', command);
    
    if (!this.modelAvailable || !this.session) {
      this.addChatMessage('AI system is initializing. Please wait a moment...', 'Gemma');
      return;
    }

    try {
      console.log('🤖 Sending to AI...');
      const response = await this.session.prompt(command, {
        expectedOutputs: [{ type: "text", languages: ["en"] }]
      });
      
      console.log('✅ AI response received');
      const formattedResponse = this.formatResponse(response);
      this.addChatMessage(formattedResponse, 'Gemma');
      
    } catch (error) {
      console.error('❌ AI processing error:', error);
      this.addChatMessage(`Sorry, I encountered an error: ${error.message}`, 'Gemma');
    }
  }

  formatResponse(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .trim();
  }

  addChatMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${sender === 'Gemma' ? 'J' : 'U'}</div>
      <div class="message-content">
        <div class="message-text">${text}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    
    this.elements.chatMessages.appendChild(messageDiv);
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    
    return messageDiv;
  }

  startGenerationAnimation() {
    console.log('🎬 Starting generation animation');
    this.isGenerating = true;
    
    const orb = this.elements.chatOrb;
    orb.classList.add('generating');
    
    // Add 27 additional rings for generating state (total 77)
    this.addAdditionalRings();
    
    // Apply alternating colors to all 77 rings
    this.applyAlternatingColors();
    
    this.updateConnectionStatus('Generating response...', 'warning');
  }

  stopGenerationAnimation() {
    console.log('🛑 Stopping generation animation');
    this.isGenerating = false;
    
    const orb = this.elements.chatOrb;
    orb.classList.remove('generating');
    
    // Remove additional rings
    this.removeAdditionalRings();
    
    // Remove color classes
    this.removeColorClasses();
    
    this.updateConnectionStatus('Ready', 'success');
  }

  addAdditionalRings() {
    const rasengan = this.elements.chatOrb.querySelector('.rasengan');
    
    // Add rings 51-77 with proper scaling for chat orb size
    for (let i = 51; i <= 77; i++) {
      const ring = document.createElement('div');
      ring.className = `line line${i}`;
      
      // Calculate position for additional rings (scaled for 100px orb)
      const size = 75 + (i - 50) * 1.5;
      ring.style.top = `${size}px`;
      ring.style.left = `${size}px`;
      ring.style.bottom = `${size}px`;
      ring.style.right = `${size}px`;
      
      rasengan.appendChild(ring);
      this.additionalRings.push(ring);
    }
  }

  removeAdditionalRings() {
    this.additionalRings.forEach(ring => {
      if (ring.parentNode) {
        ring.parentNode.removeChild(ring);
      }
    });
    this.additionalRings = [];
  }

  applyAlternatingColors() {
    const rasengan = this.elements.chatOrb.querySelector('.rasengan');
    const allRings = rasengan.querySelectorAll('.line');
    
    allRings.forEach((ring, index) => {
      // Remove any existing color classes
      ring.classList.remove('blue-ring', 'black-ring');
      
      // Apply alternating colors (odd = blue, even = black)
      if ((index + 1) % 2 === 1) {
        ring.classList.add('blue-ring');
      } else {
        ring.classList.add('black-ring');
      }
    });
  }

  removeColorClasses() {
    const rasengan = this.elements.chatOrb.querySelector('.rasengan');
    const allRings = rasengan.querySelectorAll('.line');
    
    allRings.forEach(ring => {
      ring.classList.remove('blue-ring', 'black-ring');
    });
  }

  updateAIStatus(message, type = '') {
    if (this.elements.aiStatus) {
      this.elements.aiStatus.textContent = message;
      this.elements.aiStatus.className = `ai-status ${type}`;
      console.log('🤖 AI Status:', message);
    }
  }

  updateConnectionStatus(message, type = '') {
    if (this.elements.connectionStatus) {
      this.elements.connectionStatus.textContent = message;
      this.elements.connectionStatus.className = `connection-status ${type}`;
      console.log('📡 Connection Status:', message);
    }
  }
}

// Initialize Gemma when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🧩 DOM loaded, starting Gemma initialization...');
  window.Gemma = new GemmaAssistant();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
  if (window.Gemma && window.Gemma.session) {
    console.log('🧹 Cleaning up Gemma...');
    window.Gemma.session.destroy();
  }
});

/* === New integrations & message handling === */

// listen for messages from content script (writing detection)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.action === 'userWritingDetected') {
    const popup = document.getElementById('inpageProofPopup');
    if (popup) {
      popup.classList.remove('hidden');
      const yes = document.getElementById('inpageYes');
      const no = document.getElementById('inpageNo');
      yes.onclick = () => {
        popup.classList.add('hidden');
        openProofreadMode();
      };
      no.onclick = () => popup.classList.add('hidden');
    }
  }
});

// Proofread mode launcher (within side panel)
async function openProofreadMode() {
  try {
    window.Gemma && window.Gemma.showScreen && window.Gemma.showScreen('chat');
    let bar = document.getElementById('proofreadBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'proofreadBar';
      bar.style.padding = '10px';
      bar.style.borderTop = '1px solid rgba(255,255,255,0.04)';
      bar.innerHTML = `
        <textarea id="proofreadInput" placeholder="Paste or type text to proofread..." style="width:100%;height:90px;border-radius:8px;padding:10px;background:rgba(0,0,0,0.35);color:#e8f6ff;border:1px solid rgba(255,255,255,0.06)"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px;justify-content:flex-end;">
          <button id="proofreadRun" class="primary">Proofread</button>
        </div>
        <div id="proofreadResult" style="margin-top:10px;"></div>
      `;
      document.querySelector('.chat-input-container').insertAdjacentElement('afterend', bar);
      document.getElementById('proofreadRun').addEventListener('click', async () => {
        const txt = document.getElementById('proofreadInput').value.trim();
        if (!txt) return;
        const resBox = document.getElementById('proofreadResult');
        resBox.innerHTML = 'Checking availability...';
        if (!window.GemmaProofreader) {
          resBox.innerHTML = 'Proofreader API not available in this browser.';
          return;
        }
        const status = await window.GemmaProofreader.check();
        if (!status.available) {
          resBox.innerHTML = 'Proofreader not available: ' + (status.reason || JSON.stringify(status));
          return;
        }
        resBox.innerHTML = 'Proofreading...';
        try {
          const result = await window.GemmaProofreader.proofread(txt, (p) => {
            resBox.innerHTML = `Model downloading: ${p}%`;
          });
          const corrected = result.correctedText || result.text || JSON.stringify(result);
          const highlights = result.corrections || [];
          let html = '<h4>Corrected</h4><div class="proof-corrected">' + corrected + '</div>';
          if (highlights.length) {
            html += '<h4>Highlights</h4><ul>';
            highlights.forEach(c => {
              html += `<li><strong>${c.text}</strong> → <em>${c.replacement || c.suggestion || ''}</em> <div class="explain">${c.explanation || ''}</div></li>`;
            });
            html += '</ul>';
          }
          resBox.innerHTML = html;
        } catch (e) {
          resBox.innerHTML = 'Proofread failed: ' + e.message;
        }
      });
    }
  } catch (e) {
    console.error('openProofreadMode error', e);
  }
}

// wire proofread button in settings modal
const launchProofBtn = document.getElementById('launchProofreadBtn');
if (launchProofBtn) {
  launchProofBtn.addEventListener('click', () => {
    openProofreadMode();
  });
}

// TTS speaking on Gemma responses
const origAddChatMessage = GemmaAssistant.prototype.addChatMessage;
GemmaAssistant.prototype.addChatMessage = function(text, sender) {
  const messageDiv = origAddChatMessage.call(this, text, sender);
  if (sender === 'Gemma') {
    try {
      const contentEl = messageDiv.querySelector('.message-text');
      const plain = contentEl ? contentEl.innerText : text;
      window.GemmaTTS && window.GemmaTTS.speak(plain);
    } catch (e) { }
  } else {
    window.GemmaTTS && window.GemmaTTS.stop && window.GemmaTTS.stop();
  }
  return messageDiv;
};

// On load, populate system status info
(async function updateSystemStatus(){
  const modelStatusEl = document.getElementById('modelStatus');
  const proofEl = document.getElementById('proofreaderStatus');
  try {
    if ('LanguageModel' in window && LanguageModel.availability) {
      const a = await LanguageModel.availability();
      modelStatusEl.textContent = a;
    } else {
      modelStatusEl.textContent = 'LanguageModel API not present';
    }
  } catch(e){ modelStatusEl.textContent = 'Error'; }

  try {
    if ('Proofreader' in window && Proofreader.availability) {
      const pa = await Proofreader.availability();
      proofEl.textContent = pa;
    } else {
      proofEl.textContent = 'Not available';
    }
  } catch(e){ proofEl.textContent = 'Error'; }

  const flagsEl = document.getElementById('flagsStatus');
  try {
    flagsEl.textContent = 'chrome://flags not readable from extension';
  } catch(e){ flagsEl.textContent = 'Unknown'; }
})();


// --- Proofread & Translate UI wiring ---
(function(){
  function $(id){return document.getElementById(id);}
  const launchProofBtn = $('launchProofreadBtn');
  const proofScreen = document.getElementById('proofreadInterface');
  const translateScreen = document.getElementById('translateInterface');
  const chatScreen = document.getElementById('chatInterface');
  const backButtons = document.querySelectorAll('.back-to-chat');

  function showScreen(el){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    if (chatScreen) chatScreen.classList.remove('active');
    el.classList.add('active');
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden','false');
  }
  function hideScreen(el){
    el.classList.remove('active');
    el.classList.add('hidden');
    el.setAttribute('aria-hidden','true');
  }

  if (launchProofBtn) {
    launchProofBtn.addEventListener('click', ()=>{
      showScreen(proofScreen);
    });
  }

  backButtons.forEach(b=>b.addEventListener('click', ()=>{
    // return to chat interface
    if (chatScreen) { showScreen(chatScreen); }
    // stop any orbs thinking
    document.querySelectorAll('.rasengan-orb').forEach(o=>o.classList.remove('thinking'));
  }));

  // Proofread run handler
  const proofRun = $('proofreadRunBtn');
  const proofInput = $('proofInputArea');
  const proofOrb = document.getElementById('proofOrb');
  const proofCorrected = $('proofCorrected');
  const proofHighlights = $('proofHighlights');
  const proofResultHeader = $('proofResultHeader');
  const insertToEditor = $('insertToEditorBtn');

  async function simpleFallbackProof(text){
    // naive fixes: capitalize i pronoun, fix double spaces, capitalize sentence start
    let t = text.replace(/\bi\b/g, 'I');
    t = t.replace(/\s{2,}/g, ' ');
    t = t.replace(/(^|[\.\!\?]\s+)([a-z])/g, (m,p,ch)=> p + ch.toUpperCase());
    return {correctedInput:t, corrections: []};
  }

  async function renderProofResult(res, originalText){
    proofCorrected.innerHTML = '';
    proofHighlights.innerHTML = '';
    proofResultHeader.textContent = 'Proofread results';
    if (!res) { proofCorrected.textContent = 'No result'; return; }
    const corrected = res.correctedInput || res.transformed || res.text || '';
    // Build inline corrected HTML by applying corrections to originalText if possible
    let html = '';
    if (Array.isArray(res.corrections) && res.corrections.length>0 && originalText) {
      // sort by startIndex
      const corr = res.corrections.slice().sort((a,b)=> (a.startIndex||0)-(b.startIndex||0) );
      let pos = 0;
      for (const c of corr) {
        const si = c.startIndex||0;
        const ei = c.endIndex||si;
        const before = originalText.slice(pos, si);
        html += escapeHtml(before);
        const after = c.correction || c.replacement || '';
        const tooltip = c.message || c.explanation || c.suggestion || '';
        html += `<span class="correction-span" title="${escapeHtml(tooltip)}">${escapeHtml(after)}</span>`;
        pos = ei;
      }
      html += escapeHtml(originalText.slice(pos));
      proofCorrected.innerHTML = html;
      // highlights list
      for (const c of corr) {
        const before = originalText.slice(c.startIndex||0, c.endIndex||0) || '(empty)';
        const after = c.correction || c.replacement || '(none)';
        const li = document.createElement('li');
        li.textContent = `${before} → ${after}`;
        proofHighlights.appendChild(li);
      }
    } else {
      proofCorrected.textContent = corrected || originalText || '';
      if (Array.isArray(res.corrections)) {
        for (const c of res.corrections) {
          const before = (originalText && typeof c.startIndex==='number') ? originalText.slice(c.startIndex, c.endIndex) : '(unknown)';
          const after = c.correction || c.replacement || '';
          const li = document.createElement('li');
          li.textContent = `${before} → ${after}`;
          proofHighlights.appendChild(li);
        }
      }
    }
  }

  function escapeHtml(str){ if(!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  if (proofRun) {
    proofRun.addEventListener('click', async ()=>{
      const txt = proofInput.value || '';
      if (!txt.trim()) return;
      proofResultHeader.textContent = 'Processing…';
      proofOrb.classList.add('thinking');
      try {
        let res;
        if (window.GemmaProofreader && window.GemmaProofreader.proofread) {
          try {
            res = await window.GemmaProofreader.proofread(txt, (pct)=>{ proofResultHeader.textContent = 'Processing '+pct+'%'; });
          } catch(e){ console.warn('Proofreader API failed:', e); res = await simpleFallbackProof(txt); }
        } else {
          res = await simpleFallbackProof(txt);
        }
        await renderProofResult(res, txt);
      } catch (e) {
        proofCorrected.textContent = 'Error: ' + (e.message||e);
      } finally {
        proofOrb.classList.remove('thinking');
      }
    });
  }

  // insert to focused field on active tab
  if (insertToEditor) {
    insertToEditor.addEventListener('click', async ()=>{
      const correctedText = proofCorrected.textContent || proofInput.value || '';
      try {
        const tabs = await chrome.tabs.query({active:true,currentWindow:true});
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action:'insertText', text: correctedText}, (r)=>{ console.log('insert result', r); });
        }
      } catch(e){ console.warn(e); }
    });
  }

  // Translate UI handlers (panel)
  const translateRun = $('translateRunBtn');
  const translateInput = $('translateInputArea');
  const translateLang = $('translateLangSelect');
  const translateOutput = $('translateOutput');
  const translatePageBtn2 = $('translatePageBtn2');
  const revertTranslateBtn2 = $('revertTranslateBtn2');
  const translateOrb = document.getElementById('translateOrb');

  async function translateTextLocal(q, target='en'){
    // call external API (LibreTranslate) - this will work when online. We'll fallback if fetch fails.
    try {
      const resp = await fetch('https://libretranslate.com/translate', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({q, source:'auto', target, format:'text'})
      });
      const j = await resp.json();
      return j.translatedText || j.result || '';
    } catch(e){
      // simple fake fallback: return original with note
      return '[Translated('+target+')]: ' + q;
    }
  }

  if (translateRun) {
    translateRun.addEventListener('click', async ()=>{
      const q = translateInput.value || '';
      if (!q) return;
      translateOrb.classList.add('thinking');
      translateOutput.textContent = 'Translating…';
      try {
        const t = await translateTextLocal(q, translateLang.value || 'en');
        translateOutput.textContent = t;
      } catch(e){ translateOutput.textContent = 'Translate error: '+e.message; }
      translateOrb.classList.remove('thinking');
    });
  }

  if (translatePageBtn2) {
    translatePageBtn2.addEventListener('click', async ()=>{
      translateOrb.classList.add('thinking');
      try {
        const tabs = await chrome.tabs.query({active:true,currentWindow:true});
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action:'translatePage', target: translateLang.value||'en'}, (res)=>{ console.log('translate page res', res); translateOrb.classList.remove('thinking'); });
        }
      } catch(e){ console.warn(e); translateOrb.classList.remove('thinking'); }
    });
  }
  if (revertTranslateBtn2) {
    revertTranslateBtn2.addEventListener('click', async ()=>{
      try {
        const tabs = await chrome.tabs.query({active:true,currentWindow:true});
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action:'revertTranslation'}, (res)=>{ console.log('revert res', res); });
        }
      } catch(e){ console.warn(e); }
    });
  }

})(); // end proofread/translate wiring
