resource "docker_network" "app_network" {
  name = "terraform_app_network_${var.app_env}"
}

resource "docker_volume" "db_data" {
  name = "terraform_db_data_${var.app_env}"
}

resource "docker_image" "postgres_image" {
  name = "postgres:15-alpine"
}

resource "docker_container" "db" {
  name  = "tf-db-${var.app_env}"
  image = docker_image.postgres_image.image_id
  
  # Resource Governance for DB
  memory = 256 # 256 MB for DB
  
  env = [
    "POSTGRES_USER=postgres",
    "POSTGRES_PASSWORD=password",
    "POSTGRES_DB=webapp_db"
  ]
  
  volumes {
    host_path      = null              # Managed volume
    container_path = "/var/lib/postgresql/data"
    volume_name    = docker_volume.db_data.name
  }

  networks_advanced {
    name    = docker_network.app_network.name
    aliases = ["db"]
  }
}

# Workaround for Terraform Provider "unexpected EOF" bug on Windows:
# specific context handling with local-exec is more robust for demos.
resource "null_resource" "docker_build" {
  triggers = {
    # Always force a rebuild check on apply for the demo's sake
    # In a real app, you'd hash the directory
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    # Build using the host Docker CLI
    command     = "docker build -f ../docker/Dockerfile -t terraform-managed-webapp:latest -t terraform-managed-webapp:${var.app_env} ../"
    interpreter = ["PowerShell", "-Command"]
  }
}

resource "docker_container" "webapp" {
  name  = local.container_name
  # Direct reference to image name since we built it manually
  image = "terraform-managed-webapp:latest"

  # Ensure image is ready before container starts
  depends_on = [
    null_resource.docker_build,
    docker_container.db
  ]


  # --- Resource Governance ---
  memory = local.current_limits.memory
  # cpu_shares used as proxy for governance if quota not available/supported by provider version easily, 
  # or rely on logic that worked previously.
  
  # --- Hardening & Security ---
  user = "node"
  read_only = true 
  
  capabilities {
    drop = ["ALL"]
    add  = ["NET_BIND_SERVICE"]
  }

  # --- Networking ---
  networks_advanced {
    name = docker_network.app_network.name
  }
  
  ports {
    internal = 3000
    external = local.external_port
    ip       = "127.0.0.1" 
  }

  # --- Configuration ---
  env = [
    "APP_ENV=${var.app_env}",
    "App_CPU_LIMIT=${local.current_limits.cpu_quota / 100000} cores",
    "APP_MEMORY_LIMIT=${local.current_limits.memory}MB",
    "DB_HOST=db",
    "DB_USER=postgres",
    "DB_PASSWORD=password",
    "DB_NAME=webapp_db"
  ]

  labels {
    label = "managed_by"
    value = "terraform"
  }

  tmpfs = {
    "/tmp" = ""
  }
  
  rm = true
  
  # Wait for DB to be ready? 
  # In a real scenario we'd use 'depends_on' but Docker provider doesn't wait for "service healthy" easily without nuances.
  depends_on = [docker_container.db]
}
