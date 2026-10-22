import { app } from './src/server/app';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

// Serve static assets in production if dist exists
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.resolve(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>LabReserve API Server</title></head>
          <body style="font-family: sans-serif; padding: 2rem; background: #faf8ff; color: #131b2e;">
            <h1>LabReserve API Server</h1>
            <p>API endpoints running at <code>/api</code>.</p>
            <ul>
              <li><a href="/api/health">/api/health</a> - Status do Banco de Dados</li>
              <li><a href="/api/labs">/api/labs</a> - Salas e Laboratórios</li>
              <li><a href="/api/reservations">/api/reservations</a> - Reservas</li>
              <li><a href="/api/notifications">/api/notifications</a> - Notificações</li>
            </ul>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LabReserve Backend & API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
