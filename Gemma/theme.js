// theme.js - handles dynamic theme toggling and persistence using chrome.storage.sync
(function(){
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark');
      label.textContent = 'Light';
      document.documentElement.style.setProperty('--welcome-orb-size','#fff');
    } else {
      document.body.classList.add('dark');
      label.textContent = 'Dark';
    }
  }

  // init
  if (toggle) {
    chrome.storage && chrome.storage.sync ? chrome.storage.sync.get({gemmaTheme: 'dark'}, (res) => {
      const theme = res.gemmaTheme || 'dark';
      toggle.checked = theme === 'light';
      applyTheme(theme);
    }) : applyTheme('dark');

    toggle.addEventListener('change', () => {
      const theme = toggle.checked ? 'light' : 'dark';
      applyTheme(theme);
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({gemmaTheme: theme});
      }
    });
  }
})();