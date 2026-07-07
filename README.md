# 🌤️ Weather Dashboard

Hey there! Welcome to my Weather Dashboard project. 👋

I built this dashboard to challenge myself with some precise UI/UX implementation. The goal was to take a gorgeous, modern design and bring it to life with clean HTML, CSS, and TypeScript—no heavy UI framework, just a fast Vite toolchain underneath.

## ✨ What makes this cool?

- **It's alive:** I hooked it up to the [Open-Meteo API](https://open-meteo.com/), so it actually pulls real-time weather, humidity, UV index, wind speed, and a 7-day forecast for any city you search for.
- **Things can go wrong (and that's okay!):** I added a bunch of error handling. If you search for a fake city, lose your internet connection, or if the API hiccups, the app gracefully shows a loading state or a sleek red error toast instead of just breaking.
- **Dark & Light Mode:** It defaults to a really slick dark mode, but if you click the sun/moon icon at the top, it smoothly transitions into a clean, bright light mode. 
- **Pure CSS Moon Phases:** I'm particularly proud of this! Instead of using a bunch of image files for the moons, they are mathematically plotted on a perfect arc using CSS (`transform: rotate() translateY()`). The moons themselves are drawn entirely using HTML elements and layered `box-shadow` tricks.

## 🛠️ What's under the hood?

- **HTML5** & **CSS3**: CSS Grid and Flexbox for a layout that looks great on desktop, tablet, and mobile.
- **TypeScript**: Typed API responses, a discriminated UI state machine, debounced search with request cancellation, and strict compiler checks.
- **Vite**: Dev server with hot reload and a production build into `dist/`.
- **Open-Meteo**: Free geocoding + forecast APIs (no API key required).
- **Lucide Icons**: Loaded from a pinned CDN build for the UI icons.

### Project layout

| Path | Purpose |
| --- | --- |
| `index.html` | App shell and markup |
| `style.css` | Layout and theme styles |
| `src/main.ts` | Entry point (clock, theme, boot) |
| `src/search.ts` | Search + autocomplete |
| `src/weather.ts` | Geocoding + forecast fetch + render |
| `src/ui.ts` | UI state machine + error toast |
| `src/lib/` | Pure formatting helpers + self-check |
| `src/types/` | Open-Meteo and UI TypeScript types |

## 🚀 Want to run it yourself?

The project uses [Vite](https://vite.dev/) as its dev server and build tool, so you'll need [Node.js](https://nodejs.org/) (v18+) installed.

1. **Clone it:**
   ```bash
   git clone https://github.com/chukwusuccess/weather-dashboard.git
   cd weather-dashboard
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Then open the URL Vite prints (usually `http://localhost:5173`).

### Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Build the production bundle into `dist/`. |
| `npm run preview` | Serve the built `dist/` output locally to verify a production build. |
| `npm run typecheck` | Run the TypeScript compiler in check-only mode (no output). |
| `npm test` | Run the assert-based self-checks for the pure formatting helpers. |

### Production build

```bash
npm run build
npm run preview   # optional: verify dist/ locally
```

Deploy the contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.). The build outputs a bundled `index.html`, CSS, and JS; Lucide icons are still loaded from the pinned unpkg URL in `index.html`.

## 🤝 Want to contribute?

If you spot a bug or have an idea to make this even better, I'd love to see it! 

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/CoolNewThing`)
3. Commit your changes (`git commit -m 'Added a CoolNewThing'`)
4. Push to the branch (`git push origin feature/CoolNewThing`)
5. Open a Pull Request

---
Thanks for checking it out! ✌️
