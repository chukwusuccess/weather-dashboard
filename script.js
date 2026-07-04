lucide.createIcons();

// Elements
const statusContainer = document.getElementById('status-container');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const weatherTop = document.getElementById('weather-top');
const weatherBottom = document.getElementById('weather-bottom');
const sidebarWrapper = document.getElementById('sidebar-wrapper');

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

// Set UI State
function setUIState(state, message = '') {
  if (state === 'empty') {
    weatherTop.style.display = 'none';
    weatherBottom.style.display = 'none';
    sidebarWrapper.style.display = 'none';
    statusContainer.style.display = 'flex';
    statusIcon.setAttribute('data-lucide', 'search');
    statusIcon.classList.remove('spin');
    statusIcon.style.color = 'var(--accent)';
    statusText.textContent = 'Search for a city to see live weather data.';
  } else if (state === 'loading') {
    weatherTop.style.display = 'none';
    weatherBottom.style.display = 'none';
    sidebarWrapper.style.display = 'none';
    statusContainer.style.display = 'flex';
    statusIcon.setAttribute('data-lucide', 'loader-2');
    statusIcon.classList.add('spin');
    statusIcon.style.color = 'var(--accent)';
    statusText.textContent = 'Loading weather data...';
  } else if (state === 'error') {
    weatherTop.style.display = 'none';
    weatherBottom.style.display = 'none';
    sidebarWrapper.style.display = 'none';
    statusContainer.style.display = 'flex';
    statusIcon.setAttribute('data-lucide', 'cloud-off');
    statusIcon.classList.remove('spin');
    statusIcon.style.color = '#ff4d4d'; // Red for error
    statusText.textContent = message || 'City not found. Try another city.';
  } else if (state === 'success') {
    statusContainer.style.display = 'none';
    weatherTop.style.display = 'grid';
    weatherBottom.style.display = 'grid';
    sidebarWrapper.style.display = 'flex';
  }
  lucide.createIcons(); // re-init state icon
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
      throw new Error(`City "${city}" not found. Try another city.`);
    }
    
    return data.results[0];
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request took too long. Check your internet connection.');
    throw error;
  }
}

// Fetch Weather Data
async function fetchWeather(lat, lon, locationName) {
  if (!navigator.onLine) {
    showError("Internet is offline.");
    setUIState('error', 'Internet is offline. Cannot fetch data.');
    return;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,sunset,sunrise,rain_sum,showers_sum,snowfall_sum,uv_index_max,weather_code&hourly=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
  
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
    
    const list = document.getElementById('forecast-list');
    list.innerHTML = ''; 
    
    // WMO Weather interpretation codes
    const wmoMap = {
      0: { label: 'Clear', icon: 'sun' },
      1: { label: 'Mostly Clear', icon: 'cloud-sun' },
      2: { label: 'Partly Cloudy', icon: 'cloud-sun' },
      3: { label: 'Cloudy', icon: 'cloud' },
      45: { label: 'Fog', icon: 'cloud-fog' },
      48: { label: 'Fog', icon: 'cloud-fog' },
      51: { label: 'Drizzle', icon: 'cloud-drizzle' },
      53: { label: 'Drizzle', icon: 'cloud-drizzle' },
      55: { label: 'Drizzle', icon: 'cloud-drizzle' },
      61: { label: 'Rain', icon: 'cloud-rain' },
      63: { label: 'Rain', icon: 'cloud-rain' },
      65: { label: 'Heavy Rain', icon: 'cloud-rain' },
      71: { label: 'Snow', icon: 'snowflake' },
      73: { label: 'Snow', icon: 'snowflake' },
      75: { label: 'Heavy Snow', icon: 'snowflake' },
      80: { label: 'Showers', icon: 'cloud-rain' },
      81: { label: 'Showers', icon: 'cloud-rain' },
      82: { label: 'Heavy Showers', icon: 'cloud-rain' },
      95: { label: 'Storm', icon: 'cloud-lightning' },
      96: { label: 'Storm', icon: 'cloud-lightning' },
      99: { label: 'Heavy Storm', icon: 'cloud-lightning' }
    };
    
    for (let i = 0; i < 7; i++) {
      if (i >= data.daily.time.length) break;
      
      const dayStr = data.daily.time[i];
      const dayDate = new Date(dayStr + 'T00:00:00'); 
      const isToday = i === 0;
      const dayName = isToday ? 'Today' : dayDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      const temp = Math.round(data.daily.temperature_2m_max[i]);
      const code = data.daily.weather_code[i];
      const weatherInfo = wmoMap[code] || { label: 'Cloudy', icon: 'cloud' };
      
      list.innerHTML += `
        <div class="forecast-item">
          <div class="f-time">${dayName}</div>
          <div class="f-line"></div>
          <div class="f-icon-col">
            <i data-lucide="${weatherInfo.icon}" class="icon-sm" style="color: var(--accent);"></i>
            <span class="f-speed" style="font-size: 12px; margin-top: 4px;">${weatherInfo.label}</span>
          </div>
          <div class="f-line"></div>
          <div class="f-temp">${temp}°C</div>
        </div>
      `;
    }
    lucide.createIcons();
    
    setUIState('success');
    
  } catch (error) {
    console.error("Fetch Error:", error);
    let errorMsg = error.message;
    if (error.name === 'AbortError') errorMsg = "Request took too long. Check your internet connection.";
    
    showError(errorMsg);
    setUIState('error', errorMsg);
  }
}

// Search Logic
document.getElementById('search-btn').addEventListener('click', handleSearch);
// Make full bar click focus the input
document.querySelector('.search-container').addEventListener('click', () => document.getElementById('city-input').focus());
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
    setUIState('error', 'Internet is offline. Cannot fetch data.');
    return;
  }
  
  setUIState('loading');
  
  try {
    const geoData = await getCoordinates(city);
    await fetchWeather(geoData.latitude, geoData.longitude, geoData.name);
  } catch (error) {
    showError(error.message);
    setUIState('error', error.message);
  }
}

// Initialize empty state instead of auto-fetching
setUIState('empty');

// Autocomplete Logic
const cityInput = document.getElementById('city-input');
const suggestionsDropdown = document.getElementById('search-suggestions');
let debounceTimer;

cityInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  const query = e.target.value.trim();
  if (query.length < 2) {
    suggestionsDropdown.style.display = 'none';
    return;
  }
  debounceTimer = setTimeout(() => fetchSuggestions(query), 300);
});

async function fetchSuggestions(query) {
  if (!navigator.onLine) return;
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      showSuggestions(data.results);
    } else {
      suggestionsDropdown.style.display = 'none';
    }
  } catch (e) {
    console.error("Suggestion fetch failed", e);
  }
}

function showSuggestions(results) {
  suggestionsDropdown.innerHTML = '';
  results.forEach(res => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    const region = res.admin1 ? `${res.admin1}, ` : '';
    div.innerHTML = `<span>${res.name}</span><span class="suggestion-country">${region}${res.country}</span>`;
    div.addEventListener('click', () => {
      cityInput.value = res.name;
      suggestionsDropdown.style.display = 'none';
      handleSearch();
    });
    suggestionsDropdown.appendChild(div);
  });
  suggestionsDropdown.style.display = 'flex';
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    suggestionsDropdown.style.display = 'none';
  }
});
