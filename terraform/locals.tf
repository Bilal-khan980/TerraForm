locals {
  # Resource Governance Rules
  resource_limits = {
    dev = {
      cpu_quota  = 25000  # 0.25 cores (25ms per 100ms period)
      memory     = 128    # MB
      pids_limit = 50
    }
    stage = {
      cpu_quota  = 50000  # 0.5 cores
      memory     = 256
      pids_limit = 100
    }
    prod = {
      cpu_quota  = 100000 # 1.0 cores
      memory     = 512
      pids_limit = 200
    }
  }

  current_limits = local.resource_limits[var.app_env]
  container_name = "tf-docker-${var.app_env}-${var.container_name_suffix}"
  external_port  = lookup(var.host_port_map, var.app_env, 8080)
}
