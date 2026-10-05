# PomoPets

PomoPets está organizado como un monorepo sencillo:

```text
frontend/   Aplicación Expo (iOS, Android y web)
backend/    Espacio reservado para una API; actualmente no hay servidor
```

## Desarrollo local

```bash
cd frontend
npm install
npm run web
```

Para comprobar la compilación web de producción:

```bash
cd frontend
npm run build:web
```

## Publicar en Vercel

1. Importa el repositorio conectado a GitHub en Vercel.
2. Deja **Root Directory** en la raíz del repositorio (`./`).
3. Vercel usará `vercel.json` para instalar las dependencias del frontend, compilar con `npm run build:web` y publicar `frontend/dist`.
4. Haz un nuevo push; Vercel ejecutará el despliegue automáticamente.

La app guarda su estado localmente y no requiere backend para esta publicación. Si más adelante se agrega una API, `backend/` puede desplegarse como un proyecto independiente de Vercel.
