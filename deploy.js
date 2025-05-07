// Script de déploiement personnalisé pour EcoTeam Challenge
// Ce script contourne les problèmes de chemin dans la version compilée

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Préparation du déploiement EcoTeam Challenge...');

// 1. Construction du frontend
console.log('🔨 Construction du frontend...');
execSync('vite build', { stdio: 'inherit' });

// 2. Préparation du dossier dist
console.log('🗂️ Préparation des dossiers...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// 3. Construction du serveur avec configuration spéciale
console.log('🔨 Construction du serveur...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

// 4. Création d'un wrapper pour le serveur
console.log('🔧 Création du wrapper de démarrage...');
const serverWrapper = `
// Wrapper pour le serveur EcoTeam Challenge
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Polyfills pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
globalThis.__dirname = __dirname;
globalThis.__filename = __filename;

// Fixer les chemins pour l'environnement de production
process.env.STATIC_PATH = path.resolve(__dirname, '../dist/client');
if (!fs.existsSync(process.env.STATIC_PATH)) {
  process.env.STATIC_PATH = path.resolve(__dirname, '../client/dist');
}
if (!fs.existsSync(process.env.STATIC_PATH)) {
  process.env.STATIC_PATH = path.resolve(__dirname, 'public');
}
if (!fs.existsSync(process.env.STATIC_PATH)) {
  process.env.STATIC_PATH = path.resolve(__dirname, '../public');
}

// Lancer le serveur
import './index.js';
`;

fs.writeFileSync('dist/server.js', serverWrapper);

console.log('✅ Déploiement préparé avec succès !');
console.log('');
console.log('Pour démarrer l\'application:');
console.log('NODE_ENV=production node dist/server.js');