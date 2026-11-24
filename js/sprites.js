/* SpriteManager — rutas intercambiables PMD SpriteCollab / Edición Reloaded.
   Añade sprites descargados legalmente a assets/sprites/... y registra su ruta aquí.
   Soporta PNG individual y sprite sheets con frameWidth/frameHeight/frameCount. */
(() => {
  const SPRITE_SOURCES = {
    pmd: "assets/sprites/pmd/",
    reloaded: "assets/sprites/reloaded/"
  };
  const SPRITE_OVERRIDES = {
    // Ejemplo:
    // 25: {source:"pmd", normal:"pikachu.png", shiny:"pikachu_shiny.png",
    //      sheet:{frameWidth:40,frameHeight:40,frameCount:4,fps:8}}
  };
  class SpriteManager {
    constructor(){ this.cache=new Map(); this.failed=new Set(); }
    config(id, shiny=false){
      const c=SPRITE_OVERRIDES[id];
      if(c) return {url:SPRITE_SOURCES[c.source||"pmd"]+(shiny?(c.shiny||c.normal):c.normal),sheet:c.sheet||null};
      const p=window.POKEDEX_DATA?.[id-1];
      if(!p) return null;
      return {url:SPRITE_SOURCES.pmd+id+(shiny?"_shiny":"")+".png",sheet:null};
    }
    load(id,shiny=false){
      const key=id+":"+shiny;
      if(this.cache.has(key)) return this.cache.get(key);
      const cfg=this.config(id,shiny); if(!cfg) return null;
      const img=new Image(); img.src=cfg.url;
      const item={img,ready:false,failed:false,sheet:cfg.sheet};
      img.onload=()=>item.ready=true; img.onerror=()=>{item.failed=true;this.failed.add(key);};
      this.cache.set(key,item); return item;
    }
    draw(ctx,id,x,y,size,shiny=false,frame=0){
      const item=this.load(id,shiny);
      if(item?.ready){
        const s=item.sheet;
        if(s){const f=frame%s.frameCount;ctx.drawImage(item.img,f*s.frameWidth,0,s.frameWidth,s.frameHeight,x-size/2,y-size/2,size,size);}
        else ctx.drawImage(item.img,x-size/2,y-size/2,size,size);
        return true;
      }
      // Marcador tipográfico discreto; nunca se inventa un Pokémon con primitivas.
      ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle="#a9bad0";ctx.font="11px monospace";ctx.fillText(item?.failed?`#${id}`:`#${id} ·`,x,y);
      ctx.restore();return false;
    }
  }
  window.SpriteManager = new SpriteManager();
})();