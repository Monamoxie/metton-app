variable "vpc_id" {
  description = "The ID of the VPC where resources will be created"
  type        = string
}

variable "cidr_ipv4_block" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "key_name" {
  description = "The name of the SSH key pair"
  type        = string
}

variable "security_group_id" {
  description = "Security group id"
  type = string
} 

variable "subnet_ids" {
  description = "Subnet ids"
  type = list(string)
}

variable "service_discovery_arn" {
  description = "Service discovery arn"
  type = string
}

variable "static_root_id" {}
variable "media_root_id" {}
variable "load_balancer_arn" {}