// Set side panel behavior globally
chrome.runtime.onInstalled.addListener(() => {
  console.log('Gemma Assistant installed');
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Gemma: Action clicked on tab:', tab.url);
  
  // Only open on HTTP/HTTPS pages
  if (!tab.url.startsWith('http')) {
    console.warn('Gemma: Cannot open on system pages');
    return;
  }

  try {
    // Enable side panel for this tab
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'index.html',
      enabled: true
    });
    
    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id });
    console.log('✅ Gemma side panel opened');
    
  } catch (error) {
    console.error('🚨 Error opening side panel:', error);
  }
});

// Auto-enable side panel for web pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    try {
      await chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'index.html',
        enabled: true
      });
    } catch (error) {
      // Ignore errors for special pages
    }
  }
});