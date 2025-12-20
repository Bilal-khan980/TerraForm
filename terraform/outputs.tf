output "application_url" {
  description = "URL of the deployed application"
  value       = "http://localhost:${local.external_port}"
}

output "active_environment" {
  description = "Current deployment environment"
  value       = var.app_env
}

output "resource_limits" {
  description = "Enforced Resource Limits"
  value = {
    cpu    = "${local.current_limits.cpu_quota / 100000} cores"
    memory = "${local.current_limits.memory} MB"
  }
}

output "container_id" {
  description = "ID of the running container"
  value       = docker_container.webapp.id
}

# Image ID output removed as build is now handled via local-exec

