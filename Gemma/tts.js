// tts.js - handles speech synthesis for Gemma responses
(function(){
  const voiceToggle = document.getElementById('voiceToggle');
  const voiceLabel = document.getElementById('voiceLabel');
  let voiceEnabled = false;
  let synth = window.speechSynthesis;
  let currentUtterance = null;

  function setVoiceEnabled(v) {
    voiceEnabled = !!v;
    voiceLabel.textContent = voiceEnabled ? 'On' : 'Off';
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({gemmaVoice: voiceEnabled});
    }
  }

  // load saved
  if (chrome.storage && chrome.storage.sync && voiceToggle) {
    chrome.storage.sync.get({gemmaVoice: false}, (res) => {
      voiceToggle.checked = !!res.gemmaVoice;
      setVoiceEnabled(voiceToggle.checked);
    });
  }

  if (voiceToggle) {
    voiceToggle.addEventListener('change', () => setVoiceEnabled(voiceToggle.checked));
  }

  // expose global for script.js to call
  window.GemmaTTS = {
    speak(text) {
      if (!voiceEnabled || !synth) return;
      // stop existing
      synth.cancel();
      currentUtterance = new SpeechSynthesisUtterance(text);
      currentUtterance.rate = 1;
      currentUtterance.onend = () => { currentUtterance = null; };
      synth.speak(currentUtterance);
    },
    pause() {
      if (synth && synth.speaking) synth.pause();
    },
    stop() {
      if (synth) synth.cancel();
      currentUtterance = null;
    },
    isEnabled() { return voiceEnabled; }
  };
})();