// translate.js - talks to content script to translate page or revert
(function(){
  const translateBtn = document.getElementById('translatePageBtn');
  const revertBtn = document.getElementById('revertTranslateBtn');
  const langSelect = document.getElementById('translateLang');
  const status = document.getElementById('translateStatus');

  async function sendToActiveTab(message) {
    const tabs = await chrome.tabs.query({active:true, currentWindow:true});
    if (!tabs[0]) throw new Error('No active tab');
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        resolve(response);
      });
    });
  }

  if (translateBtn) {
    translateBtn.addEventListener('click', async () => {
      const lang = langSelect.value || 'en';
      status.textContent = `Translating this page to ${lang}…`;
      try {
        const res = await sendToActiveTab({action: 'translatePage', targetLanguage: lang});
        status.textContent = res && !res.error ? `Translated ${res.translatedElements} elements to ${res.language}` : `Translate failed: ${res && res.error ? res.error : 'unknown'}`;
      } catch (e) {
        status.textContent = 'Translate error: ' + e.message;
      }
    });
  }

  if (revertBtn) {
    revertBtn.addEventListener('click', async () => {
      status.textContent = 'Reverting translation…';
      try {
        const res = await sendToActiveTab({action: 'revertTranslation'});
        status.textContent = 'Reverted';
      } catch (e) {
        status.textContent = 'Revert failed: ' + e.message;
      }
    });
  }
})();