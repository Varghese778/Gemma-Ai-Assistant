
# Gemma AI Assistant

Gemma AI Assistant is a Chrome side-panel extension that provides a small, modular AI assistant UI with chat, proofread, translate and text-to-speech helpers. It uses Chrome extension APIs (Manifest v3) and—when available—experimental browser AI/web platform features such as the LanguageModel and Proofreader APIs.

This repo contains the side-panel UI and helper modules located in the `Gemma/` folder.

## Key features

- Chat mode with a lively orb UI and quick suggestion buttons
- Proofreader mode (uses the browser `Proofreader` API when available; falls back to a small local heuristic)
- Page translation (works with a translation API when online, and communicates with the content script to swap page text)
- Text-to-speech for Gemma responses (optional; toggle in settings)
- Side-panel integration (opens in Chrome's side panel)

## Files of interest

- `Gemma/manifest.json` — extension manifest (manifest_version: 3). Declares `side_panel` and basic permissions.
- `Gemma/index.html` — the UI shown inside the side panel.
- `Gemma/script.js` — core UI logic and the GemmaAssistant class.
- `Gemma/background.js` — background service worker that manages opening the side panel and side-panel behavior.
- `Gemma/content.js` — content script used to extract and translate page content and to insert proofread text into focused fields.
- `Gemma/proofreader.js` — wrapper for the Proofreader API.
- `Gemma/translate.js` — wiring for page-level translation actions.
- `Gemma/tts.js` — text-to-speech helper using the Web Speech API.
- `Gemma/style.css`, `Gemma/theme.js` — styling and theme toggles.

## Installation (developer / local testing)

1. Open Chrome (or Chromium-based browser that supports Manifest v3 and the Side Panel API).
2. Open `chrome://extensions`.
3. Enable "Developer mode" (top-right).
4. Click "Load unpacked" and select this repository folder (the directory that contains `manifest.json` inside `Gemma/` — if the manifest is inside `Gemma/`, point the loader to that folder or move `Gemma/manifest.json` to the root depending on your workflow).
5. Pin or click the extension action to open Gemma. The extension is configured to show `index.html` in the side panel.

Notes:
- The extension requires the Side Panel API. Side panel behavior is set from the background service worker.
- When running locally, open DevTools (Console) for both the side panel (inspect the side panel window) and the active page to see debug logs.

## Usage

- Open the side panel or click the extension action. Click the orb to enter Chat mode and type into the input field.
- Use the settings modal to enable voice replies (TTS), switch theme, open Proofread mode, or run Translate on the current page.
- Proofread mode will attempt to use the browser `Proofreader` API when present and will show download/progress info if a model must be downloaded.
- Translate page will send a message to the content script which uses a browser `Translation` API if present; otherwise a fallback (online) translation endpoint is used for text.

## Permissions

The manifest declares the following permissions:

- `sidePanel` — to show the UI in Chrome's side panel
- `activeTab` — to interact with the currently active tab
- `host_permissions: ["<all_urls>"]` — necessary for page translation and sending messages to content scripts on pages

The extension also uses `chrome.storage.sync` for saving simple settings (theme, TTS toggle).

## Chrome flags and experimental features

Gemma includes integrations that rely on experimental web platform APIs (the repository checks for `LanguageModel`, `Proofreader`, and `Translation` on `window`). Those APIs are not available in stable Chrome by default.

If you want to try the experimental AI/proofreading features, follow these recommendations:

- Use Chrome Canary or a Dev channel build when possible. Experimental APIs frequently appear first on Canary/Dev.
- Enable Experimental Web Platform features:
	1. Open `chrome://flags`.
	2. Search for "Experimental Web Platform features" (flag id: `#enable-experimental-web-platform-features`).
	3. Set it to "Enabled" and restart the browser.

After enabling that flag (or using a browser build with the APIs exposed), reload the extension and open the side panel. The side panel UI shows basic availability checks for the `LanguageModel` and `Proofreader` APIs — those elements will report if the APIs are present.

Important: the extension cannot read `chrome://flags` programmatically; enabling flags is a manual step performed by the user. Also, experimental flags change across Chrome versions — consult the Chrome Canary/Dev release notes if a specific API name is not yet present.

## System requirements & recommendations

- OS: Windows, macOS or Linux (any OS supported by Chrome/Chromium browsers).
- Browser: Chromium-based browser with Manifest v3 support. For basic UI and translation features, stable Chrome (recent versions) is fine. For experimental AI features (LanguageModel, Proofreader) use Chrome Canary or Dev and enable experimental features as described above.
- Chrome version: use a modern Chrome/Chromium release (Chrome 100+). Experimental APIs may require more recent channel builds.
- Memory & Disk: If a browser-side model is required (Proofreader or LanguageModel), the browser may download model data to disk; allow extra disk space and internet bandwidth. Devices with limited RAM may experience slower model-download or inference times.
- Network: Online connectivity is required for the web translation fallback (the extension uses libretranslate.com as a fallback endpoint). Some features (local LanguageModel APIs) may work offline depending on the browser/engine.

Recommended minimum hardware for a smooth experience:
- CPU: Modern dual-core or better
- RAM: 4 GB minimum; 8 GB+ recommended when using heavy experimental models
- Disk: At least a few hundred MB free to allow for temporary model downloads (if the browser chooses to cache models)

## Privacy & data

- Text sent to external translation endpoints (fallback) will be transmitted to that service. The extension shows and tries to use built-in browser translation APIs when available (which may keep processing local to the browser depending on implementation).
- If `LanguageModel` or `Proofreader` is available on the client, model execution is typically local/in-browser, but consult your browser documentation for details.

## Troubleshooting

- If the side panel does not open, ensure the extension is installed and `sidePanel` is enabled in `manifest.json`. Check DevTools logs in the side panel and the background service worker.
- If proofreader/ai features show "not available", enable Experimental Web Platform features in `chrome://flags` or try Chrome Canary/Dev.
- For translation failures, check network access and whether a browser `Translation` API exists. The code falls back to an online translator; ensure outgoing HTTP(S) is permitted.

## Development notes

- The UI mounts inside `Gemma/index.html`. Most behavior is in `Gemma/script.js` and modular helpers in the same folder.
- To debug: open the extension in `chrome://extensions`, click "service worker" (for the background script) and inspect the side panel's DevTools.

## Contributing

Feel free to open issues or PRs for improvements. Small PRs such as bug fixes, accessibility improvements, or additions to the README are welcome.

## License

See `LICENSE` in the repository root.

---

