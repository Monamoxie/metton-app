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