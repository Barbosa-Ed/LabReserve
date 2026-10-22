import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes.ts';
import { initDatabase } from './db.ts';
import type { Plugin } from 'vite';

export const app = express();

app.use(cors());
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

// Initialize DB connection in background
initDatabase().catch((err) => {
  console.warn('Database initialization finished with message:', err.message);
});

/**
 * Vite plugin that mounts the Express app as middleware in Vite's development server.
 * This guarantees that `npm run dev` serves both the frontend and full REST backend seamlessly.
 */
export function expressPlugin(): Plugin {
  return {
    name: 'vite-express-backend',
    configureServer(server) {
      server.middlewares.use(app);
      console.log('⚡ LabReserve Express REST API mounted at /api on Vite dev server.');
    },
  };
}
