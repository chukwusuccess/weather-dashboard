# 🌤️ Weather Dashboard

![Weather Dashboard UI](https://via.placeholder.com/1200x600.png?text=Weather+Dashboard+Preview)

A modern, sleek, and fully responsive Weather Dashboard built with **HTML, CSS, and JavaScript**. This project focuses heavily on precise UI/UX implementation, replicating a high-quality design into clean frontend code without relying on heavy frameworks.

## ✨ Features

- **🌓 Dark & Light Mode Support**: Seamlessly toggle between dark mode (default) and a crisp light mode using CSS variables.
- **📱 Fully Responsive**: Built with CSS Grid and Flexbox to gracefully adapt across desktop, tablet, and mobile displays.
- **🌙 CSS-only Moon Phase Arc**: Features a mathematically plotted, fully CSS-drawn semi-circle arc for moon phases, including dynamically styled inner box-shadows to represent different moon cycles.
- **🧭 Custom UI Components**: Includes a CSS-based wind compass, SVG sunrise sine wave, and a multi-stop UV index gradient bar.
- **⚡ Zero Dependencies**: Pure vanilla JavaScript for logic (time updating, theme toggling, and dynamic forecast rendering) and standard CSS for styling. Only uses [Lucide Icons](https://lucide.dev/) via CDN for lightweight vector icons.

## 🛠️ Technologies Used

- **HTML5**: Semantic structure.
- **CSS3**: Custom properties (variables), CSS Grid, Flexbox, transitions, complex gradients, and layered `box-shadow` techniques.
- **JavaScript (ES6+)**: DOM manipulation, dynamic HTML generation, and interval timers.
- **Lucide Icons**: Clean, consistent open-source iconography.

## 📁 Folder Structure

```text
weather-dashboard/
├── index.html     # Main HTML structure and SVG decorations
├── style.css      # All styling, responsive breakpoints, and theme variables
├── script.js      # Time logic, theme toggle, and forecast data populator
└── README.md      # Project documentation
```

## 🚀 Getting Started

To run this project locally, you don't need any build tools, bundlers, or package managers.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chukwusuccess/weather-dashboard.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd weather-dashboard
   ```
3. **Open the file:**
   Simply double-click on `index.html` to open it in your default web browser, or use an extension like VS Code Live Server for hot reloading.

## 🎨 Design & Implementation Notes

- **Grid Architecture**: The main layout uses a CSS Grid structure (`grid-template-columns: repeat(5, 1fr)`) that allows the smaller widgets to flow naturally while giving the moon phase card the ability to span multiple rows and columns seamlessly.
- **Theming**: Theme switching is handled by adding a `.light-mode` class to the `body`, which overrides the CSS custom properties defined in `:root`.
- **Performance**: The 12-hour forecast is generated via a small JavaScript array to keep the HTML DRY (Don't Repeat Yourself) and make updating the forecast data trivial.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/chukwusuccess/weather-dashboard/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
