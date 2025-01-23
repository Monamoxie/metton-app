variable "db_name" {
  description = "The name of the database"
  type        = string
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "security_group_id" {
  description = "ID of the security group for the database"
  type        = string
}

variable "database_subnet_ids" {
  description = "List of subnet IDs for the database"
  type        = list(string)
}