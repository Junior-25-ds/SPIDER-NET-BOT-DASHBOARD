// ============================
// CONFIG BOT ET MOTS DE PASSE
// ============================
const BOT_URL = "http://localhost:3000"; // mettre l'URL publique si déployé
const OWNER_PASSWORD = "spidernet123";
const GUEST_PASSWORD = "guest123";

// ============================
// SCREENS
// ============================
const entryScreen = document.getElementById("entry-screen");
const ownerLoginScreen = document.getElementById("owner-login-screen");
const guestLoginScreen = document.getElementById("guest-login-screen");
const guestUsernameScreen = document.getElementById("guest-username-screen");
const dashboardApp = document.getElementById("dashboard-app");

// ============================
// BOUTONS ENTRY
// ============================
document.getElementById("owner-btn").addEventListener("click", ()=>{
  entryScreen.classList.add("hidden");
  ownerLoginScreen.classList.remove("hidden");
});

document.getElementById("guest-btn").addEventListener("click", ()=>{
  entryScreen.classList.add("hidden");
  guestLoginScreen.classList.remove("hidden");
});

// ============================
// BACK BUTTONS
// ============================
document.getElementById("owner-back").addEventListener("click", ()=>{
  ownerLoginScreen.classList.add("hidden");
  entryScreen.classList.remove("hidden");
});
document.getElementById("guest-back").addEventListener("click", ()=>{
  guestLoginScreen.classList.add("hidden");
  entryScreen.classList.remove("hidden");
});

// ============================
// LOGIN OWNER
// ============================
document.getElementById("owner-login-btn").addEventListener("click", ()=>{
  const pw = document.getElementById("owner-password").value;
  if(pw===OWNER_PASSWORD){
    ownerLoginScreen.classList.add("hidden");
    dashboardApp.classList.remove("hidden");
    init(true); // true = propriétaire
  } else {
    document.getElementById("owner-login-error").textContent="Mot de passe incorrect";
  }
});

// ============================
// LOGIN GUEST
// ============================
document.getElementById("guest-login-btn").addEventListener("click", ()=>{
  const pw = document.getElementById("guest-password").value;
  if(pw===GUEST_PASSWORD){
    guestLoginScreen.classList.add("hidden");
    guestUsernameScreen.classList.remove("hidden");
  } else {
    document.getElementById("guest-login-error").textContent="Mot de passe invité incorrect";
  }
});

// ============================
// INVITÉ NOM D'UTILISATEUR
// ============================
let currentUser = { role:"guest", name:"Invité" };
document.getElementById("guest-username-btn").addEventListener("click", ()=>{
  const username = document.getElementById("guest-username").value.trim();
  if(!username) return alert("Entrez un pseudo !");
  currentUser.name = username;
  guestUsernameScreen.classList.add("hidden");
  dashboardApp.classList.remove("hidden");
  init(false); // false = invité
});

// ============================
// SIDEBAR
// ============================
const menuBtn = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll(".sidebar ul li");

menuBtn.addEventListener("click", ()=> sidebar.classList.toggle("active"));

navItems.forEach(item=>{
  item.addEventListener("click", ()=>{
    navItems.forEach(i=>i.classList.remove("active"));
    sections.forEach(s=>s.classList.remove("active"));
    item.classList.add("active");
    document.getElementById(item.dataset.section).classList.add("active");
    if(window.innerWidth<768) sidebar.classList.remove("active");
  });
});

// ============================
// THEME
// ============================
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", ()=>{
  document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light");
  localStorage.setItem("theme", document.body.classList.contains("theme-dark")?"dark":"light");
});
const savedTheme = localStorage.getItem("theme");
if(savedTheme){
  document.body.classList.remove("theme-dark","theme-light");
  document.body.classList.add(savedTheme==="dark"?"theme-dark":"theme-light");
}

