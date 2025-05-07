// Script de démarrage pour le mode production
// Usage: node start-production.js

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de l'environnement pour contourner les problèmes de chemin
process.env.NODE_ENV = 'production';
process.env.APP_ROOT = __dirname;
process.env.STATIC_PATH = path.join(__dirname, 'dist');

// Vérification si le build existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('⚠️ Le dossier dist n\'existe pas. Veuillez exécuter npm run build d\'abord.');
  process.exit(1);
}

// Démarrer le serveur avec des variables d'environnement configurées
console.log('🚀 Démarrage d\'EcoTeam Challenge en mode production...');
console.log(`📂 Dossier racine: ${__dirname}`);
console.log(`📂 Dossier statique: ${process.env.STATIC_PATH}`);

const serverProcess = spawn('node', ['server/index.ts'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    FORCE_COLOR: '1',
    TS_NODE_TRANSPILE_ONLY: 'true'
  },
  stdio: 'inherit'
});

serverProcess.on('close', (code) => {
  console.log(`Le serveur s'est arrêté avec le code ${code}`);
  process.exit(code);
});

// Gestion des signaux pour arrêt gracieux
process.on('SIGINT', () => {
  console.log('\nArrêt du serveur...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nArrêt du serveur...');
  serverProcess.kill('SIGTERM');
});