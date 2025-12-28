output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "location" {
  value = azurerm_resource_group.rg.location
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_username" {
  value = azurerm_container_registry.acr.admin_username
  sensitive = true
}

output "acr_password" {
  value = azurerm_container_registry.acr.admin_password
  sensitive = true
}

output "unique_id" {
  value = random_integer.ri.result
}

output "region" {
  value = var.region
}

output "backend_cpu" {
  value = var.backend_cpu
}

output "backend_memory" {
  value = var.backend_memory
}

output "backend_port" {
  value = var.backend_port
}

output "frontend_cpu" {
  value = var.frontend_cpu
}

output "frontend_memory" {
  value = var.frontend_memory
}

output "frontend_port" {
  value = var.frontend_port
}
