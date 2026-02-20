# Cavea

**Cavea** est une application de gestion de cave à vin permettant aux amateurs et collectionneurs de suivre leur inventaire de bouteilles. Elle est composée d'un backend Laravel et d'une application mobile React Native.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes utiles](#commandes-utiles)
- [API](#api)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [CI/CD](#cicd)
- [Version](#version)

---

## Fonctionnalités

- Inscription et authentification des utilisateurs (token-based via Sanctum)
- Ajout, modification et suppression de bouteilles dans sa cave
- Suivi des stocks (incrémentation / décrémentation)
- Tableau de bord avec statistiques (stock total, répartition par couleur, ajouts récents)
- Filtrage des vins par couleur et par région
- Fiches détaillées : domaine, appellation, millésime, cépages, région
- Notes de dégustation
- Indicateur de connectivité réseau dans l'application mobile

---

## Architecture

```
cavea/
├── cavea-back/       # API REST Laravel (PHP 8.3)
├── cavea-front/      # Application mobile Expo / React Native
├── .github/
│   └── workflows/    # Pipelines CI/CD GitHub Actions
├── DEVOPS_README.md  # Documentation infrastructure
├── VERSION           # Version courante du projet
└── dockerfile        # Image Docker du backend
```

---

## Technologies

### Backend

| Technologie     | Version  |
|-----------------|----------|
| PHP             | 8.3      |
| Laravel         | 12.0     |
| FrankenPHP      | 1        |
| MySQL           | 8.0      |
| Laravel Sanctum | 4.0      |
| PHPUnit         | 11.5     |
| PHP CS Fixer    | 3.86     |

### Frontend

| Technologie      | Version  |
|------------------|----------|
| React Native     | 0.81.4   |
| Expo             | Latest   |
| TypeScript       | 5.9.2    |
| React            | 19.1.0   |
| NativeWind       | 4.1.23   |
| Tailwind CSS     | 3.4.17   |
| Jest             | 54.0     |
| Expo Router      | 6.0.7    |

### Infrastructure

- **Conteneurisation** : Docker
- **Orchestration** : Kubernetes (Azure AKS)
- **Déploiement** : Helm Charts
- **CI/CD** : GitHub Actions
- **Qualité du code** : SonarQube
- **Ingress** : Traefik + Let's Encrypt (TLS)

---

## Prérequis

- PHP >= 8.3 + Composer
- Node.js >= 22.16.0 + npm
- MySQL 8.0
- Docker (optionnel)
- Expo CLI (`npm install -g expo-cli`)

---

## Installation

### Backend

```bash
cd cavea-back

# Installer les dépendances PHP
composer install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate

# Lancer les migrations
php artisan migrate

# Démarrer le serveur de développement
php artisan serve
```

### Frontend

```bash
cd cavea-front

# Installer les dépendances NPM
npm install

# Démarrer le serveur Expo
npm start

# Ou cibler une plateforme spécifique
npm run android
npm run ios
npm run web
```

---

## Variables d'environnement

Copiez `.env.example` à la racine et dans `cavea-back/` et renseignez les valeurs :

| Variable          | Description                           |
|-------------------|---------------------------------------|
| `APP_NAME`        | Nom de l'application                  |
| `APP_ENV`         | Environnement (`local`, `production`) |
| `APP_URL`         | URL de base de l'API                  |
| `DB_HOST`         | Hôte MySQL                            |
| `DB_PORT`         | Port MySQL (défaut : 3306)            |
| `DB_DATABASE`     | Nom de la base de données             |
| `DB_USERNAME`     | Utilisateur MySQL                     |
| `DB_PASSWORD`     | Mot de passe MySQL                    |
| `NODE_VERSION`    | Version Node.js utilisée              |
| `LARAVEL_VERSION` | Version Laravel utilisée              |

---

## Commandes utiles

### Backend

```bash
# Linting (vérification)
composer lint

# Linting (correction automatique)
composer lint:fix

# Tests unitaires
composer test

# Migrations
php artisan migrate

# Logs en temps réel
php artisan pail
```

### Frontend

```bash
# Lancement en développement
npm start

# Tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
```

### Docker

```bash
# Build de l'image backend
docker build -t cavea-back:local .

# Lancement du conteneur
docker run -p 8000:80 cavea-back:local
```

---

## API

L'API REST est servie à l'adresse :
- **Dev** : `https://api-dev.cavea.ovh`
- **Prod** : `https://api.cavea.ovh`

### Authentification

| Méthode | Endpoint        | Description |
|---------|-----------------|-------------|
| POST    | `/api/register` | Inscription |
| POST    | `/api/login`    | Connexion   |
| POST    | `/api/logout`   | Déconnexion |

### Gestion de la cave

| Méthode | Endpoint                              | Description                  |
|---------|---------------------------------------|------------------------------|
| GET     | `/api/cellar-items`                   | Liste des vins               |
| GET     | `/api/cellar-items/{id}`              | Détail d'un vin              |
| GET     | `/api/cellar-items/last`              | Dernier vin ajouté           |
| GET     | `/api/cellar-items/total-stock`       | Stock total                  |
| GET     | `/api/cellar-items/stock-by-colour`   | Stock par couleur            |
| GET     | `/api/cellar-items/colour/{colourId}` | Vins filtrés par couleur     |
| GET     | `/api/cellar-items/region/{regionId}` | Vins filtrés par région      |
| POST    | `/api/cellar-items`                   | Ajouter un vin               |
| PUT     | `/api/cellar-items/{id}`              | Modifier un vin              |
| POST    | `/api/cellar-items/{id}/increment`    | Incrémenter le stock         |
| POST    | `/api/cellar-items/{id}/decrement`    | Décrémenter le stock         |
| DELETE  | `/api/cellar-items/{id}`              | Supprimer un vin             |

> Toutes les routes (hors authentification) nécessitent un token Bearer Sanctum.

---

## Tests

### Backend (PHPUnit)

```bash
cd cavea-back
composer test
```

### Frontend (Jest)

```bash
cd cavea-front
npm test
```

---

## Déploiement

Le déploiement s'effectue via Helm sur un cluster Azure AKS.

```bash
# Base de données
helm upgrade database ./cavea-back/k8s_helm/database \
  -f ./cavea-back/k8s_helm/database/values_dev.yaml \
  --namespace cavea-back-dev --install

# Backend
helm upgrade back ./cavea-back/k8s_helm/backend \
  -f ./cavea-back/k8s_helm/backend/values_dev.yaml \
  --namespace cavea-back-dev --install
```

| Environnement | Branche | Namespace       | URL                       | Réplicas |
|---------------|---------|-----------------|---------------------------|----------|
| Dev           | dev     | cavea-back-dev  | https://api-dev.cavea.ovh | 1        |
| Prod          | main    | cavea-back-prod | https://api.cavea.ovh     | 2        |

Pour plus de détails, consulter [DEVOPS_README.md](./DEVOPS_README.md).

---

## CI/CD

Les pipelines GitHub Actions déclenchent automatiquement :

1. **Lint** — Vérification du style PHP (PHP CS Fixer)
2. **Tests backend** — PHPUnit avec couverture de code
3. **Tests frontend** — Jest
4. **SonarQube** — Analyse de la qualité du code
5. **Versioning** — Incrémentation automatique de `VERSION` sur `main`
6. **Docker Build** — Construction et push sur DockerHub
7. **Déploiement Kubernetes** — Mise à jour du cluster AKS

---

## Version

Version courante : **0.0.15**

Voir le fichier [VERSION](./VERSION).
