import { execSync } from 'child_process';
import { existsSync } from 'fs';

if (!existsSync('./dist/server-core.js')) {
  console.log('Building...');
  execSync('npm run build', { stdio: 'inherit' });
}

import('./dist/server-core.js').catch(e => {
  console.error('Error al iniciar servidor:', e);
  process.exit(1);
});
