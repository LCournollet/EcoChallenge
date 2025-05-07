#!/bin/bash
# Script pour lancer EcoTeam Challenge en production

echo "🚀 Démarrage d'EcoTeam Challenge en production..."

# Construction du frontend
echo "📦 Construction du frontend..."
npm run build

# Exécution du serveur customisé pour la production
echo "🔌 Démarrage du serveur..."
NODE_ENV=production node prod-server.js