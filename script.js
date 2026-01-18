const BOT_URL = "http://localhost:3000"; // ton bot déjà sur localhost

const menuBtn = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

menuBtn.addEventListener("click",()=>sidebar.classList.toggle("active"));

const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll(".sidebar ul li");

navItems.forEach(item=>{
  item.addEventListener("click",()=>{
    navItems.forEach(i=>i.classList.remove("active"));
    sections.forEach(s=>s.classList.remove("active"));
    item.classList.add("active");
    document.getElementById(item.dataset.section).classList.add("active");
    if(window.innerWidth<768) sidebar.classList.remove("active");
  });
});

const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click",()=>{
  document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light");
  localStorage.setItem("theme",document.body.classList.contains("theme-dark")?"dark":"light");
});
const savedTheme=localStorage.getItem("theme");
if(savedTheme){document.body.classList.remove("theme-dark","theme-light");document.body.classList.add(savedTheme==="dark"?"theme-dark":"theme-light");}

async function fetchStatus(){try{const res=await fetch(`${BOT_URL}/status`);const data=await res.json();document.getElementById("bot-status").textContent=data.status==="online"?"🟢 En ligne":"🔴 Hors ligne";document.getElementById("bot-uptime").textContent=data.uptime;document.getElementById("bot-ping").textContent=data.ping+" ms";}catch(err){console.error(err);document.getElementById("bot-status").textContent="🔴 Hors ligne";document.getElementById("bot-uptime").textContent="-";document.getElementById("bot-ping").textContent="-";}}
async function fetchTable(endpoint,id,columns){try{const res=await fetch(`${BOT_URL}/${endpoint}`);const data=await res.json();const tbody=document.getElementById(id);tbody.innerHTML="";data.forEach(row=>{const tr=document.createElement("tr");columns.forEach(col=>{const td=document.createElement("td");td.textContent=row[col]||"";tr.appendChild(td);});const actionTd=document.createElement("td");if(id==="guests-table") actionTd.innerHTML='🔕 Mute · 🔊 Unmute · ❌ Supprimer · ⬆️ Promouvoir';if(id==="admins-table") actionTd.innerHTML='⬆️ Promouvoir · ⬇️ Rétrograder · ❌ Supprimer';tr.appendChild(actionTd);tbody.appendChild(tr);});}catch(err){console.error(err);}}
async function fetchHistory(){try{const res=await fetch(`${BOT_URL}/history`);const data=await res.json();const historyList=document.getElementById("history-list");historyList.innerHTML="";data.forEach(item=>{const li=document.createElement("li");li.textContent=item;historyList.appendChild(li);});}catch(err){console.error(err);}}

async function init(){
  await fetchStatus();
  await fetchTable("guests","guests-table",["name","number","group","status"]);
  await fetchTable("admins","admins-table",["name","number","role"]);
  await fetchTable("groups","groups-table",["name","members","admins","status"]);
  await fetchHistory();
  const groups=await fetch(`${BOT_URL}/groups`).then(r=>r.json()).catch(()=>[]);
  const guests=await fetch(`${BOT_URL}/guests`).then(r=>r.json()).catch(()=>[]);
  const admins=await fetch(`${BOT_URL}/admins`).then(r=>r.json()).catch(()=>[]);
  document.getElementById("groups-count").textContent=groups.length;
  document.getElementById("members-count").textContent=guests.length+admins.length;
}

init();

const broadcastBtn=document.getElementById("send-broadcast");
broadcastBtn.addEventListener("click",async ()=>{
  const message=document.getElementById("broadcast-message").value;
  if(!message.trim()) return alert("Écris un message !");
  try{
    await fetch(`${BOT_URL}/broadcast`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message})
    });
    alert("Message envoyé !");
    document.getElementById("broadcast-message").value="";
  }catch(err){console.error(err);alert("Erreur en envoyant le message");}
});
