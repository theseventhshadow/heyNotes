# heyNotes

Estructura base para una Single Page Application (SPA) con JavaScript vanilla y Vite.

La aplicación usa funciones serverless de Vercel y MongoDB Atlas para almacenar usuarios, sesiones y notas.

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
api/
  auth/         Registro, login, sesion y logout
  notes/        CRUD de notas autenticadas
  _lib/         Conexion MongoDB y sesiones
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## MongoDB Atlas y Vercel

1. Crea un cluster gratuito en MongoDB Atlas.
2. Crea un usuario de base de datos y permite la conexión desde Vercel.
3. En Vercel configura estas variables de entorno para `Development`, `Preview` y `Production`:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=heynotes
```

`MONGODB_URI` no debe añadirse al repositorio ni exponerse con variables `VITE_*`. Las contraseñas se guardan como hashes bcrypt y las sesiones se mantienen en cookies `HttpOnly`.
