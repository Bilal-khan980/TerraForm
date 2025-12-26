# 🌍 TerraEcom - Cloud Native E-Commerce Platform

A modern, full-stack E-commerce application deployed on **Azure** using **Terraform** (Infrastructure as Code) and **Docker**. This project demonstrates a production-grade workflow for provisioning serverless infrastructure and deploying containerized microservices.

---

## 🏗️ Project Structure

```bash
TerraForm/
├── 📂 frontend/          # React + Vite (Storefront)
├── 📂 backend/           # Node.js + Express (API)
├── 📂 infra/             # Terraform Configuration (The Magic 🪄)
│   ├── main.tf           # Defines Azure Resources (DB, Registry, Groups)
│   ├── provider.tf       # Azure Provider Setup
│   └── outputs.tf        # Captures Resource IDs/URLs after creation
├── deploy.ps1            # 🚀 Master Deployment Automation Script
└── README.md             # Documentation
```

---

## 🛠️ Tech Stack

### **Frontend**
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) 
- Built with **React** for a dynamic user interface.
- **Vite** for lightning-fast build tooling.
- **Glassmorphism UI** design for a premium aesthetic.

### **Backend**
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
- **Node.js**: Scalable runtime environment.
- **Express**: RESTful API handling Auth, Products, and Orders.
- **MongoDB Atlas**: Cloud-hosted NoSQL database (Mongoose ODM).

### **Infrastructure & DevOps**
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white) ![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
- **Terraform**: Declarative Infrastructure as Code (IaC).
- **Azure Container Instances (ACI)**: Serverless container hosting.
- **Azure Container Registry (ACR)**: Secure Docker image storage.

---

## 🧞 The Power of Terraform

This project uses **Terraform** to treat infrastructure exactly like application code. instead of clicking buttons in the Azure Portal manually, we define our desired state in files.

### **Why use Terraform?**
1.  **Automation**: Provisioning databases, networks, and servers takes seconds, not hours.
2.  **Consistency**: No "it works on my machine" issues. The environment is identical every time.
3.  **Scalability**: Need 100 servers? Just change `count = 1` to `count = 100`.

### **Terraform Files Deep Dive (`/infra`)**

Terraform works by reading `.tf` files in a directory and combining them into a single "plan". Here is exactly what is inside each file and why it exists:

#### **1. `provider.tf` (The Handshake)**
This file is the specific instruction manual Terraform needs to talk to Azure.
- **`required_providers`**: Tells Terraform "We need the Azure plugin (AzureRM)". Without this, Terraform doesn't know what an "Azure Resource Group" is.
- **`provider "azurerm"`**: Initializes the plugin. This is where you would put subscription IDs if you weren't logged in via CLI.
- **Why?**: It acts as the driver. Just like a printer needs a driver to talk to Windows, Terraform needs this provider to talk to the Azure Cloud API.

#### **2. `main.tf` (The Blueprint)**
This is the heart of the project. It describes **WHAT** we want to exist.
- **`resource "azurerm_resource_group" "rg"`**: Creates a folder in Azure to hold everything else. If we delete this folder, everything inside (databases, apps) gets deleted too. It's safe management.
- **`resource "random_integer" "ri"`**:
  - *Problem*: Azure resource names (like Registry URLs) must be globally unique. If you name it "my-app", someone else probably already took it.
  - *Solution*: This resource generates a random number (e.g., `85179`). We attach this number to every resource name (`techquest-api-85179`) to guarantee it creates successfully without conflicts.
- **`resource "azurerm_container_registry" "acr"`**:
  - Creates a private Docker Hub inside Azure.
  - **Why?**: We don't want our private backend code on public Docker Hub. This gives us a secure place to push our images (`docker push`) so Azure can pull them later.
- **`resource "azurerm_cosmosdb_account"`**:
  - Provisions a fully managed MongoDB database.
  - **Why?**: We need a database that persists data even if the server restarts. Using a managed service means Azure handles backups and scaling for us.

#### **3. `outputs.tf` (The Receipt)**
After Terraform finishes building your cloud city, `outputs.tf` allows it to print specific addresses back to you.
- **What it stores**:
  - `acr_login_server`: The URL of the registry we just created (e.g., `techquest.azurecr.io`).
  - `acr_password`: The auto-generated password to access that registry.
- **Why is it crucial?**:
  - Our PowerShell script (`deploy.ps1`) **READS** these outputs.
  - The script says: "Hey Terraform, what was the password for the registry you just made?" -> Terraform replies via `outputs.tf` -> The script uses that password to run `docker login`.
  - Without this, we would have to copy-paste passwords manually from the Azure Portal website.

#### **4. `.terraform.lock.hcl` (The Security Check)**
- **What is it?**: An auto-generated file that "locks" the exact version of the Azure Provider we used.
- **Why?**: If you run this project 2 years from now, Azure might change how their API works. This lock file ensures Terraform downloads the *exact* old version that works with your code, preventing "breaking changes."

#### **5. `terraform.tfstate` (The Brain)**
*Note: This file is usually hidden and ignored by Git.*
- **What is it?**: A dynamic JSON file that maps your code to Real World IDs.
- **Example**:
  - Code says: `resource "azurerm_resource_group" "rg"`
  - State file says: `resource "rg" = "/subscriptions/xyz/resourceGroups/techquest-rg-85179"`
- **Why?**: When you run Terraform again, it looks at this file. "Oh, I already created the database with ID `xyz`. I don't need to create it again."
- **Critical Warning**: Never delete this file locally, or Terraform will lose track of your resources and try to create duplicates (which will fail).

---

## 🚀 How to Run (Deployment Guide)

We have simplified the complex DevOps pipeline into a single **"Golden Script"**.

### **Prerequisites**
1.  **Azure CLI** installed and logged in (`az login`).
2.  **Terraform** installed.
3.  **Docker Desktop** running.

### **Step 1: Configuration**
Open `deploy.ps1` and edit the top section with your database details:
```powershell
$ATLAS_MONGO_URI = "mongodb+srv://YourUser:YourPassword@cluster.../DBName"
$REGION = "northeurope"  # or "eastus", "westus", etc.
```

### **Step 2: Deploy**
Run the master script in PowerShell:
```powershell
.\deploy.ps1
```

### **What happens next? (The Automated Flow)**
1.  **Terraform Init**: Initializes the Azure connection.
2.  **Provision**: Terraform creates the Resource Group and Registry on Azure.
3.  **Build**: Docker builds the React Frontend and Node Backend images locally.
4.  **Push**: Uploads the images to your private Azure Container Registry (ACR).
5.  **Deploy**: Tells Azure to pull the images and spin up serverless instances (ACI).
6.  **Configure**: Automatically injects secrets (Database Connection Strings) into the containers.

### **Step 3: Access**
The script will output your live URLs at the end:
```text
Frontend: http://techquest-web-85179.northeurope.azurecontainer.io
Backend:  http://techquest-api-85179.northeurope.azurecontainer.io:5000
```

---

## 🧹 Cleanup
To destroy all resources and stop billing, run:
```powershell
cd infra
terraform destroy -auto-approve
```
