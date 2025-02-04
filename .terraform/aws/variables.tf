variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "development"
}

variable "domain_name" {
  description = "Production domain name"
  type = string
}

variable "domain_alternative_names" {
  description = "Production subdomains or wildcard"
  type = list(string)
}

variable "profile" {
  description = "Aws profile. Set in /Users/admin/.aws/config or whereever your development aws config is stored. To also be referenced and defined in terraform.tfvars, which MUST NOT be tracked by git"
  type = string
}

variable "aws_region" {
  description = "Aws region"
  type = string
}

variable "project_name" {
  description = "Project name"
  type = string
}

variable "shared_config_files" {
  description = "Path to aws config. Could be /Users/admin/.aws/config or wherever you've created it. Should contain the aws profile and the region"
  type = list(string)
}

variable "shared_credentials_files" {
  description = "Credentials file. Coule be /Users/admin/.aws/credentials or wherever you've created it. Should be grouped by aws profile, and this profile should contain the access key and secret required for terraform to authenticate and access the account"
  type = list(string)
}

variable "ec2_key_pair_name" {
  description = "Name of ec2 key pair public file"
  type = string
}

variable "db_username" {
  description = "DB username"
  type = string
}

variable "db_password" {
  description = "DB password"
  type = string
}

variable "db_name" {
  description = "DB name"
  type = string
}