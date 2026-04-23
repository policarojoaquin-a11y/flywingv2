import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('=== app.js iniciado ===');
console.log('dist existe:', existsSync('./dist'));
console.log('dist/server-core.js existe:', existsSync('./dist/server-core.js'));

if (!existsSync('./dist/server-core.js')) {
  console.log('Corriendo build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completado');
  } catch (e) {
    console.error('Error en build:', e.message);
    process.exit(1);
  }
}

console.log('Importando servidor...');
import('./dist/server-core.js').catch(e => {
  console.error('Error al importar servidor:', e);
  process.exit(1);
});
