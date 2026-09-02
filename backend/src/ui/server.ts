import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { checkHealth, initializeApplication, searchImages, uploadImage } from '../logic/index.js';

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
  const statusParam = req.query.status;

  if (statusParam !== undefined && !isImageStatus(statusParam)) {
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
    status: statusParam,
    page,
    pageSize,
  });

  res.status(200).json(result);
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
