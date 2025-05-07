// Serveur de production EcoTeam Challenge
// Exécutez ce fichier avec: NODE_ENV=production node server.js

import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importation des définitions de jeu et stockage
import { storage } from './server/storage.js';
import { handleSocketConnection } from './server/sockets.js';

const app = express();
app.use(express.json());

// Création du serveur HTTP
const server = createServer(app);

// Configuration WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', handleSocketConnection);

// Servir les fichiers statiques du build
const distPath = path.join(__dirname, 'dist', 'assets');
if (fs.existsSync(distPath)) {
  console.log(`Serving static files from: ${distPath}`);
  app.use('/assets', express.static(distPath));
}

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Route fallback pour SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur EcoTeam Challenge en cours d'exécution sur le port ${PORT}`);
  console.log(`📱 Application accessible sur http://localhost:${PORT}`);
});