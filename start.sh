#!/bin/bash
# Script de démarrage pour EcoTeam Challenge

echo "🚀 Démarrage de EcoTeam Challenge..."

# Vérifier si le build existe
if [ ! -d "./dist" ]; then
  echo "📦 Création du build de production..."
  npm run build
fi

# Démarrer le serveur
echo "🔌 Démarrage du serveur..."
NODE_ENV=production node server.js