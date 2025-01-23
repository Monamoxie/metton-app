variable "vpc_id" {
  description = "The ID of the VPC where the security group will be created"
}

variable "security_group_id" {
  description = "Security group id"
  type        = string
}

variable "subnet ids" {
  description = "subnet ids"
  type        = list(string)
}