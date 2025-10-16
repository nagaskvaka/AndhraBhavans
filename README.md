# Andhra Bhavans — Local Theme & UI Enhancements

This project contains a small static site for Andhra Bhavans. I added a modern food-themed stylesheet, animations, responsive navigation, and client-side menu filtering.

Files changed/added
- `styles.css` — theme, responsive nav, animations, FLIP filter support
- `js/site.js` — mobile nav accessibility, filtering, dynamic menu rendering
- `data/menu.json` — sample menu data
- `Main.html`, `menu.html`, `aboutus.html`, `contactus.html` — updated to use the shared header/nav/footer and scripts

Preview locally
1. Open files directly in your browser (quick preview): open `Main.html` and `menu.html` in your browser.

2. Recommended: run a simple static server (ensures fetch() for JSON works)

PowerShell (Windows):
```powershell
# from the project root (d:\Work\AndhraBhavans)
python -m http.server 8000
# or, if you prefer Node and have npm:
# npx http-server -p 8000
```

Then open http://localhost:8000/Main.html and http://localhost:8000/menu.html

Notes
- If `data/menu.json` is not loaded in your browser, use a local server as some browsers restrict fetch() on file://.
- Accessibility: I added keyboard support for the hamburger and a simple focus trap; further improvements are possible.

Next steps
- Add prices and ordering, lazy-load images, or integrate a real backend for menu management.

