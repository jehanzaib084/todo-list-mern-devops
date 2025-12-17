# Ansible Configuration Management

This directory contains Ansible playbooks and inventory for automating server configuration.

## 📋 Files

- `hosts.ini` - Ansible inventory file defining target servers
- `playbook.yml` - Main playbook with multiple roles for different server types
- `ansible.cfg` - Ansible configuration file
- `nginx.conf.j2` - Nginx configuration template

## 🎯 Server Roles

### 1. Web Servers (`webservers`)
- **Software Installed:**
  - Nginx (web server)
  - Docker & Docker Compose
  - Python3 & pip
  - Basic utilities (curl, wget, git)

### 2. Application Servers (`appservers`)
- **Software Installed:**
  - Node.js 20.x
  - npm (Node Package Manager)
  - PM2 (Process Manager)
  - Docker & Docker Compose
  - Python3 & pip
  - Build tools

### 3. Database Servers (`dbservers`)
- **Software Installed:**
  - Docker & Docker Compose
  - Python3 & pip
  - MongoDB data directory setup

### 4. Kubernetes Nodes (`kubernetes`)
- **Software Installed:**
  - kubectl (Kubernetes CLI)
  - Docker & Docker Compose
  - Python3 & pip

## 🚀 Setup Instructions

### 1. Install Ansible

```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install -y ansible

# Verify installation
ansible --version
```

### 2. Configure Inventory

Edit `hosts.ini` and replace placeholder IPs with your actual server IPs:

```ini
[webservers]
web-server-1 ansible_host=192.168.1.10 ansible_user=root

[appservers]
app-server-1 ansible_host=192.168.1.11 ansible_user=root

[dbservers]
db-server-1 ansible_host=192.168.1.12 ansible_user=root

[kubernetes]
k8s-node-1 ansible_host=192.168.1.13 ansible_user=root
```

### 3. Test Connectivity

```bash
# Test connection to all servers
ansible all -i hosts.ini -m ping

# Test specific group
ansible webservers -i hosts.ini -m ping
```

### 4. Run Playbook

```bash
# Run playbook for all servers
ansible-playbook -i hosts.ini playbook.yml

# Run for specific server group
ansible-playbook -i hosts.ini playbook.yml --limit webservers

# Run with verbose output
ansible-playbook -i hosts.ini playbook.yml -v

# Run with extra verbosity (for debugging)
ansible-playbook -i hosts.ini playbook.yml -vvv
```

## 📸 Screenshot Requirements

For assignment submission, capture:

1. **Inventory verification:**
   ```bash
   ansible-inventory -i hosts.ini --list
   ```

2. **Playbook execution:**
   ```bash
   ansible-playbook -i hosts.ini playbook.yml
   ```
   - Show all tasks completing successfully
   - Show "PLAY RECAP" with all hosts showing `ok` status

3. **Verification on target servers:**
   ```bash
   # On web server
   nginx -v
   docker --version
   
   # On app server
   node --version
   npm --version
   docker --version
   
   # On k8s node
   kubectl version --client
   docker --version
   ```

## 🔧 Customization

### Variables

You can customize installations by modifying variables in `playbook.yml`:

- `nodejs_version`: Node.js version (default: "20.x")
- `nginx_user`: Nginx user (default: "www-data")
- `nginx_worker_processes`: Nginx worker processes (default: "auto")

### Adding More Servers

Add new servers to `hosts.ini`:

```ini
[webservers]
web-server-1 ansible_host=192.168.1.10 ansible_user=root
web-server-2 ansible_host=192.168.1.20 ansible_user=root
```

## 🐛 Troubleshooting

**Connection issues:**
```bash
# Test SSH connection manually
ssh root@YOUR_SERVER_IP

# Test with Ansible
ansible all -i hosts.ini -m ping -vvv
```

**Permission issues:**
- Ensure `ansible_user` has sudo privileges
- Check `ansible.cfg` for `become` settings

**Package installation failures:**
- Verify internet connectivity on target servers
- Check if repositories are accessible
- Review playbook output with `-vvv` flag

## 📝 Assignment Checklist

- ✅ `hosts.ini` - Inventory file with at least 2 servers/roles
- ✅ `playbook.yml` - Playbook automating software installation
- ✅ Installs required software (Docker, Node, Nginx, Python)
- ✅ Basic configuration (service setup, directories)
- ✅ Screenshot of successful playbook execution

## 🎓 Notes

- This playbook configures **4 different server roles** (webservers, appservers, dbservers, kubernetes)
- Each role installs different software packages as needed
- All roles include Docker installation for containerization
- Services are automatically started and enabled
- Playbook is idempotent (safe to run multiple times)
