import express from 'express';

import { env } from '../config/env.js';
import { checkHealth, initializeApplication } from '../logic/index.js';

/**
 * Punto de entrada de la capa UI.
 *
 * La UI nunca accede directamente a MariaDB ni a MinIO;
 * únicamente se comunica con la capa Logic.
 */
const app = express();
const port = env.PORT;

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
