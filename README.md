# Image Annotation Repo

Monolito para un repositorio web de imágenes que, en fases posteriores, permitirá
subirlas, dibujar bounding boxes, clasificarlas por categoría y exportar el dataset
resultante a formato COCO JSON para entrenamiento de modelos (MLOps).

> **Este repositorio está actualmente en Fase 1 (Skeleton / Infrastructure).**
> Ver la sección [Qué incluye la Fase 1](#qué-incluye-la-fase-1) para el alcance exacto.

## Tecnologías utilizadas

- **TypeScript** (Node.js, ESM)
- **Express** — servidor HTTP mínimo de la capa UI
- **Drizzle ORM** + **mysql2** — acceso a datos
- **MariaDB** — base de datos
- **Drizzle Kit** — generación y ejecución de migrations
- **Biome** — linting y formatting
- **tsx** — ejecución/hot-reload en desarrollo

## Arquitectura

Monolito (no microservicios) con separación estricta de responsabilidades en 3 capas:

```
UI  →  Logic  →  Data  →  MariaDB
```

- **`src/ui`** — Presentación/servidor HTTP (Express). No accede a la base de datos
  directamente; solo puede importar de `logic`.
- **`src/logic`** — Reglas de negocio y validaciones. Es la única capa que puede
  importar de `data`. No contiene código específico de UI (nada de Express/HTTP).
- **`src/data`** — Drizzle ORM: conexión, schema y (en fases posteriores)
  repositorios/queries. Es el único punto de acceso a MariaDB.

Esta regla de dependencia (`ui → logic → data`, nunca al revés ni saltándose capas)
se mantiene incluso en esta fase, donde la única funcionalidad real es un healthcheck
que recorre las tres capas de punta a punta para validar que el esqueleto funciona.

## Estructura de carpetas

```
.
├── src/
│   ├── ui/
│   │   └── server.ts          # Servidor Express, endpoints HTTP
│   ├── logic/
│   │   ├── health.service.ts  # Lógica del healthcheck (UI → Logic → Data)
│   │   └── index.ts           # Barrel export de la capa
│   └── data/
│       ├── db/
│       │   ├── client.ts      # Conexión a MariaDB + instancia de Drizzle
│       │   ├── schema.ts      # Schema: images, categories, annotations
│       │   └── migrations/    # Migrations generadas por Drizzle Kit
│       └── index.ts           # Barrel export de la capa
├── drizzle.config.ts
├── biome.json
├── tsconfig.json
├── .env.example
└── package.json
```

## Instalación

```bash
npm install
```

## Configuración de `.env`

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Ajusta los valores según tu entorno local:

   | Variable       | Descripción                                                                 |
   |----------------|------------------------------------------------------------------------------|
   | `NODE_ENV`     | Entorno de ejecución (`development`, `production`, etc.)                    |
   | `PORT`         | Puerto en el que corre el servidor Express                                  |
   | `DATABASE_URL` | Cadena de conexión completa a MariaDB (`mysql://usuario:pass@host:puerto/db`) |
   | `DB_HOST`      | Host de MariaDB (alternativa a `DATABASE_URL` si prefieres variables sueltas) |
   | `DB_PORT`      | Puerto de MariaDB (por defecto `3306`)                                      |
   | `DB_USER`      | Usuario de la base de datos                                                 |
   | `DB_PASSWORD`  | Password del usuario                                                        |
   | `DB_NAME`      | Nombre de la base de datos                                                  |

   > El código actual (`src/data/db/client.ts` y `drizzle.config.ts`) usa
   > `DATABASE_URL`. Las variables `DB_*` sueltas quedan disponibles en `.env.example`
   > por si en un despliegue futuro prefieres construir la URL a partir de ellas.

**No subas tu `.env` real al repositorio** (ya está en `.gitignore`).

## Configurar MariaDB

Necesitas una instancia de MariaDB accesible (local, Docker, o remota) y una base de
datos vacía creada, por ejemplo:

```sql
CREATE DATABASE image_repo CHARACTER SET utf8mb4;
```

Con Docker, una opción rápida para desarrollo local:

```bash
docker run --name image-repo-mariadb \
  -e MARIADB_ROOT_PASSWORD=password \
  -e MARIADB_DATABASE=image_repo \
  -p 3306:3306 \
  -d mariadb:11
```

Luego apunta `DATABASE_URL` en tu `.env` a esa instancia.

## Ejecutar migrations

El schema vive en `src/data/db/schema.ts`. El flujo con Drizzle Kit es:

```bash
# 1. Generar los archivos SQL de migration a partir del schema
npm run db:generate

# 2. Aplicar las migrations pendientes contra la base de datos configurada en .env
npm run db:migrate
```

Ya existen migrations generadas en `src/data/db/migrations/`:

- `0000_*.sql` — crea las tablas `images`, `categories` y `annotations`.
- `0001_*.sql` — agrega la columna `iscrowd` a `annotations` (flag de COCO para
  marcar si un bounding box es un objeto individual o un grupo superpuesto).

Solo necesitas ejecutar `npm run db:migrate` contra tu MariaDB para aplicarlas
todas en orden.

Scripts adicionales disponibles:

- `npm run db:push` — sincroniza el schema directamente sin generar archivos de
  migration (útil en desarrollo temprano).
- `npm run db:studio` — abre Drizzle Studio para explorar la base de datos.

## Ejecutar el proyecto

```bash
# Modo desarrollo (hot reload con tsx)
npm run dev

# Build de producción
npm run build
npm start
```

El servidor expone:

- `GET /` — información básica del proyecto/fase.
- `GET /health` — healthcheck que verifica la conexión a MariaDB (recorre
  `ui → logic → data`).

## Ejecutar Biome

```bash
npm run lint         # revisar (lint + formato)
npm run lint:fix      # revisar y corregir automáticamente lo que se pueda
npm run format        # solo formatear
npm run typecheck     # compilar TypeScript sin generar archivos (validación)
```

## Qué incluye la Fase 1

- Configuración de TypeScript, Biome, `.env`/`.env.example` y scripts de npm.
- Esqueleto del monolito con capas `src/ui`, `src/logic`, `src/data` y la regla de
  dependencia `UI → Logic → Data` (sin acceso directo de UI a la base de datos).
- Conexión a MariaDB configurada con Drizzle ORM (`mysql2`).
- Schema de base de datos con 3 tablas mínimas y razonables:
  - `images` — metadata de imágenes (nombre, referencia de storage, dimensiones, etc.)
  - `categories` — categorías/clases para anotar
  - `annotations` — bounding boxes, relacionados con una imagen y una categoría, con
    los campos necesarios para una futura exportación a COCO (`bbox_x`, `bbox_y`,
    `bbox_width`, `bbox_height`, `area`, `iscrowd`)
- Migration inicial generada y lista para aplicarse.
- Un endpoint `GET /health` como única "funcionalidad" real, usado únicamente para
  validar que el flujo UI → Logic → Data → MariaDB funciona de punta a punta.

## Qué NO está implementado todavía

Estas funcionalidades pertenecen a fases posteriores y **no** están incluidas:

- Integración con MinIO
- Endpoint de subida de imágenes
- Seeder de datos
- Interfaz para subir imágenes
- Herramienta para dibujar bounding boxes
- Asignación de categorías desde la UI
- Exportación a formato COCO JSON
- Generación/paquetizado del training dataset
- Preparación para MLOps
