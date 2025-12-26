$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "   MASTER DEPLOYMENT SCRIPT (ACI)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# --- CONFIGURATION (EDIT THESE IF NEEDED) ---
$ATLAS_MONGO_URI = "mongodb+srv://Bilalkhan:Pakistan@cluster1.moct8fi.mongodb.net/TerraForm"
$REGION = "northeurope"
# --------------------------------------------

# 1. Terraform Infrastructure
Write-Host "`n[1/5] Provisioning Base Infrastructure..." -ForegroundColor Cyan
Set-Location "infra"
terraform init -input=false
terraform apply -auto-approve -input=false
if ($LASTEXITCODE -ne 0) { throw "Terraform provisioning failed." }

# 2. Extract Outputs
Write-Host "`n[2/5] Reading Configuration..." -ForegroundColor Cyan
$acr_login_server = terraform output -raw acr_login_server
$acr_username = terraform output -raw acr_username
$acr_password = terraform output -raw acr_password
$rg_name = terraform output -raw resource_group_name
$unique_id = terraform output -raw unique_id
Set-Location ".."

# Derive Container Names
$backend_name = "techquest-api-$unique_id"
$frontend_name = "techquest-web-$unique_id"
$backend_url = "http://${backend_name}.${REGION}.azurecontainer.io:5000"

# 3. Build & Push Images
Write-Host "`n[3/5] Building & Pushing Docker Images..." -ForegroundColor Cyan
Write-Host "Logging into ACR: $acr_login_server"
docker login $acr_login_server -u $acr_username -p $acr_password

Write-Host "Building Backend..."
Set-Location "backend"
docker build -t "${acr_login_server}/backend:latest" .
docker push "${acr_login_server}/backend:latest"

Write-Host "Building Frontend (Binding API URL: $backend_url)..."
Set-Location "../frontend"
docker build --build-arg "VITE_API_URL=$backend_url" -t "${acr_login_server}/frontend:latest" .
docker push "${acr_login_server}/frontend:latest"
Set-Location ".."

# 4. Generate & Deploy Backend YAML
Write-Host "`n[4/5] Deploying Backend Container..." -ForegroundColor Cyan
$backend_yaml = @"
apiVersion: 2019-12-01
location: $REGION
name: $backend_name
properties:
  containers:
  - name: $backend_name
    properties:
      image: $acr_login_server/backend:latest
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 1.5
      ports:
      - port: 5000
      environmentVariables:
      - name: PORT
        value: '5000'
      - name: MONGO_URI
        value: '$ATLAS_MONGO_URI'
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 5000
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
location: $REGION
name: $frontend_name
properties:
  containers:
  - name: $frontend_name
    properties:
      image: $acr_login_server/frontend:latest
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 1.5
      ports:
      - port: 80
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 80
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
Write-Host "Frontend: http://${frontend_name}.${REGION}.azurecontainer.io" -ForegroundColor Yellow
Write-Host "Backend:  $backend_url" -ForegroundColor Yellow
