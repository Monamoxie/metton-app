variable "vpc_id" {
  description = "The ID of the VPC where the security group will be created"
}

variable "key_name" {
  description = "The name of the SSH key pair"
  type        = string
}

variable "domain_name" {
  description = "The domain name for Route53 records"
  type        = string
}

variable "domain_alternative_names" {
  description = "The alternative domain names"
  type        = list(string)
}