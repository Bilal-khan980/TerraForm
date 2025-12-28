# TechQuest - Infrastructure as Code with Terraform

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Terraform Files Explained](#terraform-files-explained)
- [Prerequisites](#prerequisites)
- [Setup & Configuration](#setup--configuration)
- [Deployment Guide](#deployment-guide)
- [Terraform Commands Reference](#terraform-commands-reference)
- [Infrastructure Cleanup](#infrastructure-cleanup)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## 📖 Project Overview

**TechQuest** is a full-stack web application deployed on **Azure** using **Infrastructure as Code (IaC)** with **Terraform**. The project demonstrates:

- ✅ **Infrastructure as Code** using Terraform
- ✅ **Containerized deployment** with Docker & Azure Container Registry (ACR)
- ✅ **Azure Container Instances (ACI)** for hosting
- ✅ **MongoDB Atlas** for database
- ✅ **Automated deployment** with PowerShell orchestration

### Technology Stack
- **Infrastructure**: Terraform + Azure
- **Backend**: Node.js/Express (containerized)
- **Frontend**: React/Vite (containerized)
- **Database**: MongoDB Atlas (external)
- **Container Registry**: Azure Container Registry (ACR)
- **Hosting**: Azure Container Instances (ACI)
- **Orchestration**: PowerShell

---

## 📁 Folder Structure

```
TechQuest/TerraForm/
│
├── 📂 infra/                          # Terraform Infrastructure Configuration
│   ├── main.tf                        # Main infrastructure resources
│   ├── variables.tf                   # Variable definitions
│   ├── outputs.tf                     # Output values
│   ├── provider.tf                    # Azure provider configuration
│   ├── terraform.tfvars.example       # Example configuration values
│   ├── terraform.tfvars               # Actual values (gitignored)
│   ├── .terraform.lock.hcl            # Provider version lock file
│   ├── terraform.tfstate              # Current infrastructure state (gitignored)
│   └── terraform.tfstate.backup       # Backup of previous state (gitignored)
│
├── 📂 backend/                        # Backend Application
│   ├── Dockerfile                     # Backend container definition
│   ├── package.json                   # Node.js dependencies
│   └── [source code files]
│
├── 📂 frontend/                       # Frontend Application
│   ├── Dockerfile                     # Frontend container definition
│   ├── package.json                   # React dependencies
│   └── [source code files]
│
├── 📄 deploy.ps1                      # Master deployment orchestration script
├── 📄 setup.ps1                       # One-time setup script
├── 📄 .env                            # Environment variables (gitignored)
├── 📄 .env.example                    # Environment template
├── 📄 .gitignore                      # Git ignore rules
└── 📄 README.md                       # This file

```

---

## 🔧 Terraform Files Explained

### 📄 `infra/main.tf`
**Purpose**: Defines the actual Azure infrastructure resources

**What it contains**:
```hcl
1. Random Integer Generator
   - Creates unique ID for resource naming
   - Ensures no naming conflicts in Azure

2. Azure Resource Group
   - Container for all Azure resources
   - Location: North Europe (configurable)

3. Azure Container Registry (ACR)
   - Private Docker registry for your images
   - Stores backend and frontend containers
   - Admin access enabled for deployment
```

**Why it's used**: This is the core infrastructure definition. Terraform reads this file to know what resources to create in Azure.

**Key Resources**:
- `random_integer.ri` - Generates unique 5-digit number
- `azurerm_resource_group.rg` - Resource group named `techquest-rg-{ID}`
- `azurerm_container_registry.acr` - Container registry named `techquestacr{ID}`

---

### 📄 `infra/variables.tf`
**Purpose**: Declares all configurable variables for the infrastructure

**What it contains**:
```hcl
- region              # Azure region (default: northeurope)
- project_name        # Project prefix (default: techquest)
- acr_sku            # Registry tier (default: Basic)
- backend_cpu        # Backend CPU cores (default: 1.0)
- backend_memory     # Backend RAM in GB (default: 1.5)
- backend_port       # Backend port (default: 5000)
- frontend_cpu       # Frontend CPU cores (default: 1.0)
- frontend_memory    # Frontend RAM in GB (default: 1.5)
- frontend_port      # Frontend port (default: 80)
```

**Why it's used**: 
- Makes infrastructure **reusable** and **customizable**
- Single source of truth for configuration
- No need to edit `main.tf` to change settings
- Enables different configurations for dev/staging/prod

**How it's used**: Variables are referenced in `main.tf` using `var.variable_name`

---

### 📄 `infra/terraform.tfvars`
**Purpose**: Provides actual values for the variables

**What it contains**:
```hcl
region = "northeurope"
project_name = "techquest"
backend_cpu = 1.0
# ... all variable values
```

**Why it's used**:
- Separates **configuration** from **code**
- Easy to customize without touching Terraform code
- Can have different `.tfvars` files for different environments

**How it's used**: 
- Terraform automatically loads this file
- Overrides default values from `variables.tf`
- **Note**: Gitignored to prevent committing sensitive configs

---

### 📄 `infra/terraform.tfvars.example`
**Purpose**: Template showing what variables need to be configured

**Why it's used**:
- Shows team members what to configure
- Safe to commit to Git (no sensitive data)
- Copy to `terraform.tfvars` to get started

**How to use**:
```bash
cp terraform.tfvars.example terraform.tfvars
# Then edit terraform.tfvars with your values
```

---

### 📄 `infra/outputs.tf`
**Purpose**: Defines what information Terraform should output after deployment

**What it contains**:
```hcl
- resource_group_name    # Name of created resource group
- acr_login_server       # ACR URL (e.g., techquestacr12345.azurecr.io)
- acr_username           # ACR admin username (sensitive)
- acr_password           # ACR admin password (sensitive)
- unique_id              # Generated unique ID
- region                 # Configured region
- backend_cpu/memory/port   # Backend configuration
- frontend_cpu/memory/port  # Frontend configuration
```

**Why it's used**:
- Makes Terraform data available to other scripts
- `deploy.ps1` reads these outputs to configure deployment
- Provides deployment information to users

**How it's used**:
```bash
# View all outputs
terraform output

# Get specific output
terraform output -raw acr_login_server

# Used by deploy.ps1
$acr_server = terraform output -raw acr_login_server
```

---

### 📄 `infra/provider.tf`
**Purpose**: Configures the Azure provider for Terraform

**What it contains**:
```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
```

**Why it's used**:
- Tells Terraform to use Azure
- Specifies provider version
- Configures authentication to Azure

**How it works**: Uses Azure CLI authentication (`az login`)

---

### 📄 `infra/terraform.tfstate`
**Purpose**: Stores current state of infrastructure

**What it contains**:
- All resource IDs created in Azure
- Current configuration of each resource
- Resource dependencies
- Sensitive data (passwords, connection strings)

**Why it's critical**:
- Terraform's "memory" of what exists
- Used to calculate what changes are needed
- **NEVER delete** unless you want to lose control of resources
- **Gitignored** - contains sensitive data

**How it's used**:
- Automatically managed by Terraform
- Updated after every `terraform apply`
- Backed up to `terraform.tfstate.backup`

---

### 📄 `infra/.terraform.lock.hcl`
**Purpose**: Locks provider versions for consistency

**Why it's used**:
- Ensures everyone uses same provider version
- Prevents unexpected changes from version updates
- **Should be committed** to version control

---

## 🚀 Prerequisites

### Required Software
```bash
1. Azure CLI
   - Download: https://aka.ms/installazurecli
   - Used for: Azure authentication

2. Terraform
   - Download: https://www.terraform.io/downloads
   - Used for: Infrastructure provisioning

3. Docker Desktop
   - Download: https://www.docker.com/products/docker-desktop
   - Used for: Building container images

4. PowerShell 7+ (Windows)
   - Usually pre-installed
   - Used for: Deployment orchestration

5. Git (optional)
   - Download: https://git-scm.com/downloads
   - Used for: Version control
```

### Required Accounts
```bash
1. Azure Account
   - Free tier available: https://azure.microsoft.com/free
   - Used for: Hosting infrastructure

2. MongoDB Atlas Account
   - Free tier available: https://www.mongodb.com/cloud/atlas/register
   - Used for: Database
```

---

## ⚙️ Setup & Configuration

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/TechQuest.git
cd TechQuest/TerraForm
```

### Step 2: Azure Authentication
```bash
# Login to Azure
az login

# Verify login
az account show

# (Optional) Set specific subscription
az account set --subscription "Your-Subscription-Name"
```

### Step 3: Run Setup Script
```powershell
# Creates .env and terraform.tfvars from templates
.\setup.ps1
```

### Step 4: Configure Environment Variables
Edit `.env` file:
```bash
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Step 5: (Optional) Customize Terraform Variables
Edit `infra/terraform.tfvars`:
```hcl
# Change region
region = "westeurope"

# Adjust resources
backend_cpu = 2.0
backend_memory = 3.0
```

---

## 🚀 Deployment Guide

### Option 1: Automated Deployment (Recommended)
```powershell
# One command deployment
.\deploy.ps1
```

**What this does**:
1. Loads environment variables from `.env`
2. Runs Terraform to provision infrastructure
3. Builds Docker images for backend/frontend
4. Pushes images to Azure Container Registry
5. Deploys containers to Azure Container Instances

---

### Option 2: Manual Terraform Deployment

#### Step 1: Initialize Terraform
```bash
cd infra
terraform init
```
**What this does**:
- Downloads Azure provider
- Initializes backend
- Creates `.terraform/` directory

#### Step 2: Plan Infrastructure
```bash
terraform plan
```
**What this does**:
- Shows what will be created/changed/destroyed
- No actual changes made
- **Always run this before apply**

#### Step 3: Apply Infrastructure
```bash
terraform apply
```
**What this does**:
- Creates resources in Azure
- Updates `terraform.tfstate`
- Shows outputs after completion

**Interactive mode** (asks for confirmation):
```bash
terraform apply
# Type "yes" when prompted
```

**Auto-approve mode** (no confirmation):
```bash
terraform apply -auto-approve
```

#### Step 4: View Outputs
```bash
# All outputs
terraform output

# Specific output
terraform output acr_login_server
terraform output -raw resource_group_name
```

#### Step 5: Return to Root
```bash
cd ..
```

---

## 📚 Terraform Commands Reference

### Basic Commands

#### Initialize Terraform
```bash
terraform init
```
**When to use**: First time setup, after modifying `provider.tf`

#### Validate Configuration
```bash
terraform validate
```
**When to use**: Check syntax errors before applying

#### Format Code
```bash
terraform fmt
```
**When to use**: Auto-format `.tf` files to standard style

#### Plan Changes
```bash
# Basic plan
terraform plan

# Save plan to file
terraform plan -out=tfplan

# Plan with specific vars
terraform plan -var="region=westeurope"
```

#### Apply Changes
```bash
# Interactive
terraform apply

# Auto-approve
terraform apply -auto-approve

# From saved plan
terraform apply tfplan

# With specific variables
terraform apply -var="backend_cpu=2.0"
```

#### View State
```bash
# List all resources
terraform state list

# Show specific resource
terraform state show azurerm_resource_group.rg

# Show all state
terraform show
```

#### View Outputs
```bash
# All outputs
terraform output

# Specific output (formatted)
terraform output acr_login_server

# Raw output (no quotes, for scripts)
terraform output -raw acr_login_server
```

### Advanced Commands

#### Refresh State
```bash
terraform refresh
```
**When to use**: Sync state with real Azure resources

#### Import Existing Resources
```bash
terraform import azurerm_resource_group.rg /subscriptions/{sub-id}/resourceGroups/{rg-name}
```
**When to use**: Bring existing Azure resources under Terraform control

#### Taint Resource (Force Recreate)
```bash
terraform taint azurerm_container_registry.acr
terraform apply
```
**When to use**: Force recreation of a specific resource

#### Remove from State (Keep in Azure)
```bash
terraform state rm azurerm_resource_group.rg
```
**When to use**: Stop managing resource, but keep it in Azure

---

## 🧹 Infrastructure Cleanup

### Option 1: Destroy Everything (Recommended)
```bash
cd infra

# Preview what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy

# Or auto-approve
terraform destroy -auto-approve

cd ..
```
**Result**: All Azure resources deleted, costs stop immediately

### Option 2: Clean State and Resources
```bash
# 1. Destroy infrastructure
cd infra
terraform destroy -auto-approve

# 2. Delete state files
Remove-Item terraform.tfstate* -Force

# 3. Delete Terraform files
Remove-Item -Recurse -Force .terraform/

cd ..
```
**Result**: Complete reset, next deployment creates new unique ID

### Option 3: Manual Azure Cleanup
```bash
# Delete resource group (deletes everything inside)
az group delete --name techquest-rg-85179 --yes --no-wait

# List all resource groups
az group list --output table
```

### Verify Cleanup
```bash
# Check Azure for remaining resources
az group list --output table

# Should show no techquest resources
```

---

## 🏗️ Architecture

### Infrastructure Flow
```
┌─────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT                          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         ┌──────▼──────┐           ┌───────▼────────┐
         │  Terraform  │           │  Docker Build  │
         │             │           │                │
         │  Provision  │           │  Backend Image │
         │   Azure     │           │  Frontend Image│
         │  Resources  │           └────────┬───────┘
         └──────┬──────┘                    │
                │                           │
         ┌──────▼──────────────────────────▼────────┐
         │                                           │
         │           Azure Container Registry        │
         │          (techquestacr{ID}.azurecr.io)   │
         │                                           │
         └───────────────┬───────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
    ┌────▼────┐                     ┌────▼────┐
    │ Backend │                     │Frontend │
    │   ACI   │                     │   ACI   │
    │         │                     │         │
    │ Port:   │◄────────────────────┤ Calls   │
    │  5000   │     API Requests    │ API     │
    └────┬────┘                     └─────────┘
         │
         │
    ┌────▼────────┐
    │  MongoDB    │
    │   Atlas     │
    │  (External) │
    └─────────────┘
```

### Resource Naming Convention
```
Pattern: {project_name}-{resource_type}-{unique_id}

Examples:
- Resource Group:      techquest-rg-85179
- Container Registry:  techquestacr85179
- Backend Container:   techquest-api-85179
- Frontend Container:  techquest-web-85179
```

---

## 🐛 Troubleshooting

### Terraform Errors

#### "Error: Provider not found"
```bash
cd infra
terraform init
```

#### "Error: Resource already exists"
```bash
# Import existing resource
terraform import azurerm_resource_group.rg /subscriptions/{id}/resourceGroups/{name}

# Or destroy and recreate
terraform destroy
terraform apply
```

#### "Error: Variables not declared"
```bash
# Make sure terraform.tfvars exists
ls infra/terraform.tfvars

# If not, copy from example
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

#### "Warning: cosmos_throughput undeclared"
```bash
# Edit infra/terraform.tfvars and remove the cosmos_throughput line
```

### Docker Errors

#### "Docker daemon not running"
```bash
# Start Docker Desktop
# Wait for it to fully start
# Then retry deployment
```

#### "Cannot connect to Docker"
```bash
# Restart Docker Desktop
# Check: docker ps
```

### Deployment Errors

#### "MONGO_URI not set"
```bash
# Edit .env file
# Add: MONGO_URI=your-actual-connection-string
```

#### "Azure login required"
```bash
az login
az account show
```

#### "Image not found in ACR"
```bash
# Make sure Docker is running
# Rebuild and push images
cd backend
docker build -t {acr_server}/backend:latest .
docker push {acr_server}/backend:latest
```

---

## 📊 Cost Estimates

### Azure Resources (Per Month)
```
Resource Group:         Free
Container Registry:     ~$5  (Basic tier)
Container Instance x2:  ~$30 (1 core, 1.5GB each)

Total: ~$35/month
```

### MongoDB Atlas
```
Free tier:     0 GB - 512 MB (FREE)
Shared tier:   ~$9/month
```

---

## 🔐 Security Best Practices

### Never Commit
- ❌ `.env` - Contains MongoDB credentials
- ❌ `terraform.tfstate` - Contains sensitive resource data
- ❌ `terraform.tfvars` - May contain sensitive config

### Always Commit
- ✅ `.env.example` - Template without secrets
- ✅ `terraform.tfvars.example` - Template configuration
- ✅ All `.tf` files - Infrastructure code
- ✅ `.terraform.lock.hcl` - Provider versions

### Verify .gitignore
```bash
cat .gitignore
# Should include: .env, *.tfstate, *.tfvars
```

---

## 📖 Learning Resources

### Terraform
- [Official Documentation](https://www.terraform.io/docs)
- [Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Learn Terraform](https://learn.hashicorp.com/terraform)

### Azure
- [Azure Documentation](https://docs.microsoft.com/azure)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure)

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Terraform output errors
3. Check Azure Portal for resource status
4. Verify all prerequisites are installed

---

## 📝 Quick Reference Card

```bash
# SETUP
az login                          # Login to Azure
.\setup.ps1                      # Create config files
# Edit .env with MONGO_URI

# DEPLOY (ALL-IN-ONE)
.\deploy.ps1                     # Full deployment

# DEPLOY (TERRAFORM ONLY)
cd infra
terraform init                   # First time only
terraform plan                   # Preview changes
terraform apply                  # Create infrastructure
terraform output                 # View info
cd ..

# CLEANUP
cd infra
terraform destroy               # Delete everything
cd ..

# TERRAFORM UTILITIES
terraform validate              # Check syntax
terraform fmt                   # Format files
terraform state list           # List resources
terraform output acr_login_server  # Get output value
```

---

## 🎓 What This Project Teaches

1. **Infrastructure as Code (IaC)** - Define infrastructure in code
2. **Terraform Basics** - Resources, variables, outputs, state
3. **Azure Cloud** - Resource groups, ACR, ACI
4. **Containerization** - Docker images and registries
5. **Automation** - Scripted deployment workflows
6. **GitOps** - Version-controlled infrastructure
7. **Security** - Secrets management with `.env` files
8. **Best Practices** - Separation of concerns, DRY principle

---

Made with ❤️ using Terraform and Azure
