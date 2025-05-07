// Script simplifié pour exécuter l'application en production
// Usage: node production.js

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Préparation d\'EcoTeam Challenge pour le mode production...');

// Vérifier si le build existe déjà
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'server', 'public');

if (!fs.existsSync(distPath)) {
  console.log('📦 Construction du client...');
  try {
    // Construire uniquement le client (frontend)
    execSync('vite build', { stdio: 'inherit' });
    
    // Créer le dossier public dans server s'il n'existe pas
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    // Copier les fichiers du build vers server/public
    console.log('📂 Copie des fichiers du build vers server/public...');
    execSync(`cp -r ${distPath}/* ${publicPath}/`, { stdio: 'inherit' });
    
    console.log('✅ Construction terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la construction :', error);
    process.exit(1);
  }
} else {
  console.log('✅ Le build existe déjà, utilisation du build existant...');
  // S'assurer que les fichiers sont copiés dans server/public
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    execSync(`cp -r ${distPath}/* ${publicPath}/`, { stdio: 'inherit' });
  }
}

// Configuration de l'environnement
process.env.NODE_ENV = 'production';

console.log('🔌 Démarrage du serveur en mode production...');

// Démarrer le serveur avec tsx (qui peut exécuter directement TypeScript)
const serverProcess = spawn('tsx', ['server/index.ts'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    FORCE_COLOR: '1'
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