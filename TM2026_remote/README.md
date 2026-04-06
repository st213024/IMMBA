# imMBA Website (Demo)

This project is a lightweight, front-end website mock for the Fu Jen Catholic University **imMBA** homepage, built with:
- **HTML + CSS + Vanilla JS**
- A simple local-data layer (`news-store.js`) to render **Latest News** on both Chinese and English home pages.

## File Structure
```text
TM2026_remote/
  README.md
  index.html        # Chinese homepage
  index-en.html     # English homepage
  styles.css        # Shared styles for both home pages
  script.js         # Shared interactions + news rendering

  news-store.js     # Local news data store + logic (used by both home pages)
  news-detail.html  # Optional internal detail page (used when external_url is empty)
```

## How to Run
This workspace does not require a build step.

1. Open a PowerShell (or use any terminal) in this folder:
   - `C:\Users\Administrator\2026TM\TM2026_remote`
2. Start a local server (choose any free port, e.g. 5502):
   ```powershell
   py -m http.server 5502
   ```
3. Visit:
   - Chinese: `http://localhost:5502/index.html`
   - English: `http://localhost:5502/index-en.html`

## Language Switch
Both pages include links in the top bar:
- `中文` → `index.html`
- `English` → `index-en.html`
