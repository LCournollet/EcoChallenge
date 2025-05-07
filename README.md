# EcoTeam Challenge

Application de quiz écologique en équipe inspirée de Kahoot.

## Prérequis

- Node.js v18 ou supérieur
- npm v8 ou supérieur

## Installation

```bash
# Cloner le dépôt (si vous utilisez git)
git clone [url-du-repo]
cd ecoteam-challenge

# Installer les dépendances
npm install
```

## Exécution en développement

```bash
npm run dev
```

L'application sera accessible à l'adresse http://localhost:5000.

## Exécution en production

### Solution recommandée

Utilisez le script `run-prod.sh` qui évite les problèmes de compilation :

```bash
./run-prod.sh
```

Ce script va :
1. Construire l'application frontend
2. Démarrer le serveur en mode production sans compilation

### Alternative 1 : Utilisation de prod-server.js

```bash
# Construire l'application
npm run build

# Démarrer le serveur personnalisé
NODE_ENV=production node prod-server.js
```

### Alternative 2 : Script de démarrage en production

```bash
./start-prod.sh
```

## Fonctionnalités

- Quiz environnemental en temps réel
- Jeu en équipes
- 20 questions prédéfinies sur le thème de l'environnement
- Interface entièrement en français
- Classement et statistiques en fin de partie

## Structure du projet

- `/client` : Application frontend React
- `/server` : Serveur Express et logique métier
- `/shared` : Types et schémas partagés entre client et serveur

## Déploiement sur Replit

1. Cliquez sur le bouton "Deploy" en haut de l'interface Replit
2. Suivez les instructions à l'écran
3. L'application sera accessible via l'URL fournie par Replit

## Dépannage

Si vous rencontrez des erreurs lors du démarrage avec `npm start`, utilisez l'une des méthodes alternatives décrites ci-dessus.

L'erreur `The "paths[0]" argument must be of type string. Received undefined` est causée par un problème de chemin dans la version compilée. Nos scripts alternatifs contournent ce problème.