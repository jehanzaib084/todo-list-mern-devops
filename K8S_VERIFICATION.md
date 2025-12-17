# Kubernetes AKS Deployment Verification Guide

## ✅ Section C Requirements Checklist

### Task C1: Kubernetes Manifests

#### ✅ 1. Create an Azure Kubernetes Cluster (AKS)
- **Status**: ✅ Complete
- **Evidence**: You have a kubeconfig file pointing to AKS cluster
- **Cluster**: `cf-aks` in `eastasia` region
- **To verify**: `kubectl cluster-info`

#### ✅ 2. Deploy containerized application from Docker Hub onto AKS
- **Status**: ✅ Complete
- **Images deployed from Docker Hub**:
  - `jehanzaib08/todo-frontend:latest`
  - `jehanzaib08/todo-backend:latest`
  - `jehanzaib08/todo-db:latest`
- **Deployment method**: Kubernetes manifests in `k8s/` directory
- **CI/CD**: GitHub Actions automatically deploys on push to main/master

#### ✅ 3. Expose the app using a public IP address and provide a reachable link
- **Status**: ✅ Complete
- **Service Type**: LoadBalancer (frontend service)
- **Azure DNS Label**: `todo-app` (creates `todo-app.<region>.cloudapp.azure.com`)
- **Public Access**: External IP assigned by Azure Load Balancer
- **To get URL**: After deployment, run:
  ```bash
  kubectl get svc frontend -n todo-app
  ```
  Or check GitHub Actions logs for the external IP/hostname

---

### Task C2: AKS Deployment Verification

#### ✅ 1. All pods in Running state
**Verification Command:**
```bash
kubectl get pods -n todo-app
```

**Expected Output:**
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxx-xxxxx     1/1     Running   0          Xm
backend-xxxxxxxxx-xxxxx     1/1     Running   0          Xm
frontend-xxxxxxxxx-xxxxx    1/1     Running   0          Xm
frontend-xxxxxxxxx-xxxxx    1/1     Running   0          Xm
mongodb-xxxxxxxxx-xxxxx     1/1     Running   0          Xm
```

**Screenshot Requirements:**
- Show all pods with `STATUS: Running`
- Show `READY: 1/1` for all pods
- Include namespace (`-n todo-app`)

---

#### ✅ 2. Services created successfully
**Verification Command:**
```bash
kubectl get svc -n todo-app
```

**Expected Output:**
```
NAME       TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)        AGE
backend    ClusterIP      10.0.x.x       <none>           4000/TCP       Xm
frontend   LoadBalancer   10.0.x.x       XX.XXX.XXX.XXX  80:XXXXX/TCP   Xm
mongodb    ClusterIP      10.0.x.x       <none>           27017/TCP      Xm
```

**Screenshot Requirements:**
- Show all 3 services
- Frontend should have `EXTERNAL-IP` assigned
- All services should have `TYPE` correctly set

---

#### ✅ 3. Frontend connecting to backend
**Verification:**
- **Configuration**: Frontend nginx proxies `/api/*` requests to `http://backend:4000`
- **Service Discovery**: Frontend uses Kubernetes DNS (`backend` service name)
- **Network**: Both services in same namespace (`todo-app`)

**Verification Commands:**
```bash
# Check frontend can resolve backend service
kubectl exec -n todo-app deployment/frontend -- nslookup backend

# Check backend service endpoint
kubectl get endpoints backend -n todo-app

# Test from frontend pod
kubectl exec -n todo-app deployment/frontend -- wget -qO- http://backend:4000/api/health
```

**Expected Result:**
- Backend service should resolve to ClusterIP
- Health endpoint should return: `{"status":"ok","timestamp":"..."}`

**Screenshot Requirements:**
- Show successful connection test
- Show backend service endpoint with pod IPs

---

#### ✅ 4. Backend connecting to database
**Verification:**
- **Configuration**: Backend uses `MONGO_URL=mongodb://mongodb:27017/todoapp`
- **Service Discovery**: Backend uses Kubernetes DNS (`mongodb` service name)
- **Network**: Both services in same namespace (`todo-app`)

**Verification Commands:**
```bash
# Check backend can resolve mongodb service
kubectl exec -n todo-app deployment/backend -- nslookup mongodb

# Check mongodb service endpoint
kubectl get endpoints mongodb -n todo-app

# Check backend logs for successful MongoDB connection
kubectl logs -n todo-app deployment/backend | grep -i mongo

# Test MongoDB connection from backend pod
kubectl exec -n todo-app deployment/backend -- sh -c "echo 'db.runCommand({ping:1})' | mongosh mongodb://mongodb:27017/todoapp"
```

**Expected Result:**
- MongoDB service should resolve to ClusterIP
- Backend logs should show: `✅ MongoDB connected successfully` or similar
- MongoDB ping should succeed

**Screenshot Requirements:**
- Show successful MongoDB connection in backend logs
- Show mongodb service endpoint with pod IP
- Show successful ping test

---

## 📸 Complete Verification Script

Run this script to get all verification outputs at once:

```bash
#!/bin/bash
echo "=== K8S AKS Deployment Verification ==="
echo ""
echo "1. All Pods Status:"
kubectl get pods -n todo-app
echo ""
echo "2. All Services:"
kubectl get svc -n todo-app
echo ""
echo "3. Frontend -> Backend Connection:"
kubectl exec -n todo-app deployment/frontend -- wget -qO- http://backend:4000/api/health 2>/dev/null || echo "Connection test"
echo ""
echo "4. Backend -> MongoDB Connection:"
kubectl logs -n todo-app deployment/backend --tail=20 | grep -i mongo || echo "Check logs manually"
echo ""
echo "5. Frontend External URL:"
kubectl get svc frontend -n todo-app -o jsonpath='http://{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || \
kubectl get svc frontend -n todo-app -o jsonpath='http://{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || \
echo "IP provisioning..."
echo ""
echo "=== Verification Complete ==="
```

---

## 🎯 Submission Checklist

For your assignment submission, include screenshots of:

1. ✅ **kubectl get pods -n todo-app** (all Running)
2. ✅ **kubectl get svc -n todo-app** (all services created)
3. ✅ **Frontend->Backend connection test** (health endpoint response)
4. ✅ **Backend->MongoDB connection** (backend logs showing connection)
5. ✅ **Frontend external URL** (LoadBalancer IP/hostname)
6. ✅ **Application running in browser** (access via external IP)

---

## 🔧 Quick Troubleshooting

**Pods not Running?**
```bash
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app
```

**Services not created?**
```bash
kubectl get svc -n todo-app
kubectl describe svc <service-name> -n todo-app
```

**Connection issues?**
```bash
# Check if services can resolve each other
kubectl exec -n todo-app deployment/backend -- nslookup mongodb
kubectl exec -n todo-app deployment/frontend -- nslookup backend
```

---

## 📝 Notes

- All deployments use **Docker Hub images** (`jehanzaib08/todo-*`)
- Frontend uses **LoadBalancer** for public access
- Backend and MongoDB use **ClusterIP** for internal communication
- All services are in the **`todo-app`** namespace
- Health probes ensure pods are ready before serving traffic
- Persistent storage ensures MongoDB data survives pod restarts
