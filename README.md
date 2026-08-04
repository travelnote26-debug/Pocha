# Apuntator Web

Versión web del anotador de **Pocha** (Apuntator). Aplicación responsive que funciona en cualquier smartphone, instalable como app (PWA) y 100% local: los datos se guardan en el navegador.

## Requisitos

- Node.js 18+ y npm
- Python 3 (solo para regenerar los iconos: `npm run icons`)

## Instalación y desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run test       # tests unitarios de la lógica de puntuación y rondas
npm run build      # build de producción en dist/
npm run preview    # sirve el build para probarlo
```

Para probarlo en el móvil por red local durante el desarrollo:

```bash
npm run dev -- --host
# abre en el teléfono: http://<IP-de-tu-ordenador>:5173
```

## Verificación del flujo completo

```bash
npm run build
npm run preview    # en otra terminal
npm run smoke      # prueba el flujo entero con un navegador real (Playwright/Firefox)
```

## Despliegue

La carpeta `dist/` es una web estática con PWA (manifest + service worker). Puedes subirla a cualquier hosting estático:

- **Netlify / Vercel / Cloudflare Pages**: arrastra y suelta `dist/` (o conecta el repo) y queda publicado con una URL accesible desde cualquier móvil.
- **GitHub Pages**: si se publica en un subdirectorio (`usuario.github.io/repo`), añade `base: '/repo/'` en `vite.config.ts` antes de `npm run build`.

Tras publicar, en el móvil se puede abrir la URL y elegir *"Añadir a pantalla de inicio"* para instalarla como app (funciona offline).

## Estructura

```
src/
  domain/       lógica de negocio (modelos, fases, puntuación, rondas)
  data/         persistencia en localStorage
  state/        stores Zustand (equivalentes a los ViewModels)
  components/   componentes reutilizables
  pages/        pantallas (Home, Jugadores, Nueva Partida, Partida, Resultados)
  theme/        tema MUI verde fieltro + oro
scripts/        generación de iconos y smoke test
test/           tests unitarios de la lógica
```

## Reglas de juego implementadas (idénticas a la app Android)

- Fases: **Subida** (1→N), **Ronda arriba** (N rondas con todas las cartas), **Bajada** (N→1). Las cartas máximas son 40 / nº de jugadores.
- Puntuación: acierto = 10 + 5·bazas; fallo = −5·|pred−real|; **Pocha x2** duplica si se cogen todas las bazas (con más de 1 carta).
- Predicciones: la suma no puede ser igual a las cartas de la ronda. Bazas reales: la suma debe ser exacta.
- El repartidor rota cada ronda y el orden de juego empieza por el siguiente a la mesa.
- Las partidas en curso se guardan y se pueden retomar.
