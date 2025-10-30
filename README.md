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

# Expose backend as internal service (ClusterIP)
kubectl expose deployment jehanzaib-todo-backend --port=4000 --target-port=4000 --type=ClusterIP
```

#### Deploy Frontend:
```bash
# Create frontend deployment using Docker Hub image
kubectl create deployment jehanzaib-todo-frontend --image=jehanzaib08/jehanzaib-todo-app-frontend:latest

# Set environment variable for backend connection
kubectl set env deployment/jehanzaib-todo-frontend VITE_API_BASE_URL=http://jehanzaib-todo-backend:4000

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

### Step 5: Get Public IP and Test (3 Marks)
```bash
# Check all services
kubectl get services

# Get the external IP for frontend (wait until EXTERNAL-IP shows an IP)
kubectl get services jehanzaib-todo-frontend --watch

# Test your application using the EXTERNAL-IP
# Frontend will be accessible at: http://<EXTERNAL-IP>
# Backend is internal only, accessed by frontend
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
kubectl expose deployment jehanzaib-todo-backend --port=4000 --target-port=4000 --type=ClusterIP

# Deploy frontend with backend connection
kubectl create deployment jehanzaib-todo-frontend --image=jehanzaib08/jehanzaib-todo-app-frontend:latest
kubectl set env deployment/jehanzaib-todo-frontend VITE_API_BASE_URL=http://jehanzaib-todo-backend:4000
kubectl expose deployment jehanzaib-todo-frontend --port=80 --target-port=3000 --type=LoadBalancer

# Get public IP
kubectl get services jehanzaib-todo-frontend --watch
```

### Why Frontend Needs Environment Variable?

In Kubernetes, services communicate using **internal service names**, not external IPs:

- Backend service name: `jehanzaib-todo-backend`
- Frontend connects to: `http://jehanzaib-todo-backend:4000`
- External users access frontend via LoadBalancer IP

This is how microservices communicate in Kubernetes!

## 3. GitHub Repository & Commands Usage (5 Marks)

### Step 1: Create GitHub Repository (1 Mark)
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Set git user configuration
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Initial commit
git commit -m "Initial commit: MERN Todo List App"

# Create GitHub repository via web interface or GitHub CLI
# GitHub CLI method:
gh repo create todo-list-mern --public --source=. --remote=origin --push
```

### Step 2: Add Project Files Including Dockerfile (2 Marks)
```bash
# Add any remaining files
git add .

# Commit changes
git commit -m "Add Dockerfile and deployment configurations"
```

### Step 3: Use Git Commands Properly (2 Marks)
```bash
# Check status
git status

# Add specific files
git add README.md Dockerfile deployment.yaml

# Commit with descriptive message
git commit -m "Add comprehensive DevOps deployment guide and configurations"

# Push to GitHub
git push -u origin main

# Pull latest changes
git pull origin main

# Create and switch to new branch for features
git checkout -b feature/docker-improvements

# Merge branches
git checkout main
git merge feature/docker-improvements
```

---

## Required Deliverables

### GitHub Repository Link
- **Repository URL**: [Your GitHub Repository Link - Create and push your code]

### Docker Hub Image Links
- **Backend Image**: https://hub.docker.com/repository/docker/jehanzaib08/jehanzaib-todo-app-backend/general
- **Frontend Image**: https://hub.docker.com/repository/docker/jehanzaib08/jehanzaib-todo-app-frontend/general

### Azure App Public URL
- **Application URL**: http://20.6.45.39 (Your LoadBalancer External IP)

### Screenshots Required
1. **Docker Build & Run**: Screenshot of successful Docker build and container running
2. **Docker Hub Push**: Screenshot of image pushed to Docker Hub
3. **AKS Cluster Creation**: Screenshot of Azure portal showing AKS cluster
4. **AKS Deployment**: Screenshot of kubectl commands and deployment status
5. **Public IP Access**: Screenshot of application accessible via public URL

---

## Environment Variables Setup

For production deployment, ensure these environment variables are set:

### Backend (.env)
```
JWT_KEY=your_secure_jwt_secret_key
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/todoapp
PORT=4000
```

### Frontend (Client/src/constant/api.jsx)
The frontend uses environment variable for backend connection:
```javascript
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
```
In Kubernetes, this becomes: `http://jehanzaib-todo-backend:4000`

---

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure CORS middleware is enabled in Express server
2. **MongoDB Connection**: Verify MongoDB Atlas IP whitelist includes Azure IPs
3. **AKS Access**: Ensure proper RBAC permissions for AKS cluster
4. **Docker Build Failures**: Check all dependencies are properly installed

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

**Course**: DevOps for Cloud Computing (CSC418)
**Semester**: 7th, Fall 2025
**Student**: Jehanzaib
**Registration No**: [Your Reg No]
