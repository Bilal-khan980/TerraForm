# Advanced Terraform-Driven Docker Web Application Deployment

**Purpose**: This project demonstrates **advanced Infrastructure as Code (IaC)** principles, strict resource governance, and security-first deployment using Terraform and Docker.

## 🚀 Key Features

- **Strict Resource Governance**: Enforced CPU and Memory limits (defined per environment).
- **Security Hardening**: Non-root user, Read-only RootFS, Dropped Capabilities.
- **Environment Parity**: Dev/Stage/Prod handling via Terraform variables.
- **Self-Contained**: Docker multi-stage build included.
- **Zero-Touch Destroy**: Full cleanup with one command.

## 📂 Project Structure

- `app/`: Node.js Express Application (Stateless)
- `docker/`: Multi-stage Dockerfile
- `terraform/`: Infrastructure Definition
  - `main.tf`: Container & Image resources
  - `locals.tf`: Governance logic (CPU/Mem limits)
  - `variables.tf`: Environment inputs

## 🛠 Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.0
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

## 🚦 Quick Start (Demo Mode)

### 1. Initialize
Navigate to the terraform directory:
```bash
cd terraform
terraform init
```

### 2. Plan (Dev)
See what will be created for the default `dev` environment:
```bash
terraform plan
```
*Note the memory limit is 128MB and CPU is constrained.*

### 3. Apply
Deploys the application:
```bash
terraform apply -auto-approve
```
**Output:**
```
active_environment = "dev"
application_url    = "http://localhost:8080"
resource_limits    = { cpu = "0.25 cores", memory = "128 MB" }
```

### 4. Verify
Open [http://localhost:8080](http://localhost:8080) to see the live resource report.
Check `/health` and `/metrics`.

### 5. Destroy
Clean up all resources:
```bash
terraform destroy -auto-approve
```

## 🔄 Environment Switching

To deploy to **prod** with higher limits (1.0 Core, 512MB RAM, Port 80):

```bash
terraform apply -var="app_env=prod" -auto-approve
```

## 🛡 Security & Governance Detail

| Feature | Implementation |
| :--- | :--- |
| **User** | `USER node` (1000:1000) |
| **Filesystem** | `read_only = true` (mounts allowed only on /tmp) |
| **Capabilities** | All dropped (`drop = ["ALL"]`) except `NET_BIND_SERVICE`? (Actually none needed for >1024 ports) |
| **Isolation** | `pids_limit` enforced to prevent fork bombs |

---
*Built for TechQuest Demo.*