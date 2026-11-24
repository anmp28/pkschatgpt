(() => {
  const canvas=document.getElementById("arena"),ctx=canvas.getContext("2d");
  const W=canvas.width,H=canvas.height;
  const state={running:false,paused:false,t:0,last:0,player:null,enemies:[],shots:[],gems:[],particles:[],keys:{},kills:0,xp:0,need:8,level:1,stats:{damage:18,rate:.7,range:280,speed:190,area:1},moveLevel:1,spawn:0,gameId:0};
  const upgrades=[
    {name:"Potencia elemental",desc:"+25% de daño de tus movimientos.",apply:s=>s.stats.damage*=1.25},
    {name:"Ritmo de combate",desc:"Los movimientos se ejecutan un 18% más rápido.",apply:s=>s.stats.rate*=.82},
    {name:"Alcance ampliado",desc:"+20% de alcance de ataque.",apply:s=>s.stats.range*=1.2},
    {name:"Paso ligero",desc:"+12% de velocidad de movimiento.",apply:s=>s.stats.speed*=1.12},
    {name:"Energía concentrada",desc:"+20% de área de impacto.",apply:s=>s.stats.area*=1.2}
  ];
  let camera={x:0,y:0},audio=null,attackClock=0,pointer=null;
  const rand=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function sound(freq=440,duration=.07,type="sine"){
    if(!window.AppSettings?.sound) return;
    try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.value=(window.AppSettings.volume||.25)*.08;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.stop(audio.currentTime+duration);}catch(e){}
  }
  function start(){
    Object.assign(state,{running:true,paused:false,t:0,last:0,enemies:[],shots:[],gems:[],particles:[],kills:0,xp:0,need:8,level:1,spawn:0,gameId:state.gameId+1});
    state.player={x:0,y:0,hp:100,maxHp:100,r:14,inv:0};
    state.stats={damage:18,rate:.7,range:280,speed:190,area:1};
    camera={x:0,y:0};attackClock=0;document.getElementById("gameOverModal").classList.add("hidden");document.getElementById("pauseModal").classList.add("hidden");
    window.App.showScreen("game");updateHud();requestAnimationFrame(loop);
  }
  function spawnEnemy(){
    const angle=rand(0,Math.PI*2),radius=rand(430,600),difficulty=1+state.t/95;
    state.enemies.push({x:state.player.x+Math.cos(angle)*radius,y:state.player.y+Math.sin(angle)*radius,r:rand(10,16),hp:18+difficulty*8,speed:rand(38,58)+difficulty*5,damage:8+difficulty*1.4,flash:0});
  }
  function attack(){
    if(!state.enemies.length)return;
    let target=null,best=Infinity;
    for(const e of state.enemies){const d=dist(e,state.player);if(d<state.stats.range&&d<best){best=d;target=e;}}
    if(!target)return;
    const a=Math.atan2(target.y-state.player.y,target.x-state.player.x);
    state.shots.push({x:state.player.x,y:state.player.y,vx:Math.cos(a)*440,vy:Math.sin(a)*440,life:1.2,damage:state.stats.damage, r:5*state.stats.area});
    sound(520,.045,"triangle");
  }
  function gainXp(x,y){state.gems.push({x,y,value:1});}
  function levelUp(){
    state.level++;state.need=Math.floor(state.need*1.32+4);
    const picks=[...upgrades].sort(()=>Math.random()-.5).slice(0,3);
    const holder=document.getElementById("upgradeChoices");holder.innerHTML="";
    picks.forEach(u=>{const b=document.createElement("button");b.className="upgrade-choice";b.innerHTML=`<b>${u.name}</b><small>${u.desc}</small>`;b.onclick=()=>{u.apply(state);document.getElementById("levelModal").classList.add("hidden");state.paused=false;updateHud();};holder.appendChild(b);});
    state.paused=true;document.getElementById("levelModal").classList.remove("hidden");sound(880,.2,"sine");
  }
  function updateHud(){
    document.getElementById("timer").textContent=`${String(Math.floor(state.t/60)).padStart(2,"0")}:${String(Math.floor(state.t%60)).padStart(2,"0")}`;
    document.getElementById("level").textContent=state.level;document.getElementById("kills").textContent=state.kills;
    document.getElementById("xpText").textContent=`${state.xp} / ${state.need}`;document.getElementById("xpFill").style.width=(state.xp/state.need*100)+"%";
  }
  function update(dt){
    const p=state.player;state.t+=dt;
    let dx=(state.keys.ArrowRight||state.keys.d?1:0)-(state.keys.ArrowLeft||state.keys.a?1:0),dy=(state.keys.ArrowDown||state.keys.s?1:0)-(state.keys.ArrowUp||state.keys.w?1:0);
    if(pointer){dx=pointer.dx;dy=pointer.dy;}
    const l=Math.hypot(dx,dy)||1;p.x+=dx/l*state.stats.speed*dt;p.y+=dy/l*state.stats.speed*dt;
    camera.x+=(p.x-camera.x)*Math.min(1,dt*5);camera.y+=(p.y-camera.y)*Math.min(1,dt*5);
    state.spawn+=dt;const interval=Math.max(.18,.85-state.t*.004);
    while(state.spawn>interval){state.spawn-=interval;spawnEnemy();}
    attackClock+=dt;if(attackClock>=state.stats.rate){attackClock=0;attack();}
    for(const e of state.enemies){const d=dist(e,p)||1;e.x+=(p.x-e.x)/d*e.speed*dt;e.y+=(p.y-e.y)/d*e.speed*dt;e.flash=Math.max(0,e.flash-dt);if(d<e.r+p.r&&p.inv<=0){p.hp-=e.damage*dt;p.inv=.1;if(p.hp<=0){end();return;}}}
    p.inv=Math.max(0,p.inv-dt);
    for(const s of state.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const e of state.enemies){if(e.hp>0&&Math.hypot(s.x-e.x,s.y-e.y)<e.r+s.r){e.hp-=s.damage;e.flash=.08;s.life=0;if(e.hp<=0){state.kills++;gainXp(e.x,e.y);sound(180,.03,"square");}break;}}}
    state.shots=state.shots.filter(s=>s.life>0);state.enemies=state.enemies.filter(e=>e.hp>0);
    for(const g of state.gems){const d=dist(g,p);if(d<120){g.x+=(p.x-g.x)*dt*4;g.y+=(p.y-g.y)*dt*4;}if(d<20){state.xp+=g.value;g.value=0;if(state.xp>=state.need){state.xp-=state.need;levelUp();}}}
    state.gems=state.gems.filter(g=>g.value>0);
    updateHud();
  }
  function draw(){
    ctx.clearRect(0,0,W,H);const ox=W/2-camera.x,oy=H/2-camera.y;
    ctx.fillStyle="#101b2b";ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#26364d";ctx.lineWidth=1;const grid=48,startX=((ox%grid)+grid)%grid,startY=((oy%grid)+grid)%grid;
    for(let x=startX;x<W;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=startY;y<H;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    // Arena decor is environmental geometry, never used as creature art.
    for(const g of state.gems){ctx.fillStyle="#78eee0";ctx.shadowColor="#78eee0";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(g.x+ox,g.y+oy,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    for(const s of state.shots){ctx.fillStyle="#ffe38d";ctx.shadowColor="#ffe38d";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(s.x+ox,s.y+oy,s.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    for(const e of state.enemies){const x=e.x+ox,y=e.y+oy;if(x<-40||x>W+40||y<-40||y>H+40)continue;ctx.fillStyle=e.flash?"#fff":"#e77991";ctx.beginPath();ctx.arc(x,y,e.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#542d50";ctx.fillRect(x-8,y-e.r-7,16,3);ctx.fillStyle="#ff8297";ctx.fillRect(x-8,y-e.r-7,16*Math.max(0,e.hp/(30+state.t*.08)),3);}
    const p=state.player;if(p){const x=p.x+ox,y=p.y+oy;ctx.save();ctx.globalAlpha=p.inv>0?.55:1;const chosen=window.App?.getSelectedPokemon?.()||25;const shiny=window.App?.isSelectedShiny?.()||false;window.SpriteManager.draw(ctx,chosen,x,y,44,shiny,Math.floor(state.t*8));ctx.restore();ctx.strokeStyle="#78eee0";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#ff7188";ctx.fillRect(14,14,Math.max(0,120*p.hp/p.maxHp),5);ctx.strokeStyle="#8b9bb0";ctx.strokeRect(14,14,120,5);}
  }
  function loop(now){if(!state.running)return;if(!state.last)state.last=now;const dt=Math.min(.033,(now-state.last)/1000);state.last=now;if(!state.paused)update(dt);draw();if(state.running)requestAnimationFrame(loop);}
  function end(){state.running=false;window.App?.recordRun?.(state.t,state.kills);document.getElementById("runSummary").innerHTML=`<div><b>${Math.floor(state.t)}s</b>TIEMPO</div><div><b>${state.kills}</b>BAJAS</div><div><b>${state.level}</b>NIVEL</div>`;document.getElementById("gameOverModal").classList.remove("hidden");}
  function pause(){if(!state.running)return;state.paused=true;document.getElementById("pauseModal").classList.remove("hidden");}
  function resume(){state.paused=false;state.last=0;document.getElementById("pauseModal").classList.add("hidden");}
  window.Game={start,pause,resume,getState:()=>state};
  window.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();state.keys[e.key]=true;if(e.key==="Escape"&&state.running)pause();});
  window.addEventListener("keyup",e=>state.keys[e.key]=false);
  let touchStart=null;
  canvas.addEventListener("pointerdown",e=>{touchStart={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!touchStart)return;const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;const l=Math.hypot(dx,dy)||1;pointer={dx:dx/l,dy:dy/l};});
  const clearPointer=()=>{touchStart=null;pointer=null;};canvas.addEventListener("pointerup",clearPointer);canvas.addEventListener("pointercancel",clearPointer);
})();