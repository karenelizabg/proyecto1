import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import {
  checkHealth,
  createAnnotationForImage,
  deleteAnnotation,
  deleteImage,
  getAnnotationsForImage,
  getCategories,
  getImageFile,
  initializeApplication,
  searchImages,
  setImageStatus,
  updateAnnotation,
  uploadImage,
} from '../logic/index.js';

const IMAGE_STATUS_VALUES = ['pending', 'in_progress', 'completed'] as const;
type ImageStatusParam = (typeof IMAGE_STATUS_VALUES)[number];

function isImageStatus(value: unknown): value is ImageStatusParam {
  return typeof value === 'string' && (IMAGE_STATUS_VALUES as readonly string[]).includes(value);
}

/**
 * Punto de entrada de la capa UI.
 *
 * La UI nunca accede directamente a MariaDB ni a MinIO;
 * únicamente se comunica con la capa Logic.
 */
const app = express();
const port = env.PORT;

app.use(express.json());

/**
 * Multer mantiene temporalmente la imagen en memoria.
 * El archivo real posteriormente se almacena en MinIO.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
  },
});

app.get('/', (_req, res) => {
  res.json({
    project: 'image-annotation-repo',
    phase: 2,
    message: 'UI → Logic → Data funcionando.',
  });
});

app.get('/health', async (_req, res) => {
  const health = await checkHealth();

  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

/**
 * Recibe una imagen y delega su procesamiento a Logic.
 */
app.post('/images', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      error: 'Debe enviarse una imagen.',
    });
    return;
  }

  try {
    const image = await uploadImage({
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      buffer: req.file.buffer,
    });

    // El body va plano (sin wrapper), así coincide con el contrato que
    // espera el frontend (imageUploadResponseSchema): id, filename,
    // storageKey, width, height directamente en la raíz.
    res.status(201).json(image);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al cargar la imagen.';

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * Busca imágenes paginadas, opcionalmente filtradas por status.
 */
app.get('/images/search', async (req, res) => {
  // Acepta uno o varios status separados por coma, p. ej.
  // "?status=pending,in_progress" (usado por la cola de "pendientes por
  // anotar", que debe seguir mostrando una imagen mientras no esté
  // completada, no solo mientras está "pending").
  const rawStatus = req.query.status;
  const statusValues = rawStatus === undefined ? [] : String(rawStatus).split(',');

  if (statusValues.some((value) => !isImageStatus(value))) {
    res.status(400).json({
      error: 'El parámetro status debe ser "pending", "in_progress" o "completed".',
    });
    return;
  }

  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(String(req.query.pageSize ?? '50'), 10) || 50),
  );

  const result = await searchImages({
    status: statusValues.length > 0 ? (statusValues as ImageStatusParam[]) : undefined,
    page,
    pageSize,
  });

  res.status(200).json(result);
});

/**
 * Elimina una imagen (registro + archivo en MinIO + sus anotaciones).
 */
app.delete('/images/:imageId', async (req, res) => {
  const imageId = Number.parseInt(req.params.imageId, 10);
  if (Number.isNaN(imageId)) {
    res.status(400).json({ error: 'ID de imagen inválido.' });
    return;
  }

  try {
    await deleteImage(imageId);
    res.status(204).end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar la imagen.';
    res.status(404).json({ error: message });
  }
});

/**
 * Sirve el binario de una imagen desde MinIO.
 */
app.get('/images/:imageId/file', async (req, res) => {
  const imageId = Number.parseInt(req.params.imageId, 10);
  if (Number.isNaN(imageId)) {
    res.status(400).json({ error: 'ID de imagen inválido.' });
    return;
  }

  const file = await getImageFile(imageId);
  if (!file) {
    res.status(404).json({ error: 'Imagen no encontrada.' });
    return;
  }

  res.setHeader('Content-Type', file.mimeType);
  file.stream.on('error', () => res.destroy());
  file.stream.pipe(res);
});

/**
 * Cambia el status de una imagen.
 */
app.patch('/images/:imageId/status', async (req, res) => {
  const imageId = Number.parseInt(req.params.imageId, 10);
  const status = req.body?.status;

  if (Number.isNaN(imageId) || (status !== 'in_progress' && status !== 'completed')) {
    res.status(400).json({ error: 'Solicitud inválida.' });
    return;
  }

  try {
    await setImageStatus(imageId, status);
    res.status(204).end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el status.';
    res.status(400).json({ error: message });
  }
});

/**
 * Lista/crea anotaciones de una imagen.
 */
app.get('/images/:imageId/annotations', async (req, res) => {
  const imageId = Number.parseInt(req.params.imageId, 10);
  if (Number.isNaN(imageId)) {
    res.status(400).json({ error: 'ID de imagen inválido.' });
    return;
  }

  const annotations = await getAnnotationsForImage(imageId);
  res.status(200).json(annotations);
});

app.post('/images/:imageId/annotations', async (req, res) => {
  const imageId = Number.parseInt(req.params.imageId, 10);
  if (Number.isNaN(imageId)) {
    res.status(400).json({ error: 'ID de imagen inválido.' });
    return;
  }

  try {
    const created = await createAnnotationForImage(imageId, req.body);
    res.status(201).json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear la anotación.';
    res.status(400).json({ error: message });
  }
});

/**
 * Actualiza o elimina una anotación existente.
 */
app.patch('/annotations/:annotationId', async (req, res) => {
  const annotationId = Number.parseInt(req.params.annotationId, 10);
  if (Number.isNaN(annotationId)) {
    res.status(400).json({ error: 'ID de anotación inválido.' });
    return;
  }

  try {
    const updated = await updateAnnotation(annotationId, req.body);
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la anotación.';
    res.status(400).json({ error: message });
  }
});

app.delete('/annotations/:annotationId', async (req, res) => {
  const annotationId = Number.parseInt(req.params.annotationId, 10);
  if (Number.isNaN(annotationId)) {
    res.status(400).json({ error: 'ID de anotación inválido.' });
    return;
  }

  await deleteAnnotation(annotationId);
  res.status(204).end();
});

/**
 * Lista las categorías disponibles.
 */
app.get('/categories', async (_req, res) => {
  const categories = await getCategories();
  res.status(200).json(categories);
});

/**
 * Maneja errores generados por Multer.
 */
app.use(
  (error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          error: 'La imagen excede el tamaño máximo permitido.',
        });
        return;
      }

      res.status(400).json({
        error: 'No se pudo procesar el archivo.',
      });
      return;
    }

    next(error);
  },
);

/**
 * Inicializa los servicios necesarios antes de levantar el servidor.
 */
async function startServer(): Promise<void> {
  await initializeApplication();

  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exit(1);
});
