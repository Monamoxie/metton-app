variable "vpc_id" {
  description = "The ID of the VPC where the security group will be created"
}

variable "security_group_id" {
  description = "Security group id"
  type        = string
}

variable "alb_security_group_id" {
  description = "ALB Security group id"
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

variable "ec2_instance_id" {
  description = "Ec2 instance id"
  type        = string
}

variable "aws_acm_certificate_arn" {
  description = "ACM cert arn"
  type = string
}

variable "sendgrid_dkim_s1" {
  description = "Sendgrid DKIM S1"
  type = string
}
variable "sendgrid_dkim_s2" {
  description = "Sendgrid DKIM S2"
  type = string
}