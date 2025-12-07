# DevOps Documentation - Cavea Project

## Overview

This documentation describes the DevOps infrastructure set up for the Cavea project, including a Laravel backend and an Expo React Native mobile frontend.

## Architecture

### Backend
- Framework: Laravel (PHP 8.3)
- Server: FrankenPHP
- Database: MySQL 8.0
- Containerization: Docker
- Orchestration: Kubernetes (Azure AKS)
- Deployment Management: Helm Charts

### Frontend
- Framework: Expo React Native
- Build: EAS Build (Expo Application Services)
- Target Platform: Android

## CI/CD Pipeline

The pipeline is triggered on main, dev and feature/** branches and consists of the following steps:

### 1. Linting
Code style verification with PHP CS Fixer. In case of error, run locally:
```bash
composer lint:fix
```

### 2. Tests
- Unit and integration tests execution with PHPUnit
- Temporary MySQL database for tests
- Code coverage report generation

### 3. Quality Analysis
Code analysis via SonarQube for backend and frontend with coverage report retrieval.

### 4. Versioning
On main branch only, the VERSION file is automatically incremented and a Git tag is created.

### 5. Docker Build
Docker image build and publish to DockerHub with:
- Versioned tag (main only)
- Latest tag
- Commit SHA tag (dev)

### 6. Kubernetes Deployment
Automatic deployment to Kubernetes cluster:
- Dev environment: dev branch
- Prod environment: main branch

Deployment includes:
- MySQL database installation
- Database availability check
- Laravel backend deployment
- Backend-database connection verification
- Laravel migrations execution

### 7. Frontend Build
On main and dev branches, Android APK generation via EAS Build.

## Environments

### Development (dev)
- Namespace: cavea-back-dev
- URL: https://api-dev.cavea.ovh
- Replicas: 1
- Resources: 128Mi RAM, 100m CPU (request)

### Production (prod)
- Namespace: cavea-back-prod
- URL: https://api.cavea.ovh
- Replicas: 2
- Resources: 256Mi RAM, 250m CPU (request)

## Helm Structure

### Backend Chart (cavea-back/k8s_helm/backend)
- Deployment: Laravel pod configuration with environment variables
- Service: Internal ClusterIP exposure on port 80
- Ingress: External routing via Traefik with TLS support (Let's Encrypt)
- ConfigMap: Database connection variables

### Database Chart (cavea-back/k8s_helm/database)
- Deployment: MySQL 8.0 pod with Recreate strategy
- Service: Internal exposure on port 3306
- PVC: Persistent volume for MySQL data
- ConfigMap: Database configuration

## Required Configuration

### GitHub Secrets
The following secrets must be configured in the repository:

- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN
- KUBECONFIG_CONTENT
- MYSQL_ROOT_PASSWORD
- APP_KEY
- EXPO_TOKEN
- SONAR_TOKEN
- SONAR_HOST_URL
- SONAR_PROJECT_KEY
- SONAR_ORGANIZATION

### VERSION File
A VERSION file at the project root contains the current version in X.Y.Z format.

## Useful Commands

### Manual Helm Deployment

```bash
helm upgrade database ./cavea-back/k8s_helm/database \
  -f ./cavea-back/k8s_helm/database/values_dev.yaml \
  --namespace cavea-back-dev \
  --create-namespace \
  --install \
  --set mysql_root_password=your_password

helm upgrade back ./cavea-back/k8s_helm/backend \
  -f ./cavea-back/k8s_helm/backend/values_dev.yaml \
  --namespace cavea-back-dev \
  --install \
  --set db_password=your_password \
  --set image.tag=latest \
  --set app_key=your_app_key
```

### Local Docker Build

```bash
cd cavea-back
docker build -t cavea-back:local .
docker run -p 8000:80 cavea-back:local
```

### Cluster Verification

```bash
kubectl get pods -n cavea-back-dev
kubectl logs deployment/back-deployment -n cavea-back-dev
kubectl exec -it deployment/back-deployment -n cavea-back-dev -- bash
```
