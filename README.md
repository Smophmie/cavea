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
git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo
```

### 2. Créer un fichier .env

À la racine du projet :
```bash
FRONTEND_VOLUME=./cavea-front
BACKEND_VOLUME=./cavea-back
DB_VOLUME=./data/db
LARAVEL_VERSION=12.0.10
```
