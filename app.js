import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correr npm run build si la carpeta dist/ no existe
if (!existsSync('./dist')) {
  console.log('Building for Hostinger...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Importar y arrancar el servidor desde dist/server-core.js
console.log('Starting production server...');
import('./dist/server-core.js');
