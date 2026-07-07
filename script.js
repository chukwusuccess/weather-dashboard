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
