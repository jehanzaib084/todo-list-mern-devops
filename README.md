# MERN Stack Todo List Application - DevOps Deployment Guide

## Project Overview
This is a full-stack MERN (MongoDB, Express.js, React, Node.js) Todo List application with complete DevOps pipeline implementation for cloud deployment.

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (for database)
- Git

### Frontend Setup (React + Vite)
```bash
cd Client
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend Setup (Node.js + Express)
```bash
cd Server
npm install
```

Create a `.env` file in the Server directory:
```env
JWT_KEY=your_jwt_secret_key
MONGO_URL=your_mongodb_atlas_connection_string
PORT=4000
```

Start the backend server:
```bash
npm start
# or for development with auto-reload
npx nodemon server.js
```
### Alternative: Using Docker Compose for Local Development
For easier local development with all services:

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

This will start:
- MongoDB on port 27017
- Backend API on port 4000
- Frontend on port 5173

## 1. Dockerization & Local Deployment (10 Marks)

### Step 1: Application Setup and Local Testing (2 Marks)
```bash
# Ensure both frontend and backend are running locally
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

### Step 2: Create Separate Dockerfiles (3 Marks)

#### Backend Dockerfile (Server/Dockerfile):
```dockerfile
# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

#### Frontend Dockerfile (Client/Dockerfile):
```dockerfile
# Simple React build and serve
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to serve the built app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Step 3: Build Docker Images (3 Marks)
```bash
# Build backend image
cd Server
docker build -t jehanzaib-todo-app-backend:latest .

# Build frontend image
cd ../Client
docker build -t jehanzaib-todo-app-frontend:latest .

# Run backend container
docker run -d -p 4000:4000 --env-file ../Server/.env --name jehanzaib-backend jehanzaib-todo-app-backend:latest

# Run frontend container
docker run -d -p 3000:3000 --name jehanzaib-frontend jehanzaib-todo-app-frontend:latest

# Verify applications are running
curl http://localhost:4000
curl http://localhost:3000
```

### Step 4: Push to Docker Hub (2 Marks)
```bash
# Login to Docker Hub
docker login

# Tag and push backend image
docker tag jehanzaib-todo-app-backend:latest jehanzaib08/jehanzaib-todo-app-backend:latest
docker push jehanzaib08/jehanzaib-todo-app-backend:latest

# Tag and push frontend image
docker tag jehanzaib-todo-app-frontend:latest jehanzaib08/jehanzaib-todo-app-frontend:latest
docker push jehanzaib08/jehanzaib-todo-app-frontend:latest
```

---

## 2. Azure Kubernetes Cloud Deployment (10 Marks)

### Prerequisites
- Azure CLI installed
- Azure account with active subscription
- Docker Hub account with uploaded images (✅ Already done!)

### Step 1: Install Azure CLI and Login
```bash
# Install Azure CLI (Ubuntu/Debian)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login
```

### Step 2: Create Azure Resource Group
```bash
# Create resource group
az group create --name todo-app-rg --location eastus
```

### Step 3: Create AKS Cluster (3 Marks)
Since your images are already on Docker Hub, you can skip the ACR steps and deploy directly from Docker Hub.

### Step 3: Create AKS Cluster (3 Marks)
```bash
# Create AKS cluster
az aks create \
  --resource-group todo-app-rg \
  --name todo-aks-cluster \
  --node-count 1 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get AKS credentials
az aks get-credentials --resource-group todo-app-rg --name todo-aks-cluster
```

### Step 4: Deploy to AKS (4 Marks)
Use these kubectl commands to deploy your applications:

#### Deploy Backend:
```bash
# Create backend deployment using Docker Hub image
kubectl create deployment jehanzaib-todo-backend --image=jehanzaib08/jehanzaib-todo-app-backend:latest

# Set environment variables for backend
kubectl set env deployment/jehanzaib-todo-backend JWT_KEY=jwtsecret MONGO_URL=mongodb+srv://muhammadjehanzaib2021:Jehanzaib0842021@cluster0.fu6zzfl.mongodb.net/?appName=Cluster0

# Expose backend as public service (LoadBalancer) for external access
kubectl expose deployment jehanzaib-todo-backend --port=80 --target-port=4000 --type=LoadBalancer
```

