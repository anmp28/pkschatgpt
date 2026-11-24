/* Catálogo extensible: 966 entradas estructuradas. Los nombres no verificados se dejan como
   "Pokémon #NNN" para no inventar especies. Sustituye/expande con datos autorizados. */
(() => {
  const regions = ["Kanto","Johto","Hoenn","Sinnoh","Teselia","Kalos","Alola","Galar","Paldea"];
  const regionRanges = [[1,151],[152,251],[252,386],[387,493],[494,649],[650,721],[722,809],[810,898],[899,966]];
  const known = {
    1:["Bulbasaur",["Planta","Veneno"]],2:["Ivysaur",["Planta","Veneno"]],3:["Venusaur",["Planta","Veneno"]],
    4:["Charmander",["Fuego"]],5:["Charmeleon",["Fuego"]],6:["Charizard",["Fuego","Volador"]],
    7:["Squirtle",["Agua"]],8:["Wartortle",["Agua"]],9:["Blastoise",["Agua"]],
    25:["Pikachu",["Eléctrico"]],26:["Raichu",["Eléctrico"]],133:["Eevee",["Normal"]],
    150:["Mewtwo",["Psíquico"]],151:["Mew",["Psíquico"]],249:["Lugia",["Psíquico","Volador"]],250:["Ho-Oh",["Fuego","Volador"]],
    384:["Rayquaza",["Dragón","Volador"]],487:["Giratina",["Fantasma","Dragón"]],493:["Arceus",["Normal"]],
   };
  const moves = ["Impactrueno","Placaje","Hoja afilada","Ascuas","Burbuja","Ataque rápido"];
  const roster = [];
  for (let id=1; id<=966; id++) {
    const range = regionRanges.findIndex(([a,b])=>id>=a&&id<=b);
    const info = known[id] || [`Pokémon #${String(id).padStart(3,"0")}`,["Normal"]];
    roster.push({
      id, dex:id, name:info[0], types:info[1], region:regions[range],
      rarity: id%100===0 ? "legendary" : (id%17===0 ? "rare" : "common"),
      stats:{hp:70+(id*7)%70, attack:45+(id*11)%65, defense:40+(id*13)%65, speed:40+(id*17)%70},
      startingMove:moves[id%moves.length], spriteKey:`pokemon-${id}`,
      sprite:{normal:`pmd/${id}.png`,shiny:`pmd/${id}_shiny.png`}
    });
  }
  window.POKEDEX_DATA = roster;
})();