// proofreader.js - integrates with Chrome Proofreader API if available.
(function(){
  async function checkProofreader() {
    if (!('Proofreader' in window)) return {available:false, reason:'API not present'};
    try {
      const avail = await Proofreader.availability();
      return {available: true, state: avail};
    } catch (e) {
      return {available:false, reason: e.message || 'error'};
    }
  }

  async function createProofreader(onProgress) {
    if (!('Proofreader' in window)) throw new Error('Proofreader API not available');
    const proofreader = await Proofreader.create({
      expectedInputLanguages: ['en'],
      monitor(m) {
        m.addEventListener('downloadprogress', e => {
          const pct = Math.round((e.loaded || 0) * 100);
          onProgress && onProgress(pct);
        });
      }
    });
    return proofreader;
  }

  async function proofreadText(text, onProgress) {
    const p = await createProofreader(onProgress);
    const res = await p.proofread(text);
    return res;
  }

  window.GemmaProofreader = {
    check: checkProofreader,
    create: createProofreader,
    proofread: proofreadText
  };
})();