#### Deploy Frontend:
```bash
# Create frontend deployment using Docker Hub image
kubectl create deployment jehanzaib-todo-frontend --image=jehanzaib08/jehanzaib-todo-app-frontend:latest

# Set environment variable for backend connection
kubectl set env deployment/jehanzaib-todo-frontend VITE_API_BASE_URL=http://4.145.123.244

# Expose frontend as public service (LoadBalancer)
kubectl expose deployment jehanzaib-todo-frontend --port=80 --target-port=3000 --type=LoadBalancer
```

Apply the deployments:
```bash
# Check deployment status
kubectl get deployments

# Check services
kubectl get services

# Get public IP for frontend (wait for EXTERNAL-IP to be assigned)
kubectl get services jehanzaib-todo-frontend --watch
```

### Why We Use kubectl create deployment & expose?

The `kubectl create deployment` and `kubectl expose` commands tell **Kubernetes** how to run your app:

1. **`kubectl create deployment`**: Creates pods running your Docker containers
2. **`kubectl set env`**: Sets environment variables (database URL, secrets)
3. **`kubectl expose`**: Creates a service to make your app accessible
   - `ClusterIP`: Internal access (for backend)
   - `LoadBalancer`: Public access with external IP (for frontend)

Without these commands, Kubernetes doesn't know how to deploy and access your application!

### 🔄 **Update Existing Deployment (Instead of Delete & Recreate):**

If you want to update the existing deployment instead of deleting it:

```bash
# Update the frontend image to the latest version (use the correct container name)
kubectl set image deployment/jehanzaib-todo-frontend jehanzaib-todo-app-frontend=jehanzaib08/jehanzaib-todo-app-frontend:latest

# Set the correct environment variable for Vite (remove old one first if needed)
kubectl set env deployment/jehanzaib-todo-frontend REACT_APP_API_BASE_URL- VITE_API_BASE_URL=http://jehanzaib-todo-backend:4000

# Restart the deployment to apply changes
kubectl rollout restart deployment/jehanzaib-todo-frontend

# Check rollout status
kubectl rollout status deployment/jehanzaib-todo-frontend

# Get the service IP (should remain the same)
kubectl get services jehanzaib-todo-frontend
```

# Get public IP and Test (3 Marks)
```bash
# Check all services
kubectl get services

# Get the external IP for both frontend and backend (wait until EXTERNAL-IP shows an IP)
kubectl get services --watch

# Test your application using the EXTERNAL-IP
# Frontend will be accessible at: http://<FRONTEND-EXTERNAL-IP>
# Backend will be accessible at: http://<BACKEND-EXTERNAL-IP>:4000
# Test health endpoint: curl http://<BACKEND-EXTERNAL-IP>:4000/health
```

### 🔄 **Rebuild & Redeploy Steps (If Frontend Can't Connect to Backend):**

If your frontend can't connect to the backend, follow these steps:

#### Step 1: Delete Current Deployments
```bash
# Delete current deployments and services
kubectl delete deployment jehanzaib-todo-frontend
kubectl delete deployment jehanzaib-todo-backend
kubectl delete service jehanzaib-todo-frontend
kubectl delete service jehanzaib-todo-backend
```

#### Step 2: Rebuild Frontend Image (Local Machine)
```bash
cd Client
docker build -t jehanzaib-todo-app-frontend:latest .
docker tag jehanzaib-todo-app-frontend:latest jehanzaib08/jehanzaib-todo-app-frontend:latest
docker push jehanzaib08/jehanzaib-todo-app-frontend:latest
```

