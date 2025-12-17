# GitHub Actions CI/CD Setup

## ✅ Workflow Created

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) is ready and will automatically:
- Build frontend and backend
- Run tests
- Build Docker images
- Push to Docker Hub
- Deploy to Kubernetes (on main/master branch)

## 🔑 Required GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

### 1. Docker Hub Credentials

**DOCKERHUB_USERNAME:**
- Value: `jehanzaib08`

**DOCKERHUB_PASSWORD:**
- Value: Your Docker Hub password or access token
- To create access token: Docker Hub → Account Settings → Security → New Access Token

### 2. Kubernetes Config (Optional - for deployment)

**KUBECONFIG:**
- Value: Base64 encoded kubeconfig file
- To encode: `cat ~/.kube/config | base64 -w 0`
- Or: `base64 -i ~/.kube/config`

## 🚀 How It Works

### On Push/Pull Request:
1. ✅ Checks out code
2. ✅ Builds frontend (npm ci + build)
3. ✅ Builds backend (npm ci + validation)
4. ✅ Runs tests (linting + syntax checks)
5. ✅ Builds Docker images
6. ✅ Pushes to Docker Hub

### On Push to main/master:
- All above steps PLUS
- ✅ Deploys to Kubernetes
- ✅ Shows external IP/hostname

## 📋 Workflow Triggers

- **Push to main/master** → Full pipeline + deployment
- **Pull Request** → Build and test only (no deployment)
- **Push to other branches** → Build and test only

## 🐳 Docker Images

Images will be pushed to:
- `hamayal497/todo-frontend:latest` and `:COMMIT_SHA`
- `hamayal497/todo-backend:latest` and `:COMMIT_SHA`
- `hamayal497/todo-db:latest` and `:COMMIT_SHA`

## ☸️ Kubernetes Deployment

The workflow will:
1. Create namespace `todo-app`
2. Create Docker Hub secret
3. Deploy MongoDB, Backend, and Frontend
4. Display external IP/hostname

## 📸 For Submission

After pushing to GitHub, you'll see:
1. **Actions tab** → Shows pipeline runs
2. **Pipeline stages** → All stages completed ✅
3. **Deployment logs** → Shows Kubernetes deployment status
4. **External URL** → Frontend access URL

## 🔧 Troubleshooting

**Build fails?**
- Check Node.js version compatibility
- Verify package.json files are correct
- Check build logs in Actions tab

**Docker push fails?**
- Verify Docker Hub secrets are set correctly
- Check Docker Hub username is lowercase
- Ensure repository exists or allows auto-creation

**Kubernetes deploy fails?**
- Verify KUBECONFIG secret contains the full kubeconfig file content (plain text)
- Check kubeconfig file is valid
- Ensure cluster is accessible

## 📝 Next Steps

1. Add GitHub secrets (DOCKERHUB_USERNAME, DOCKERHUB_PASSWORD, KUBECONFIG)
2. Push to GitHub
3. Check Actions tab to see pipeline run
4. Screenshot the completed pipeline for submission
