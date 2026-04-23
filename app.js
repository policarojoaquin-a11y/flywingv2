/**
 * Entry file for Hostinger Node.js
 * Optimized for Express recognition
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico para que Hostinger lo vea como Express
app.use(express.json());

// Intentar cargar la lógica del servidor real de forma segura
async function start() {
  try {
    // Si ya existe el build, lo cargamos
    const { setupServer } = await import('./dist/server-core.js');
    setupServer(app);
  } catch (err) {
    console.log("Aún no se ha realizado el build. Mostrando página de espera.");
    app.get('*', (req, res) => {
      res.send('<h1>Servidor Flywing</h1><p>Por favor, ejecuta <b>npm run build</b> en tu panel de Hostinger para finalizar la instalación.</p>');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
