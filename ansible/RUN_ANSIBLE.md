# How to Run Ansible Playbook - Step by Step Guide

## 🎯 Quick Start for Assignment

Since AKS nodes don't have direct SSH access, here are **3 options** to complete your assignment:

---

## Option 1: Use Localhost (Easiest - Recommended for Assignment)

This uses your current server as both control and target machine. Perfect for demonstration!

### Step 1: Install Ansible

```bash
# Update package list
sudo apt update

# Install Ansible
sudo apt install -y ansible

# Verify installation
ansible --version
```

### Step 2: Update hosts.ini for Localhost

Edit `ansible/hosts.ini`:

```ini
[webservers]
web-server-1 ansible_host=localhost ansible_connection=local

[appservers]
app-server-1 ansible_host=localhost ansible_connection=local

[dbservers]
db-server-1 ansible_host=localhost ansible_connection=local

[kubernetes]
k8s-node-1 ansible_host=localhost ansible_connection=local

[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

**Note:** `ansible_connection=local` tells Ansible to run commands locally instead of SSH.

### Step 3: Test Connection

```bash
cd /root/todo-list-mern-devops/ansible
ansible all -i hosts.ini -m ping
```

Expected output:
```
web-server-1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
app-server-1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
...
```

### Step 4: Run the Playbook

```bash
cd /root/todo-list-mern-devops/ansible
ansible-playbook -i hosts.ini playbook.yml
```

### Step 5: Take Screenshots

Capture these screenshots for submission:

1. **Ansible version:**
   ```bash
   ansible --version
   ```

2. **Inventory verification:**
   ```bash
   ansible-inventory -i hosts.ini --list
   ```

3. **Connection test:**
   ```bash
   ansible all -i hosts.ini -m ping
   ```

4. **Playbook execution (full output):**
   ```bash
   ansible-playbook -i hosts.ini playbook.yml
   ```
   - Show all tasks completing
   - Show "PLAY RECAP" at the end

5. **Verification (after playbook runs):**
   ```bash
   # Verify installations
   docker --version
   node --version
   nginx -v
   kubectl version --client
   ```

---

## Option 2: Create Azure VMs (More Realistic)

If you want to use actual remote servers:

### Step 1: Create Azure VMs

```bash
# Create resource group
az group create --name ansible-rg --location eastasia

# Create VM 1 (Web Server)
az vm create \
  --resource-group ansible-rg \
  --name web-server-1 \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Create VM 2 (App Server)
az vm create \
  --resource-group ansible-rg \
  --name app-server-1 \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Get VM IPs
az vm list-ip-addresses --resource-group ansible-rg -o table
```

### Step 2: Update hosts.ini

```ini
[webservers]
web-server-1 ansible_host=YOUR_VM1_PUBLIC_IP ansible_user=azureuser

[appservers]
app-server-1 ansible_host=YOUR_VM2_PUBLIC_IP ansible_user=azureuser

[dbservers]
db-server-1 ansible_host=YOUR_VM1_PUBLIC_IP ansible_user=azureuser

[kubernetes]
k8s-node-1 ansible_host=YOUR_VM2_PUBLIC_IP ansible_user=azureuser
```

### Step 3: Test SSH Connection

```bash
# Test SSH to VMs
ssh azureuser@YOUR_VM1_PUBLIC_IP
ssh azureuser@YOUR_VM2_PUBLIC_IP
```

### Step 4: Run Playbook

```bash
cd /root/todo-list-mern-devops/ansible
ansible-playbook -i hosts.ini playbook.yml
```

---

## Option 3: Use Current Server as Multiple Targets (Advanced)

You can simulate multiple servers using the same machine with different connection methods.

### Update hosts.ini:

```ini
[webservers]
web-server-1 ansible_host=127.0.0.1 ansible_connection=local

[appservers]
app-server-1 ansible_host=127.0.0.1 ansible_connection=local

[dbservers]
db-server-1 ansible_host=127.0.0.1 ansible_connection=local

[kubernetes]
k8s-node-1 ansible_host=127.0.0.1 ansible_connection=local
```

---

## 📸 Screenshot Checklist for Submission

### Required Screenshots:

1. ✅ **Ansible Installation**
   ```bash
   ansible --version
   ```

2. ✅ **Inventory File Content**
   ```bash
   cat ansible/hosts.ini
   ```

3. ✅ **Inventory Verification**
   ```bash
   ansible-inventory -i hosts.ini --list
   ```

4. ✅ **Connection Test**
   ```bash
   ansible all -i hosts.ini -m ping
   ```

5. ✅ **Playbook Execution (MOST IMPORTANT)**
   ```bash
   ansible-playbook -i hosts.ini playbook.yml
   ```
   - Show the full output
   - Show all tasks completing successfully
   - Show "PLAY RECAP" showing all hosts with `ok` status

6. ✅ **Verification on Target Servers**
   ```bash
   docker --version
   node --version
   nginx -v
   kubectl version --client
   ```

---

## 🚀 Complete Execution Example

```bash
# 1. Navigate to ansible directory
cd /root/todo-list-mern-devops/ansible

# 2. Install Ansible (if not installed)
sudo apt update && sudo apt install -y ansible

# 3. Verify Ansible
ansible --version

# 4. Update hosts.ini (use Option 1 - localhost)
# Edit hosts.ini and set ansible_connection=local

# 5. Test connection
ansible all -i hosts.ini -m ping

# 6. Run playbook
ansible-playbook -i hosts.ini playbook.yml

# 7. Verify installations
docker --version
node --version
nginx -v
kubectl version --client
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or "Host unreachable"
- **Solution:** Use `ansible_connection=local` for localhost testing

### Issue: "Permission denied"
- **Solution:** Ensure you're running with sudo or as root

### Issue: "Module not found"
- **Solution:** Install required Python packages:
  ```bash
  sudo apt install -y python3-pip
  pip3 install docker
  ```

### Issue: "Package installation fails"
- **Solution:** Update package cache first:
  ```bash
  sudo apt update
  ```

---

## 📝 Assignment Submission Checklist

- [ ] `hosts.ini` file created with at least 2 server groups
- [ ] `playbook.yml` file with automation tasks
- [ ] Screenshot of Ansible version
- [ ] Screenshot of inventory file
- [ ] Screenshot of connection test (ping)
- [ ] **Screenshot of successful playbook execution** (MOST IMPORTANT)
- [ ] Screenshot of verification commands showing installed software

---

## 💡 Pro Tips

1. **Use Option 1 (localhost)** - It's the easiest and works perfectly for assignment demonstration
2. **Run with verbose output** for better debugging: `ansible-playbook -i hosts.ini playbook.yml -v`
3. **Check playbook syntax** before running: `ansible-playbook --syntax-check -i hosts.ini playbook.yml`
4. **Idempotent playbooks** - Safe to run multiple times, won't break if already installed

---

## 🎓 What the Playbook Does

The playbook configures **4 different server roles**:

1. **Web Servers** → Installs Nginx, Docker, Python
2. **App Servers** → Installs Node.js, Docker, PM2, Python
3. **Database Servers** → Installs Docker, sets up MongoDB directories
4. **Kubernetes Nodes** → Installs kubectl, Docker, Python

Each role installs and configures the required software automatically!
