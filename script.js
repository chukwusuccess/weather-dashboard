lucide.createIcons();

function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', ' : ');
  document.getElementById('current-time').textContent = timeStr;
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  document.getElementById('loc-date').innerHTML = `${days[now.getDay()]}<br>${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
}
setInterval(updateTime, 1000);
updateTime();

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  themeIcon.setAttribute('data-lucide', document.body.classList.contains('light-mode') ? 'moon' : 'sun');
  lucide.createIcons({ nameAttr: 'data-lucide' });
});

// Error handling toast
function showError(message) {
  const toast = document.getElementById('error-toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Fetch City Coordinates
async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const res = await fetch(geoUrl, { signal: controller.signal });
    if (!res.ok) {
      if (res.status === 429) throw new Error('API limit reached. Please try again later.');
      throw new Error('Failed to reach geocoding service.');
    }
    
    const data = await res.json();
    clearTimeout(timeoutId);
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`City "${city}" does not exist.`);
    }
    
    return data.results[0];
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request took too long. Check your internet connection.');
    throw error;
  }
}

// Fetch Weather Data
async function fetchWeather(lat = 52.52, lon = 13.41, locationName = 'NEW\nYORK') {
  document.getElementById('forecast-list').innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; margin-top: 20px;">Loading forecast...</div>`;
  
  if (!navigator.onLine) {
    showError("Internet is offline. Cannot fetch data.");
    document.getElementById('forecast-list').innerHTML = `<div style="text-align: center; color: #ff4d4d; font-size: 12px; margin-top: 20px;">Offline mode</div>`;
    return;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,sunset,sunrise,rain_sum,showers_sum,snowfall_sum,uv_index_max&hourly=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error("API key is wrong or unauthorized.");
      if (response.status === 429) throw new Error("API limit is reached.");
      throw new Error("Failed to fetch weather data.");
    }
    
    const data = await response.json();
    clearTimeout(timeoutId);
    
    if (!data.current || !data.daily || !data.hourly) {
      throw new Error("Weather data is missing from the response.");
    }
    
    // Update UI
    document.getElementById('loc-name').innerHTML = locationName.replace(' ', '<br>').toUpperCase();
    
    const current = data.current;
    document.getElementById('outdoor-temp').innerHTML = `${Math.round(current.temperature_2m)}<span>°C</span>`;
    document.getElementById('outdoor-humidity').textContent = `${Math.round(current.relative_humidity_2m)}%`;
    document.getElementById('wind-val').textContent = current.wind_speed_10m.toFixed(1);
    
    const daily = data.daily;
    const todayRain = (daily.rain_sum[0] || 0) + (daily.showers_sum[0] || 0);
    document.getElementById('rainfall-val').textContent = `${todayRain.toFixed(1)}mm`;
    
    const uv = Math.round(daily.uv_index_max[0] || 0);
    let uvText = "Low"; let uvPos = 10;
    if (uv >= 3 && uv <= 5) { uvText = "Moderate"; uvPos = 30; }
    else if (uv >= 6 && uv <= 7) { uvText = "High"; uvPos = 50; }
    else if (uv >= 8 && uv <= 10) { uvText = "Very High"; uvPos = 70; }
    else if (uv >= 11) { uvText = "Extreme"; uvPos = 90; }
    
    document.getElementById('uv-val').textContent = uv;
    document.getElementById('uv-sub').textContent = uvText;
    document.getElementById('uv-dot').style.left = `${uvPos}%`;
    
    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':', ' : ') : '-- : --';
    document.getElementById('sunrise-val').textContent = formatTime(daily.sunrise[0]);
    document.getElementById('sunset-val').textContent = `SUNSET ${formatTime(daily.sunset[0])}`;
    
    const currentHourIndex = data.hourly.time.findIndex(t => new Date(t) >= new Date());
    const startIndex = currentHourIndex > -1 ? currentHourIndex : 0;
    const list = document.getElementById('forecast-list');
    list.innerHTML = ''; 
    
    for (let i = 0; i < 12; i++) {
      const idx = startIndex + i;
      if (idx >= data.hourly.time.length) break;
      
      const hourTime = new Date(data.hourly.time[idx]);
      const formattedHour = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
      const temp = Math.round(data.hourly.temperature_2m[idx]);
      const rain = data.hourly.rain[idx];
      
      let icon = 'cloud';
      if (rain > 0) icon = 'cloud-rain';
      else if (temp > 25 && hourTime.getHours() > 6 && hourTime.getHours() < 18) icon = 'sun';
      else if (hourTime.getHours() <= 6 || hourTime.getHours() >= 18) icon = 'moon';
      
      list.innerHTML += `
        <div class="forecast-item">
          <div class="f-time">${formattedHour}</div>
          <div class="f-line"></div>
          <div class="f-icon-col">
            <i data-lucide="${icon}" class="icon-sm" style="color: var(--accent);"></i>
            <span class="f-speed">${Math.round(data.hourly.wind_speed_10m[idx])}km/h</span>
          </div>
          <div class="f-line"></div>
          <div class="f-temp">${temp}°</div>
        </div>
      `;
    }
    lucide.createIcons();
    
  } catch (error) {
    console.error("Fetch Error:", error);
    if (error.name === 'AbortError') showError("Request took too long. Please try again.");
    else showError(error.message);
    
    document.getElementById('forecast-list').innerHTML = `
      <div style="text-align: center; color: #ff4d4d; font-size: 12px; margin-top: 20px;">
        Failed to load data.
      </div>
    `;
  }
}

// Search Logic
document.getElementById('search-btn').addEventListener('click', handleSearch);
document.getElementById('city-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
  const city = document.getElementById('city-input').value.trim();
  
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  
  if (!navigator.onLine) {
    showError("Internet is offline.");
    return;
  }
  
  try {
    const geoData = await getCoordinates(city);
    // Success: fetch weather for new coordinates
    fetchWeather(geoData.latitude, geoData.longitude, geoData.name);
  } catch (error) {
    showError(error.message);
  }
}

// Init default fetch (New York roughly)
fetchWeather(40.71, -74.00, 'NEW\nYORK');
