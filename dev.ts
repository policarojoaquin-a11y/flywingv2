import express from 'express';
import { setupServer } from './server.ts';

const app = express();
const PORT = 3000;

setupServer(app).then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- AI STUDIO DEV SERVER ---`);
    console.log(`Port: ${PORT}`);
    console.log(`----------------------------`);
  });
}).catch(err => {
  console.error("Failed to start dev server:", err);
  process.exit(1);
});
