variable "region" {
  description = "Azure region for all resources"
  type        = string
  default     = "northeurope"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "techquest"
}

variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Basic"
}


variable "backend_cpu" {
  description = "CPU allocation for backend container"
  type        = number
  default     = 1.0
}

variable "backend_memory" {
  description = "Memory allocation for backend container (GB)"
  type        = number
  default     = 1.5
}

variable "backend_port" {
  description = "Port for backend service"
  type        = number
  default     = 5000
}

variable "frontend_cpu" {
  description = "CPU allocation for frontend container"
  type        = number
  default     = 1.0
}

variable "frontend_memory" {
  description = "Memory allocation for frontend container (GB)"
  type        = number
  default     = 1.5
}

variable "frontend_port" {
  description = "Port for frontend service"
  type        = number
  default     = 80
}
