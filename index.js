/**
 * Entry file for Hostinger Node.js (Express)
 */
import express from 'express';

// Force production environment
process.env.NODE_ENV = 'production';

// Import the actual compiled server
import('./dist/server.js').catch(err => {
  console.error("Build folder 'dist' not found yet. Starting minimal server for Hostinger validation.");
  
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  app.get('*', (req, res) => {
    res.send('Servidor Flywing en espera de compilación. Por favor, ejecuta "npm run build" en el panel de Hostinger.');
  });
  
  app.listen(PORT, () => {
    console.log(`Minimal server running on port ${PORT}`);
  });
});