// ============================
// FETCH STATUS BOT
// ============================
async function fetchStatus(){
  try{
    const res = await fetch(`${BOT_URL}/status`);
    const data = await res.json();
    document.getElementById("bot-status").textContent = data.status==="online"?"🟢 En ligne":"🔴 Hors ligne";
    document.getElementById("bot-uptime").textContent = data.uptime;
    document.getElementById("bot-ping").textContent = data.ping+" ms";
    document.getElementById("bot-dot").className = "dot "+(data.status==="online"?"online":"offline");
  } catch(err){
    console.error(err);
    document.getElementById("bot-status").textContent="🔴 Hors ligne";
    document.getElementById("bot-uptime").textContent="-";
    document.getElementById("bot-ping").textContent="-";
    document.getElementById("bot-dot").className="dot offline";
  }
}

// ============================
// FETCH TABLES
// ============================
async function fetchTable(endpoint,id,columns){
  try{
    const res = await fetch(`${BOT_URL}/${endpoint}`);
    const data = await res.json();
    const tbody = document.getElementById(id);
    tbody.innerHTML="";
    data.forEach(row=>{
      const tr = document.createElement("tr");
      columns.forEach(col=>{
        const td = document.createElement("td");
        td.textContent=row[col]||"";
        tr.appendChild(td);
      });
      const actionTd = document.createElement("td");
      if(currentUser.role==="owner"){
        if(id==="guests-table") actionTd.innerHTML='🔕 Mute · 🔊 Unmute · ❌ Supprimer · ⬆️ Promouvoir';
        if(id==="admins-table") actionTd.innerHTML='⬆️ Promouvoir · ⬇️ Rétrograder · ❌ Supprimer';
      } else {
        actionTd.textContent="-";
      }
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });
  } catch(err){console.error(err);}
}

// ============================
// FETCH HISTORY
// ============================
async function fetchHistory(){
  try{
    const res = await fetch(`${BOT_URL}/history`);
    const data = await res.json();
    const historyList = document.getElementById("history-list");
    historyList.innerHTML="";
    data.forEach(item=>{
      const li = document.createElement("li");
      li.textContent=item;
      historyList.appendChild(li);
    });
  } catch(err){console.error(err);}
}

// ============================
// INIT DASHBOARD
// ============================
async function init(isOwner=false){
  currentUser.role = isOwner?"owner":"guest";
  await fetchStatus();
  await fetchTable("guests","guests-table",["name","number","group","status"]);
  await fetchTable("admins","admins-table",["name","number","role"]);
  await fetchTable("groups","groups-table",["name","members","admins","status"]);
  await fetchHistory();
  const groups = await fetch(`${BOT_URL}/groups`).then(r=>r.json()).catch(()=>[]);
  const guests = await fetch(`${BOT_URL}/guests`).then(r=>r.json()).catch(()=>[]);
  const admins = await fetch(`${BOT_URL}/admins`).then(r=>r.json()).catch(()=>[]);
  document.getElementById("groups-count").textContent = groups.length;
  document.getElementById("members-count").textContent = guests.length + admins.length;
}

// ============================
// BROADCAST
// ============================
const broadcastBtn = document.getElementById("send-broadcast");
broadcastBtn.addEventListener("click", async ()=>{
  if(currentUser.role==="guest") return alert("Vous n'avez pas la permission pour envoyer un broadcast !");
  const message = document.getElementById("broadcast-message").value;
  const allGroups = document.getElementById("all-groups").checked;
  const adminsOnly = document.getElementById("admins-only").checked;

  if(!message.trim()) return alert("Écris un message !");

  try{
    const res = await fetch(`${BOT_URL}/broadcast`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ message, allGroups, adminsOnly })
    });
    const data = await res.json();
    if(data.success) alert("Message envoyé !");
    else alert("Erreur: "+(data.error||"inconnue"));
    document.getElementById("broadcast-message").value="";
  } catch(err){console.error(err);alert("Erreur en envoyant le message");}
});
