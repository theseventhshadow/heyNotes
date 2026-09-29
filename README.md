# heyNotes

Estructura base para una Single Page Application (SPA) con JavaScript vanilla y Vite.

## Principios

- Separacion de responsabilidades por capas.
- Componentes reutilizables e independientes.
- Vistas enfocadas en composicion de UI.
- Servicios aislados para acceso a datos.
- Estado y persistencia encapsulados.
- Enrutamiento SPA sin acoplar las vistas al punto de entrada.

## Estructura

```text
src/
  components/   Componentes reutilizables de interfaz
  router/       Enrutamiento y navegacion
  services/     Acceso a datos y APIs
  state/        Estado global de la aplicacion
  styles/       Reset, variables y estilos globales
  utils/        Funciones auxiliares
  views/        Paginas o vistas de la SPA
  main.js       Composicion e inicializacion de la aplicacion
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```
