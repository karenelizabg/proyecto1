import 'dotenv/config';
import express from 'express';
import { checkHealth } from '../logic/index.js';

/**
 * Punto de entrada de la capa UI.
 *
 * Responsabilidad: presentación/interfaz (en fases posteriores, subida
 * de imágenes y anotación). Esta capa NUNCA debe importar directamente
 * desde `data`; solo debe hablar con `logic`.
 *
 * En esta fase el único endpoint real es un healthcheck, usado para
 * validar que el flujo UI → Logic → Data → MariaDB funciona de punta
 * a punta. No hay rutas de subida, anotación ni exportación todavía.
 */
const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get('/', (_req, res) => {
  res.json({
    project: 'image-annotation-repo',
    phase: 1,
    message: 'Skeleton UI → Logic → Data funcionando.',
  });
});

app.get('/health', async (_req, res) => {
  const health = await checkHealth();
  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
