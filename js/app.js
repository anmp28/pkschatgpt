(() => {
  const KEY="pokesurvivor-save-v1";
  const defaults={coins:500,owned:[25],shinies:[],achievements:[],bestTime:0,totalKills:0,runs:0,settings:{volume:.25,sound:true,particles:true,shinyRate:128},selected:25,selectedShiny:false};
  let save=load();
  function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}"),settings:{...defaults.settings,...(JSON.parse(localStorage.getItem(KEY)||"{}").settings||{})}};}catch(e){return structuredClone(defaults);}}
  function persist(){localStorage.setItem(KEY,JSON.stringify(save));renderHeader();}
  function renderHeader(){document.getElementById("coins").textContent=save.coins;document.getElementById("dexCount").textContent=save.owned.length;}
  function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}
  function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));}
  function pokemon(id){return window.POKEDEX_DATA[id-1];}
  function getSelectedPokemon(){return save.selected;}
  function isSelectedShiny(){return save.selectedShiny;}
  function addOwned(id,shiny){if(!save.owned.includes(id))save.owned.push(id);if(shiny&&!save.shinies.includes(id))save.shinies.push(id);persist();}
  function pull(){
    if(save.coins<100){toast("No tienes suficientes monedas.");return;}
    save.coins-=100;const region=document.getElementById("regionSelect").value;
    const pool=window.POKEDEX_DATA.filter(p=>p.region===region);const p=pool[Math.floor(Math.random()*pool.length)];
    const shiny=Math.random()<1/save.settings.shinyRate;addOwned(p.id,shiny);
    const out=document.getElementById("pullResult");out.className="pull-result"+(shiny?" shiny":"");
    out.innerHTML=`<div class="pull-badge">${shiny?"✧":"✦"}</div><div><small>${shiny?"¡POKÉMON SHINY!":"NUEVO RECLUTAMIENTO"} · #${String(p.id).padStart(3,"0")}</small><h3>${p.name}${shiny?" ★":""}</h3><span class="muted">${p.region} · ${p.types.join(" / ")}</span></div>`;
    save.selected=p.id;save.selectedShiny=shiny;persist();checkAchievements();toast(shiny?"¡Un shiny!":"¡Reclutamiento completado!");
  }
  function renderDex(){
    const q=document.getElementById("dexSearch").value.toLowerCase(),f=document.getElementById("dexFilter").value;
    const list=window.POKEDEX_DATA.filter(p=>(String(p.id).includes(q)||p.name.toLowerCase().includes(q))&&(f==="all"||(f==="owned"&&save.owned.includes(p.id))||(f==="shiny"&&save.shinies.includes(p.id))));
    document.getElementById("dexSummary").textContent=`${list.length} resultados · ${save.owned.length} obtenidas · ${save.shinies.length} shinies`;
    document.getElementById("dexGrid").innerHTML=list.slice(0,250).map(p=>{const owned=save.owned.includes(p.id),shiny=save.shinies.includes(p.id);return `<button class="dex-card ${owned?"owned":""} ${shiny?"shiny":""}" data-pokemon="${p.id}"><span class="dex-id">#${String(p.id).padStart(3,"0")} · ${p.region}</span><b>${owned?p.name:"???"}${shiny?" ★":""}</b><small>${owned?p.types.join(" / "):"Sin registrar"}</small></button>`;}).join("");
    document.querySelectorAll("[data-pokemon]").forEach(b=>b.onclick=()=>{const id=+b.dataset.pokemon;if(save.owned.includes(id)){save.selected=id;save.selectedShiny=save.shinies.includes(id);persist();toast("Pokémon seleccionado.");}});
  }
  const achievements=[
    ["first_run","Primera aventura","Completa tu primera partida.","♧",s=>s.runs>=1],
    ["ten_kills","Cazador","Derrota a 10 enemigos en total.","⚔",s=>s.totalKills>=10],
    ["five_minutes","Aguante","Sobrevive al menos 5 minutos en una partida.","⌛",s=>s.bestTime>=300],
    ["collector","Coleccionista","Consigue 10 especies diferentes.","▦",s=>s.owned.length>=10],
    ["sparkle","Destello","Consigue tu primer Pokémon shiny.","✧",s=>s.shinies.length>=1]
  ];
  function checkAchievements(){for(const a of achievements)if(a[4](save)&&!save.achievements.includes(a[0])){save.achievements.push(a[0]);toast("Logro desbloqueado: "+a[1]);}persist();}
  function renderAchievements(){document.getElementById("achievementList").innerHTML=achievements.map(a=>{const done=save.achievements.includes(a[0]);return `<div class="achievement ${done?"":"locked"}"><span class="ach-icon">${a[3]}</span><div><b>${a[1]} ${done?"✓":""}</b><small>${a[2]}</small></div></div>`;}).join("");}
  function recordRun(time,kills){save.runs++;save.totalKills+=kills;save.bestTime=Math.max(save.bestTime,time);checkAchievements();}
  function init(){
    window.AppSettings=save.settings;renderHeader();
    document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>{showScreen(b.dataset.screen);if(b.dataset.screen==="dex")renderDex();if(b.dataset.screen==="achievements")renderAchievements();}));
    document.getElementById("startBtn").onclick=()=>window.Game.start();
    document.getElementById("pullBtn").onclick=pull;
    document.getElementById("dexSearch").oninput=renderDex;document.getElementById("dexFilter").onchange=renderDex;
    document.getElementById("pauseBtn").onclick=()=>window.Game.pause();document.getElementById("resumeBtn").onclick=()=>window.Game.resume();
    document.getElementById("quitBtn").onclick=()=>{window.Game.getState().running=false;document.getElementById("pauseModal").classList.add("hidden");showScreen("home");};
    document.getElementById("retryBtn").onclick=()=>window.Game.start();document.getElementById("homeBtn").onclick=()=>{document.getElementById("gameOverModal").classList.add("hidden");showScreen("home");};
    const volume=document.getElementById("volume"),soundToggle=document.getElementById("soundToggle"),particles=document.getElementById("particlesToggle"),shiny=document.getElementById("shinySelect");
    volume.value=save.settings.volume;soundToggle.checked=save.settings.sound;particles.checked=save.settings.particles;shiny.value=save.settings.shinyRate;
    volume.oninput=()=>{save.settings.volume=+volume.value;window.AppSettings=save.settings;persist();};
    soundToggle.onchange=()=>{save.settings.sound=soundToggle.checked;window.AppSettings=save.settings;persist();};
    particles.onchange=()=>{save.settings.particles=particles.checked;persist();};
    shiny.onchange=()=>{save.settings.shinyRate=+shiny.value;persist();document.getElementById("shinyRate").textContent=`1 / ${shiny.value}`;};
    document.getElementById("shinyRate").textContent=`1 / ${save.settings.shinyRate}`;
    document.getElementById("resetBtn").onclick=()=>{if(confirm("¿Borrar toda la colección, monedas y récords guardados en este navegador?")){localStorage.removeItem(KEY);save=structuredClone(defaults);window.AppSettings=save.settings;persist();renderDex();renderAchievements();toast("Progreso reiniciado.");}};
    renderDex();renderAchievements();
  }
  window.App={showScreen,getSelectedPokemon,isSelectedShiny,recordRun,save,checkAchievements};init();
})();