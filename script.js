// ============================
// CONFIG BOT ET MOTS DE PASSE
// ============================
const BOT_URL = "http://localhost:3000"; // changez si déployé sur Vercel
const OWNER_PASSWORD = "spidernet123";
const GUEST_PASSWORD = "guest123";

// ============================
// SCREENS
// ============================
const welcomeScreen = document.getElementById("welcome-screen");
const ownerLoginScreen = document.getElementById("owner-login-screen");
const guestLoginScreen = document.getElementById("guest-login-screen");
const guestUsernameScreen = document.getElementById("guest-username-screen");
const dashboardApp = document.getElementById("dashboard-app");

// ============================
// ENTRY BUTTONS
// ============================
document.getElementById("owner-btn").addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  ownerLoginScreen.classList.remove("hidden");
});
document.getElementById("guest-btn").addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  guestLoginScreen.classList.remove("hidden");
});

// ============================
// BACK BUTTONS
// ============================
document.getElementById("owner-back").addEventListener("click", () => {
  ownerLoginScreen.classList.add("hidden");
  welcomeScreen.classList.remove("hidden");
});
document.getElementById("guest-back").addEventListener("click", () => {
  guestLoginScreen.classList.add("hidden");
  welcomeScreen.classList.remove("hidden");
});

// ============================
// CURRENT USER
// ============================
let currentUser = { role: "guest", name: "Invité" };

// ============================
// LOGIN PROPRIÉTAIRE
// ============================
document.getElementById("owner-login-btn").addEventListener("click", () => {
  const pw = document.getElementById("owner-password").value;
  if (pw === OWNER_PASSWORD) {
    ownerLoginScreen.classList.add("hidden");
    dashboardApp.classList.remove("hidden");
    currentUser.role = "owner";
    currentUser.name = "Propriétaire";
    initDashboard();
  } else {
    document.getElementById("owner-login-error").textContent = "Mot de passe incorrect";
  }
});

// ============================
// LOGIN INVITÉ
// ============================
document.getElementById("guest-login-btn").addEventListener("click", () => {
  const pw = document.getElementById("guest-password").value;
  if (pw === GUEST_PASSWORD) {
    guestLoginScreen.classList.add("hidden");
    guestUsernameScreen.classList.remove("hidden");
  } else {
    document.getElementById("guest-login-error").textContent = "Mot de passe invité incorrect";
  }
});

// ============================
// INVITÉ NOM D'UTILISATEUR
// ============================
document.getElementById("guest-username-btn").addEventListener("click", () => {
  const username = document.getElementById("guest-username").value.trim();
  if (!username) return alert("Entrez un pseudo !");
  currentUser.name = username;
  guestUsernameScreen.classList.add("hidden");
  dashboardApp.classList.remove("hidden");
  initDashboard();
});

// ============================
// SIDEBAR TOGGLE
// ============================
const menuBtn = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const navItems = document.querySelectorAll(".sidebar ul li");
const sections = document.querySelectorAll(".section");

menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((i) => i.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));
    item.classList.add("active");
    document.getElementById(item.dataset.section).classList.add("active");
    if (window.innerWidth < 768) sidebar.classList.remove("active");
  });
});

// ============================
// THEME TOGGLE
// ============================
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("theme-dark") ? "dark" : "light"
  );
});
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(savedTheme === "dark" ? "theme-dark" : "theme-light");
}

// ============================
// FETCH BOT STATUS
// ============================
async function fetchBotStatus() {
  try {
    const res = await fetch(`${BOT_URL}/status`);
    const data = await res.json();
    document.getElementById("bot-status").textContent =
      data.status === "online" ? "🟢 En ligne" : "🔴 Hors ligne";
    document.getElementById("bot-uptime").textContent = data.uptime;
    document.getElementById("bot-ping").textContent = data.ping + " ms";
    document.getElementById("bot-dot").className = "dot " + (data.status === "online" ? "online" : "offline");
  } catch (err) {
    console.error(err);
    document.getElementById("bot-status").textContent = "🔴 Hors ligne";
    document.getElementById("bot-uptime").textContent = "-";
    document.getElementById("bot-ping").textContent = "-";
    document.getElementById("bot-dot").className = "dot offline";
  }
}

// ============================
// FETCH TABLE DATA
// ============================
async function fetchTable(endpoint, tableId, columns) {
  try {
    const res = await fetch(`${BOT_URL}/${endpoint}`);
    const data = await res.json();
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = "";
    data.forEach((row) => {
      const tr = document.createElement("tr");
      columns.forEach((col) => {
        const td = document.createElement("td");
        td.textContent = row[col] || "";
        tr.appendChild(td);
      });
      const actionTd = document.createElement("td");
      if (currentUser.role === "owner") {
        if (tableId === "guests-table")
          actionTd.innerHTML = '❌ Supprimer · ⬆️ Promouvoir';
        if (tableId === "admins-table")
          actionTd.innerHTML = '⬇️ Rétrograder · ❌ Supprimer';
      } else {
        actionTd.textContent = "-";
      }
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

// ============================
// FETCH HISTORY
// ============================
async function fetchHistory() {
  try {
    const res = await fetch(`${BOT_URL}/history`);
    const data = await res.json();
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";
    data.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      historyList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ============================
// INIT DASHBOARD
// ============================
async function initDashboard() {
  await fetchBotStatus();
  await fetchTable("guests", "guests-table", ["name", "number", "group", "status"]);
  await fetchTable("admins", "admins-table", ["name", "number", "role"]);
  await fetchTable("groups", "groups-table", ["name", "members", "admins", "status"]);
  await fetchHistory();

  // Update cards
  const groups = await fetch(`${BOT_URL}/groups`).then(r => r.json()).catch(() => []);
  const guests = await fetch(`${BOT_URL}/guests`).then(r => r.json()).catch(() => []);
  const admins = await fetch(`${BOT_URL}/admins`).then(r => r.json()).catch(() => []);
  document.getElementById("groups-count").textContent = groups.length;
  document.getElementById("members-count").textContent = guests.length + admins.length;
}

// ============================
// BROADCAST
// ============================
const broadcastBtn = document.getElementById("send-broadcast");
broadcastBtn.addEventListener("click", async () => {
  if (currentUser.role === "guest") return alert("Vous n'avez pas la permission pour envoyer un broadcast !");
  const message = document.getElementById("broadcast-message").value;
  const allGroups = document.getElementById("all-groups").checked;
  const adminsOnly = document.getElementById("admins-only").checked;

  if (!message.trim()) return alert("Écris un message !");

  try {
    const res = await fetch(`${BOT_URL}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, allGroups, adminsOnly })
    });
    const data = await res.json();
    if (data.success) alert("Message envoyé !");
    else alert("Erreur: " + (data.error || "inconnue"));
    document.getElementById("broadcast-message").value = "";
  } catch (err) {
    console.error(err);
    alert("Erreur en envoyant le message");
  }
});
