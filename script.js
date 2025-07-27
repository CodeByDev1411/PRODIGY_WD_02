const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const msEl = document.getElementById("milliseconds");

const startPauseBtn = document.getElementById("startPauseBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const clearLapsBtn = document.getElementById("clearLapsBtn");
const lapsBody = document.getElementById("lapsBody");
const themeToggle = document.getElementById("themeToggle");

let running = false;
let rafId = null;
let startTime = 0;
let accumulated = 0;
let lastRendered = 0;
let lastLapAt = 0;
let lapCount = 0;

function formatTime(elapsedMs) {
  const h = Math.floor(elapsedMs / 3600000);
  const m = Math.floor((elapsedMs % 3600000) / 60000);
  const s = Math.floor((elapsedMs % 60000) / 1000);
  const ms = Math.floor(elapsedMs % 1000);

  return {
    h: h.toString().padStart(2, "0"),
    m: m.toString().padStart(2, "0"),
    s: s.toString().padStart(2, "0"),
    ms: ms.toString().padStart(3, "0"),
  };
}

function render(elapsedMs) {
  const t = formatTime(elapsedMs);
  hoursEl.textContent = t.h;
  minutesEl.textContent = t.m;
  secondsEl.textContent = t.s;
  msEl.textContent = t.ms;
}

function tick(now) {
  const elapsed = accumulated + (now - startTime);
  lastRendered = elapsed;
  render(elapsed);
  rafId = requestAnimationFrame(tick);
}

function start() {
  running = true;
  startTime = performance.now();
  startPauseBtn.textContent = "Pause";
  startPauseBtn.setAttribute("aria-pressed", "true");
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  rafId = requestAnimationFrame(tick);
}

function pause() {
  running = false;
  accumulated = lastRendered;
  cancelAnimationFrame(rafId);
  startPauseBtn.textContent = "Start";
  startPauseBtn.setAttribute("aria-pressed", "false");
}

function reset() {
  pause();
  accumulated = 0;
  lastRendered = 0;
  lastLapAt = 0;
  lapCount = 0;
  render(0);
  lapsBody.innerHTML = "";
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  clearLapsBtn.disabled = true;
}

function addLap() {
  const total = lastRendered;
  const split = total - lastLapAt;
  lastLapAt = total;

  lapCount++;

  const tr = document.createElement("tr");
  const cells = [
    lapCount,
    formatPretty(total),
    formatPretty(split),
    formatPretty(total),
  ];

  cells.forEach((text, idx) => {
    const td = document.createElement("td");
    td.textContent = text;
    if (idx === 0) td.style.textAlign = "left";
    tr.appendChild(td);
  });

  lapsBody.prepend(tr);
  clearLapsBtn.disabled = false;
}

function clearLaps() {
  lapsBody.innerHTML = "";
  lastLapAt = 0;
  lapCount = 0;
  clearLapsBtn.disabled = true;
}

function formatPretty(ms) {
  const t = formatTime(ms);
  return `${t.h}:${t.m}:${t.s}.${t.ms}`;
}

/* Event Listeners */
startPauseBtn.addEventListener("click", () => (running ? pause() : start()));
lapBtn.addEventListener("click", () => running && addLap());
resetBtn.addEventListener("click", reset);
clearLapsBtn.addEventListener("click", clearLaps);

themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  html.setAttribute(
    "data-theme",
    html.getAttribute("data-theme") === "dark" ? "light" : "dark"
  );
});

/* Keyboard Shortcuts */
window.addEventListener("keydown", (e) => {
  if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;
  if (e.code === "Space") {
    e.preventDefault();
    running ? pause() : start();
  } else if (e.key.toLowerCase() === "l" && running) addLap();
  else if (e.key.toLowerCase() === "r") reset();
  else if (e.key.toLowerCase() === "t") themeToggle.click();
});

/* Initialize */
render(0);
