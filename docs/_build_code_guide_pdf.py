from pathlib import Path
import math
import re
import textwrap


OUT = Path("docs/weather-dashboard-code-guide.pdf")
W, H = 792, 612
M = 36


def esc(text):
    return str(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Page:
    def __init__(self):
        self.ops = []

    def color(self, rgb):
        r, g, b = rgb
        self.ops.append(f"{r} {g} {b} rg {r} {g} {b} RG")

    def rect(self, x, y, w, h, fill=(1, 1, 1), stroke=(0.8, 0.85, 0.88), lw=1):
        self.ops.append(f"q {lw} w {stroke[0]} {stroke[1]} {stroke[2]} RG {fill[0]} {fill[1]} {fill[2]} rg {x} {y} {w} {h} re B Q")

    def line(self, x1, y1, x2, y2, color=(0.16, 0.2, 0.24), lw=1.5):
        self.ops.append(f"q {lw} w {color[0]} {color[1]} {color[2]} RG {x1} {y1} m {x2} {y2} l S Q")

    def arrow(self, x1, y1, x2, y2, color=(0.0, 0.55, 0.55), lw=2):
        self.line(x1, y1, x2, y2, color, lw)
        angle = math.atan2(y2 - y1, x2 - x1)
        size = 8
        a1 = angle + math.pi * 0.82
        a2 = angle - math.pi * 0.82
        p1 = (x2 + size * math.cos(a1), y2 + size * math.sin(a1))
        p2 = (x2 + size * math.cos(a2), y2 + size * math.sin(a2))
        self.ops.append(
            f"q {color[0]} {color[1]} {color[2]} rg {x2} {y2} m {p1[0]} {p1[1]} l {p2[0]} {p2[1]} l f Q"
        )

    def text(self, text, x, y, size=10, font="F1", color=(0.12, 0.14, 0.16)):
        self.ops.append(f"q {color[0]} {color[1]} {color[2]} rg BT /{font} {size} Tf {x} {y} Td ({esc(text)}) Tj ET Q")

    def wrap(self, text, x, y, width=42, size=9, leading=11, font="F1", color=(0.12, 0.14, 0.16)):
        for line in textwrap.wrap(text, width=width):
            self.text(line, x, y, size, font, color)
            y -= leading
        return y

    def label_box(self, title, body, x, y, w, h, fill=(0.94, 0.98, 0.98), accent=(0.0, 0.62, 0.58)):
        self.rect(x, y, w, h, fill=fill, stroke=(0.72, 0.86, 0.86), lw=1)
        self.rect(x, y + h - 18, w, 18, fill=accent, stroke=accent, lw=0.5)
        self.text(title, x + 8, y + h - 13, 9, "F2", (1, 1, 1))
        self.wrap(body, x + 8, y + h - 31, max(18, int(w / 5.2)), 8.5, 10)


# syntax highlighting palette (dark panel)
C_DEFAULT = (0.88, 0.92, 0.94)
C_COMMENT = (0.52, 0.62, 0.52)
C_KEYWORD = (0.62, 0.76, 1.0)
C_STRING = (0.95, 0.78, 0.45)
C_NUMBER = (0.5, 0.9, 0.85)
KEYWORD_RE = r"\b(?:function|const|let|var|if|else|return|await|async|for|throw|new|try|catch|break|typeof)\b"
TOKEN_RE = re.compile(
    r"(?P<string>'[^']*'|\"[^\"]*\"|`[^`]*`?)|(?P<kw>%s)|(?P<num>\b\d[\d.]*\b)" % KEYWORD_RE
)


def highlight(ln):
    """Split a code line into (text, color) segments. Trailing // comment
    (not the // of https://) is comment-colored whole."""
    m = re.search(r"(?<!:)//", ln)
    code, comment = (ln[: m.start()], ln[m.start():]) if m else (ln, None)
    segs, pos = [], 0
    for t in TOKEN_RE.finditer(code):
        if t.start() > pos:
            segs.append((code[pos: t.start()], C_DEFAULT))
        color = C_STRING if t.group("string") else C_KEYWORD if t.group("kw") else C_NUMBER
        segs.append((t.group(0), color))
        pos = t.end()
    if pos < len(code):
        segs.append((code[pos:], C_DEFAULT))
    if comment:
        segs.append((comment, C_COMMENT))
    return segs


def code_panel(p, title, lines, x, y_top, w, size=7.5, leading=9.6):
    h = len(lines) * leading + 30
    p.rect(x, y_top - h, w, h, fill=(0.07, 0.09, 0.11), stroke=(0.3, 0.36, 0.4), lw=1)
    p.text(title, x + 10, y_top - 15, 9, "F2", (0.35, 0.99, 0.96))
    yy = y_top - 29
    cw = size * 0.6  # Courier is monospace: fixed char advance
    for ln in lines:
        col_pos = 0
        for seg, color in highlight(ln):
            p.text(seg, x + 10 + col_pos * cw, yy, size, "F3", color)
            col_pos += len(seg)
        yy -= leading
    return y_top - h


def footer(p, n):
    p.line(M, 28, W - M, 28, (0.82, 0.86, 0.88), 0.8)
    p.text("Weather Dashboard visual code guide", M, 14, 8, "F1", (0.38, 0.44, 0.5))
    p.text(f"Page {n}", W - 70, 14, 8, "F1", (0.38, 0.44, 0.5))


pages = []


# Page 1: architecture flow
p = Page()
p.text("Weather Dashboard: Visual Code Guide", M, H - 54, 24, "F2", (0.06, 0.12, 0.16))
p.wrap("How this repo works: HTML gives the app bones, CSS gives the look, JavaScript connects user actions to live weather data.", M, H - 78, 105, 11, 13)

x0, y0, bw, bh, gap = M, 395, 145, 84, 24
cards = [
    ("index.html", "Static dashboard skeleton: search bar, status area, weather cards, forecast sidebar, icon placeholders."),
    ("style.css", "Design system: theme variables, responsive grid, cards, moon phase drawing, toast, loading spinner."),
    ("script.js", "Behavior: time, search, API calls, UI states, DOM updates, autocomplete, error handling."),
    ("Open-Meteo APIs", "External JSON data. Geocoding turns city into coordinates; forecast returns current, daily, hourly weather."),
]
for i, card in enumerate(cards):
    p.label_box(card[0], card[1], x0 + i * (bw + gap), y0, bw, bh, fill=(0.96, 0.99, 0.99))
    if i < len(cards) - 1:
        p.arrow(x0 + i * (bw + gap) + bw + 2, y0 + 42, x0 + (i + 1) * (bw + gap) - 6, y0 + 42)

p.text("Main Runtime Pipeline", M, 338, 16, "F2", (0.06, 0.12, 0.16))
flow = [
    ("1 Browser loads page", "index.html links CSS, Lucide CDN, then script.js."),
    ("2 Empty state", "Weather sections hidden. Search prompt visible."),
    ("3 User searches city", "Click search or press Enter. Input validated."),
    ("4 Coordinates", "getCoordinates(city) calls geocoding API."),
    ("5 Weather", "fetchWeather(lat, lon) calls forecast API."),
    ("6 Dashboard updates", "DOM nodes receive temp, rain, UV, wind, sunrise, forecast rows."),
]
fx, fy = M, 250
for i, (title, body) in enumerate(flow):
    col = i % 3
    row = i // 3
    x = fx + col * 240
    y = fy - row * 105
    p.label_box(title, body, x, y, 200, 65, fill=(1, 0.985, 0.94), accent=(0.91, 0.52, 0.08))
    if i in (0, 1, 3, 4):
        p.arrow(x + 200, y + 32, x + 238, y + 32, (0.91, 0.52, 0.08), 2)
    if i == 2:
        p.arrow(x + 100, y - 4, x + 100, y - 35, (0.91, 0.52, 0.08), 2)
p.line(M, 52, W - M, 52, (0.82, 0.86, 0.88), 0.8)
p.text("Inside:  p1 architecture   p2 UI map   p3 state machine   p4 concepts   p5-8 code walkthrough   p9 cheat sheet", M, 40, 9, "F2", (0.38, 0.44, 0.5))
footer(p, 1)
pages.append(p)


# Page 2: UI wireframe
p = Page()
p.text("Page Structure: What User Sees", M, H - 54, 22, "F2", (0.06, 0.12, 0.16))
p.wrap("index.html creates named placeholders. script.js fills those placeholders after API data arrives. style.css makes the layout responsive.", M, H - 78, 105, 10.5, 13)

dash_x, dash_y, dash_w, dash_h = 58, 80, 676, 420
p.rect(dash_x, dash_y, dash_w, dash_h, fill=(0.08, 0.11, 0.13), stroke=(0.2, 0.28, 0.3), lw=2)
p.text(".dashboard", dash_x + 10, dash_y + dash_h - 18, 9, "F2", (0.7, 0.95, 0.93))

p.rect(82, 442, 470, 36, fill=(0.16, 0.18, 0.2), stroke=(0.35, 0.42, 0.44))
p.text("Header: #current-time  #city-input  #search-btn  #theme-toggle", 94, 456, 9, "F2", (1, 1, 1))

p.rect(82, 340, 220, 82, fill=(0.18, 0.2, 0.22), stroke=(0.36, 0.48, 0.48))
p.text("Outdoor Card", 96, 397, 12, "F2", (0.35, 0.99, 0.96))
p.text("#outdoor-temp", 96, 375, 16, "F2", (0.35, 0.99, 0.96))
p.text("#outdoor-humidity", 96, 355, 9, "F1", (0.75, 0.8, 0.83))

p.rect(322, 340, 230, 82, fill=(0.18, 0.2, 0.22), stroke=(0.36, 0.48, 0.48))
p.text("Indoor Card", 336, 397, 12, "F2", (0.35, 0.99, 0.96))
p.text("Static: 22C / 45%", 336, 374, 14, "F2", (1, 1, 1))

metric_labels = [
    ("Location", "#loc-name / #loc-date"),
    ("Rainfall", "#rainfall-val"),
    ("Sunrise", "#sunrise-val / #sunset-val"),
    ("UV Index", "#uv-val / #uv-dot"),
    ("Visibility", "Static card"),
    ("Wind", "#wind-val"),
]
for i, (title, body) in enumerate(metric_labels):
    col = i % 3
    row = i // 3
    x = 82 + col * 156
    y = 230 - row * 96
    p.rect(x, y, 136, 76, fill=(0.18, 0.2, 0.22), stroke=(0.36, 0.48, 0.48))
    p.text(title, x + 10, y + 54, 10, "F2", (0.35, 0.99, 0.96))
    p.wrap(body, x + 10, y + 34, 20, 8, 10, color=(0.88, 0.92, 0.94))

p.rect(562, 120, 148, 358, fill=(0.06, 0.075, 0.09), stroke=(0.35, 0.42, 0.44))
p.text("Sidebar", 602, 452, 13, "F2", (0.35, 0.99, 0.96))
p.text("#forecast-list", 594, 430, 9, "F1", (0.75, 0.8, 0.83))
for i in range(7):
    y = 390 - i * 38
    p.rect(580, y, 112, 22, fill=(0.13, 0.15, 0.17), stroke=(0.28, 0.34, 0.36), lw=0.8)
    p.text(f"Day {i + 1}  icon  temp", 590, y + 7, 8, "F1", (0.9, 0.94, 0.95))

p.label_box("Learning key", "Each id is a hook. JavaScript finds that hook, then changes textContent, innerHTML, style, or data-lucide.", 470, 70, 240, 48, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
footer(p, 2)
pages.append(p)


# Page 3: JS state/function map
p = Page()
p.text("JavaScript: State Machine + Function Map", M, H - 54, 22, "F2", (0.06, 0.12, 0.16))
p.wrap("script.js is small because one function, setUIState(), controls which screen is visible. Fetch functions only gather data; DOM updates happen after data is valid.", M, H - 78, 110, 10.5, 13)

states = [
    ("empty", "Show search prompt. Hide dashboard."),
    ("loading", "Show spinner. Hide dashboard."),
    ("success", "Show cards and forecast sidebar."),
    ("error", "Show error icon/message. Toast explains failure."),
]
coords = [(70, 360), (285, 360), (500, 360), (285, 220)]
for (name, body), (x, y) in zip(states, coords):
    fill = (0.94, 0.98, 0.98) if name != "error" else (1, 0.94, 0.94)
    accent = (0.0, 0.62, 0.58) if name != "error" else (0.86, 0.18, 0.18)
    p.label_box(f"state: {name}", body, x, y, 170, 70, fill=fill, accent=accent)
p.arrow(240, 395, 285, 395)
p.arrow(455, 395, 500, 395)
p.arrow(585, 360, 390, 290, (0.86, 0.18, 0.18), 2)
p.arrow(305, 360, 340, 290, (0.86, 0.18, 0.18), 2)

p.text("Search Path", 70, 170, 15, "F2", (0.06, 0.12, 0.16))
steps = [
    ("handleSearch()", "Read city, validate input, check offline, set loading."),
    ("getCoordinates()", "Fetch geocoding result. Return latitude/longitude/name."),
    ("fetchWeather()", "Fetch current/daily/hourly weather. Validate JSON shape."),
    ("DOM update", "Write values, build 7 forecast rows, recreate Lucide icons."),
]
for i, (title, body) in enumerate(steps):
    x = 70 + i * 175
    p.label_box(title, body, x, 90, 145, 62, fill=(1, 0.985, 0.94), accent=(0.91, 0.52, 0.08))
    if i < 3:
        p.arrow(x + 145, 121, x + 170, 121, (0.91, 0.52, 0.08), 2)

p.label_box("Autocomplete", "input event starts 300ms debounce. fetchSuggestions() asks geocoding API for 5 matches. showSuggestions() creates clickable rows.", 70, 465, 300, 58, fill=(0.95, 0.95, 1), accent=(0.38, 0.32, 0.78))
p.label_box("Theme", "Click toggles body.light-mode. CSS variables do most visual work. Icon switches sun/moon.", 420, 465, 270, 58, fill=(0.95, 0.95, 1), accent=(0.38, 0.32, 0.78))
footer(p, 3)
pages.append(p)


# Page 4: API/data/CSS concepts
p = Page()
p.text("Core Concepts Behind Code", M, H - 54, 22, "F2", (0.06, 0.12, 0.16))

p.text("API Data Map", 60, 520, 15, "F2", (0.06, 0.12, 0.16))
p.label_box("City text", "Example: Lagos", 60, 440, 120, 55, fill=(0.96, 0.99, 0.99))
p.arrow(180, 468, 230, 468)
p.label_box("Geocoding API", "Returns latitude, longitude, location name.", 230, 440, 160, 55, fill=(0.96, 0.99, 0.99))
p.arrow(390, 468, 440, 468)
p.label_box("Forecast API", "Returns current, daily, hourly weather arrays.", 440, 440, 165, 55, fill=(0.96, 0.99, 0.99))
p.arrow(605, 468, 660, 468)
p.label_box("UI cards", "Temperature, humidity, UV, wind, rain, sunrise, 7-day list.", 660, 430, 90, 75, fill=(0.96, 0.99, 0.99))

p.text("CSS Learning Map", 60, 375, 15, "F2", (0.06, 0.12, 0.16))
css = [
    ("CSS variables", ":root dark theme. body.light-mode overrides same names."),
    ("Grid", ".top-section and .bottom-section place dashboard cards."),
    ("Flexbox", "Header, cards, sidebar, forecast rows, status center."),
    ("Media queries", "1100px, 768px, 480px reshape layout for small screens."),
    ("Pure CSS visuals", "Moon phase arc, compass, UV bar, spinner, toast."),
]
for i, (title, body) in enumerate(css):
    x = 60 + (i % 3) * 230
    y = 285 - (i // 3) * 82
    p.label_box(title, body, x, y, 190, 55, fill=(0.95, 0.97, 1), accent=(0.1, 0.45, 0.82))

p.text("Best Next Fixes", 60, 150, 15, "F2", (0.06, 0.12, 0.16))
fixes = [
    "Close final CSS @media block if missing in editor.",
    "Use textContent/createElement for suggestions to reduce XSS risk.",
    "Either display hourly data or stop requesting hourly fields.",
    "Make visibility dynamic or label it as static example data.",
]
for i, fix in enumerate(fixes):
    y = 118 - i * 20
    p.rect(70, y - 3, 10, 10, fill=(0.0, 0.62, 0.58), stroke=(0.0, 0.62, 0.58))
    p.text(fix, 90, y - 1, 10, "F1", (0.12, 0.14, 0.16))

p.label_box("One sentence model", "User input -> API JSON -> validated data -> DOM updates -> responsive dashboard.", 470, 72, 280, 58, fill=(1, 0.985, 0.94), accent=(0.91, 0.52, 0.08))
footer(p, 4)
pages.append(p)


# Page 5: script.js piece by piece (1/4) - boot, clock, theme, UI states
p = Page()
p.text("script.js Piece by Piece (1/4): Boot, Clock, Theme, UI States", M, H - 54, 20, "F2", (0.06, 0.12, 0.16))

clock_lines = [
    "function updateTime() {",
    "  const now = new Date();                       // current moment",
    "  const timeStr = now.toLocaleTimeString('en-US',",
    "      { hour: '2-digit', minute: '2-digit' })",
    "      .replace(':', ' : ');                     // \"04 : 32 PM\"",
    "  document.getElementById('current-time').textContent = timeStr;",
    "}",
    "setInterval(updateTime, 1000);   // re-run every second",
    "updateTime();                    // and once at startup",
    "// also writes 'SUNDAY / 7 JUL, 2026' into #loc-date each tick",
]
y = code_panel(p, "The clock (lines 11-21)", clock_lines, M, 520, 430)

theme_lines = [
    "themeBtn.addEventListener('click', () => {",
    "  document.body.classList.toggle('light-mode');  // CSS vars flip",
    "  themeIcon.setAttribute('data-lucide',",
    "    body.classList.contains('light-mode') ? 'moon' : 'sun');",
    "  lucide.createIcons({ nameAttr: 'data-lucide' }); // redraw icon",
    "});",
]
y = code_panel(p, "Theme toggle (lines 24-30)", theme_lines, M, y - 14, 430)

state_lines = [
    "function setUIState(state, message = '') {",
    "  // 'empty'   -> hide cards, show search prompt",
    "  // 'loading' -> hide cards, show spinning loader",
    "  // 'error'   -> hide cards, show red cloud-off + message",
    "  if (state === 'success') {",
    "    statusContainer.style.display = 'none';",
    "    weatherTop.style.display    = 'grid';",
    "    weatherBottom.style.display = 'grid';",
    "    sidebarWrapper.style.display = 'flex';",
    "  }",
    "  lucide.createIcons();  // re-render <i data-lucide> as SVG",
    "}",
]
code_panel(p, "setUIState() - one function owns the screen (lines 41-76)", state_lines, M, y - 14, 430)

p.label_box("Concept: polling loop", "setInterval() calls a function on a timer. The clock is a 1-second loop: compute string, write into the DOM.", 500, 460, 250, 62, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: CSS does the theme", "JS only toggles one class on <body>. All colors change because style.css redefines the same CSS variables under body.light-mode.", 500, 380, 250, 68, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: state machine", "Every screen change goes through setUIState(). No scattered show/hide calls = impossible to show error and data at once.", 500, 300, 250, 68, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("showError() toast (lines 33-38)", "Adds .show class to #error-toast, removes it after 4000ms. CSS transition does the slide animation.", 500, 220, 250, 62, fill=(0.95, 0.95, 1), accent=(0.38, 0.32, 0.78))
footer(p, 5)
pages.append(p)


# Page 6: getCoordinates
p = Page()
p.text("script.js Piece by Piece (2/4): getCoordinates() - City Name to Lat/Lon", M, H - 54, 20, "F2", (0.06, 0.12, 0.16))

geo_lines = [
    "async function getCoordinates(city) {",
    "  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search",
    "                  ?name=${encodeURIComponent(city)}&count=1...`;",
    "",
    "  const controller = new AbortController();      // cancel handle",
    "  const timeoutId = setTimeout(() => controller.abort(), 5000);",
    "",
    "  try {",
    "    const res = await fetch(geoUrl, { signal: controller.signal });",
    "    if (!res.ok) {",
    "      if (res.status === 429)",
    "        throw new Error('API limit reached. Try again later.');",
    "      throw new Error('Failed to reach geocoding service.');",
    "    }",
    "    const data = await res.json();",
    "    clearTimeout(timeoutId);",
    "    if (!data.results || data.results.length === 0)",
    "      throw new Error(`City \"${city}\" not found.`);",
    "    return data.results[0];  // { name, latitude, longitude, ... }",
    "  } catch (error) {",
    "    if (error.name === 'AbortError')",
    "      throw new Error('Request took too long.');",
    "    throw error;             // bubble up to handleSearch()",
    "  }",
    "}",
]
code_panel(p, "getCoordinates() (lines 79-104)", geo_lines, M, 520, 440)

p.label_box("Concept: async/await", "fetch() takes time. 'await' pauses THIS function only; the page stays responsive. 'async' marks the function as pausable.", 510, 470, 240, 70, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: timeout via AbortController", "If the API hangs, abort() fires at 5s and fetch throws AbortError - the user gets a clear message instead of an endless spinner.", 510, 385, 240, 72, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: HTTP status codes", "res.ok means status 200-299. 429 = rate limited. Each failure becomes a human sentence via throw new Error(...).", 510, 300, 240, 70, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: errors bubble up", "This function never touches the UI. It throws; handleSearch() catches and decides what the user sees. Data code and UI code stay separate.", 510, 210, 240, 76, fill=(1, 0.94, 0.94), accent=(0.86, 0.18, 0.18))

p.text("Data shape example", M, 150, 13, "F2", (0.06, 0.12, 0.16))
p.label_box("Input", "\"Lagos\"", M, 70, 100, 55, fill=(0.96, 0.99, 0.99))
p.arrow(M + 100, 98, M + 145, 98)
p.label_box("Geocoding API JSON", "results[0] = { name: 'Lagos', latitude: 6.45, longitude: 3.39, country: 'Nigeria' }", M + 145, 62, 260, 66, fill=(0.96, 0.99, 0.99))
footer(p, 6)
pages.append(p)


# Page 7: fetchWeather
p = Page()
p.text("script.js Piece by Piece (3/4): fetchWeather() - API JSON to Dashboard", M, H - 54, 20, "F2", (0.06, 0.12, 0.16))

wx_lines = [
    "const url = `...open-meteo.com/v1/forecast?latitude=${lat}",
    "  &longitude=${lon}&daily=...&hourly=...&current=...&timezone=auto`;",
    "",
    "const data = await response.json();",
    "if (!data.current || !data.daily || !data.hourly)",
    "  throw new Error(\"Weather data is missing from the response.\");",
    "",
    "// write numbers into named DOM hooks",
    "outdoorTemp.innerHTML  = `${Math.round(current.temperature_2m)}<span>C</span>`;",
    "humidity.textContent   = `${Math.round(current.relative_humidity_2m)}%`;",
    "windVal.textContent    = current.wind_speed_10m.toFixed(1);",
    "",
    "// UV number -> label + dot position on the gradient bar",
    "let uvText = 'Low';  let uvPos = 10;",
    "if (uv >= 3 && uv <= 5) { uvText = 'Moderate'; uvPos = 30; }  // ...etc",
    "uvDot.style.left = `${uvPos}%`;",
    "",
    "// WMO weather code -> icon name + label",
    "const wmoMap = { 0: {label:'Clear', icon:'sun'},",
    "                 61: {label:'Rain', icon:'cloud-rain'}, ... };",
    "",
    "// build the 7-day forecast rows",
    "for (let i = 0; i < 7; i++) {",
    "  const info = wmoMap[data.daily.weather_code[i]] || {label:'Cloudy'};",
    "  list.innerHTML += `<div class=\"forecast-item\">...${temp}C</div>`;",
    "}",
    "lucide.createIcons();   // new <i data-lucide> tags -> real SVGs",
    "setUIState('success');  // reveal the dashboard",
]
code_panel(p, "fetchWeather() condensed (lines 107-227)", wx_lines, M, 520, 460)

p.label_box("Concept: one URL, three datasets", "The forecast API returns current (now), daily (7 days), hourly (per hour) in one JSON reply. Query params pick the fields.", 530, 470, 222, 76, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: validate before painting", "Check data.current/daily/hourly exist BEFORE touching the DOM. A half-updated dashboard is worse than an error screen.", 530, 380, 222, 74, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: WMO codes", "Weather services worldwide use standard numbers: 0=clear, 61=rain, 95=storm. wmoMap is a lookup table turning codes into icons.", 530, 290, 222, 74, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: template rows", "The forecast list is built as an HTML string in a loop, then icons are re-scanned once at the end - one createIcons() call, not seven.", 530, 200, 222, 74, fill=(0.95, 0.95, 1), accent=(0.38, 0.32, 0.78))
footer(p, 7)
pages.append(p)


# Page 8: search flow + autocomplete
p = Page()
p.text("script.js Piece by Piece (4/4): Search Flow + Autocomplete Debounce", M, H - 54, 20, "F2", (0.06, 0.12, 0.16))

search_lines = [
    "searchBtn.addEventListener('click', handleSearch);",
    "cityInput.addEventListener('keypress', e => {",
    "  if (e.key === 'Enter') handleSearch();",
    "});",
    "",
    "async function handleSearch() {",
    "  const city = cityInput.value.trim();",
    "  if (!city) { showError('Please enter a city name.'); return; }",
    "  if (!navigator.onLine) { setUIState('error', 'offline'); return; }",
    "  setUIState('loading');",
    "  try {",
    "    const geo = await getCoordinates(city);",
    "    await fetchWeather(geo.latitude, geo.longitude, geo.name);",
    "  } catch (err) {",
    "    showError(err.message); setUIState('error', err.message);",
    "  }",
    "}",
]
y = code_panel(p, "handleSearch() - the conductor (lines 230-260)", search_lines, M, 520, 430)

deb_lines = [
    "cityInput.addEventListener('input', (e) => {",
    "  clearTimeout(debounceTimer);            // cancel pending call",
    "  const query = e.target.value.trim();",
    "  if (query.length < 2) { dropdown.style.display='none'; return; }",
    "  debounceTimer = setTimeout(() => fetchSuggestions(query), 300);",
    "});",
]
code_panel(p, "Autocomplete debounce (lines 270-278)", deb_lines, M, y - 14, 430)

p.label_box("Concept: guard clauses", "handleSearch() checks the cheap failures first (empty input, offline) and returns early. The happy path reads top-to-bottom.", 500, 470, 250, 70, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: debounce", "Typing 'London' = 6 keystrokes. Without debounce: 6 API calls. With it: each keystroke resets a 300ms timer; only the pause after the last key fires ONE call.", 500, 380, 250, 82, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))
p.label_box("Concept: click-outside close", "A document-level click listener hides the dropdown unless the click was inside .search-container (checked with closest()).", 500, 288, 250, 74, fill=(0.95, 0.95, 1), accent=(0.38, 0.32, 0.78))

p.text("Debounce timeline", M, 190, 13, "F2", (0.06, 0.12, 0.16))
p.line(M, 150, M + 420, 150, (0.16, 0.2, 0.24), 1.5)
for i, t in enumerate(["L", "o", "n", "d", "o", "n"]):
    x = M + 20 + i * 40
    p.rect(x - 8, 142, 16, 16, fill=(1, 0.985, 0.94), stroke=(0.91, 0.52, 0.08))
    p.text(t, x - 3, 146, 9, "F2", (0.91, 0.52, 0.08))
    p.text("reset", x - 10, 126, 6.5, "F1", (0.5, 0.55, 0.6))
p.arrow(M + 240, 150, M + 330, 150, (0.0, 0.62, 0.58), 2)
p.text("300ms silence", M + 244, 158, 8, "F1", (0.0, 0.5, 0.5))
p.label_box("ONE API call", "fetchSuggestions('London') shows up to 5 clickable matches.", M + 335, 118, 150, 60, fill=(0.94, 0.98, 0.98))
footer(p, 8)
pages.append(p)


# Page 9: cheat sheet - function reference + vocabulary
p = Page()
p.text("Cheat Sheet: Every Function + Key Vocabulary", M, H - 54, 22, "F2", (0.06, 0.12, 0.16))
p.wrap("One row per function in script.js. Find the line, read the job, jump into the source.", M, H - 78, 110, 10.5, 13)

funcs = [
    ("updateTime()", "11-21", "Clock + date header. Re-runs every second via setInterval."),
    ("theme toggle", "24-30", "Flips body.light-mode class; CSS variables restyle everything."),
    ("showError()", "33-38", "Slides in the toast, auto-hides after 4000ms."),
    ("setUIState()", "41-76", "The screen owner: empty / loading / error / success."),
    ("getCoordinates()", "79-104", "City name to lat/lon via geocoding API. 5s timeout."),
    ("fetchWeather()", "107-227", "Forecast API to DOM: temp, rain, UV, wind, sunrise, 7-day list. 8s timeout."),
    ("handleSearch()", "237-260", "The conductor: validate, set loading, geocode, fetch, catch errors."),
    ("fetchSuggestions()", "280-294", "Asks geocoding API for up to 5 city matches."),
    ("showSuggestions()", "296-311", "Builds clickable dropdown rows; click fills input and searches."),
    ("click-outside", "313-317", "Document listener closes the dropdown via closest()."),
]
ty = 455
p.rect(M, ty - len(funcs) * 26 + 18, 470, len(funcs) * 26 + 24, fill=(0.97, 0.99, 0.99), stroke=(0.72, 0.86, 0.86))
p.text("Function", M + 12, ty + 22, 9, "F2", (0.0, 0.5, 0.5))
p.text("Lines", M + 130, ty + 22, 9, "F2", (0.0, 0.5, 0.5))
p.text("Job", M + 185, ty + 22, 9, "F2", (0.0, 0.5, 0.5))
for i, (name, lines_, job) in enumerate(funcs):
    y = ty - i * 26
    if i % 2 == 0:
        p.rect(M + 4, y - 8, 462, 24, fill=(0.92, 0.97, 0.97), stroke=(0.92, 0.97, 0.97), lw=0.5)
    p.text(name, M + 12, y, 8.5, "F3", (0.06, 0.12, 0.16))
    p.text(lines_, M + 130, y, 8.5, "F3", (0.38, 0.44, 0.5))
    p.wrap(job, M + 185, y + 4, 58, 8, 9.5)

vocab = [
    ("async / await", "Pause one function while data loads; page stays responsive."),
    ("debounce", "Reset a timer per keystroke; act only after the typing pause."),
    ("guard clause", "Check cheap failures first, return early, keep happy path flat."),
    ("state machine", "One function decides the visible screen. No scattered show/hide."),
    ("AbortController", "Cancel handle for fetch; turns a hang into a clear timeout error."),
    ("WMO code", "Standard weather number (0=clear, 61=rain, 95=storm) mapped to icons."),
]
for i, (term, body) in enumerate(vocab):
    x = 530
    y = 440 - i * 66
    p.label_box(term, body, x, y, 222, 56, fill=(0.94, 0.98, 1), accent=(0.1, 0.45, 0.82))

p.label_box("Remember the pipeline", "User input -> API JSON -> validated data -> DOM updates. Every feature in this app is one trip through that pipe.", M, 70, 470, 60, fill=(1, 0.985, 0.94), accent=(0.91, 0.52, 0.08))
footer(p, 9)
pages.append(p)


objects = []


def add(obj):
    objects.append(obj)
    return len(objects)


font_ids = {
    "F1": add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    "F2": add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
    "F3": add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>"),
}

page_ids = []
for page in pages:
    content = "\n".join(page.ops)
    stream = content.encode("latin-1", "replace")
    content_id = add(f"<< /Length {len(stream)} >>\nstream\n{content}\nendstream")
    page_id = add(f"<< /Type /Page /Parent 0 0 R /MediaBox [0 0 {W} {H}] /Resources << /Font << /F1 {font_ids['F1']} 0 R /F2 {font_ids['F2']} 0 R /F3 {font_ids['F3']} 0 R >> >> /Contents {content_id} 0 R >>")
    page_ids.append(page_id)

pages_id = add("placeholder")
catalog_id = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")
objects[pages_id - 1] = f"<< /Type /Pages /Kids [{' '.join(f'{pid} 0 R' for pid in page_ids)}] /Count {len(page_ids)} >>"
for pid in page_ids:
    objects[pid - 1] = objects[pid - 1].replace("/Parent 0 0 R", f"/Parent {pages_id} 0 R")

pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for i, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf.extend(f"{i} 0 obj\n{obj}\nendobj\n".encode("latin-1", "replace"))
xref = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
for off in offsets[1:]:
    pdf.extend(f"{off:010d} 00000 n \n".encode())
pdf.extend(f"trailer << /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())

OUT.write_bytes(pdf)
print(OUT)
