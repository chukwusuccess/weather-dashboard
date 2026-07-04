# 🌤️ Weather Dashboard

Hey there! Welcome to my Weather Dashboard project. 👋

I built this dashboard to challenge myself with some precise UI/UX implementation. The goal was to take a gorgeous, modern design and bring it to life using just clean HTML, CSS, and plain JavaScript—no heavy frameworks or bulky libraries holding it together! 

*(Note: To add a preview of your app here, just take a screenshot, save it in the `assets/` folder as `preview.png`, and replace this line with `![Dashboard Preview](./assets/preview.png)`)*

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

It's super simple. You don't need `npm install` or any build tools.

1. **Clone it:**
   ```bash
   git clone https://github.com/chukwusuccess/weather-dashboard.git
   ```
2. **Open it:**
   Just double-click on `index.html` to open it in your browser. That's it! (Though using something like VS Code's Live Server makes tweaking it more fun).

## 🤝 Want to contribute?

If you spot a bug or have an idea to make this even better, I'd love to see it! 

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/CoolNewThing`)
3. Commit your changes (`git commit -m 'Added a CoolNewThing'`)
4. Push to the branch (`git push origin feature/CoolNewThing`)
5. Open a Pull Request

---
Thanks for checking it out! ✌️
