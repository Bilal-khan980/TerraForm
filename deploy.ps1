$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "   MASTER DEPLOYMENT SCRIPT (ACI)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Load environment variables from .env file
Write-Host "`n[0/5] Loading Environment Variables..." -ForegroundColor Cyan
if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and fill in your values." -ForegroundColor Yellow
    exit 1
}

Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

# Validate required environment variables
if (-Not $env:MONGO_URI) {
    Write-Host "ERROR: MONGO_URI not set in .env file!" -ForegroundColor Red
    exit 1
}

# 1. Terraform Infrastructure
Write-Host "`n[1/5] Provisioning Base Infrastructure..." -ForegroundColor Cyan
Set-Location "infra"
terraform init -input=false
terraform apply -auto-approve -input=false
if ($LASTEXITCODE -ne 0) { throw "Terraform provisioning failed." }

# 2. Extract Outputs from Terraform
Write-Host "`n[2/5] Reading Configuration from Terraform..." -ForegroundColor Cyan
$acr_login_server = terraform output -raw acr_login_server
$acr_username = terraform output -raw acr_username
$acr_password = terraform output -raw acr_password
$rg_name = terraform output -raw resource_group_name
$unique_id = terraform output -raw unique_id
$region = terraform output -raw region
$backend_cpu = terraform output -raw backend_cpu
$backend_memory = terraform output -raw backend_memory
$backend_port = terraform output -raw backend_port
$frontend_cpu = terraform output -raw frontend_cpu
$frontend_memory = terraform output -raw frontend_memory
$frontend_port = terraform output -raw frontend_port
Set-Location ".."

# Derive Container Names
$backend_name = "techquest-api-$unique_id"
$frontend_name = "techquest-web-$unique_id"
$backend_url = "http://${backend_name}.${region}.azurecontainer.io:${backend_port}"

# Generate unique image tag
$tag = Get-Date -Format "yyyyMMddHHmmss"

# 3. Build & Push Images
Write-Host "`n[3/5] Building & Pushing Docker Images (Tag: $tag)..." -ForegroundColor Cyan
Write-Host "Logging into ACR: $acr_login_server"
docker login $acr_login_server -u $acr_username -p $acr_password

Write-Host "Building Backend..."
Set-Location "backend"
docker build -t "${acr_login_server}/backend:${tag}" .
docker push "${acr_login_server}/backend:${tag}"

Write-Host "Building Frontend (Binding API URL: $backend_url)..."
Set-Location "../frontend"
docker build --build-arg "VITE_API_URL=$backend_url" -t "${acr_login_server}/frontend:${tag}" .
docker push "${acr_login_server}/frontend:${tag}"
Set-Location ".."

# 4. Generate & Deploy Backend YAML
Write-Host "`n[4/5] Deploying Backend Container..." -ForegroundColor Cyan
$backend_yaml = @"
apiVersion: 2019-12-01
location: $region
name: $backend_name
properties:
  containers:
  - name: $backend_name
    properties:
      image: $acr_login_server/backend:${tag}
      resources:
        requests:
          cpu: $backend_cpu
          memoryInGB: $backend_memory
      ports:
      - port: $backend_port
      environmentVariables:
      - name: PORT
        value: '$backend_port'
      - name: MONGO_URI
        value: '$env:MONGO_URI'
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: $backend_port
    dnsNameLabel: $backend_name
  imageRegistryCredentials:
  - server: $acr_login_server
    username: $acr_username
    password: $acr_password
type: Microsoft.ContainerInstance/containerGroups
"@
$backend_yaml | Out-File -FilePath "backend-deploy.yaml" -Encoding UTF8
az container create --resource-group $rg_name --file backend-deploy.yaml

# 5. Generate & Deploy Frontend YAML
Write-Host "`n[5/5] Deploying Frontend Container..." -ForegroundColor Cyan
$frontend_yaml = @"
apiVersion: 2019-12-01
location: $region
name: $frontend_name
properties:
  containers:
  - name: $frontend_name
    properties:
      image: $acr_login_server/frontend:${tag}
      resources:
        requests:
          cpu: $frontend_cpu
          memoryInGB: $frontend_memory
      ports:
      - port: $frontend_port
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: $frontend_port
    dnsNameLabel: $frontend_name
  imageRegistryCredentials:
  - server: $acr_login_server
    username: $acr_username
    password: $acr_password
type: Microsoft.ContainerInstance/containerGroups
"@
$frontend_yaml | Out-File -FilePath "frontend-deploy.yaml" -Encoding UTF8
az container create --resource-group $rg_name --file frontend-deploy.yaml

# Cleanup YAMLs (optional security measure)
Remove-Item -Path "backend-deploy.yaml" -ErrorAction SilentlyContinue
Remove-Item -Path "frontend-deploy.yaml" -ErrorAction SilentlyContinue

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Frontend: http://${frontend_name}.${region}.azurecontainer.io" -ForegroundColor Yellow
Write-Host "Backend:  $backend_url" -ForegroundColor Yellow
