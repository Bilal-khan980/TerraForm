resource "random_integer" "ri" {
  min = 10000
  max = 99999
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.project_name}-rg-${random_integer.ri.result}"
  location = var.region
}

# Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "${var.project_name}acr${random_integer.ri.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.acr_sku
  admin_enabled       = true
}
