lucide.createIcons();

function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', ' : ');
  document.getElementById('current-time').textContent = timeStr;
  
  // Update Date
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dateStr = `${days[now.getDay()]}<br>${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
  document.getElementById('loc-date').innerHTML = dateStr;
}
setInterval(updateTime, 1000);
updateTime();

// Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  if (document.body.classList.contains('light-mode')) {
    themeIcon.setAttribute('data-lucide', 'moon');
  } else {
    themeIcon.setAttribute('data-lucide', 'sun');
  }
  lucide.createIcons({ nameAttr: 'data-lucide' });
});

// Fetch Weather Data
async function fetchWeather() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_min,temperature_2m_max,sunset,sunrise,rain_sum,showers_sum,snowfall_sum,uv_index_max,uv_index_clear_sky_max&hourly=temperature_2m,relative_humidity_2m,rain,apparent_temperature&current=temperature_2m,relative_humidity_2m,is_day,showers,snowfall,precipitation,rain,weather_code,wind_speed_10m&timezone=Africa%2FCairo";
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Update Outdoor
    const current = data.current;
    document.getElementById('outdoor-temp').innerHTML = `${Math.round(current.temperature_2m)}<span>°C</span>`;
    document.getElementById('outdoor-humidity').textContent = `${Math.round(current.relative_humidity_2m)}%`;
    document.getElementById('wind-val').textContent = current.wind_speed_10m.toFixed(1);
    
    // Update Daily Metrics (Rain, UV, Sunrise/set)
    const daily = data.daily;
    const todayRain = (daily.rain_sum[0] || 0) + (daily.showers_sum[0] || 0);
    document.getElementById('rainfall-val').textContent = `${todayRain.toFixed(1)}mm`;
    
    // UV Index mapping
    const uv = Math.round(daily.uv_index_max[0] || 0);
    let uvText = "Low";
    let uvPos = 10;
    if (uv >= 3 && uv <= 5) { uvText = "Moderate"; uvPos = 30; }
    else if (uv >= 6 && uv <= 7) { uvText = "High"; uvPos = 50; }
    else if (uv >= 8 && uv <= 10) { uvText = "Very High"; uvPos = 70; }
    else if (uv >= 11) { uvText = "Extreme"; uvPos = 90; }
    
    document.getElementById('uv-val').textContent = uv;
    document.getElementById('uv-sub').textContent = uvText;
    document.getElementById('uv-dot').style.left = `${uvPos}%`;
    
    // Sunrise / Sunset format
    const formatTime = (isoString) => {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':', ' : ');
    };
    document.getElementById('sunrise-val').textContent = formatTime(daily.sunrise[0]);
    document.getElementById('sunset-val').textContent = `SUNSET ${formatTime(daily.sunset[0])}`;
    
    // Populate Hourly Forecast (next 12 hours)
    const currentHourIndex = data.hourly.time.findIndex(t => new Date(t) >= new Date());
    const startIndex = currentHourIndex > -1 ? currentHourIndex : 0;
    
    const list = document.getElementById('forecast-list');
    list.innerHTML = ''; // clear loading text
    
    for (let i = 0; i < 12; i++) {
      const idx = startIndex + i;
      if (idx >= data.hourly.time.length) break;
      
      const hourTime = new Date(data.hourly.time[idx]);
      const formattedHour = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
      
      const temp = Math.round(data.hourly.temperature_2m[idx]);
      const rain = data.hourly.rain[idx];
      
      // Basic weather code mapping to icons
      let icon = 'cloud';
      if (rain > 0) icon = 'cloud-rain';
      else if (temp > 25 && hourTime.getHours() > 6 && hourTime.getHours() < 18) icon = 'sun';
      else if (hourTime.getHours() <= 6 || hourTime.getHours() >= 18) icon = 'moon';
      else icon = 'cloud'; // Default fallback
      
      list.innerHTML += `
        <div class="forecast-item">
          <div class="f-time">${formattedHour}</div>
          <div class="f-line"></div>
          <div class="f-icon-col">
            <i data-lucide="${icon}" class="icon-sm" style="color: var(--accent);"></i>
            <span class="f-speed">${current.wind_speed_10m.toFixed(0)}km/h</span>
          </div>
          <div class="f-line"></div>
          <div class="f-temp">${temp}°</div>
        </div>
      `;
    }
    
    lucide.createIcons(); // re-init icons
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById('forecast-list').innerHTML = `
      <div style="text-align: center; color: red; font-size: 12px; margin-top: 20px;">
        Failed to load forecast data.
      </div>
    `;
  }
}

// Init fetch
fetchWeather();
