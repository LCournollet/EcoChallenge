#!/bin/bash
# Solution la plus simple pour lancer EcoTeam Challenge en production
# Cette méthode utilise tsx qui peut exécuter directement le code TypeScript

echo "🚀 Démarrage d'EcoTeam Challenge en mode production..."

# Créer d'abord le build du frontend
echo "📦 Construction du frontend..."
npx vite build

# Définir l'environnement de production
export NODE_ENV=production

# Exécuter le serveur TypeScript directement avec tsx
echo "🔌 Démarrage du serveur..."
npx tsx server/index.ts