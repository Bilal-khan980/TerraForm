variable "app_env" {
  description = "Application deployment environment (dev, stage, prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "stage", "prod"], var.app_env)
    error_message = "Valid values for app_env: dev, stage, prod."
  }
}

variable "container_name_suffix" {
  description = "Suffix for the container name"
  type        = string
  default     = "webapp"
}

variable "host_port_map" {
  description = "Map of external ports per environment"
  type        = map(number)
  default = {
    dev   = 8080
    stage = 8081
    prod  = 80
  }
}
