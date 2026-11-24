# PokeSurvivor — prototipo web local

Fan project no oficial. Abrir `index.html` en un navegador moderno. No necesita servidor ni build.

## Incluye
- Arena Canvas con movimiento WASD/flechas y control táctil, cámara suave, hordas, autoataque, experiencia y mejoras.
- Gacha por región, monedas, colección y probabilidad shiny configurable.
- Pokédex estructurada con 966 IDs, logros, récords y guardado en `localStorage`.
- Audio sintético mediante Web Audio API.
- `SpriteManager` centralizado con rutas para PMD SpriteCollab y Edición Reloaded, sprites individuales y sprite sheets.

## Sprites
Los sprites no se incluyen en este paquete. Añade únicamente archivos que tengas derecho a usar en:
- `assets/sprites/pmd/`
- `assets/sprites/reloaded/`

Edita `SPRITE_OVERRIDES` en `js/sprites.js` para enlazar nombres concretos. Ejemplo:

```js
25: {
  source: "pmd",
  normal: "pikachu.png",
  shiny: "pikachu_shiny.png",
  sheet: { frameWidth: 40, frameHeight: 40, frameCount: 4, fps: 8 }
}
```

Para sprite individual, omite `sheet`. Si el recurso no existe, el juego muestra un marcador `#ID`; nunca genera un Pokémon sustituto con figuras geométricas.

## Sobre el catálogo
El catálogo reserva y estructura 966 entradas, con regiones, tipos, rareza, estadísticas y claves de sprites. Los nombres se han rellenado solo para unas pocas especies conocidas; los demás quedan como `Pokémon #NNN` para no presentar datos inventados como oficiales. Sustituye `js/data.js` por un dataset completo verificado si necesitas nombres, tipos y estadísticas exactos.

## Alcance
Es una base jugable original inspirada en el género survivor-like, no una reproducción exacta del código, arte, balance ni contenido interno de pokesurvivor.com. No incluye assets propietarios de PMD SpriteCollab o Pokémon Edición Reloaded.
