// Wrapper pour lancer l'application EcoTeam Challenge en production
// Usage: NODE_ENV=production node prod-server.js

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Définir les polyfills pour les chemins ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
globalThis.__dirname = __dirname;
globalThis.__filename = __filename;

// Configuration de l'environnement
process.env.NODE_ENV = 'production';

// Importer les composants serveur
import { storage } from './server/storage.js';
import { handleSocketConnection } from './server/sockets.js';

// Capture d'erreur pour le débogage
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Créer l'application Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Créer le serveur HTTP
const server = createServer(app);

// Configuration WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', handleSocketConnection);

// Routes API (à personnaliser selon votre application)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Servir les fichiers statiques
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
}

// Route fallback pour SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur EcoTeam Challenge en cours d'exécution sur le port ${PORT}`);
});