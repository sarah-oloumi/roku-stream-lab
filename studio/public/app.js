const state = {
  files: [],
  feed: { items: [] },
  focus: 0
};

const filesEl = document.querySelector("#files");
const codeEl = document.querySelector("#code");
const fileTitleEl = document.querySelector("#fileTitle");
const fileMetaEl = document.querySelector("#fileMeta");
const screenEl = document.querySelector("#screen");
const playerEl = document.querySelector("#player");
const statusEl = document.querySelector("#status");
const clockEl = document.querySelector("#clock");

start();

async function start() {
  setInterval(() => {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, 1000);
  await Promise.all([loadFiles(), loadFeed()]);
  renderPreview();
  bindControls();
}

async function loadFiles() {
  const { files } = await getJson("/api/files");
  state.files = files;
  filesEl.innerHTML = "";
  for (const file of files) {
    const button = document.createElement("button");
    button.className = "file";
    button.textContent = file;
    button.addEventListener("click", () => openFile(file, button));
    filesEl.append(button);
  }
}

async function openFile(path, button) {
  document.querySelectorAll(".file").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
  const text = await response.text();
  fileTitleEl.textContent = path;
  fileMetaEl.textContent = `${text.length.toLocaleString()} chars`;
  codeEl.textContent = text;
}

async function loadFeed() {
  state.feed = await getJson("/api/feed");
}

function renderPreview() {
  const items = state.feed.items;
  screenEl.innerHTML = `
    <div class="hero-title">${escapeHtml(state.feed.title ?? "Streaming App")}</div>
    <div class="hero-copy">${escapeHtml(state.feed.description ?? "")}</div>
    <div class="grid">
      ${items.map((item, index) => `
        <div class="tile ${index === state.focus ? "focused" : ""}">
          <div class="poster"></div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description ?? item.streamFormat ?? "")}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function bindControls() {
  document.querySelector("#runDoctor").addEventListener("click", async () => {
    const result = await getJson("/api/doctor");
    statusEl.textContent = result.feed ? "Doctor passed: feed is valid" : "Doctor found feed issues";
  });

  document.querySelector("#packageApp").addEventListener("click", async () => {
    statusEl.textContent = "Packaging...";
    const response = await fetch("/api/package", { method: "POST" });
    const result = await response.json();
    statusEl.textContent = result.ok ? `Packaged ${result.artifact}` : "Package failed";
  });

  document.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", () => handleKey(button.dataset.key));
  });

  window.addEventListener("keydown", (event) => {
    const map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      Enter: "select",
      Escape: "back",
      Backspace: "back"
    };
    if (map[event.key]) {
      event.preventDefault();
      handleKey(map[event.key]);
    }
  });
}

function handleKey(key) {
  const count = state.feed.items.length;
  if (!count) return;
  if (key === "left") state.focus = Math.max(0, state.focus - 1);
  if (key === "right") state.focus = Math.min(count - 1, state.focus + 1);
  if (key === "up") state.focus = Math.max(0, state.focus - 3);
  if (key === "down") state.focus = Math.min(count - 1, state.focus + 3);
  if (key === "select") playFocused();
  if (key === "back") {
    playerEl.pause();
    playerEl.removeAttribute("src");
    playerEl.load();
  }
  renderPreview();
}

function playFocused() {
  const item = state.feed.items[state.focus];
  playerEl.src = item.streamUrl;
  playerEl.play().catch(() => {
    statusEl.textContent = "Browser blocked autoplay. Press play in the video controls.";
  });
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
