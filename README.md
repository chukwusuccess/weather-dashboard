# 🌤️ Weather Dashboard

Hey there! Welcome to my Weather Dashboard project. 👋

I built this dashboard to challenge myself with some precise UI/UX implementation. The goal was to take a gorgeous, modern design and bring it to life using just clean HTML, CSS, and plain JavaScript—no heavy frameworks or bulky libraries holding it together! 

## ✨ What makes this cool?

- **It's alive:** I hooked it up to the [Open-Meteo API](https://open-meteo.com/), so it actually pulls real-time weather, humidity, UV index, wind speed, and a 7-day forecast for any city you search for.
- **Things can go wrong (and that's okay!):** I added a bunch of error handling. If you search for a fake city, lose your internet connection, or if the API hiccups, the app gracefully shows a loading state or a sleek red error toast instead of just breaking.
- **Dark & Light Mode:** It defaults to a really slick dark mode, but if you click the sun/moon icon at the top, it smoothly transitions into a clean, bright light mode. 
- **Pure CSS Moon Phases:** I'm particularly proud of this! Instead of using a bunch of image files for the moons, they are mathematically plotted on a perfect arc using CSS (`transform: rotate() translateY()`). The moons themselves are drawn entirely using HTML elements and layered `box-shadow` tricks.

## 🛠️ What's under the hood?

I wanted to keep it raw and dependency-free:
- **HTML5** & **CSS3**: Using CSS Grid and Flexbox for a layout that looks great on desktop, tablet, and mobile.
- **Vanilla JavaScript (ES6+)**: Handling the API calls (`async/await`), timeouts, theme toggling, and injecting the forecast data into the DOM.
- **Lucide Icons**: The only external asset I used. They are clean, lightweight, and perfect for the UI.

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

## 🤝 Want to contribute?

If you spot a bug or have an idea to make this even better, I'd love to see it! 

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/CoolNewThing`)
3. Commit your changes (`git commit -m 'Added a CoolNewThing'`)
4. Push to the branch (`git push origin feature/CoolNewThing`)
5. Open a Pull Request

---
Thanks for checking it out! ✌️
