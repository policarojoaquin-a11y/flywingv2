import express from 'express';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// --- AUTO-BUILD LOGIC FOR HOSTINGER ---
if (!existsSync('./dist')) {
  console.log('Carpeta dist/ no encontrada. Iniciando build en Hostinger...');
  try {
    // Instalamos dependencias por las dudas y corremos el build
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completado con éxito.');
  } catch (err) {
    console.error('Error durante el build:', err);
    process.exit(1);
  }
}

// --- START SERVER ---
const startServer = async () => {
  try {
    const { setupServer } = await import('./dist/server-core.js');
    const app = express();
    
    await setupServer(app);
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor Flywing corriendo en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor desde dist/server-core.js:', err);
    process.exit(1);
  }
};

startServer();
