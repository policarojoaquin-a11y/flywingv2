import express from 'express';
import { setupServer } from './dist/server-core.js';

const app = express();

setupServer(app).then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
