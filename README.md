# Cavea — Setup Docker (Expo Frontend + Laravel Backend + MySQL)

Ce projet utilise Docker pour exécuter :

- **Frontend** : Expo (React Native)
- **Backend** : Laravel
- **BDD** : MySQL 8
- **phpMyAdmin** : Interface Web

---

## 🛠 Prérequis

- Docker & Docker Compose installés

---

## 🚀 Lancer le projet

### 1. Cloner le dépôt

```bash
git clone https://github.com/Smophmie/cavea.git
cd cavea
```

### 2. Créer un fichier .env

À la racine du projet :
```bash
FRONTEND_VOLUME=./cavea-front
BACKEND_VOLUME=./cavea-back
DB_VOLUME=./data/db
LARAVEL_VERSION=12.0.10
```

### 3. Lancer les conteneurs Docker
```bash
docker compose up --build
```

Cela va :

Construire les conteneurs frontend, backend, base de données
Lancer l’application sur les bons ports.

### 4. Accéder à l'application
| Service               | URL par défaut                                                       |
| --------------------- | -------------------------------------------------------------------- |
| Frontend (Expo)       | [http://localhost:8081](http://localhost:8081)                       |
| Backend (API Laravel) | [http://localhost:8000](http://localhost:8000)                       |
| phpMyAdmin            | [http://localhost:8080](http://localhost:8080)                       |

## Configurations supplémentaires

Accéder au conteneur backend via
```bash
docker exec -it cavea-back
```

puis 

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

Cela permettra d'alimenter la base de données.
