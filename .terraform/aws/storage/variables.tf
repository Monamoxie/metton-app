variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs"
  type = list(string)
}

variable "kms_efs_arn" {
  description = "KMS EFS ARN"
  type = string
}

variable "region" {
  description = "AWS region"
  type = string
}

variable "security_group_id" {}