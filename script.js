// Initialize Lucide icons
lucide.createIcons();

// Update Time
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', ' : ');
  document.getElementById('current-time').textContent = timeStr;
}
setInterval(updateTime, 1000);
updateTime();

// Populate Forecast (Lazy ponytail: avoid repeating HTML)
const forecastData = [
  { time: '4:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '5:00', icon: 'cloud-drizzle', speed: '15km/h', temp: '20°' },
  { time: '6:00', icon: 'moon', speed: '15km/h', temp: '20°' },
  { time: '7:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '8:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '9:00', icon: 'cloud-lightning', speed: '15km/h', temp: '20°' },
  { time: '10:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '11:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '12:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '13:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '14:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' },
  { time: '15:00', icon: 'cloud-rain', speed: '15km/h', temp: '20°' }
];

const list = document.getElementById('forecast-list');
forecastData.forEach(f => {
  list.innerHTML += `
    <div class="forecast-item">
      <div class="f-time">${f.time}</div>
      <div class="f-dot">.......</div>
      <div class="f-icon-col">
        <i data-lucide="${f.icon}" class="icon-sm"></i>
        <span class="f-speed">${f.speed}</span>
      </div>
      <div class="f-dot">.......</div>
      <div class="f-temp">${f.temp}</div>
    </div>
  `;
});
lucide.createIcons(); // re-init for dynamic content
