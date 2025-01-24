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

variable "domain_name" {
  description = "The domain name for Route53 records"
  type        = string
}
