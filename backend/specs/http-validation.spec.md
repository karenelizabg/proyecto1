# SPEC-VALID-001 ÔÇö Validaci├│n de la frontera HTTP con Zod

## Objetivo

Garantizar que **todo** dato que entra por HTTP (body, query params y route
params) se valide con Zod **antes** de alcanzar la capa de datos, y que los
errores devuelvan el c├│digo HTTP correcto con un mensaje accionable.

## Problema que resuelve

Antes de esta especificaci├│n, algunos datos externos llegaban a la capa Data
sin validar porque la firma de TypeScript declaraba un tipo que nadie
verificaba en tiempo de ejecuci├│n. Ejemplos reproducidos:

| Petici├│n                                          | Respuesta anterior                                | Problema                          |
|---------------------------------------------------|---------------------------------------------------|-----------------------------------|
| `POST /annotations` con `imageId: null`           | `404 La imagen con id null no existe.`            | `null` lleg├│ a la consulta SQL    |
| `POST /annotations` con `imageId: "no-soy-numero"`| `404 La imagen con id no-soy-un-numero no existe.`| String lleg├│ a la consulta SQL    |
| `POST /annotations` con body `{}`                 | `404 La imagen con id undefined no existe.`       | `undefined` lleg├│ a la consulta   |

Un dato mal formado debe producir `400 Bad Request` (petici├│n inv├ílida), no
`404 Not Found` (el recurso no existe), y el mensaje debe se├▒alar el campo.

## Reglas

1. **Todo body se parsea con Zod** antes de usarse. Ning├║n servicio recibe
   `req.body` con un tipo declarado sin verificar; los servicios aceptan
   `unknown` y hacen `safeParse`.
2. **Prohibido usar aserciones de tipo** (`as`) para describir datos externos.
   La forma de un dato externo se establece parseando, no afirmando.
3. **Los route params se validan con Zod.** Un `:id` no num├®rico, cero o
   negativo devuelve `400`.
4. **Los tipos se infieren del esquema** con `z.infer<>`; no se declaran
   interfaces duplicadas a mano para datos externos.
5. **Sem├íntica de errores:**
   - Dato mal formado o regla de negocio violada ÔåÆ `400 Bad Request`
   - Recurso inexistente (id v├ílido que no est├í en BD) ÔåÆ `404 Not Found`
   - Archivo que excede la cuota ÔåÆ `413 Payload Too Large`
6. La validaci├│n de forma ocurre **antes** de cualquier consulta a la base de
   datos o a MinIO.

## Taxonom├¡a de errores

Para que la capa UI no dependa de comparar cadenas de texto, la capa Logic
lanza errores tipados:

| Clase             | Significado                                | HTTP |
|-------------------|--------------------------------------------|------|
| `ValidationError` | Dato inv├ílido o regla de negocio violada   | 400  |
| `NotFoundError`   | El recurso no existe en la base de datos   | 404  |

La capa UI mapea la clase del error al c├│digo HTTP. No inspecciona mensajes.

## Fronteras cubiertas

| Frontera                          | Esquema Zod                | Ubicaci├│n                        |
|-----------------------------------|----------------------------|----------------------------------|
| Variables de entorno              | `envSchema`                | `src/config/env.ts`              |
| Archivo subido (MIME y tama├▒o)    | `imageUploadSchema`        | `image-upload.validation.ts`     |
| Body de `POST /annotations`       | `createAnnotationSchema`   | `annotation.validation.ts`       |
| Body de `PATCH /annotations/:id`  | `updateAnnotationSchema`   | `annotation.validation.ts`       |
| Body de `PATCH /images/:id/status`| `imageStatusSchema`        | `annotation.validation.ts`       |
| Query params de `GET /images`     | `imageSearchSchema`        | `annotation.validation.ts`       |
| Route param `:id`                 | `idParamSchema`            | `annotation.validation.ts`       |

## Flujo esperado

UI (dato crudo `unknown`) ÔåÆ Logic (`safeParse` + errores tipados) ÔåÆ Data
