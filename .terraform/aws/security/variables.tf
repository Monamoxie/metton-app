variable "vpc_id" {
  description = "The ID of the VPC where the security group will be created"
}

variable "key_name" {
  description = "The name of the SSH key pair"
  type        = string
}