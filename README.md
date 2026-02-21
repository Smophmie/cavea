# Cavea

**Cavea** is a wine cellar management application that allows wine enthusiasts and collectors to track their bottle inventory. It consists of a Laravel REST API backend and a React Native mobile application.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [Useful Commands](#useful-commands)
- [API](#api)
- [Tests](#tests)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Version](#version)

---

## Features

- User registration and authentication (token-based via Sanctum)
- Add, update, and delete bottles from your cellar
- Stock tracking (increment / decrement)
- Dashboard with statistics (total stock, breakdown by color, recently added)
- Filter wines by color and region
- Detailed wine sheets: domain, appellation, vintage, grape varieties, region
- Tasting notes
- Network connectivity indicator in the mobile app

---

## Architecture

```
cavea/
├── cavea-back/       # Laravel REST API (PHP 8.3)
├── cavea-front/      # Expo / React Native mobile app
├── .github/
│   └── workflows/    # GitHub Actions CI/CD pipelines
├── DEVOPS_README.md  # Infrastructure documentation
├── VERSION           # Current project version
└── dockerfile        # Backend Docker image
```

---

## Technologies

### Backend

| Technology      | Version |
|-----------------|---------|
| PHP             | 8.3     |
| Laravel         | 12.0    |
| FrankenPHP      | 1       |
| MySQL           | 8.0     |
| Laravel Sanctum | 4.0     |
| PHPUnit         | 11.5    |
| PHP CS Fixer    | 3.86    |

### Frontend

| Technology   | Version |
|--------------|---------|
| React Native | 0.81.4  |
| Expo         | Latest  |
| TypeScript   | 5.9.2   |
| React        | 19.1.0  |
| NativeWind   | 4.1.23  |
| Tailwind CSS | 3.4.17  |
| Jest         | 54.0    |
| Expo Router  | 6.0.7   |

### Infrastructure

- **Orchestration**: Kubernetes (Azure AKS)
- **Deployment**: Helm Charts
- **CI/CD**: GitHub Actions
- **Code Quality**: SonarQube
- **Ingress**: Traefik + Let's Encrypt (TLS)

---

## Prerequisites

- PHP >= 8.3 + Composer
- Node.js >= 22.16.0 + npm
- MySQL 8.0
- **Expo Go** app installed on your Android device ([download on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## Installation

### Backend

```bash
cd cavea-back

# Install PHP dependencies
composer install

# Set up environment
cp .env.example .env
php artisan key:generate

# Run database migrations
php artisan migrate

# Start the development server
php artisan serve
```

### Frontend

```bash
cd cavea-front

# Install NPM dependencies
npm install

# Start the Expo development server
npm start
```

Once the Expo server is running, a QR code will be displayed in your terminal. Open the **Expo Go** app on your Android device and scan the QR code to launch the application locally.

> Make sure your phone and your computer are connected to the same Wi-Fi network.

---

## Environment Variables

Copy `.env.example` at the root and inside `cavea-back/` and fill in the values:

| Variable          | Description                           |
|-------------------|---------------------------------------|
| `APP_NAME`        | Application name                      |
| `APP_ENV`         | Environment (`local`, `production`)   |
| `APP_URL`         | Base API URL                          |
| `DB_HOST`         | MySQL host                            |
| `DB_PORT`         | MySQL port (default: 3306)            |
| `DB_DATABASE`     | Database name                         |
| `DB_USERNAME`     | MySQL username                        |
| `DB_PASSWORD`     | MySQL password                        |
| `NODE_VERSION`    | Node.js version in use                |
| `LARAVEL_VERSION` | Laravel version in use                |

---

## Useful Commands

### Backend

```bash
# Check code style
composer lint

# Auto-fix code style
composer lint:fix

# Run unit tests
composer test

# Run database migrations
php artisan migrate

# Watch logs in real time
php artisan pail
```

### Frontend

```bash
# Start development server (scan QR with Expo Go on Android)
npm start

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Lint
npm run lint
```

---

## API

The REST API is available at:
- **Dev**: `https://api-dev.cavea.ovh`
- **Prod**: `https://api.cavea.ovh`

### Authentication

| Method | Endpoint        | Description |
|--------|-----------------|-------------|
| POST   | `/api/register` | Register    |
| POST   | `/api/login`    | Login       |
| POST   | `/api/logout`   | Logout      |

### Cellar Management

| Method | Endpoint                              | Description                 |
|--------|---------------------------------------|-----------------------------|
| GET    | `/api/cellar-items`                   | List all wines              |
| GET    | `/api/cellar-items/{id}`              | Get wine details            |
| GET    | `/api/cellar-items/last`              | Get last added wine         |
| GET    | `/api/cellar-items/total-stock`       | Get total stock             |
| GET    | `/api/cellar-items/stock-by-colour`   | Get stock by color          |
| GET    | `/api/cellar-items/colour/{colourId}` | Filter wines by color       |
| GET    | `/api/cellar-items/region/{regionId}` | Filter wines by region      |
| POST   | `/api/cellar-items`                   | Add a wine                  |
| PUT    | `/api/cellar-items/{id}`              | Update a wine               |
| POST   | `/api/cellar-items/{id}/increment`    | Increment stock             |
| POST   | `/api/cellar-items/{id}/decrement`    | Decrement stock             |
| DELETE | `/api/cellar-items/{id}`              | Delete a wine               |

> All routes (except authentication) require a Sanctum Bearer token.

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

## Deployment

Deployment is handled via Helm on an Azure AKS cluster.

```bash
# Database
helm upgrade database ./cavea-back/k8s_helm/database \
  -f ./cavea-back/k8s_helm/database/values_dev.yaml \
  --namespace cavea-back-dev --install

# Backend
helm upgrade back ./cavea-back/k8s_helm/backend \
  -f ./cavea-back/k8s_helm/backend/values_dev.yaml \
  --namespace cavea-back-dev --install
```

| Environment | Branch | Namespace       | URL                       | Replicas |
|-------------|--------|-----------------|---------------------------|----------|
| Dev         | dev    | cavea-back-dev  | https://api-dev.cavea.ovh | 1        |
| Prod        | main   | cavea-back-prod | https://api.cavea.ovh     | 2        |

For more details, see [DEVOPS_README.md](./DEVOPS_README.md).

---

## CI/CD

GitHub Actions pipelines automatically trigger:

1. **Lint** — PHP code style check (PHP CS Fixer)
2. **Backend tests** — PHPUnit with code coverage
3. **Frontend tests** — Jest
4. **SonarQube** — Code quality analysis
5. **Versioning** — Auto-increment of `VERSION` on `main`
6. **Docker Build** — Build and push to DockerHub
7. **Kubernetes Deploy** — Update AKS cluster

---

## Version

Current version: **0.0.15**

See [VERSION](./VERSION).
