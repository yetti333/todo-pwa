// IndexedDB
const dbName = "TodoDB";
const storeName = "tasks";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore(storeName, { keyPath: "id" });
    };
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function () {
      reject("Chyba při otevírání DB");
    };
  });
}

async function addTask(text) {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const task = { id: Date.now(), text, done: false };
  store.put(task);
  tx.oncomplete = () => renderTasks();
}

async function getAllTasks() {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Chyba při načítání");
  });
}

async function deleteTask(id) {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.delete(id);
  tx.oncomplete = () => renderTasks();
}

async function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  const tasks = await getAllTasks();

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => deleteTask(task.id);

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Stylové přepínání
function applyStyle(style) {
  document.body.className = "";
  document.body.classList.add(`theme-${style}`);
  localStorage.setItem("appStyle", style);
}

document.addEventListener("DOMContentLoaded", () => {
  // Stylové tlačítko
  const styleToggle = document.getElementById("style-toggle");
  const styleMenu = document.getElementById("style-menu");
  if (styleToggle && styleMenu) {
    styleToggle.addEventListener("click", () => {
      styleMenu.classList.toggle("hidden");
    });
  }

  // Globální posluchač pro všechna tlačítka s data-style
  const styleButtons = document.querySelectorAll("[data-style]");
  styleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const style = btn.dataset.style;
      applyStyle(style);
    });
  });

  // Dropdown
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden");
    });
  }

  // FAB
  const fab = document.getElementById("fab");
  const fabMenu = document.getElementById("fab-menu");
  if (fab && fabMenu) {
    fab.addEventListener("click", () => {
      fabMenu.classList.toggle("hidden");
    });
  }

  // Styl při načtení
  const savedStyle = localStorage.getItem("appStyle");
  if (savedStyle) {
    applyStyle(savedStyle);
  }

  // Formulář
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  if (form && input) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      addTask(input.value);
      input.value = "";
    });
  }

  // Úkoly
  renderTasks();

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("Service Worker registered", reg))
      .catch(err => console.error("Service Worker registration failed", err));
  }
});