#### Step 3: Redeploy with Environment Variables
```bash
# Deploy backend
kubectl create deployment jehanzaib-todo-backend --image=jehanzaib08/jehanzaib-todo-app-backend:latest
kubectl set env deployment/jehanzaib-todo-backend JWT_KEY=jwtsecret MONGO_URL=mongodb+srv://muhammadjehanzaib2021:Jehanzaib0842021@cluster0.fu6zzfl.mongodb.net/?appName=Cluster0
kubectl expose deployment jehanzaib-todo-backend --port=4000 --target-port=4000 --type=LoadBalancer

# Deploy frontend with backend connection
kubectl create deployment jehanzaib-todo-frontend --image=jehanzaib08/jehanzaib-todo-app-frontend:latest
kubectl set env deployment/jehanzaib-todo-frontend VITE_API_BASE_URL=http://jehanzaib-todo-backend:4000
kubectl expose deployment jehanzaib-todo-frontend --port=80 --target-port=3000 --type=LoadBalancer


### Useful Commands
```bash
# Check deployments
kubectl get deployments

# Check services
kubectl get services

# Check pods
kubectl get pods

# View pod logs
kubectl logs deployment/jehanzaib-todo-backend
kubectl logs deployment/jehanzaib-todo-frontend

# Check health endpoint
curl http://<BACKEND-EXTERNAL-IP>:4000/health

# Restart deployments
kubectl rollout restart deployment jehanzaib-todo-backend
kubectl rollout restart deployment jehanzaib-todo-frontend

# Delete deployments
kubectl delete deployment jehanzaib-todo-backend
kubectl delete deployment jehanzaib-todo-frontend

# Delete services
kubectl delete service jehanzaib-todo-backend
kubectl delete service jehanzaib-todo-frontend
```

---

## Project Structure
```
To-do-list-MERN-/
├── Client/                 # React Frontend
│   ├── Dockerfile         # Frontend Docker configuration
│   └── ...
├── Server/                 # Node.js Backend
│   ├── Dockerfile         # Backend Docker configuration
│   └── ...
├── docker-compose.yml         # Local development setup
├── README.md                  # This file
└── .gitignore
```

## 🔄 Update Deployment with New Image

If you've made changes to your code and want to update the deployed application with the latest image while keeping the same public IP:

### Step 1: Rebuild and Push Updated Images

#### For Frontend:
```bash
cd Client
docker build -t jehanzaib-todo-app-frontend:latest .
docker tag jehanzaib-todo-app-frontend:latest jehanzaib08/jehanzaib-todo-app-frontend:latest
docker push jehanzaib08/jehanzaib-todo-app-frontend:latest
```

#### For Backend:
```bash
cd ../Server
docker build -t jehanzaib-todo-app-backend:latest .
docker tag jehanzaib-todo-app-backend:latest jehanzaib08/jehanzaib-todo-app-backend:latest
docker push jehanzaib08/jehanzaib-todo-app-backend:latest
```

### Step 2: Update Kubernetes Deployment
```bash
# Update frontend image
kubectl set image deployment/jehanzaib-todo-frontend jehanzaib-todo-app-frontend=jehanzaib08/jehanzaib-todo-app-frontend:latest

# Update backend image
kubectl set image deployment/jehanzaib-todo-backend jehanzaib-todo-app-backend=jehanzaib08/jehanzaib-todo-app-backend:latest

# Restart deployments to apply changes
kubectl rollout restart deployment/jehanzaib-todo-frontend
kubectl rollout restart deployment/jehanzaib-todo-backend

# Check rollout status
kubectl rollout status deployment/jehanzaib-todo-frontend
kubectl rollout status deployment/jehanzaib-todo-backend

# Verify the service IPs remain the same
kubectl get services
```

Your application will be updated with the new image while maintaining the same public IP address.

---

**Course**: DevOps for Cloud Computing (CSC418)
**Semester**: 7th, Fall 2025
**Student**: Jehanzaib
**Registration No**: FA22-BSE-084
